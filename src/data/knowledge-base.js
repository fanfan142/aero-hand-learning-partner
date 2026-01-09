/**
 * Aero Hand 学习知识库
 * 包含完整的技术原理、架构说明、代码示例
 */

export const knowledgeCategories = [
  {
    id: 'architecture',
    title: '系统架构',
    icon: 'Connection',
    description: '理解各组件之间的关系和数据流',
    articles: [
      {
        id: 'overview',
        title: '整体架构概览',
        content: `
## 系统组成

Aero Hand Open 由 5 个核心模块组成：

\`\`\`
┌─────────────────────────────────────────────────┐
│                    上层应用                       │
│  (RL训练、遥操作、任务执行)                      │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│              SDK / ROS2 接口层                   │
│  Python API、ROS2话题、服务                      │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│                  ESP32 固件                      │
│  串口协议、舵机控制、归位逻辑                     │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│              HLS3606M 舵机阵列                   │
│  7个智能总线舵机（PWM控制）                      │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│               肌腱驱动机械结构                    │
│  3D打印部件、肌腱、滑轮系统                       │
└─────────────────────────────────────────────────┘
\`\`\`

## 数据流向

### 控制流（从上到下）
\`\`\`
用户指令 → SDK → 串口协议 → ESP32 → 舵机PWM → 手指运动
\`\`\`

### 反馈流（从下到上）
\`\`\`
舵机位置 → 串口反馈 → SDK → 状态读取 → 用户界面
\`\`\`

## 各层职责

| 层级 | 职责 | 技术 |
|------|------|------|
| **应用层** | 实现具体任务（抓取、操作等） | Python, C++, JAX |
| **接口层** | 提供标准化的控制API | Python SDK, ROS2 |
| **固件层** | 实时控制、串口通信 | C++ (Arduino) |
| **驱动层** | 执行运动指令 | Feetech HLS3606M |
| **机械层** | 传递运动、产生抓取力 | 肌腱、滑轮、3D件 |
        `
      },
      {
        id: 'firmware-architecture',
        title: '固件架构详解',
        content: `
## ESP32 固件核心模块

### 1. 串口通信协议 (SerialProtocol)

固件使用固定 16 字节帧格式与上位机通信：

\`\`\`cpp
struct SerialPacket {
  uint8_t  header;        // 0x7E 帧头
  uint8_t  cmd;           // 命令码 (见下表)
  uint8_t  data[12];      // 数据载荷
  uint8_t  checksum;      // 校验和
  uint8_t  tail;          // 0x7E 帧尾
};
\`\`\`

**重要命令码：**

| 命令码 | 功能 | 数据格式 |
|--------|------|----------|
| 0x01 | 设置舵机位置 | [舵机ID, 位置低, 位置高, ...] |
| 0x10 | 读取舵机位置 | [舵机ID] |
| 0x20 | 保存端点配置 | [配置数据] |
| 0x30 | 开始归位 | 无 |
| 0x31 | 停止归位 | 无 |

### 2. 舵机控制 (ServoData)

每个舵机的配置保存在 \`ServoData\` 结构体：

\`\`\`cpp
struct ServoData {
  uint8_t  id;           // 舵机ID (0-6)
  uint16_t grasp_count;  // 闭合端点 (最大弯曲位置)
  uint16_t extend_count; // 张开端点 (完全伸直位置)
  uint16_t current_pos;  // 当前位置 (0-4095)
};
\`\`\`

**关键点：**
- \`grasp_count\` 和 \`extend_count\` 是安全边界
- 固件将 0-100% 的控制命令映射到这两个值之间
- 避免手指碰到机械限位

### 3. 归位程序 (Homing)

归位是启动时的关键步骤：

\`\`\`
流程：
1. 收到归位命令 (0x30)
2. 所有舵机缓慢移动到 extend_count (张开端点)
3. 等待所有舵机到位
4. 标记归位完成，允许正常控制
\`\`\`

**为什么需要归位？**
- 启动时不知道手指当前位置
- 需要统一到已知起始状态
- 避免"突然运动"造成机械损坏

## 代码位置

主要源文件：
- \`firmware/main/firmware_v0.1.0.ino\` - 主程序
- \`firmware/main/Homing.cpp\` - 归位逻辑
- \`firmware/main/HandConfig.h\` - 配置定义
        `
      },
      {
        id: 'sdk-internals',
        title: 'SDK 内部实现',
        content: `
## Python SDK 架构

### 核心类：AeroHand

\`\`\`python
class AeroHand:
    def __init__(self, port=None):
        # 自动检测或使用指定端口
        self.serial = self._connect_serial(port)
        self.servos = [ServoData(i) for i in range(7)]

    def set_joint_positions(self, positions):
        """
        设置所有关节位置

        参数:
            positions: list[float] - 7个关节的百分比 (0-100)
        """
        for i, pos in enumerate(positions):
            percent = np.clip(pos, 0, 100)
            count = self._percent_to_count(i, percent)
            self._send_servo_command(i, count)

    def get_joint_positions(self):
        """读取当前所有关节位置"""
        # 发送读取命令
        # 解析返回数据
        return positions
\`\`\`

### 位置映射算法

\`\`\`python
def _percent_to_count(self, servo_id, percent):
    """
    将百分比转换为舵机计数值

    公式:
        count = extend_count + (grasp_count - extend_count) * percent / 100
    """
    servo = self.servos[servo_id]
    count_range = servo.grasp_count - servo.extend_count
    return int(servo.extend_count + count_range * percent / 100)
\`\`\`

**示例：**
- extend_count = 500
- grasp_count = 3500
- 命令 50% → count = 500 + (3500-500)*50/100 = **2000**

### GUI 工具

\`gui_chinese.py\` 提供可视化控制：

**功能模块：**
1. 端口检测 - 自动列出可用串口
2. 单舵机测试 - 精细控制每个舵机
3. 端点配置 - 设置 grasp/extend 值
4. 固件烧录 - 一键更新固件
5. 实时监控 - 显示位置反馈

## 示例脚本解析

### run_sequence.py

\`\`\`python
from aero_open_sdk import AeroHand
import time

# 初始化
hand = AeroHand()
time.sleep(1)  # 等待连接

# 执行动作序列
sequence = [
    [0, 0, 0, 0, 0, 0, 0],      # 张开
    [50, 30, 45, 50, 55, 50, 40], # 半握
    [100, 100, 100, 100, 100, 100, 100], # 握紧
]

for positions in sequence:
    hand.set_joint_positions(positions)
    time.sleep(1)

# 复位
hand.set_joint_positions([0]*7)
\`\`\`

**为什么需要延时？**
- 舵机运动需要时间（约 500ms-1s）
- 不等待会导致命令堆积
- 可能造成运动不平滑
        `
      }
    ]
  },
  {
    id: 'servo-control',
    title: '舵机控制原理',
    icon: 'Setting',
    description: '深入理解舵机配置和控制',
    articles: [
      {
        id: 'pwm-basics',
        title: 'PWM 控制基础',
        content: `
## 什么是 PWM？

PWM (Pulse Width Modulation，脉宽调制) 是舵机控制的标准方式。

### 信号时序

\`\`\`
标准舵机PWM信号：
┌─────┐                    ┌─────┐
│     │                    │     │
│     │                    │     │
└─────┘────────────────────└─────┘────→
  1.5ms    20ms 周期         1.5ms

高电平宽度决定位置：
- 0.5ms  → 最小角度 (通常 0°)
- 1.5ms  → 中间角度 (通常 90°)
- 2.5ms  → 最大角度 (通常 180°)
\`\`\`

## HLS3606M 的特殊之处

### 总线协议

不同于普通PWM舵机，HLS3606M使用**串行总线**：

\`\`\`
ESP32 ─── TX ──┬── 舵机0
              ├── 舵机1
              ├── 舵机2
              ├── ...
              └── 舵机6

所有舵机共享同一根信号线
\`\`\`

**优点：**
- 只需 1 个GPIO引脚控制7个舵机
- 减少ESP32引脚占用
- 简化布线

**协议格式：**
\`\`\`
数据帧: [起始位] [ID] [位置低] [位置高] [校验] [结束位]
\`\`\`

### 4096 级分辨率

\`\`\`
位置范围: 0 - 4095 (12位)
精度: 4096 级

实际角度:
- 0    → 完全伸直
- 2048 → 中间位置
- 4095 → 最大弯曲
\`\`\`

**为什么需要 4096 级？**
- 手指抓取需要精细控制
- 不同的物体需要不同的弯曲程度
- 更平滑的运动轨迹
        `
      },
      {
        id: 'endpoint-configuration',
        title: '端点配置详解',
        content: `
## 什么是端点配置？

端点配置定义了舵机的**安全运动范围**。

### 为什么要配置？

\`\`\`
未配置的问题:
extend_count 默认 = 0
grasp_count  默认 = 4095

问题:
1. 0 可能已经是弯曲状态（肌腱预紧）
2. 4095 可能超过机械限位
3. 可能导致机械损坏
\`\`\`

### 配置后

\`\`\`
配置后:
extend_count = 500   ← 你的手指伸直位置
grasp_count  = 3500  ← 你的手指安全弯曲极限

控制时:
命令 0%   → 实际发送 500
命令 50%  → 实际发送 2000
命令 100% → 实际发送 3500

✓ 永远在安全范围内
✓ 适应不同的装配误差
\`\`\`

## 详细配置步骤

### 第 1 步：连接单个舵机

\`\`\`bash
# 只连接一个舵机到ESP32
# 避免其他舵机的干扰
\`\`\`

### 第 2 步：启动 GUI

\`\`\`bash
python -m aero_open_sdk.gui_chinese
\`\`\`

1. 切换到"单舵机测试"标签
2. 选择对应的舵机ID (0-6)

### 第 3 步：找到张开端点

\`\`\`
操作：
1. 拖动滑块慢慢增大位置值
2. 观察手指，直到完全伸直
3. 检查肌腱是否松弛（不要过紧）
4. 记录这个值作为 extend_count
5. 点击"设为张开"按钮

⚠️ 注意：
- 不要让手指"反向弯曲"
- 肌腱应该刚好拉直，不要有张力
\`\`\`

### 第 4 步：找到闭合端点

\`\`\`
操作：
1. 拖动滑块慢慢减小位置值
2. 观察手指慢慢弯曲
3. 找到最大弯曲位置，但不要用力过猛
4. 手指应该能稳定保持这个位置
5. 点击"设为闭合"按钮

⚠️ 注意：
- 感觉到明显阻力就停止
- 不要让舵机"堵转"（发出滋滋声）
- 这个位置应该是可重复的
\`\`\`

### 第 5 步：保存到ESP32

\`\`\`
1. 确认两个端点值都正确
2. 点击"保存端点"按钮
3. 等待"保存成功"提示
4. 这个舵机的配置完成！

5. 对其他6个舵机重复上述步骤
\`\`\`

## 验证配置

\`\`\`bash
# 测试配置
python -m aero_open_sdk.gui_chinese

# 测试每个舵机：
# 1. 发送 0% 命令 → 应该到伸直位置
# 2. 发送 100% 命令 → 应该到弯曲位置
# 3. 发送 50% 命令 → 应该到中间位置

如果运动不平滑或碰到限位，需要重新配置！
\`\`\`

## 常见问题

### Q1: 为什么我的手指在0%还是弯曲的？

**A:** extend_count 设置太大了。重新配置，找到真正的伸直位置。

### Q2: 100%时手指还在抖动？

**A:** grasp_count 太小了，舵机在试图推过机械限位。减小这个值。

### Q3: 每次重启需要重新配置吗？

**A:** 不需要！配置保存在ESP32的EEPROM中，永久保存。

### Q4: 可以用代码设置端点吗？

**A:** 可以，但不推荐。GUI更直观，避免误操作。

\`\`\`python
# 代码方式（谨慎使用）
hand.servos[0].extend_count = 500
hand.servos[0].grasp_count = 3500
hand.save_endpoint_config()
\`\`\`
        `
      }
    ]
  },
  {
    id: 'mujoco-simulation',
    title: 'MuJoCo 仿真',
    icon: 'Monitor',
    description: '仿真环境搭建和控制',
    articles: [
      {
        id: 'xml-structure',
        title: 'MuJoCo XML 模型解析',
        content: `
## MuJoCo 模型文件结构

Aero Hand 的 MuJoCo 模型定义在 XML 文件中。

### 顶层结构

\`\`\`xml
<mujoco model="aero_hand">
  <compiler angle="radian"/>  <!-- 使用弧度制 -->

  <worldbody>
    <!-- 地面、桌子等环境 -->
  </worldbody>

  <actuator>
    <!-- 7个执行器（对应7个肌腱） -->
  </actuator>

  <tendon>
    <!-- 肌腱定义 -->
  </tendon>

  <sensor>
    <!-- 传感器（位置、力等） -->
  </sensor>
</mujoco>
\`\`\`

## 关键概念

### 1. Body（刚体）

\`\`\`xml
<body name="palm" pos="0 0 0.2">
  <geom name="palm_geom" type="mesh" mesh="palm_mesh"/>

  <body name="index_prox" pos="...">  <!-- 近端指骨 -->
    <joint name="index_prox_joint" type="hinge" axis="0 1 0"/>
    <!-- ... -->
  </body>
</body>
\`\`\`

**要点：**
- 每个骨骼是一个 body
- body 可以嵌套（父子关系）
- joint 定义连接方式

### 2. Tendon（肌腱）⭐ 核心

\`\`\`xml
<tendon>
  <spatial name="index_tendon" width="0.005">
    <!-- 定义肌腱路径 -->
    <site site="palm_anchor"/>          <!-- 起点：手掌 -->
    <site site="index_prox_pulley"/>    <!-- 滑轮1：近端 -->
    <site site="index_mid_pulley"/>     <!-- 滑轮2：中端 -->
    <site site="index_tip"/>            <!-- 终点：指尖 -->
  </spatial>
</tendon>
\`\`\`

**肌腱工作原理：**
\`\`\`
收紧肌腱 → 肌腱变短 → 拉动滑轮 → 关节弯曲

类似真实的人手肌腱！
\`\`\`

### 3. Actuator（执行器）

\`\`\`xml
<actuator>
  <motor name="index_motor" tendon="index_tendon" gear="100"/>
  <motor name="middle_motor" tendon="middle_tendon" gear="100"/>
  <!-- ... 共7个 -->
</actuator>
\`\`\`

**作用：**
- 执行器控制肌腱长度
- gear 值模拟力矩放大

### 4. Site（标记点）

\`\`\`xml
<site name="palm_anchor" pos="0.01 0.02 0.05" size="0.003"/>
\`\`\`

**作用：**
- 定义肌腱的路径点
- 可以是滑轮位置
- 可以是附着点

## 修改模型的技巧

### 调整关节限位

\`\`\`xml
<joint name="index_mcp_joint" type="hinge" axis="0 1 0"
       range="-0.1 1.5"  <!-- 弧度！限制关节活动范围 -->
       damping="0.01"/>  <!-- 阻尼 -->
\`\`\`

### 修改手指长度

\`\`\`xml
<body name="index_prox" pos="0.05 0 0">  <!-- 改pos调整位置 -->
  <!-- pos 的单位是米 -->
</body>
\`\`\`

### 添加抓取物体

\`\`\`xml
<body name="cube" pos="0 0.2 0.1">
  <freejoint/>  <!-- 自由物体 -->
  <geom name="cube_geom" type="box" size="0.02 0.02 0.02"/>
</body>
\`\`\`

## 模型文件位置

\`\`\`
sim_rl/simulation/assets/
├── aero_hand.xml          # 主模型
├── aero_hand_with_obj.xml # 带物体的版本
└── meshes/                # 3D网格文件
    ├── palm.stl
    ├── finger_prox.stl
    └── ...
\`\`\`
        `
      },
      {
        id: 'realtime-control',
        title: '实时控制仿真',
        content: `
## 问题：训练脚本只生成视频？

默认的 \`train_jax_ppo.py\` 执行流程：

\`\`\`
1. 训练 N 步（不可见）
2. 评估策略
3. 生成演示视频
4. 保存 checkpoint
5. 退出 ❌
\`\`\`

这不适合交互式调试！

## 解决方案：实时控制窗口

### 方法 1：使用 mujoco.viewer（推荐）

\`\`\`python
import mujoco
import mujoco.viewer
import numpy as np

# 加载模型
model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

# 启动交互式查看器
with mujoco.viewer.launch_passive(model, data) as viewer:
    while viewer.is_running():
        # === 你的控制逻辑 ===
        # 例如：键盘控制
        keys = viewer.user_input
        if keys.press[pygame.KEY_1]:
            data.ctrl[0] = 1.0  # 收紧食指
        elif keys.press[pygame.KEY_2]:
            data.ctrl[0] = 0.0  # 放松食指

        # === 物理步进 ===
        mujoco.mj_step(model, data)

        # === 同步到显示 ===
        viewer.sync()
\`\`\`

**效果：**
- 实时看到仿真画面
- 可以交互式控制
- 适合调试和测试

### 方法 2：键盘控制示例

\`\`\`python
import mujoco
import mujoco.viewer
import pygame

# 初始化
model = mujoco.MjSpec_from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

with mujoco.viewer.launch_passive(model, data) as viewer:
    clock = pygame.time.Clock()

    while viewer.is_running():
        # 处理键盘输入
        for event in pygame.event.get():
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_1:
                    # 食指完全弯曲
                    data.ctrl[0] = 1.0
                elif event.key == pygame.K_2:
                    # 食指放松
                    data.ctrl[0] = 0.0
                elif event.key == pygame.K_3:
                    # 所有手指弯曲（握拳）
                    data.ctrl[:] = 1.0
                elif event.key == pygame.K_4:
                    # 所有手指放松
                    data.ctrl[:] = 0.0

        # 步进物理
        mujoco.mj_step(model, data)

        # 更新显示
        viewer.sync()
        clock.tick(60)  # 60 FPS
\`\`\`

**键盘映射：**
\`\`\`
1 → 收紧食指
2 → 放松食指
3 → 握拳（所有手指）
4 → 松开（所有手指）
ESC → 退出
\`\`\`

### 方法 3：加载训练好的策略

\`\`\`python
import flax
import orbax.checkpoint
from your_ppo_code import PPONetwork

# 加载模型
model = PPONetwork(...)
checkpointer = orbax.checkpoint.PyTreeCheckpointer()
params = checkpointer.restore('checkpoint_100000')

with mujoco.viewer.launch_passive(model, data) as viewer:
    while viewer.is_running():
        # 策略推理
        actions, _ = model.apply(params, data.obs)
        data.ctrl[:] = actions

        mujoco.mj_step(model, data)
        viewer.sync()
\`\`\`

## 常见问题

### Q: viewer 窗口卡住？

**A:** 确保在循环中调用 \`viewer.sync()\`

### Q: 控制没有反应？

**A:** 检查 \`data.ctrl\` 的维度是否正确（应该是7维）

### Q: 物理不稳定？

**A:** 减小时间步或增加迭代次数：
\`\`\`xml
<option timestep="0.001" iterations="50"/>
\`\`\`

### Q: 如何添加鼠标交互？

**A:** 使用 MuJoCo 的内置相机控制：
- 左键拖动：旋转视角
- 右键拖动：平移
- 滚轮：缩放
- Ctrl+左键：施加力（交互）
        `
      },
      {
        id: 'mjx-acceleration',
        title: 'MJX 加速训练',
        content: `
## 什么是 MJX？

MJX 是 MuJoCo 的 **JAX 加速版本**。

\`\`\`
传统 MuJoCo:
串行执行，单核CPU
约 1000 steps/sec

MJX:
JAX JIT编译，GPU/TPU加速
约 100,000 steps/sec

提升：100倍！
\`\`\`

## 核心概念

### 1. JIT 编译

\`\`\`python
import jax

@jax.jit  # ← 这个装饰器魔法
def step_physics(state, action):
    # 第一次调用：编译（慢）
    # 之后调用：执行（快！）
    next_state = physics_step(state, action)
    return next_state
\`\`\`

### 2. 向量化

\`\`\`
传统方式：
for env in environments:
    step(env)  # 串行

MJX方式：
step(environments)  # 并行处理所有环境

同时模拟 1024 个环境！
\`\`\`

## mujoco_playground 框架

Aero Hand 使用 Google DeepMind 的 mujoco_playground：

\`\`\`
sim_rl/mujoco_playground/
├── _src/
│   └── manipulation/
│       └── aero_hand/
│           ├── aero_hand_env.py    # 环境定义
│           ├── aero_hand_xml.py    # 模型生成
│           └── layers.py           # 网络层
├── learning/
│   └── train_jax_ppo.py           # 训练脚本
\�── ...
\`\`\`

### 训练流程

\`\`\`bash
# 1. 设置环境
export MUJOCO_GL=egl  # 无头模式

# 2. 训练
python learning/train_jax_ppo.py \\
    --env_name=aero_hand \\
    --num_train_steps=10_000_000 \\
    --num_envs=1024 \\
    --learning_rate=3e-4

# 3. 监控（自动使用 wandb）
# 访问 https://wandb.ai/yourname
\`\`\`

### 训练配置参数

\`\`\`python
# 关键超参数

--num_envs=1024           # 并行环境数
--learning_rate=3e-4      # 学习率
--entropy_cost=1e-2       # 熵正则（探索）
--batch_size=2048         # 批大小
--ppo_epochs=8            # PPO更新轮数
--clip_epsilon=0.2        # PPO裁剪参数
--gamma=0.99              # 折扣因子
--GAE_lambda=0.95         # GAE参数
--update_every=50         # 更新频率
\`\`\`

## 调试技巧

### 只训练几步验证

\`\`\`bash
python learning/train_jax_ppo.py \\
    --num_train_steps=100 \\  # 只训练100步
    --eval_every=50           # 每50步评估
\`\`\`

### 恢复训练

\`\`\`bash
python learning/train_jax_ppo.py \\
    --restore_checkpoint_path=checkpoint_500000
\`\`\`

### 导出策略

\`\`\`python
import orbax.checkpoint

# 保存参数为 numpy 格式
params = checkpointer.restore('checkpoint_final')
np.save('policy_params.npy', params)
\`\`\`

## 性能优化

### GPU 内存不足？

减小并行环境数：

\`\`\`bash
--num_envs=512  # 从1024减到512
\`\`\`

### 训练不稳定？

增加熵正则（更多探索）：

\`\`\`bash
--entropy_cost=5e-2  # 从1e-2增加到5e-2
\`\`\`

### 收敛太慢？

增大学习率（注意不要过大）：

\`\`\`bash
--learning_rate=1e-3  # 从3e-4增加到1e-3
\`\`\`
        `
      }
    ]
  },
  {
    id: 'ros2-integration',
    title: 'ROS2 集成',
    icon: 'Connection',
    description: 'ROS2 节点和通信',
    articles: [
      {
        id: 'why-ros2',
        title: '为什么需要 ROS2？',
        content: `
## ROS2 的作用

ROS2 不是必须的，但对于复杂系统很有用。

### 什么时候不需要 ROS2？

\`\`\`
简单场景：
- 只是一个手在做抓取实验
- 不需要和其他设备协作
- Python SDK 足够

✅ 可以跳过 ROS2
\`\`\`

### 什么时候需要 ROS2？

\`\`\`
复杂场景：
- 多机器人协作（双臂、移动机械臂）
- 需要标准化的消息接口
- 和其他 ROS 包集成（导航、视觉等）
- C++ 和 Python 混合开发
- 需要实时性能

✅ 使用 ROS2
\`\`\`

## ROS2 vs SDK

| 特性 | SDK | ROS2 |
|------|-----|------|
| 简单性 | ✅ 非常简单 | ⚠️ 需要学习ROS |
| 灵活性 | ⚠️ 需要自己写 | ✅ 标准接口 |
| 扩展性 | ⚠️ 单机为主 | ✅ 分布式 |
| 性能 | ✅ 直接控制 | ⚠️ 有开销 |
| 社区 | ⚠️ 独立项目 | ✅ 庞大生态 |

## Aero Hand ROS2 架构

\`\`\`
┌─────────────────────────────────────────┐
│         ROS2 节点网络                    │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────┐      ┌──────────┐         │
│  │ 轨迹规划  │ ──→  │ 手控制节点 │───→ ESP32│
│  │  节点    │      │          │         │
│  └──────────┘      └──────────┘         │
│       ↑                  ↑              │
│       │                  │              │
│  ┌──────────┐      ┌──────────┐         │
│  │ 视觉节点  │      │ 键盘控制  │         │
│  └──────────┘      └──────────┘         │
│                                          │
└─────────────────────────────────────────┘
\`\`\`

## 核心概念

### 1. Topic（话题）

\`\`\`
发布者-订阅者模式：

发布者节点：
  /hand/command ──→ "设置关节位置"
                ↓
订阅者节点：
  "读取命令"    → 调用SDK → ESP32

✓ 解耦
✓ 多对多通信
\`\`\`

### 2. Message（消息）

\`\`\`python
# 示例：关节位置消息
from std_msgs.msg import Float32MultiArray

msg = Float32MultiArray()
msg.data = [0.0, 30.0, 45.0, 50.0, 55.0, 50.0, 40.0]

publisher.publish(msg)
\`\`\`

### 3. Node（节点）

\`\`\`python
import rclpy
from rclpy.node import Node

class HandControlNode(Node):
    def __init__(self):
        super().__init__('hand_control')

        # 创建发布者
        self.cmd_pub = self.create_publisher(
            Float32MultiArray,
            '/hand/command',
            10
        )

        # 创建订阅者
        self.state_sub = self.create_subscription(
            JointState,
            '/hand/state',
            self.state_callback,
            10
        )
\`\`\`

## 实际使用场景

### 场景1：遥操作

\`\`\`
键盘节点 ──→ /hand/teleop ──→ 手控制节点 ──→ 硬件
\`\`\`

### 场景2：视觉引导抓取

\`\`\`
相机节点 → /object/pose → 轨迹规划 → /hand/command → 手
\`\`\`

### 场景3：多臂协作

\`\`\`
      /hand/left/cmd
         ↙        ↘
中央协调节点            左手和右手
         ↘        ↙
      /hand/right/cmd
\`\`\`
        `
      },
      {
        id: 'ros2-setup',
        title: 'ROS2 环境搭建',
        content: `
## 安装 ROS2 Humble

### Ubuntu 22.04

\`\`\`bash
# 1. 添加源
sudo apt update && sudo apt install software-properties-common -y
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

# 2. 安装
sudo apt update
sudo apt install ros-humble-desktop -y

# 3. 环境设置
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc

# 4. 开发工具
sudo apt install python3-colcon-common-tools -y
\`\`\`

## 安装 Aero Hand ROS2 包

\`\`\`bash
# 1. 创建工作空间
mkdir -p ~/aero_ros_ws/src
cd ~/aero_ros_ws/src

# 2. 克隆 ROS2 包（假设存在）
git clone https://github.com/tether-ia/aero-hand-ros2.git

# 3. 安装依赖
cd ~/aero_ros_ws
rosdep install --from-paths src --ignore-src -r -y

# 4. 编译
colcon build --symlink-install

# 5. 激活
source ~/aero_ros_ws/install/setup.bash
\`\`\`

## 运行示例节点

\`\`\`bash
# 终端1：启动手控制节点
ros2 run aero_hand hand_control_node

# 终端2：发送命令
ros2 topic pub /hand/command std_msgs/msg/Float32MultiArray \\
  "{data: [0.0, 30.0, 45.0, 50.0, 55.0, 50.0, 40.0]}"

# 终端3：查看状态
ros2 topic echo /hand/state
\`\`\`

## 常用命令

\`\`\`bash
# 列出所有话题
ros2 topic list

# 查看话题信息
ros2 topic info /hand/command

# 查看消息类型
ros2 interface show std_msgs/msg/Float32MultiArray

# 记录和回放
ros2 bag record -o my_data /hand/command /hand/state
ros2 bag play my_data

# 节点图
ros2 run rqt_graph rqt_graph
\`\`\`
        `
      }
    ]
  },
  {
    id: 'rl-sim2real',
    title: 'RL 与 Sim2Real',
    icon: 'TrendCharts',
    description: '强化学习和仿真到实物转移',
    articles: [
      {
        id: 'ppo-algorithm',
        title: 'PPO 算法原理',
        content: `
## 什么是 PPO？

PPO (Proximal Policy Optimization) 是最流行的强化学习算法之一。

### 为什么选择 PPO？

\`\`\`
优点：
✓ 稳定性好（不容易崩溃）
✓ 样本效率高
✓ 易于调参
✓ 支持连续动作空间（适合机器人）

缺点：
⚠️ 比一些新算法慢（但更可靠）
\`\`\`

## 核心概念

### 1. Policy Gradient（策略梯度）

\`\`\`
目标：学习一个策略 π(a|s) 映射状态到动作

方法：
1. 用当前策略收集轨迹
2. 计算每个动作的回报
3. 好的动作 ↑ 增加概率
4. 坏的动作 ↓ 减小概率
\`\`\`

### 2. Actor-Critic

\`\`\`
Actor（策略网络）：
  输入：状态 s
  输出：动作 a 的分布
  参数：θ

Critic（价值网络）：
  输入：状态 s
  输出：状态价值 V(s)
  参数：φ

训练：
  Actor 试图最大化回报
  Critic 估计价值，指导 Actor
\`\`\`

### 3. PPO 的裁剪机制（关键创新）

\`\`\`
问题：策略更新太大 → 崩溃

解决：限制更新幅度

L^CLIP + ... = min(
  r_t * A_t,                              # 标准策略梯度
  clip(r_t, 1-ε, 1+ε) * A_t               # 裁剪版本
)

其中：
r_t = π_new(a|s) / π_old(a|s)  # 概率比
A_t = 优势函数（估计这个动作有多好）
ε = 0.2（裁剪范围）
\`\`\`

**效果：**
- 如果新策略远好于旧策略：正常更新
- 如果新策略远差于旧策略：不更新（裁剪）
- **避免灾难性遗忘**

## PPO 训练流程

\`\`\`python
for iteration in range(num_iterations):
    # 1. 收集经验
    for env in environments:
        states, actions, rewards = collect(
            policy=current_policy,
            env=env,
            steps=2048
        )

    # 2. 计算优势
    advantages = compute_gae(
        rewards,
        values,
        gamma=0.99,
        lambda=0.95
    )

    # 3. 更新策略（多次使用同一批数据）
    for epoch in range(ppo_epochs=8):
        for batch in shuffle(data):
            # 计算损失
            loss = compute_ppo_loss(
                policy=current_policy,
                states=batch.states,
                actions=batch.actions,
                advantages=batch.advantages,
                epsilon=0.2
            )

            # 反向传播
            loss.backward()
            optimizer.step()

    # 4. 评估
    eval_rewards = evaluate(policy, eval_envs)
    print(f"Iteration {iteration}: {eval_rewards}")
\`\`\`

## Aero Hand 使用的 PPO

\`\`\`
网络架构：
├── Feature Extractor (MLP)
│   └── 输入：关节位置、物体位置等
├── Actor Head
│   └── 输出：7个动作（连续值）
└── Critic Head
    └── 输出：状态价值

超参数：
learning_rate = 3e-4
gamma = 0.99
GAE_lambda = 0.95
clip_epsilon = 0.2
entropy_cost = 1e-2
batch_size = 2048
ppo_epochs = 8
\`\`\`

## 训练曲线解读

\`\`\`
典型曲线：

Episode Reward
    │
 100│        ╭───── 优秀水平
    │       ╱
  50│      ╱
    │     ╱  ←── 开始学习
   0│────╱───────
    │   ╱
-50│  ╱
    │ ╱ ←── 随机探索
    └────────────→ Training Steps

如果一直不上升：
→ 检查奖励函数
→ 检查状态空间
→ 增加探索（熵）

如果剧烈波动：
→ 降低学习率
→ 增大批大小
→ 检查环境bug
\`\`\`
        `
      },
      {
        id: 'domain-randomization',
        title: '域随机化',
        content: `
## Sim2Real 挑战

\`\`\`
仿真环境 ≠ 真实世界

差距来源：
1. 物理参数不准确（摩擦、质量）
2. 传感器误差
3. 执行器延迟和非线性
4. 机械公差
\`\`\`

## 域随机化（Domain Randomization）

**核心思想：**在训练时随机化环境参数，让策略适应各种情况。

### 随机化什么？

\`\`\`python
# 在环境 reset 时

# 1. 物理属性
xmlCompiler.setModifier(
    "tendon",
    "stiffness",
    random.uniform(50, 150)  # 肌腱刚度 ±50%
)

# 2. 几何尺寸
body_geom.set_size(
    random.uniform(0.9, 1.1)  # 尺寸 ±10%
)

# 3. 传感器噪声
observation += np.random.normal(
    0,
    sensor_noise_level  # 高斯噪声
)

# 4. 动作延迟
if random.random() < 0.1:  # 10%概率
    action = prev_action  # 延迟一帧
\`\`\`

### 为什么有效？

\`\`\`
训练时策略见过：
- 不同的手指长度
- 不同的摩擦系数
- 不同的传感器噪声

→ 学习到鲁棒的特征

→ 真实世界只是"又一个环境"
\`\`\`

## Aero Hand 的随机化策略

\`\`\`python
# mujoco_playground 的实现

class DomainRandomizer:
    def randomize(self, xml_path):
        # 肌腱随机化
        for tendon in xml_path.find_all('tendon'):
            tendon.stiffness = random.uniform(0.5, 1.5)
            tendon.damping = random.uniform(0.8, 1.2)

        # 关节阻尼
        for joint in xml_path.find_all('joint'):
            joint.damping = random.uniform(0.5, 2.0)

        # 物体属性
        for geom in xml_path.find_all('geom'):
            if geom.friction is not None:
                geom.friction = random.uniform(0.5, 1.0)

        # 视觉随机化（相机纹理）
        if self.randomize_visuals:
            randomize_textures(xml_path)
\`\`\`

## 循序渐进的随机化

\`\`\`
训练策略：

阶段1 (0-1M steps):
  无随机化 → 学习基本任务

阶段2 (1-3M steps):
  轻度随机化 ±10% → 适应小变化

阶段3 (3-5M steps):
  中度随机化 ±25% → 增强鲁棒性

阶段4 (5-10M steps):
  高度随机化 ±50% → 完全泛化
\`\`\`

## 调试技巧

### 验证随机化有效性

\`\`\`bash
# 1. 固定种子测试
python train.py --seed=123 --no-randomize
# 应该性能很好

# 2. 不同种子测试
python train.py --seed=456 --no-randomize
# 性能应该差不多

# 3. 随机化测试
python train.py --seed=123 --randomize
# 性能应该略差，但稳定

如果随机化后崩溃：
→ 随机化太激进
→ 减小范围
\`\`\`

### 真实迁移测试

\`\`\`bash
# 训练多个检查点
checkpoint_1M   # 无随机化
checkpoint_3M   # 轻度随机化
checkpoint_5M   # 中度随机化
checkpoint_10M  # 高度随机化

# 依次测试到真实硬件
→ 找到最优随机化程度
\`\`\`
        `
      },
      {
        id: 'deployment',
        title: '策略部署',
        content: `
## 部署流程总览

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 仿真训练    │ →  │ 策略导出    │ →  │ 硬件部署    │
│ MJX + PPO   │    │ params.npy  │    │ ESP32       │
└─────────────┘    └─────────────┘    └─────────────┘
                      ↓
               ┌─────────────┐
               │ 测试验证    │
               │ 闭环验证    │
               └─────────────┘
\`\`\`

## 方法 1：通过 SDK 部署（简单）

### 步骤 1：导出策略

\`\`\`python
# export_policy.py
import jax
import numpy as np
from your_ppo_network import PPONetwork

# 加载训练好的参数
params = checkpointer.restore('checkpoint_10M')

# 创建推理函数
@jax.jit
def policy_inference(obs, params):
    '''推理函数，输入状态，输出动作'''
    action, _ = network.apply(params, obs)
    return action

# 保存参数
np.save('policy_params.npy, params)

# 保存推理函数
import pickle
with open('policy_fn.pkl', 'wb') as f:
    pickle.dump(policy_inference, f)
\`\`\`

### 步骤 2：Python 控制脚本

\`\`\`python
# run_sim2real.py
import numpy as np
import jax
from aero_open_sdk import AeroHand
import pickle

# 加载策略
with open('policy_fn.pkl', 'rb') as f:
    policy_fn = pickle.load(f)

params = np.load('policy_params.npy', allow_pickle=True)

# 连接硬件
hand = AeroHand()
hand.home()  # 归位

# 主循环
try:
    while True:
        # 1. 获取当前状态
        joint_pos = hand.get_joint_positions()
        object_pos = get_object_position()  # 需要视觉系统

        # 2. 构造观测
        obs = np.concatenate([joint_pos, object_pos])

        # 3. 策略推理
        action = policy_fn(obs, params)

        # 4. 执行动作
        hand.set_joint_positions(action)

        # 5. 延时
        time.sleep(0.05)  # 20Hz控制频率

except KeyboardInterrupt:
    hand.set_joint_positions([0]*7)  # 复位
\`\`\`

### 步骤 3：运行

\`\`\`bash
python run_sim2real.py
\`\`\`

## 方法 2：通过 ROS2 部署（标准）

### 架构

\`\`\`
┌──────────┐  /policy/state    ┌──────────┐  /hand/command  ┌──────┐
│ 策略节点  │ ─────────────────→ │ 手控制节点 │ ───────────────→ │ ESP32 │
│ (PPO)    │                    │ (SDK包装)  │                  │      │
└──────────┘                    └──────────┘                  └──────┘
     ↑                                                               ↓
     │                      /hand/state                               │
     └────────────────────────────────────────────────────────────────┘
\`\`\`

### 策略节点

\`\`\`python
# policy_node.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32MultiArray

class PolicyNode(Node):
    def __init__(self):
        super().__init__('policy_node')

        # 订阅状态
        self.state_sub = self.create_subscription(
            Float32MultiArray,
            '/hand/state',
            self.state_callback,
            10
        )

        # 发布动作
        self.action_pub = self.create_publisher(
            Float32MultiArray,
            '/hand/command',
            10
        )

        # 加载策略
        self.policy = load_policy()
        self.params = np.load('policy_params.npy')

    def state_callback(self, msg):
        # 收到状态，推理并发布动作
        obs = np.array(msg.data)
        action = self.policy(obs, self.params)

        cmd = Float32MultiArray()
        cmd.data = action.tolist()
        self.action_pub.publish(cmd)

rclpy.init()
node = PolicyNode()
rclpy.spin(node)
\`\`\`

### 运行

\`\`\`bash
# 终端1：手控制节点
ros2 run aero_hand hand_control_node

# 终端2：策略节点
ros2 run aero_hand policy_node

# 终端3：监控
ros2 topic echo /hand/command
\`\`\`

## 现实世界调整

### 1. 频率匹配

\`\`\`
仿真：100Hz
现实：20-50Hz（受硬件限制）

→ 调整控制循环延时
\`\`\`

### 2. 动作缩放

\`\`\`python
# 仿真训练的动作范围是 [-1, 1]
# 实际硬件需要映射

def map_action_to_hardware(action):
    """
    将 [-1, 1] 映射到 [0, 100]
    """
    return (action + 1) * 50  # 线性映射

# 或者保持比例
def scale_action(action, scale=0.8):
    """
    缩小动作幅度，更保守
    """
    return action * scale
\`\`\`

### 3. 安全检查

\`\`\`python
def safe_execute(hand, action):
    # 1. 限制范围
    action = np.clip(action, 0, 100)

    # 2. 检查速度（避免突变）
    if np.max(np.abs(action - last_action)) > 20:
        # 变化太大，限制
        action = last_action + np.sign(action - last_action) * 20

    # 3. 检查力矩（如果有力传感器）
    if get_current_force() > MAX_FORCE:
        # 力太大，停止
        return

    hand.set_joint_positions(action)
\`\`\`

## 常见问题

### Q: 仿真中很好，现实中不动？

**检查：**
1. 硬件连接（串口、电源）
2. 舵机是否归位
3. 控制频率是否太低

### Q: 动作太激进？

**解决：**
1. 缩小动作幅度
2. 增加低通滤波
3. 重新训练（缩小动作空间）

### Q: 性能下降严重？

**可能原因：**
1. 域随机化不够
2. 传感器噪声
3. 机械差异

**解决：**
1. 真实数据微调（Real2Real）
2. 系统辨识调整仿真
3. 改进硬件一致性
        `
      }
    ]
  },
  {
    id: 'code-examples',
    title: '代码示例库',
    icon: 'Files',
    description: '实用代码片段和脚本',
    articles: [
      {
        id: 'sdk-basics',
        title: 'SDK 基础操作',
        content: `
## 安装 SDK

\`\`\`bash
# 从源码安装（开发模式）
cd sdk/
pip install -e .

# 或从 PyPI 安装
pip install aero-open-sdk
\`\`\`

## 基础操作

### 1. 连接和初始化

\`\`\`python
from aero_open_sdk import AeroHand
import time

# 自动检测端口
hand = AeroHand()
# 或指定端口
# hand = AeroHand(port='/dev/ttyUSB0')

# 等待连接
time.sleep(1)

print(f"连接成功: {hand.serial.port}")
\`\`\`

### 2. 归位

\`\`\`python
# 启动归位程序
hand.home()

# 等待归位完成
while hand.is_homing():
    time.sleep(0.1)
    print("归位中...")

print("归位完成！")
\`\`\`

### 3. 单关节控制

\`\`\`python
# 设置单个关节（食指基关节 = 0）
hand.set_joint_position(0, 50)  # 50%
time.sleep(1)

# 读取位置
pos = hand.get_joint_position(0)
print(f"关节0位置: {pos}%")
\`\`\`

### 4. 多关节控制

\`\`\`python
# 设置所有关节
# 顺序：[食指, 中指, 无名指, 小指, 拇指内收, 拇指弯曲]
positions = [0, 0, 0, 0, 0, 0]  # 全张开
hand.set_joint_positions(positions)
time.sleep(1)

positions = [50, 50, 50, 50, 50, 50]  # 半握
hand.set_joint_positions(positions)
time.sleep(1)

positions = [100, 100, 100, 100, 100, 100]  # 全握
hand.set_joint_positions(positions)
time.sleep(1)

# 复位
hand.set_joint_positions([0]*6)
\`\`\`

### 5. 平滑运动

\`\`\`python
# 使用轨迹插值
import numpy as np

start = [0, 0, 0, 0, 0, 0]
target = [100, 100, 100, 100, 100, 100]
steps = 50

for i in range(steps):
    t = i / steps
    # 线性插值
    current = [
        s + (e - s) * t
        for s, e in zip(start, target)
    ]
    hand.set_joint_positions(current)
    time.sleep(0.02)  # 50Hz
\`\`\`

## 实用脚本

### 测试所有舵机

\`\`\`python
# test_all_servos.py
from aero_open_sdk import AeroHand
import time

hand = AeroHand()
hand.home()
time.sleep(1)

print("测试所有7个舵机...")

for i in range(7):
    print(f"\\n测试舵机 {i}")

    # 张开
    hand.set_joint_position(i, 0)
    time.sleep(1)

    # 中间
    hand.set_joint_position(i, 50)
    time.sleep(1)

    # 闭合
    hand.set_joint_position(i, 100)
    time.sleep(1)

    # 复位
    hand.set_joint_position(i, 0)
    time.sleep(1)

print("\\n测试完成！")
\`\`\`

### 读取配置

\`\`\`python
# read_config.py
hand = AeroHand()

print("端点配置：")
for i, servo in enumerate(hand.servos):
    print(f"舵机 {i}:")
    print(f"  张开: {servo.extend_count}")
    print(f"  闭合: {servo.grasp_count}")
    print(f"  范围: {servo.grasp_count - servo.extend_count}")
\`\`\`

### 抓取序列

\`\`\`python
# grasp_sequence.py
from aero_open_sdk import AeroHand
import time

hand = AeroHand()
hand.home()

# 预握姿势（准备抓取）
pre_grasp = [30, 30, 30, 30, 80, 50]
hand.set_joint_positions(pre_grasp)
time.sleep(0.5)

# 移动手到物体位置（需要外部系统）
# 移动机械臂...

# 闭合抓取
grasp = [80, 80, 80, 80, 90, 70]
hand.set_joint_positions(grasp)
time.sleep(0.5)

# 抬起（需要外部系统）
# 移动机械臂...

# 松开
hand.set_joint_positions([0]*6)
\`\`\`
        `
      },
      {
        id: 'mujoco-scripts',
        title: 'MuJoCo 控制脚本',
        content: `
## 基础仿真脚本

### 加载和显示

\`\`\`python
import mujoco
import mujoco.viewer

# 加载模型
model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

# 启动查看器
with mujoco.viewer.launch_passive(model, data) as viewer:
    while viewer.is_running():
        mujoco.mj_step(model, data)
        viewer.sync()
\`\`\`

### 键盘控制

\`\`\`python
# keyboard_control.py
import mujoco
import mujoco.viewer
import pygame

# 初始化
model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

# 初始化 pygame
pygame.init()
screen = pygame.display.set_mode([200, 100])

with mujoco.viewer.launch_passive(model, data) as viewer:
    clock = pygame.time.Clock()

    # 当前控制值
    current_ctrl = [0.0] * 7

    while viewer.is_running():
        # 处理事件
        for event in pygame.event.get():
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_1:
                    # 食指弯曲
                    current_ctrl[0] = 1.0
                elif event.key == pygame.K_2:
                    # 食指伸直
                    current_ctrl[0] = 0.0
                elif event.key == pygame.K_3:
                    # 握拳
                    current_ctrl = [1.0] * 7
                elif event.key == pygame.K_4:
                    # 张开
                    current_ctrl = [0.0] * 7
                elif event.key == pygame.K_r:
                    # 重置仿真
                    mujoco.mj_reset(model, data)

        # 应用控制
        data.ctrl[:] = current_ctrl

        # 步进
        mujoco.mj_step(model, data)
        viewer.sync()
        clock.tick(60)
\`\`\`

### 轨迹跟踪

\`\`\`python
# trajectory_following.py
import numpy as np
import mujoco

def generate_trajectory(duration, dt):
    """生成正弦波轨迹"""
    steps = int(duration / dt)
    trajectory = []

    for t in range(steps):
        # 慢慢握紧再松开
        phase = 2 * np.pi * t / steps
        pos = 0.5 * (1 + np.sin(phase - np.pi/2))
        trajectory.append([pos] * 7)

    return trajectory

# 加载模型
model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

# 生成轨迹
dt = model.opt.timestep
trajectory = generate_trajectory(duration=5.0, dt=dt)

# 执行轨迹
with mujoco.viewer.launch_passive(model, data) as viewer:
    for target_pos in trajectory:
        # 简单比例控制器
        current_pos = data.ctrl[:]
        error = np.array(target_pos) - current_pos
        data.ctrl[:] = current_pos + 0.1 * error

        mujoco.mj_step(model, data)
        viewer.sync()
\`\`\`

## 可视化脚本

### 绘制关节角度

\`\`\`python
# plot_joints.py
import matplotlib.pyplot as plt
import numpy as np

# 记录数据
joint_history = []

with mujoco.viewer.launch_passive(model, data) as viewer:
    for _ in range(1000):
        mujoco.mj_step(model, data)

        # 记录关节角度
        qpos = data.qpos[:7].copy()
        joint_history.append(qpos)

        viewer.sync()

# 绘图
joint_history = np.array(joint_history)

plt.figure(figsize=(12, 6))
for i in range(7):
    plt.plot(joint_history[:, i], label=f'Joint {i}')

plt.xlabel('Time step')
plt.ylabel('Joint position (rad)')
plt.title('Joint Trajectories')
plt.legend()
plt.grid(True)
plt.show()
\`\`\`

### 绘制肌腱张力

\`\`\`python
# plot_tension.py
tendon_history = []

with mujoco.viewer.launch_passive(model, data) as viewer:
    for _ in range(1000):
        mujoco.mj_step(model, data)

        # 记录肌腱张力
        tension = data.tendon_length[:]  # 或 tendon_velocity
        tendon_history.append(tension.copy())

        viewer.sync()

# 绘图
tendon_history = np.array(tendon_history)

fig, axes = plt.subplots(2, 4, figsize=(16, 8))
axes = axes.flatten()

for i in range(7):
    axes[i].plot(tendon_history[:, i])
    axes[i].set_title(f'Tendon {i}')
    axes[i].grid(True)

axes[7].remove()  # 移除多余子图
plt.tight_layout()
plt.show()
\`\`\`
        `
      }
    ]
  }
]

export const getArticleById = (categoryId, articleId) => {
  const category = knowledgeCategories.find(c => c.id === categoryId)
  if (!category) return null
  return category.articles.find(a => a.id === articleId)
}

export const getCategoryById = (id) => {
  return knowledgeCategories.find(c => c.id === id)
}
