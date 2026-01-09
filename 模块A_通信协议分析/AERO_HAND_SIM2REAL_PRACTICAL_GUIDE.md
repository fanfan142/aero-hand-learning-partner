# Aero Hand Open - Sim2Real 实操指南

## 概述

本文档从实操角度详细说明如何将CV识别或强化学习训练得到的控制策略从仿真环境迁移到真实的Aero Hand Open灵巧手硬件。

---

## 目录

1. [系统架构总览](#系统架构总览)
2. [仿真环境与真实硬件的对应关系](#仿真环境与真实硬件的对应关系)
3. [路径一：强化学习策略Sim2Real](#路径一强化学习策略sim2real)
4. [路径二：CV视觉引导控制](#路径二cv视觉引导控制)
5. [核心转换代码实现](#核心转换代码实现)
6. [常见问题与调试](#常见问题与调试)
7. [完整示例代码](#完整示例代码)

---

## 系统架构总览

### 数据流示意图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Sim2Real 控制架构                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐     │
│  │  仿真/MuJoCo │        │  训练/JAX    │        │   部署层     │     │
│  │              │        │              │        │              │     │
│  │  ┌────────┐  │        │  ┌────────┐  │        │  ┌────────┐  │     │
│  │  │RL策略  │  │───输出──│▶│策略权重 │  │───导出──│▶│推理代码│  │     │
│  │  │网络    │  │ 动作向量│ │checkpoint│  │        │ │(Python)│  │     │
│  │  └────────┘  │  7维    │ └────────┘  │        │  └────┬──┘  │     │
│  │      │        │        │      │      │        │       │     │     │
│  │      ▼        │        │      │      │        │       ▼     │     │
│  │  ┌────────┐  │        │      │      │        │  ┌────────┐  │     │
│  │  │动作空间│  │        │      │      │        │  │ AERO   │  │     │
│  │  │7维    │  │        │      │      │        │  │ HAND   │  │     │
│  │  └────────┘  │        │      │      │        │  │ SDK    │  │     │
│  └──────┬───────┘        └──────┬───────┘        │  └────┬──┘  │     │
│         │                      │                │       │     │     │
│         ▼                      ▼                │       ▼     │     │
│  ┌─────────────────────────────────────────────────────┐  │     │
│  │              关键：动作空间完全一致                    │  │     │
│  │                                                     │  │     │
│  │  仿真动作 = [肌腱0, 肌腱1, ..., 肌腱5, 关节]         │  │     │
│  │  硬件动作 = [肌腱0, 肌腱1, ..., 肌腱5, 关节]         │  │     │
│  │                                                     │  │     │
│  └─────────────────────────────────────────────────────┘  │     │
│                                                         │     │
└─────────────────────────────────────────────────────────┘     │
           │                                                   │
           ▼                                                   │
  ┌─────────────────────────────────────────────────────────┐ │
  │                   真实硬件层                              │ │
  │  ┌─────────────────────────────────────────────────┐   │ │
  │  │              ESP32-S3 固件                       │   │ │
  │  │  - 接收16字节串口命令                            │   │ │
  │  │  - 解析7个执行器目标值                           │   │ │
  │  │  - 控制Feetech智能舵机                           │   │ │
  │  └─────────────────────────────────────────────────┘   │ │
  │                         │                                │ │
  │                         ▼                                │ │
  │  ┌─────────────────────────────────────────────────┐   │ │
  │  │            肌腱驱动机械结构                       │   │ │
  │  │  - 6根肌腱 (拇指+4指)                           │   │ │
  │  │  - 1个拇指CMC外展关节                           │   │ │
  │  │  - 滑轮+弹簧传动系统                            │   │ │
  │  └─────────────────────────────────────────────────┘   │ │
  └─────────────────────────────────────────────────────────┘ │
    │                                                          │
    └──────────────────────────────────────────────────────────┘
```

---

## 仿真环境与真实硬件的对应关系

### 1. 动作空间映射 (关键!)

| 维度 | 仿真环境 (MuJoCo MJX) | 真实硬件 (AeroHand SDK) | 说明 |
|------|----------------------|------------------------|------|
| 维度数 | **7** | **7** | 完全一致 |
| 索引0 | 拇指肌腱 (thumb_tendon) | 拇指肌腱 (thumb_tendon) | 直接对应 |
| 索引1 | 食指肌腱 (index_tendon) | 食指肌腱 (index_tendon) | 直接对应 |
| 索引2 | 中指肌腱 (middle_tendon) | 中指肌腱 (middle_tendon) | 直接对应 |
| 索引3 | 无名指肌腱 (ring_tendon) | 无名指肌腱 (ring_tendon) | 直接对应 |
| 索引4 | 小指肌腱 (pinky_tendon) | 小指肌腱 (pinky_tendon) | 直接对应 |
| 索引5 | 拇指CMC屈曲 (thumb_cmc_flex) | 拇指CMC屈曲 (thumb_cmc_flex_act) | 直接对应 |
| 索引6 | 拇指CMC外展 (thumb_cmc_abd) | 拇指CMC外展 (thumb_cmc_abd_act) | 直接对应 |

### 2. 观察空间映射

| 传感器 | 仿真环境 | 真实硬件 | 获取方法 |
|--------|---------|---------|---------|
| 肌腱长度 (6个) | MuJoCo传感器 | 舵机位置反馈 | `hand.get_actuations()` |
| 拇指外展关节 | 关节位置传感器 | 舵机位置反馈 | `hand.get_joint_positions_compact()` |
| 指尖接触 | 接触传感器 | (需外部传感器) | 可选集成 |

### 3. 执行器限制常量

```python
# 仿真与硬件共享的常量 (来自 aero_hand_constants.py)
ACTUATOR_NAMES = [
    "thumb_cmc_abd_act",   # 拇指外展
    "thumb_cmc_flex_act",  # 拇指屈曲
    "thumb_tendon",        # 拇指肌腱
    "index_tendon",        # 食指肌腱
    "middle_tendon",       # 中指肌腱
    "ring_tendon",         # 无名指肌腱
    "pinky_tendon",        # 小指肌腱
]

# 执行器角度限制 (度)
ACTUATION_LOWER_LIMITS = [...]  # 下限
ACTUATION_UPPER_LIMITS = [...]  # 上限
```

---

## 路径一：强化学习策略Sim2Real

### 步骤概览

```
训练阶段                部署阶段
─────────              ─────────
1. MuJoCo环境    →     5. 导出策略权重
2. PPO训练       →     6. Python推理脚本
3. 策略checkpoint      7. 连接真实硬件
4. 仿真验证     →     8. 实时控制循环
                       9. 监控与调试
```

### 步骤1：训练RL策略

```bash
# 在 MuJoCo MJX 中训练
cd sim_rl/mujoco_playground

# 训练立方体旋转任务
python learning/train_jax_ppo.py \
    --env_name TetheriaCubeRotateZAxis \
    --num_train_steps 1000000 \
    --eval_interval 50000
```

**训练配置要点** (`rotate_z.py`):
- **观察空间**: 6个肌腱长度 + 1个关节角度 + 7个上一步动作 = 14维
- **动作空间**: 7维 (action_scale控制动作幅度)
- **奖励函数**: Z轴角速度 - 动作变化率 - 终止惩罚

### 步骤2：验证训练策略

```python
# 在仿真中测试训练好的策略
import jax
import numpy as np
from mujoco_playground._src.manipulation.aero_hand import rotate_z

# 加载环境
env = rotate_z.CubeRotateZAxis()
rng = jax.random.PRNGKey(0)
state = env.reset(rng)

# 加载checkpoint并测试
# ... (见完整代码)
```

### 步骤3：导出策略权重

训练完成后，策略网络权重保存在checkpoint中。需要提取并导出为可用格式：

```python
import orbax.checkpoint as ocp

def extract_policy_weights(checkpoint_path):
    """从checkpoint提取策略网络权重"""
    checkpointer = ocb.PyTreeCheckpointer()
    restored = checkpointer.restore(checkpoint_path)
    # 提取策略网络参数
    policy_params = restored['policy_network']['params']
    return policy_params
```

### 步骤4：创建推理脚本

```python
import jax
import jax.numpy as jnp
from aero_open_sdk import AeroHand

class Sim2RealPolicy:
    """将仿真训练的策略部署到真实硬件"""

    def __init__(self, policy_params, checkpoint_path, port=None):
        # 1. 加载策略网络
        self.policy_params = policy_params
        self.policy_fn = self._load_policy_network(checkpoint_path)

        # 2. 初始化硬件连接
        self.hand = AeroHand(port=port)

        # 3. 初始化状态
        self.last_action = np.zeros(7)

    def _load_policy_network(self, checkpoint_path):
        """加载策略网络"""
        # 这里需要根据实际训练代码加载网络结构
        # 通常是两层 MLP: obs(14) -> hidden(256) -> action(7)
        pass

    def get_observation_from_hardware(self):
        """从真实硬件获取观察向量"""
        # 1. 获取肌腱位置 (7个执行器的位置)
        actuations_deg = self.hand.get_actuations()  # 返回7个角度值
        if actuations_deg is None:
            return None

        # 转换为弧度 (与仿真一致)
        actuations_rad = [a * np.pi / 180 for a in actuations_deg]

        # 2. 归一化到仿真空间 [0, 1]
        from aero_open_sdk.aero_hand_constants import AeroHandConstants
        consts = AeroHandConstants()
        normalized_actuations = [
            (actuations_rad[i] - consts.actuation_lower_limits[i]) /
            (consts.actuation_upper_limits[i] - consts.actuation_lower_limits[i])
            for i in range(7)
        ]

        # 3. 构造观察向量: [肌腱长度(7) + 上一步动作(7)] = 14维
        obs = np.concatenate([normalized_actuations, self.last_action])
        return obs

    def compute_action(self, obs):
        """使用策略网络计算动作"""
        # 使用JAX进行前向传播
        action = self.policy_fn(self.policy_params, obs)
        return action

    def step(self):
        """执行一步控制"""
        # 1. 获取观察
        obs = self.get_observation_from_hardware()
        if obs is None:
            return False

        # 2. 计算动作
        action = self.compute_action(obs)

        # 3. 应用action_scale (与仿真一致)
        action_scale = np.array([0.02, 0.02, 0.02, 0.02, 0.7, 0.003, 0.012])
        motor_targets_deg = self.default_tendon + action * action_scale

        # 4. 发送到硬件
        self.hand.set_actuations(motor_targets_deg.tolist())

        # 5. 保存动作用于下一次观察
        self.last_action = action

        return True
```

### 步骤5：主控制循环

```python
import time

def main():
    # 初始化
    policy = Sim2RealPolicy(
        policy_params=extract_policy_weights("path/to/checkpoint"),
        checkpoint_path="path/to/checkpoint",
        port="/dev/ttyACM0"  # 或 Windows 下 "COM3"
    )

    # 归位
    print("执行归位...")
    policy.hand.send_homing()
    print("归位完成!")

    # 设置控制频率 (与仿真一致: 20Hz)
    ctrl_rate = 20  # Hz
    dt = 1.0 / ctrl_rate

    print("开始策略执行...")
    try:
        while True:
            start_time = time.time()

            # 执行一步控制
            success = policy.step()
            if not success:
                print("获取观察失败, 请检查硬件连接")
                break

            # 维持控制频率
            elapsed = time.time() - start_time
            sleep_time = dt - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
            else:
                print(f"警告: 控制循环超时 (耗时 {elapsed:.3f}s)")

    except KeyboardInterrupt:
        print("\n停止控制")
    finally:
        policy.hand.close()

if __name__ == "__main__":
    main()
```

---

## 路径二：CV视觉引导控制

### 架构概述

```
摄像头采集 → CV推理 → 目标姿态/动作 → SDK控制 → 硬件执行
```

### 步骤1：CV目标检测/姿态估计

```python
import cv2
import numpy as np

class VisionGuidedController:
    """CV视觉引导的灵巧手控制"""

    def __init__(self, camera_id=0, port=None):
        # 初始化摄像头
        self.cap = cv2.VideoCapture(camera_id)

        # 初始化灵巧手
        self.hand = AeroHand(port=port)

        # 目标物体检测模型 (示例: 使用YOLO)
        self.detector = self._init_detector()

    def _init_detector(self):
        """初始化目标检测器"""
        # 可以是 YOLO, MediaPipe, 自定义模型等
        # 这里以MediaPipe Hands为例
        import mediapipe as mp
        mp_hands = mp.solutions.hands
        return mp_hands.Hands(
            max_num_hands=1,
            min_detection_confidence=0.7
        )

    def detect_target_object(self, frame):
        """检测目标物体并返回位置/姿态"""
        # 示例: 检测立方体
        # 1. 预处理
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        # 2. 边缘检测
        edges = cv2.Canny(blur, 50, 150)

        # 3. 轮廓查找
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # 4. 找到最大轮廓 (假设是目标物体)
        if contours:
            max_contour = max(contours, key=cv2.contourArea)

            # 5. 获取边界框
            x, y, w, h = cv2.boundingRect(max_contour)

            # 6. 计算中心点
            center_x = x + w / 2
            center_y = y + h / 2

            return {
                'center': (center_x, center_y),
                'bbox': (x, y, w, h),
                'contour': max_contour
            }
        return None
```

### 步骤2：基于视觉目标计算抓取姿态

```python
    def compute_grasp_pose(self, target_info):
        """根据视觉目标计算抓取姿态"""
        # 示例: 简单的抓取策略

        # 1. 判断目标位置 (左/右/上/下)
        cx, cy = target_info['center']
        frame_w, frame_h = self.cap.get(3), self.cap.get(4)

        # 归一化坐标 [-1, 1]
        norm_x = (cx - frame_w / 2) / (frame_w / 2)
        norm_y = (cy - frame_h / 2) / (frame_h / 2)

        # 2. 根据位置选择预定义抓取姿态
        if norm_x < -0.3:  # 左侧
            grasp_pose = self.get_left_grasp()
        elif norm_x > 0.3:  # 右侧
            grasp_pose = self.get_right_grasp()
        else:  # 中间
            grasp_pose = self.get_center_grasp()

        return grasp_pose

    def get_center_grasp(self):
        """中心抓取姿态 (7关节)"""
        # 这些值需要根据实际任务调整
        return [
            0,      # 拇指外展
            30,     # 拇指屈曲
            45,     # 拇指
            50,     # 食指
            55,     # 中指
            50,     # 无名指
            40      # 小指
        ]
```

### 步骤3：执行视觉引导控制

```python
    def run(self):
        """运行视觉引导控制循环"""
        print("执行归位...")
        self.hand.send_homing()

        print("开始视觉引导控制 (按q退出)...")

        while True:
            # 1. 读取摄像头
            ret, frame = self.cap.read()
            if not ret:
                break

            # 2. 检测目标物体
            target = self.detect_target_object(frame)

            if target:
                # 3. 可视化
                x, y, w, h = target['bbox']
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.circle(frame, (int(target['center'][0]), int(target['center'][1])),
                          5, (0, 0, 255), -1)

                # 4. 计算抓取姿态
                grasp_pose = self.compute_grasp_pose(target)

                # 5. 发送到硬件 (平滑过渡)
                current_pose = self.hand.get_joint_positions_compact()
                if current_pose:
                    # 插值生成轨迹
                    trajectory = [
                        (current_pose, 0.1),      # 起始点
                        (grasp_pose, 0.5),         # 目标点
                    ]
                    self.hand.run_trajectory(trajectory)

            # 6. 显示画面
            cv2.imshow('Vision Guided Control', frame)

            # 7. 检查退出
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        self.cap.release()
        cv2.destroyAllWindows()
        self.hand.close()
```

---

## 核心转换代码实现

### 1. 观察空间转换

```python
def hardware_to_sim_obs(hand: AeroHand, last_action: np.ndarray) -> np.ndarray:
    """
    将真实硬件数据转换为仿真观察空间

    Args:
        hand: AeroHand实例
        last_action: 上一步动作 (7维)

    Returns:
        obs: 仿真观察向量 (14维)
    """
    from aero_open_sdk.aero_hand_constants import AeroHandConstants

    consts = AeroHandConstants()

    # 获取执行器位置 (角度)
    actuations_deg = hand.get_actuations()
    if actuations_deg is None:
        raise RuntimeError("无法获取执行器位置")

    # 转换为弧度
    actuations_rad = np.array(actuations_deg) * np.pi / 180

    # 归一化到 [0, 1]
    lower = np.array(consts.actuation_lower_limits)
    upper = np.array(consts.actuation_upper_limits)
    normalized = (actuations_rad - lower) / (upper - lower)

    # 构造观察: [肌腱位置(7) + 上一步动作(7)]
    obs = np.concatenate([normalized, last_action])

    return obs
```

### 2. 动作空间转换

```python
def sim_to_hardware_action(
    action: np.ndarray,
    default_tendon: np.ndarray,
    action_scale: np.ndarray
) -> list:
    """
    将仿真动作转换为硬件命令

    Args:
        action: 策略输出的动作 (7维)
        default_tendon: 默认肌腱位置
        action_scale: 动作缩放系数

    Returns:
        actuations_deg: 发送给硬件的执行器位置列表 (度)
    """
    # 应用动作缩放
    motor_targets = default_tendon + action * action_scale

    # 确保在有效范围内
    from aero_open_sdk.aero_hand_constants import AeroHandConstants
    consts = AeroHandConstants()

    lower = np.array(consts.actuation_lower_limits) * 180 / np.pi
    upper = np.array(consts.actuation_upper_limits) * 180 / np.pi

    motor_targets = np.clip(motor_targets, lower, upper)

    return motor_targets.tolist()
```

### 3. 完整策略类

```python
import jax
import jax.numpy as jnp
import numpy as np
from aero_open_sdk import AeroHand
from aero_open_sdk.aero_hand_constants import AeroHandConstants

class DeployedPolicy:
    """仿真训练策略的硬件部署类"""

    def __init__(
        self,
        policy_network,      # JAX策略网络函数
        policy_params,       # 训练好的参数
        port=None,
        action_scale=None
    ):
        self.policy_fn = policy_network
        self.policy_params = policy_params
        self.hand = AeroHand(port=port)
        self.consts = AeroHandConstants()

        # 动作缩放 (与仿真训练时一致)
        if action_scale is None:
            self.action_scale = np.array([
                0.02, 0.02, 0.02, 0.02, 0.7, 0.003, 0.012
            ])
        else:
            self.action_scale = action_scale

        # 默认肌腱位置 (从仿真keyframe获取)
        self.default_tendon = self._get_default_tendon()

        # 状态
        self.last_action = np.zeros(7)

    def _get_default_tendon(self):
        """获取默认肌腱位置 (度)"""
        # 这些值应该与仿真环境的home keyframe一致
        # 可以从仿真XML中读取或手动设置
        return np.array([
            10.0,   # thumb_cmc_abd
            0.0,    # thumb_cmc_flex
            20.0,   # thumb_tendon
            20.0,   # index_tendon
            20.0,   # middle_tendon
            20.0,   # ring_tendon
            20.0,   # pinky_tendon
        ])

    def get_observation(self) -> np.ndarray:
        """从硬件获取观察向量"""
        # 获取执行器位置
        actuations_deg = self.hand.get_actuations()
        if actuations_deg is None:
            return None

        # 转为弧度并归一化
        actuations_rad = np.array(actuations_deg) * np.pi / 180
        lower = np.array(self.consts.actuation_lower_limits)
        upper = np.array(self.consts.actuation_upper_limits)
        normalized = (actuations_rad - lower) / (upper - lower)

        # 构造观察
        obs = np.concatenate([normalized, self.last_action])
        return obs

    def compute_action(self, obs: np.ndarray) -> np.ndarray:
        """使用策略网络计算动作"""
        # 转换为JAX数组
        obs_jax = jnp.array(obs)

        # 前向传播
        action_jax = self.policy_fn(self.policy_params, obs_jax)

        # 转回numpy
        action = np.array(action_jax)
        return action

    def send_action(self, action: np.ndarray):
        """发送动作到硬件"""
        motor_targets = sim_to_hardware_action(
            action,
            self.default_tendon,
            self.action_scale
        )
        self.hand.set_actuations(motor_targets)

    def step(self) -> bool:
        """执行一步控制"""
        obs = self.get_observation()
        if obs is None:
            return False

        action = self.compute_action(obs)
        self.send_action(action)
        self.last_action = action
        return True

    def close(self):
        """关闭连接"""
        self.hand.close()
```

---

## 常见问题与调试

### 问题1: 串口连接失败

```
错误: No Aero Hand serial port detected
```

**解决方案**:
```python
# Linux: 手动指定端口
hand = AeroHand(port="/dev/ttyACM0")

# Windows: 手动指定COM口
hand = AeroHand(port="COM3")

# 检查权限 (Linux)
sudo usermod -a -G dialout $USER
# 然后重新登录
```

### 问题2: 动作超出限制

```
错误: actuations out of range
```

**解决方案**:
```python
# 确保动作在有效范围内
action = np.clip(action, -1.0, 1.0)

# 或在发送前检查
motor_targets = default_tendon + action * action_scale
lower = np.array(consts.actuation_lower_limits) * 180 / np.pi
upper = np.array(consts.actuation_upper_limits) * 180 / np.pi
motor_targets = np.clip(motor_targets, lower, upper)
```

### 问题3: 控制频率不稳定

```
警告: 控制循环超时 (耗时 0.15s)
```

**解决方案**:
```python
# 使用更高性能的机器
# 减少观察处理的复杂度
# 使用多线程: 一个线程读取传感器, 一个线程计算策略

import threading
import queue

class AsyncController:
    def __init__(self, policy):
        self.policy = policy
        self.obs_queue = queue.Queue(maxsize=1)
        self.action_queue = queue.Queue(maxsize=1)

    def sensor_thread(self):
        while True:
            obs = self.policy.get_observation()
            self.obs_queue.put(obs)
            time.sleep(0.01)

    def policy_thread(self):
        while True:
            obs = self.obs_queue.get()
            action = self.policy.compute_action(obs)
            self.action_queue.put(action)

    def actuator_thread(self):
        while True:
            action = self.action_queue.get()
            self.policy.send_action(action)
```

### 问题4: 仿真与现实差距大

**常见原因和解决方案**:

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 抓取不稳定 | 摩擦系数不匹配 | 在训练时使用域随机化 |
| 动作太激进 | 动作缩放太大 | 减小 action_scale |
| 响应慢 | 控制频率低 | 提高控制频率到20-50Hz |
| 抖动 | 观察噪声 | 添加滤波器 |

---

## 完整示例代码

### 示例1: 简单的预定义轨迹执行

```python
#!/usr/bin/env python3
"""示例: 执行预定义抓取轨迹"""

from aero_open_sdk import AeroHand

def main():
    # 连接硬件
    hand = AeroHand()

    # 归位
    print("执行归位...")
    hand.send_homing()

    # 定义抓取轨迹 (7个关节, 角度)
    trajectory = [
        ([0, 0, 0, 0, 0, 0, 0], 0.5),      # 张开, 0.5秒
        ([10, 30, 45, 50, 55, 50, 40], 1.0),  # 半握, 1秒
        ([20, 50, 70, 80, 85, 80, 70], 1.0),  # 全握, 1秒
        ([0, 0, 0, 0, 0, 0, 0], 1.0),      # 松开, 1秒
    ]

    # 执行轨迹
    print("执行抓取轨迹...")
    hand.run_trajectory(trajectory)

    print("完成!")
    hand.close()

if __name__ == "__main__":
    main()
```

### 示例2: 简单反应式控制

```python
#!/usr/bin/env python3
"""示例: 基于用户输入的简单控制"""

from aero_open_sdk import AeroHand

def main():
    hand = AeroHand()
    hand.send_homing()

    poses = {
        '1': [0, 0, 0, 50, 0, 0, 0],     # 食指伸展
        '2': [0, 0, 0, 0, 50, 0, 0],     # 中指伸展
        '3': [0, 0, 0, 0, 0, 50, 0],     # 无名指伸展
        '4': [0, 0, 0, 0, 0, 0, 50],     # 小指伸展
        '5': [30, 50, 70, 80, 85, 80, 70],  # 全握
        '0': [0, 0, 0, 0, 0, 0, 0],      # 全开
        'h': None,  # 归位
    }

    print("控制: 1-5=姿态, 0=张开, h=归位, q=退出")

    while True:
        cmd = input("> ").lower()
        if cmd == 'q':
            break
        elif cmd == 'h':
            print("归位中...")
            hand.send_homing()
        elif cmd in poses:
            hand.set_joint_positions(poses[cmd])
        else:
            print("未知命令")

    hand.close()

if __name__ == "__main__":
    main()
```

### 示例3: 带监控的RL策略部署

```python
#!/usr/bin/env python3
"""示例: 部署RL策略并监控状态"""

import time
import numpy as np
from aero_open_sdk import AeroHand

class MonitoredPolicy:
    def __init__(self, policy_fn, params, port=None):
        self.policy_fn = policy_fn
        self.params = params
        self.hand = AeroHand(port=port)
        self.last_action = np.zeros(7)
        self.action_scale = np.array([0.02, 0.02, 0.02, 0.02, 0.7, 0.003, 0.012])
        self.default_tendon = np.array([10, 0, 20, 20, 20, 20, 20])

    def get_obs(self):
        act = self.hand.get_actuations()
        if act is None:
            return None
        # 归一化
        normalized = (np.array(act) - 0) / 180  # 简化版
        return np.concatenate([normalized, self.last_action])

    def step_and_monitor(self):
        obs = self.get_obs()
        if obs is None:
            return None

        # 计算动作
        action = self.policy_fn(self.params, obs)

        # 发送到硬件
        targets = self.default_tendon + action * self.action_scale
        self.hand.set_actuations(targets.tolist())

        # 监控
        currents = self.hand.get_actuator_currents()
        temperatures = self.hand.get_actuator_temperatures()

        self.last_action = action

        return {
            'action': action,
            'currents': currents,
            'temperatures': temperatures,
        }

def main():
    # 假设已经加载了策略
    policy = MonitoredPolicy(policy_fn=policy_network, params=params)

    print("开始控制循环...")
    try:
        for i in range(1000):
            status = policy.step_and_monitor()

            if status and i % 10 == 0:
                print(f"Step {i}: Action={status['action'][:2].round(2)}... "
                      f"Avg Current={np.mean(status['currents']):.1f}mA")

            time.sleep(0.05)  # 20Hz

    except KeyboardInterrupt:
        pass
    finally:
        policy.hand.close()

if __name__ == "__main__":
    main()
```

---

## 总结

### Sim2Real成功的关键点

1. **动作空间一致**: 仿真和硬件使用相同的7维执行器空间
2. **观察空间对齐**: 硬件传感器数据正确映射到仿真观察
3. **参数匹配**: action_scale、默认位置等参数保持一致
4. **时序对齐**: 控制频率与仿真匹配 (20Hz)
5. **安全限制**: 动作和位置都有合理的限制

### 最佳实践

- **逐步测试**: 先仿真验证, 再硬件测试
- **监控状态**: 实时监控电流、温度等
- **安全第一**: 设置紧急停止, 限制最大电流
- **参数调优**: 根据硬件响应微调action_scale
- **数据记录**: 记录运行数据用于分析改进

---

*文档版本: 1.0*
*最后更新: 2025-12-30*
