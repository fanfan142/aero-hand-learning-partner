/**
 * Aero Hand 扩展知识库
 * 包含官方文档翻译、详细教程、Sim2Real示例
 */

export const extendedKnowledge = {
  // ========== 官方文档翻译 ==========
  officialDocs: {
    intro: {
      title: '项目介绍',
      content: `
## 什么是 Aero Hand Open？

Aero Hand Open 是一个**开源、肌腱驱动**的灵巧机械手项目，专为研究和教育设计。

### 核心特点

- **肌腱驱动**：模拟真实人手的肌腱系统
- **欠驱动设计**：7个执行器控制复杂运动
- **开源硬件**：3D打印 + 标准电子元件
- **完整软件栈**：从仿真到Sim2Real

### 与商业方案对比

| 特性 | Aero Hand Open | 商业灵巧手 |
|------|----------------|-----------|
| 价格 | ~$500 | $5,000 - $50,000 |
| 开放性 | 完全开源 | 专有封闭 |
| 可定制性 | 高 | 低 |
| 维护成本 | 低 | 高 |
| 教育适用性 | ✅ 优秀 | ⚠️ 受限 |

### 应用场景

1. **研究**：灵巧操作、抓取学习、Sim2Real
2. **教育**：机器人学、控制理论、AI
3. **原型开发**：快速验证设计概念
4. **DIY爱好者**：学习和实践机器人技术
      `
    },
    hardware: {
      title: '硬件清单（零件级）',
      content: `
## 完整硬件清单

### 电子元件

#### 必需组件
\`\`\`
ESP32-S3 开发板 × 1
  - 型号：ESP32-S3-DevKitC-1
  - 用途：主控制器
  - 价格：~$10

Feetech HLS3606M 舵机 × 7
  - 型号：HLS3606M
  - 规格：12位精度，总线控制
  - 用途：驱动7根手指
  - 价格：~$15 × 7 = $105

USB-C 数据线 × 1
  - 用途：ESP32供电和编程

5V 3A 电源适配器 × 1
  - 用途：舵机供电（重要！）
\`\`\`

#### 可选组件
\`\`\`
逻辑分析仪 × 1（调试用）
万用表 × 1
帮助架（固定手掌）
\`\`\`

### 3D打印零件

#### 手掌部分
\`\`\`
palm_left.stl          # 左手掌
palm_right.stl         # 右手掌
palm_cover.stl         # 手掌盖板
\`\`\`

#### 手指部分 × 4（食指、中指、无名指、小指）
\`\`\`
finger_proximal.stl    # 近端指骨
finger_intermediate.stl # 中端指骨
finger_distal.stl      # 远端指骨
fingertip.stl          # 指尖
\`\`\`

#### 拇指部分
\`\`\`
thumb_metacarpal.stl   # 掌骨
thumb_proximal.stl     # 近端
thumb_distal.stl       # 远端
thumb_tip.stl          # 指尖
\`\`\`

#### 机械零件
\`\`\`
pulley_3mm.stl         # 3mm滑轮 × 若干
pulley_5mm.stl         # 5mm滑轮 × 若干
wrist_mount.stl        # 腕部安装座
\`\`\`

### 机械零件

#### 肌腱材料
\`\`\`
钓鱼线（Dyneema或Spectra）× 2米
  - 直径：0.5mm - 0.8mm
  - 强度：≥50kg
  - 特点：不拉伸、耐磨损

或
缝合线（ coated PET ）× 2米
  - 直径：0.3mm
  - 医用级、生物相容
\`\`\`

#### 紧固件
\`\`\`
M2 螺丝 × 20
M2 螺母 × 20
M2.5 螺丝 × 10
M2.5 螺母 × 10
\`\`\`

### 工具清单

#### 3D打印
\`\`\`
3D打印机（FDM）
  - 推荐型号：Ender 3, Prusa i3
  - 最小构建尺寸：150×150×150mm

PLA 打印材料 × 1卷
  - 颜色：建议浅色（便于观察）
  - 重量：1kg

打印设置：
  - 层高：0.2mm
  - 填充：20-30%
  - 支撑：需要
  - 温度：200°C
\`\`\`

#### 组装工具
\`\`\`
小螺丝刀（PH0, PH1）× 1
镊子 × 1
剪钳 × 1
尖嘴钳 × 1
小扳手 × 1
\`\`\`

#### 测试工具
\`\`\`
数字游标卡尺（可选）
放大镜或显微镜（检查肌腱）
\`\`\`

## 总成本估算

| 类别 | 成本 |
|------|------|
| 电子元件 | ~$120 |
| 3D打印材料 | ~$20 |
| 肌腱材料 | ~$10 |
| 紧固件 | ~$5 |
| 工具（已有可忽略） | ~$100 |
| **总计** | **~$255** |

## 采购建议

### 舵机购买
- **官方推荐**：Feetech HLS3606M
- **替代方案**：LX-16A（需要修改代码）
- **注意**：必须是总线舵机，支持4096级精度

### ESP32选择
- **推荐**：ESP32-S3-DevKitC-1
- **原因**：性能足够、价格便宜、资料丰富
- **避坑**：不要买ESP32-C3（引脚不够）

### 肌腱材料
- **首选**：Dyneema钓鱼线（最强）
- **次选**：Spectra缝合线（医疗级）
- **不推荐**：普通尼龙线（会拉伸）
      `
    },
    assembly: {
      title: '组装指南',
      content: `
## 详细组装步骤

### 第1步：准备工具和零件

\`\`\`bash
# 清点零件清单
✓ 7个HLS3606M舵机
✓ 1个ESP32-S3
✓ 所有3D打印件
✓ 肌腱材料（2米）
✓ 紧固件
✓ 工具
\`\`\`

### 第2步：测试舵机

\`\`\`python
# 在组装前测试所有舵机
from aero_open_sdk import AeroHand

# 连接单个舵机测试
hand = AeroHand()

# 测试舵机0
for pos in [0, 50, 100, 0]:
    hand.set_joint_position(0, pos)
    time.sleep(1)

# 重复测试其他6个
\`\`\`

### 第3步：安装手掌电子件

1. **安装ESP32**
\`\`\`
位置：手掌中心
方向：USB接口朝向腕部
固定：2×M2.5螺丝
\`\`\`

2. **安装舵机接口**
\`\`\`
7个舵机按顺序连接：
ID0 → 食指
ID1 → 中指
ID2 → 无名指
ID3 → 小指
ID4 → 拇指内收
ID5 → 拇指弯曲
ID6 → 备用

注意：总线串联，最后一个接120Ω终端电阻
\`\`\`

### 第4步：组装手指

以食指为例（其他手指相同）：

1. **安装滑轮**
\`\`\`
近端指骨：2个3mm滑轮
中端指骨：1个3mm滑轮
远端指骨：1个5mm滑轮

用M2螺丝固定
\`\`\`

2. **穿引肌腱**
\`\`\`
路径：
1. 从掌心底部的锚点开始
2. 绕过近端滑轮（外侧）
3. 绕过中端滑轮（内侧）
4. 绕过远端滑轮
5. 到达指尖固定点

技巧：
- 保持肌腱平整，不要扭转
- 预留适当余量（约10mm）
- 用结或胶水固定两端
\`\`\`

3. **连接指骨**
\`\`\`
近端 → 中端：关节销钉
中端 → 远端：关节销钉
远端 → 指尖：胶水或小螺丝

检查：手指应能自由弯曲
\`\`\`

### 第5步：安装手指到手掌

\`\`\`
顺序：
1. 食指 → 最左侧
2. 中指 → 中间偏左
3. 无名指 → 中间偏右
4. 小指 → 最右侧
5. 拇指 → 单独的拇指座

固定：
- 掌骨关节用M2螺丝
- 确保所有手指指向同一方向
- 检查运动范围
\`\`\`

### 第6步：连接肌腱到舵机

\`\`\`
每个手指的肌腱连接到对应舵机：
1. 找到舵机摇臂
2. 将肌腱末端固定在摇臂孔
3. 调整预张力：
   - 太松：手指不能完全弯曲
   - 太紧：手指不能完全伸直
   - 合适：自然下垂时手指半弯曲

固定方法：
- 打结 + 胶水
- 或用微型线夹
\`\`\`

### 第7步：最终测试

\`\`\`python
# 测试所有手指
hand = AeroHand()
hand.home()

# 依次测试每个手指
for i in range(7):
    print(f"测试手指 {i}")
    hand.set_joint_position(i, 0)
    time.sleep(1)
    hand.set_joint_position(i, 100)
    time.sleep(1)
    hand.set_joint_position(i, 0)
\`\`\`

## 常见组装问题

### Q1: 手指运动不顺畅？

**检查：**
1. 肌腱是否扭转
2. 滑轮是否灵活
3. 关节是否过紧
4. 肌腱张力是否合适

### Q2: 手指不能完全伸直/弯曲？

**调整：**
1. 检查肌腱路径
2. 调整舵机摇臂位置
3. 重新穿引肌腱
4. 检查机械限位

### Q3: 舵机抖动？

**原因：**
- 电源不足
- 信号干扰
- 机械卡住

**解决：**
- 使用独立5V 3A电源
- 检查接线
- 检查机械摩擦
      `
    },
    firmware: {
      title: '固件烧录指南',
      content: `
## ESP32 固件详解

### 固件结构

\`\`\`cpp
// firmware_v0.1.0.ino

// 主要组件：
1. SerialProtocol    // 串口通信
2. ServoControl      // 舵机控制
3. Homing            // 归位程序
4. EEPROM存储        // 配置保存
\`\`\`

### 烧录方法

#### 方法1：使用PlatformIO（推荐）

\`\`\`bash
cd firmware/main/
pio run --target upload
\`\`\`

#### 方法2：使用Arduino IDE

1. 安装ESP32开发板支持
2. 打开 \`firmware_v0.1.0.ino\`
3. 选择开发板：ESP32-S3 Dev Module
4. 选择端口：COM口
5. 点击上传

#### 方法3：使用SDK GUI

\`\`\`bash
python -m aero_open_sdk.gui_chinese

# 在GUI中：
# 1. 切换到"固件烧录"标签
# 2. 选择固件文件
# 3. 点击"烧录"
\`\`\`

### 固件配置

#### 串口参数

\`\`\`
波特率：921600
数据位：8
停止位：1
校验：None
\`\`\`

#### 舵机配置

\`\`\`cpp
// 每个舵机的配置
struct ServoData {
  uint16_t grasp_count;   // 闭合端点（你设置的值）
  uint16_t extend_count;  // 张开端点（你设置的值）
  int8_t   servo_direction; // 方向（+1或-1）
  uint16_t current_pos;   // 当前位置
};

// 默认值（需要配置）
grasp_count = 4095;  // 会修改
extend_count = 0;    // 会修改
\`\`\`

### 测试固件

\`\`\`python
# 测试连接
from aero_open_sdk import AeroHand

try:
    hand = AeroHand()
    print("✓ 固件运行正常")

    # 测试归位
    hand.home()
    print("✓ 归位功能正常")

    # 测试舵机
    hand.set_joint_position(0, 50)
    print("✓ 舵机控制正常")

except Exception as e:
    print(f"✗ 错误: {e}")
\`\`\`

## 常见问题

### Q: 烧录失败？

**检查：**
1. 是否按住BOOT按钮
2. 驱动是否安装（CP2102或CH340）
3. 端口是否正确

### Q: 舵机不响应？

**可能原因：**
- ID配置错误
- 电源未接
- 固件未烧录成功

### Q: 如何更新固件？

\`\`\`bash
# 重新烧录即可，会覆盖旧固件
# 注意：配置会保留（在EEPROM中）
\`\`\`
      `
    },
    examples: {
      title: '示例脚本详解',
      content: `
## run_sequence.py 详解

### 脚本位置

\`\`\`
sdk/examples/run_sequence.py
\`\`\`

### 完整代码解析

\`\`\`python
from aero_open_sdk import AeroHand
import time

# ========== 初始化 ==========
# 自动检测串口
hand = AeroHand()

# 等待连接建立
time.sleep(1)

# ========== 定义动作序列 ==========
# 每个数字代表一个关节的百分比位置（0-100）
# 关节顺序：[食指, 中指, 无名指, 小指, 拇指内收, 拇指弯曲]

sequences = [
    # 序列1：张开手（起始位置）
    [0, 0, 0, 0, 0, 0],

    # 序列2：准备抓取（手指半弯曲）
    [30, 30, 30, 30, 50, 30],

    # 序列3：握紧（完全闭合）
    [100, 100, 100, 100, 100, 100],

    # 序列4：OK手势
    [0, 100, 100, 100, 80, 50],

    # 序列5：点赞
    [0, 100, 100, 100, 0, 0],

    # 序列6：张开（结束）
    [0, 0, 0, 0, 0, 0],
]

# ========== 执行序列 ==========
print("开始执行动作序列...")

for i, positions in enumerate(sequences):
    print(f"\\n动作 {i+1}: {positions}")

    # 发送位置命令
    hand.set_joint_positions(positions)

    # 等待动作完成（重要！）
    # 舵机需要时间移动到目标位置
    time.sleep(1.5)

    # 可选：读取当前位置验证
    current = hand.get_joint_positions()
    print(f"当前位置: {current}")

print("\\n序列执行完成！")

# ========== 复位 ==========
print("\\n复位到初始位置...")
hand.set_joint_positions([0]*6)
time.sleep(1)
print("完成！")
\`\`\`

### 关键概念

#### 1. 关节映射

\`\`\`
位置索引  →  关节          →  舵机ID
0        →  食指弯曲      →  0
1        →  中指弯曲      →  1
2        →  无名指弯曲    →  2
3        →  小指弯曲      →  3
4        →  拇指内收      →  4
5        →  拇指弯曲      →  5
\`\`\`

#### 2. 位置范围

\`\`\`
0    →  完全伸直（张开）
50   →  中间位置
100  →  完全弯曲（闭合）

这些百分比会自动映射到你的端点配置：
- 0%   → extend_count
- 100% → grasp_count
\`\`\`

#### 3. 时序控制

\`\`\`
为什么需要 time.sleep()？

1. 舵机不是瞬间移动的
2. 从0%到100%大约需要0.5-1秒
3. 不等待会导致命令堆积
4. 可能造成运动不平滑或失控
\`\`\`

### 自定义序列

#### 创建自己的手势

\`\`\`python
# 定义新序列
my_gesture = [50, 0, 100, 0, 80, 50]

# 执行
hand.set_joint_positions(my_gesture)
time.sleep(1.5)
\`\`\`

#### 平滑过渡

\`\`\`python
import numpy as np

def smooth_move(hand, start, target, duration=2.0):
    """
    平滑移动从起始位置到目标位置

    参数:
        hand: AeroHand实例
        start: 起始位置列表
        target: 目标位置列表
        duration: 总时长（秒）
    """
    steps = 50  # 插值点数
    dt = duration / steps

    for i in range(steps):
        t = i / steps
        # 线性插值
        current = [
            s + (e - s) * t
            for s, e in zip(start, target)
        ]
        hand.set_joint_positions(current)
        time.sleep(dt)

# 使用
smooth_move(
    hand,
    start=[0, 0, 0, 0, 0, 0],
    target=[100, 100, 100, 100, 100, 100],
    duration=3.0  # 3秒完成
)
\`\`\`

### 其他示例脚本

#### 单指测试

\`\`\`python
# test_single_finger.py
hand = AeroHand()
finger_id = 0  # 测试食指

for pos in [0, 25, 50, 75, 100, 75, 50, 25, 0]:
    hand.set_joint_position(finger_id, pos)
    print(f"位置: {pos}%")
    time.sleep(0.5)
\`\`\`

#### 波浪运动

\`\`\`python
# wave.py
hand = AeroHand()

import numpy as np

for t in np.linspace(0, 4*np.pi, 100):
    # 每个手指有相位偏移，形成波浪
    positions = [
        50 + 50 * np.sin(t + i * 0.5)
        for i in range(6)
    ]
    hand.set_joint_positions(positions)
    time.sleep(0.05)
\`\`\`

#### 抓取测试

\`\`\`python
# grasp_test.py
hand = AeroHand()

# 预握
hand.set_joint_positions([30, 30, 30, 30, 50, 30])
time.sleep(0.5)

# 闭合（假设物体已经到位）
hand.set_joint_positions([80, 80, 80, 80, 90, 70])
time.sleep(0.5)

# 保持
time.sleep(2)

# 松开
hand.set_joint_positions([0, 0, 0, 0, 0, 0])
\`\`\`
      `
    }
  },

  // ========== Sim2Real 示例 ==========
  sim2real: {
    teleoperation: {
      title: '遥操作 Sim2Real 完整指南',
      content: `
## 遥操作 Sim2Real 概述

### 什么是遥操作 Sim2Real？

\`\`\`
人手控制 → 策略学习 → 仿真训练 → 真实硬件

流程：
1. 人在仿真环境中操作
2. 记录人和仿真的状态
3. 使用行为克隆训练策略
4. 部署到真实硬件
\`\`\`

### 为什么使用遥操作？

| 方法 | 优势 | 劣势 |
|------|------|------|
| **遥操作** | • 数据质量高<br>• 训练快<br>• 易于调试 | • 需要人工<br>• 数据量有限 |
| **纯RL** | • 无需人工<br>• 可持续训练 | • 训练慢<br>• 难以调参 |
| **混合** | • 结合两者优点 | • 实现复杂 |

## 完整实现流程

### 阶段1：环境搭建

\`\`\`bash
# 1. 安装依赖
pip install mujoco
pip install mujoco-phoenix
pip install opencv-python
pip install matplotlib

# 2. 下载Aero Hand模型
cd sim_rl/simulation/
ls  # 应该看到 aero_hand.xml
\`\`\`

### 阶段2：创建遥操作界面

\`\`\`python
# teleop_interface.py
import mujoco
import mujoco.viewer
import numpy as np
import keyboard

class TeleopInterface:
    """遥操作接口"""

    def __init__(self, model_path):
        # 加载模型
        self.model = mujoco.MjSpec.from_file(model_path).to_model()
        self.data = mujoco.MjData(self.model)

        # 遥操作数据记录
        self.trajectory = []
        self.recording = False

    def start(self):
        """启动遥操作界面"""
        with mujoco.viewer.launch_passive(
            self.model, self.data
        ) as viewer:
            while viewer.is_running():
                # 处理键盘输入
                self._handle_input()

                # 步进物理
                mujoco.mj_step(self.model, self.data)

                # 记录数据
                if self.recording:
                    self._record_frame()

                # 同步显示
                viewer.sync()

    def _handle_input(self):
        """处理键盘输入"""
        # 手指控制：1-7号键
        for i in range(7):
            if keyboard.is_pressed(f"{i+1}"):
                # 按下时弯曲
                self.data.ctrl[i] = 1.0
            else:
                # 松开时伸直
                self.data.ctrl[i] = 0.0

        # 记录控制：空格键
        if keyboard.is_pressed("space"):
            if not self.recording:
                self.recording = True
                print("开始记录...")
        else:
            if self.recording:
                self.recording = False
                print(f"记录完成，共 {len(self.trajectory)} 帧")

    def _record_frame(self):
        """记录当前帧"""
        frame = {
            "state": self.data.qpos.copy(),  # 关节位置
            "action": self.data.ctrl.copy()  # 控制信号
        }
        self.trajectory.append(frame)

# 使用
if __name__ == "__main__":
    teleop = TeleopInterface("aero_hand.xml")
    teleop.start()
\`\`\`

### 阶段3：行为克隆训练

\`\`\`python
# behavioral_cloning.py
import numpy as np
import torch
import torch.nn as nn

class BCPolicy(nn.Module):
    """行为克隆策略网络"""

    def __init__(self, state_dim, action_dim):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim),
            nn.Tanh()  # 输出[-1, 1]
        )

    def forward(self, state):
        return self.network(state)

def train_bc(trajectory):
    """训练BC策略"""

    # 准备数据
    states = np.array([f["state"] for f in trajectory])
    actions = np.array([f["action"] for f in trajectory])

    # 转换为张量
    states = torch.FloatTensor(states)
    actions = torch.FloatTensor(actions)

    # 创建网络
    policy = BCPolicy(
        state_dim=states.shape[1],
        action_dim=actions.shape[1]
    )

    optimizer = torch.optim.Adam(policy.parameters(), lr=1e-3)
    loss_fn = nn.MSELoss()

    # 训练
    for epoch in range(100):
        # 前向传播
        pred_actions = policy(states)

        # 计算损失
        loss = loss_fn(pred_actions, actions)

        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if epoch % 10 == 0:
            print(f"Epoch {epoch}, Loss: {loss.item():.4f}")

    return policy

# 使用
if __name__ == "__main__":
    import pickle

    # 加载轨迹
    with open("trajectory.pkl", "rb") as f:
        trajectory = pickle.load(f)

    # 训练
    policy = train_bc(trajectory)

    # 保存
    torch.save(policy.state_dict(), "bc_policy.pt")
    print("策略已保存！")
\`\`\`

### 阶段4：部署到真实硬件

\`\`\`python
# deploy_teleop.py
import torch
from aero_open_sdk import AeroHand
import numpy as np
import time

class DeployedPolicy:
    """部署的策略"""

    def __init__(self, model_path):
        # 加载模型
        self.policy = BCPolicy(state_dim=7, action_dim=7)
        self.policy.load_state_dict(
            torch.load(model_path)
        )
        self.policy.eval()

        # 连接硬件
        self.hand = AeroHand()
        self.hand.home()
        time.sleep(1)

    def get_state(self):
        """获取当前状态"""
        # 从硬件读取关节位置
        positions = self.hand.get_joint_positions()
        # 转换为[0, 1]范围
        return np.array(positions) / 100.0

    def act(self, state):
        """根据状态输出动作"""
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state)
            action = self.policy(state_tensor)
        return action.numpy()

    def run(self):
        """运行策略"""
        print("开始运行...按Ctrl+C停止")

        try:
            while True:
                # 获取状态
                state = self.get_state()

                # 计算动作
                action = self.act(state)

                # 转换为百分比[0, 100]
                command = ((action + 1) * 50).tolist()

                # 执行
                self.hand.set_joint_positions(command)

                # 控制频率
                time.sleep(0.05)  # 20Hz

        except KeyboardInterrupt:
            # 复位
            self.hand.set_joint_positions([0]*6)
            print("\\n已停止并复位")

# 使用
if __name__ == "__main__":
    deployer = DeployedPolicy("bc_policy.pt")
    deployer.run()
\`\`\`

## 调试技巧

### 1. 验证遥操作数据

\`\`\`python
# 可视化记录的轨迹
import matplotlib.pyplot as np

states = np.array([f["state"] for f in trajectory])

plt.figure(figsize=(12, 6))
for i in range(7):
    plt.plot(states[:, i], label=f"Joint {i}")

plt.xlabel("Time step")
plt.ylabel("Joint position")
plt.legend()
plt.title("Teleoperated Trajectory")
plt.show()
\`\`\`

### 2. 检查Sim2Real差距

\`\`\`python
# 对比仿真和真实响应
sim_response = []
real_response = []

# 仿真测试
for state in test_states:
    action = policy(state)
    sim_response.append(action)

# 真实测试
for state in test_states:
    action = deployer.act(state)
    real_response.append(action)

# 计算差距
gap = np.array(sim_response) - np.array(real_response)
print(f"平均差距: {np.mean(np.abs(gap)):.3f}")
\`\`\`

### 3. 渐进式部署

\`\`\`bash
# 不要直接部署到真实硬件！
# 逐步测试：

步骤1：仿真中测试策略
python test_in_sim.py --policy bc_policy.pt

步骤2：低频测试（1Hz）
python deploy_teleop.py --freq 1

步骤3：中频测试（5Hz）
python deploy_teleop.py --freq 5

步骤4：全频测试（20Hz）
python deploy_teleop.py --freq 20

步骤5：长时间运行
python deploy_teleop.py --duration 3600  # 1小时
\`\`\`

## 常见问题

### Q: 遥操作数据不够怎么办？

**方法1：数据增强**
\`\`\`python
# 添加噪声
augmented = []
for frame in trajectory:
    # 添加小扰动
    noisy_state = frame["state"] + np.random.normal(0, 0.01, size=frame["state"].shape)
    augmented.append({"state": noisy_state, "action": frame["action"]})
\`\`\`

**方法2：混合RL**
\`\`\`python
# 先用BC快速获得基础策略
# 再用RL fine-tune
\`\`\`

### Q: 真实硬件响应不同？

**原因：**
- 仿真物理不准确
- 执行器延迟
- 传感器噪声

**解决：**
1. 域随机化
2. 系统辨识
3. 真实数据微调
      `
    },
    cubeRotate: {
      title: '魔方旋转 Sim2Real 完整指南',
      content: `
## AeroCubeRotateZAxis 任务详解

### 任务概述

\`\`\`
目标：使用Aero Hand旋转魔方Z轴

初始状态：手握住魔方
成功条件：魔方绕Z轴旋转180°
时间限制：无
\`\`\`

### 为什么选择这个任务？

1. **简单清晰**：目标明确，容易评估
2. **实用性强**：旋转是基础操作
3. **可扩展**：可以延伸到更复杂任务
4. **标准benchmark**：RL社区常用

## PPO训练详解

### 环境定义

\`\`\`python
# aero_cube_env.py
import gymnasium as gym
import mujoco

class AeroCubeRotateEnv(gym.Env):
    """魔方旋转环境"""

    metadata = {"render_modes": ["human", "rgb_array"]}

    def __init__(self):
        # 加载模型
        self.model = mujoco.MjSpec.from_file(
            "aero_cube_rotate.xml"
        ).to_model()
        self.data = mujoco.MjData(self.model)

        # 动作空间：7个连续动作[-1, 1]
        self.action_space = gym.spaces.Box(
            low=-1, high=1, shape=(7,), dtype=np.float32
        )

        # 观测空间：关节位置 + 魔方姿态
        obs_dim = 7 + 4  # 7关节 + 4四元数
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(obs_dim,), dtype=np.float32
        )

    def reset(self, seed=None):
        """重置环境"""
        super().reset(seed=seed)

        # 重置位置
        mujoco.mj_reset(self.model, self.data)

        # 随机初始姿态
        # ...

        return self._get_obs(), {}

    def step(self, action):
        """执行一步"""
        # 应用动作
        self.data.ctrl[:] = action

        # 步进物理
        mujoco.mj_step(self.model, self.data)

        # 计算奖励
        reward = self._compute_reward()

        # 检查是否完成
        done = self._is_done()
        terminated = False
        truncated = False

        return self._get_obs(), reward, terminated, truncated, {}

    def _get_obs(self):
        """获取观测"""
        # 关节位置
        joint_pos = self.data.qpos[:7]

        # 魔方姿态（四元数）
        cube_rot = self.data.body("cube").xquat

        return np.concatenate([joint_pos, cube_rot])

    def _compute_reward(self):
        """计算奖励"""
        # 获取魔方当前旋转角度
        current_angle = self._get_rotation_angle()

        # 目标：180度
        target_angle = np.pi
        error = abs(current_angle - target_angle)

        # 奖励函数
        reward = -error  # 越接近目标越好

        # 成功奖励
        if error < 0.1:  # 约5度
            reward += 10.0

        return reward

    def _is_done(self):
        """检查是否完成"""
        current_angle = self._get_rotation_angle()
        target_angle = np.pi
        return abs(current_angle - target_angle) < 0.1

    def _get_rotation_angle(self):
        """获取当前旋转角度"""
        # 从四元数提取Z轴旋转
        quat = self.data.body("cube").xquat
        # 转换为欧拉角
        # ...
        return angle_z
\`\`\`

### PPO训练脚本

\`\`\`bash
# 训练命令
python learning/train_jax_ppo.py \\
    --env_name=AeroCubeRotateZAxis \\
    --num_train_steps=10_000_000 \\
    --num_envs=1024 \\
    --learning_rate=3e-4 \\
    --entropy_cost=1e-2 \\
    --batch_size=2048 \\
    --ppo_epochs=8 \\
    --save_interval=100000
\`\`\`

### 训练监控

\`\`\`python
# 使用wandb监控
import wandb

wandb.init(project="aero-hand", name="cube-rotate")

# 训练循环中
for iteration in range(num_iterations):
    # 训练...
    reward = evaluate()

    # 记录
    wandb.log({
        "iteration": iteration,
        "reward": reward,
        "loss": loss,
        "entropy": entropy,
    })

# 访问 https://wandb.ai 查看实时曲线
\`\`\`

### 典型训练曲线

\`\`\`
Episode Reward

200 ┤                                    ╭─── 达标
    │                              ╭──────╯
150 ┤                        ╭────╯
    │                  ╭────╯
100 ┤            ╭────╯
    │      ╭────╯
 50 ┤ ╭────╯
    │ ╭─╯ ←── 随机探索
  0 ┼─╯────────────────────────────────────→ Steps
    0     2M     4M     6M     8M    10M

关键里程碑：
- 2M步：开始学习（奖励上升）
- 5M步：稳定提升
- 8M步：接近目标
- 10M步：达标
\`\`\`

## Sim2Real 部署

### 步骤1：导出策略

\`\`\`python
# export_policy.py
import jax
import numpy as np
from aero_hand_ppo import PPONetwork

# 加载checkpoint
checkpointer = orbax.checkpoint.PyTreeCheckpointer()
params = checkpointer.restore("checkpoint_10M")

# 创建推理函数
@jax.jit
def policy_inference(obs, params):
    """推理函数"""
    action, _ = network.apply(params, obs)
    return action

# 测试
test_obs = np.zeros((11,))
action = policy_inference(test_obs, params)
print(f"测试动作: {action}")

# 保存
np.save("cube_policy_params.npy", params)
\`\`\`

### 步骤2：创建部署脚本

\`\`\`python
# deploy_cube_rotate.py
import numpy as np
from aero_open_sdk import AeroHand
import jax

class CubeRotator:
    """魔方旋转部署器"""

    def __init__(self, policy_path):
        # 加载策略
        self.params = np.load(policy_path, allow_pickle=True)

        # 加载网络
        from aero_hand_ppo import PPONetwork
        self.network = PPONetwork(...)
        self.policy_fn = jax.jit(
            lambda obs: self.network.apply(self.params, obs)[0]
        )

        # 连接硬件
        self.hand = AeroHand()
        self.hand.home()

        # 获取物体位置（需要视觉系统）
        # 这里简化为固定位置
        self.cube_position = [0, 0, 0.15]  # 相对手掌

    def get_observation(self):
        """获取观测"""
        # 1. 关节位置
        joint_pos = np.array(self.hand.get_joint_positions())
        joint_pos = joint_pos / 100.0  # 归一化到[0,1]

        # 2. 魔方姿态（需要视觉系统估计）
        # 这里简化为固定值
        cube_quat = np.array([1, 0, 0, 0])  # 单位四元数

        # 组合
        obs = np.concatenate([joint_pos, cube_quat])
        return obs

    def reset(self):
        """重置到初始抓取位置"""
        # 预握姿势
        pre_grasp = [40, 40, 40, 40, 60, 40]
        self.hand.set_joint_positions(pre_grasp)
        time.sleep(0.5)
        print("已就绪，请将魔方放置到手中...")

    def run(self):
        """执行旋转任务"""
        print("开始旋转任务...")

        try:
            step = 0
            while step < 500:  # 最多500步（25秒）
                # 获取观测
                obs = self.get_observation()

                # 策略推理
                action = self.policy_fn(obs)

                # 转换动作[-1,1]到百分比[0,100]
                command = ((action + 1) * 50).tolist()

                # 执行
                self.hand.set_joint_positions(command)

                # 检查完成（需要视觉反馈）
                # if self.is_rotation_complete():
                #     print("旋转完成！")
                #     break

                # 等待
                time.sleep(0.05)  # 20Hz
                step += 1

                if step % 50 == 0:
                    print(f"步骤 {step}/500")

        except KeyboardInterrupt:
            print("\\n用户中断")

        finally:
            # 复位
            self.hand.set_joint_positions([0]*6)
            print("已复位")

# 使用
if __name__ == "__main__":
    rotator = CubeRotator("cube_policy_params.npy")
    rotator.reset()
    input("按Enter开始...")
    rotator.run()
\`\`\`

## 调试与优化

### 1. 仿真验证

\`\`\`bash
# 先在仿真中验证策略
python learning/train_jax_ppo.py \\
    --env_name=AeroCubeRotateZAxis \\
    --play_only \\
    --checkpoint_path=checkpoint_10M
\`\`\`

### 2. 部署前检查清单

\`\`\`
□ 策略在仿真中成功（>80%成功率）
□ 硬件连接正常
□ 舵机端点已配置
□ 归位功能正常
□ 测试单步响应
□ 准备好紧急停止方案
\`\`\`

### 3. 逐步部署

\`\`\`bash
# 阶段1：单步测试（手动触发）
python deploy_test.py --mode single_step

# 阶段2：低频运行（1Hz）
python deploy_cube_rotate.py --freq 1

# 阶段3：中频运行（5Hz）
python deploy_cube_rotate.py --freq 5

# 阶段4：全频运行（20Hz）
python deploy_cube_rotate.py --freq 20
\`\`\`

### 4. 性能差距分析

\`\`\`python
# 对比仿真vs真实
metrics = {
    "success_rate_sim": 0.85,
    "success_rate_real": 0.45,  # 差距！

    "avg_time_sim": 3.2,
    "avg_time_real": 5.8,  # 真实更慢

    "smoothness_sim": 0.92,
    "smoothness_real": 0.65,  # 真实抖动
}

# 分析原因
gaps = {
    "域随机化不足": "需要更多物理参数随机化",
    "执行器延迟": "真实舵机有响应延迟",
    "传感器噪声": "观测不精确",
    "机械误差": "装配公差影响"
}
\`\`\`

### 5. 优化技巧

**域随机化增强**
\`\`\`python
# 在训练时添加更多随机化
randomizations = {
    "tendon_stiffness": (0.5, 1.5),     # 肌腱刚度±50%
    "joint_damping": (0.5, 2.0),        # 关节阻尼±100%
    "actuator_delay": (0, 0.1),         # 延迟0-100ms
    "sensor_noise": 0.02,               # 观测噪声
    "cube_mass": (0.08, 0.12),          # 魔方质量±20%
}
\`\`\`

**动作平滑**
\`\`\`python
# 部署时添加低通滤波
class ActionFilter:
    def __init__(self, alpha=0.3):
        self.alpha = alpha
        self.last_action = None

    def filter(self, action):
        if self.last_action is None:
            self.last_action = action
        else:
            # 指数加权移动平均
            self.last_action = (
                self.alpha * action +
                (1 - self.alpha) * self.last_action
            )
        return self.last_action
\`\`\`

## 扩展：更复杂任务

### 从旋转到拧螺丝

\`\`\`python
# 扩展到拧螺丝任务
class ScrewdriverEnv(AeroCubeRotateEnv):
    """拧螺丝环境"""

    def __init__(self):
        super().__init__()
        # 添加螺丝刀工具
        # ...

    def _compute_reward(self):
        # 角度奖励
        angle_reward = -abs(self.target_angle - self.current_angle)

        # 扭矩奖励（需要足够力）
        torque = self.data.sensordata["torque"]
        torque_reward = min(torque / 0.1, 1.0)

        # 进度奖励
        progress = self.screw_depth
        progress_reward = progress * 10

        return angle_reward + torque_reward + progress_reward
\`\`\`
      `
    }
  },

  // ========== 技术栈可视化 ==========
  techStack: {
    architecture: {
      title: '系统架构拓扑图',
      mermaid: `
graph TB
    subgraph "应用层"
        A1[RL训练脚本]
        A2[遥操作界面]
        A3[任务脚本]
    end

    subgraph "接口层"
        B1[Python SDK]
        B2[ROS2节点]
    end

    subgraph "固件层"
        C1[ESP32固件]
        C2[串口协议]
    end

    subgraph "驱动层"
        D1[HLS3606M舵机]
    end

    subgraph "机械层"
        E1[肌腱系统]
        E2[3D打印件]
    end

    A1 -->|JAX| B1
    A2 -->|Pygame| B1
    A3 -->|Python| B1

    B1 -->|921600波特| C1
    B2 -->|Topic| C1

    C1 -->|PWM| D1

    D1 -->|拉力| E1
    E1 -->|约束| E2
      `
    },
    sim2real: {
      title: 'Sim2Real 数据流',
      mermaid: `
graph LR
    subgraph "仿真环境"
        A1[MuJoCo物理]
        A2[MJX加速]
        A3[PPO训练]
    end

    subgraph "数据处理"
        B1[策略导出]
        B2[参数优化]
    end

    subgraph "部署"
        C1[SDK控制]
        C2[ROS2节点]
    end

    subgraph "硬件"
        D1[ESP32]
        D2[舵机]
        D3[灵巧手]
    end

    A3 -->|checkpoint| B1
    A2 -->|加速| B2

    B1 -->|npy| C1
    B2 -->|tuned| C2

    C1 -->|串口| D1
    C2 -->|Topic| D1

    D1 -->|PWM| D2
    D2 -->|肌腱| D3
      `
    },
    rl: {
      title: 'RL训练流程',
      mermaid: `
graph TB
    A[环境初始化] --> B[并行采样<br/>1024个环境]
    B --> C[计算GAE优势]
    C --> D[PPO更新<br/>8个epoch]
    D --> E{完成?}
    E -->|否| B
    E -->|是| F[评估策略]
    F --> G[生成视频]
    G --> H[保存checkpoint]
    H --> I{继续训练?}
    I -->|是| B
      `
    }
  },

  // ========== 实战案例 ==========
  practicalCases: {
    graspTask: {
      title: '抓取任务完整实现',
      content: `
## 实战案例：如何实现一个抓取任务

本案例展示从环境定义到 Sim2Real 部署的完整流程。

### 1. 环境定义

\`\`\`python
# grasp_env.py
import gymnasium as gym
import numpy as np
import mujoco

class AeroGraspEnv(gym.Env):
    """Aero Hand 抓取环境"""

    def __init__(self, xml_path="aero_hand_with_obj.xml"):
        super().__init__()

        # 加载模型
        self.model = mujoco.MjSpec.from_file(xml_path).to_model()
        self.data = mujoco.MjData(self.model)

        # 动作空间：7个连续动作 [-1, 1]
        self.action_space = gym.spaces.Box(
            low=-1, high=1, shape=(7,), dtype=np.float32
        )

        # 观测空间
        obs_dim = 7 + 3 + 3  # 关节位置 + 物体位置 + 目标位置
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf, shape=(obs_dim,), dtype=np.float32
        )

    def reset(self, seed=None):
        super().reset(seed=seed)

        # 随机化物体初始位置
        self._randomize_object_position()

        # 重置仿真
        mujoco.mj_reset(self.model, self.data)

        return self._get_obs(), {}

    def step(self, action):
        # 应用动作（归一化 → 实际位置）
        self._apply_action(action)

        # 步进物理
        mujoco.mj_step(self.model, self.data)

        # 计算奖励
        reward = self._compute_reward()

        # 检查完成
        done = self._is_done()
        info = self._get_info()

        return self._get_obs(), reward, done, False, info

    def _apply_action(self, action):
        """将 [-1, 1] 动作映射到 [0, 1] 控制"""
        ctrl = (action + 1) / 2  # 归一化到 [0, 1]
        self.data.ctrl[:] = ctrl

    def _compute_reward(self):
        """抓取奖励函数"""
        reward = 0.0

        # 1. 接触奖励
        contact = self._check_contact()
        reward += contact * 0.5

        # 2. 物体靠近手掌
        object_pos = self.data.body("object").xpos
        palm_pos = self.data.body("palm").xpos
        distance = np.linalg.norm(object_pos - palm_pos)
        reward += max(0, 1.0 - distance)

        # 3. 成功抓取
        if self._check_grasp_success():
            reward += 10.0

        # 4. 动作惩罚
        reward -= 0.01 * np.sum(np.square(self.data.ctrl[:7]))

        return reward

    def _check_grasp_success(self):
        """检查是否成功抓取（物体在手掌内）"""
        object_pos = self.data.body("object").xpos
        palm_pos = self.data.body("palm").xpos

        # 物体距离手掌足够近且手指闭合
        distance = np.linalg.norm(object_pos - palm_pos)
        finger_closed = np.mean(self.data.ctrl[:4]) > 0.8

        return distance < 0.05 and finger_closed
\`\`\`

### 2. 训练配置

\`\`\`python
# train_grasp.py
from mujoco_playground import harness

# 训练配置
config = {
    "env_name": "AeroGraspEnv",
    "num_train_steps": 10_000_000,
    "num_envs": 512,
    "learning_rate": 3e-4,
    "entropy_cost": 1e-2,
    "batch_size": 2048,
    "ppo_epochs": 8,
    "clip_epsilon": 0.2,
    "gamma": 0.99,
    "GAE_lambda": 0.95,
    "save_interval": 100000,
    "eval_interval": 10000,
}

# 启动训练
harness.train(config)
\`\`\`

### 3. Sim2Real 部署

\`\`\`python
# deploy_grasp.py
import numpy as np
from aero_open_sdk import AeroHand
import time

class GraspController:
    """抓取控制器"""

    def __init__(self):
        self.hand = AeroHand()
        self.hand.home()
        time.sleep(1)

    def observation_to_hand(self, obs):
        """
        将仿真观测转换为硬件命令

        仿真 obs: [joint_pos(7), object_pos(3), ...]
        硬件 cmd: [0-100] × 6
        """
        joint_pos = obs[:7]
        object_pos = obs[7:10]

        # 简单的启发式控制
        # 物体越近，手指弯曲越多
        distance = np.linalg.norm(object_pos)

        # 预定义抓取姿势
        if distance < 0.05:  # 物体很近
            return [80, 80, 80, 80, 90, 70]  # 握紧
        elif distance < 0.10:  # 物体较近
            return [40, 40, 40, 40, 60, 40]  # 半握
        else:  # 物体远
            return [0, 0, 0, 0, 0, 0]  # 张开

    def run(self):
        """运行抓取"""
        print("等待物体就位...")
        time.sleep(2)

        print("开始抓取...")
        for _ in range(50):
            # 获取观测（需要视觉系统）
            obs = self._get_vision_observation()

            # 计算动作
            cmd = self.observation_to_hand(obs)

            # 执行
            self.hand.set_joint_positions(cmd)
            time.sleep(0.05)

        print("抓取完成")

# 使用
controller = GraspController()
controller.run()
\`\`\`

### 常见问题排查

\`\`\`
问题1：抓取成功率低

检查：
1. 仿真物理参数是否准确
2. 域随机化是否足够
3. 奖励函数是否正确

解决：
- 增加训练步数
- 调整奖励函数权重
- 使用更复杂的策略网络

问题2：Sim2Real 差距大

检查：
1. 视觉系统标定
2. 物理参数差异
3. 执行延迟

解决：
- 使用域随机化训练
- 添加执行延迟到仿真
- 部署时使用低通滤波
\`\`\`
      `
    }
  },

  // ========== 性能优化技巧 ==========
  performanceOptimization: {
    servoOptimization: {
      title: '舵机控制性能优化',
      content: `
## 舵机控制性能优化

### 1. 通信优化

\`\`\`
优化策略：
├── 批量命令
│   └── 一次发送多个舵机命令，减少通信次数
├── 压缩帧格式
│   └── 只发送变化的舵机
└── 异步通信
    └── 发送后不等待响应，继续执行
\`\`\`

**批量命令示例：**

\`\`\`python
# 优化前：逐个发送
for i in range(7):
    hand.set_joint_position(i, positions[i])
    time.sleep(0.01)  # 每舵机10ms

# 优化后：批量发送
hand.set_joint_positions(positions)  # 一次发送所有
time.sleep(0.05)  # 等待所有舵机响应

# 时间对比：70ms vs 50ms
\`\`\`

### 2. 轨迹优化

\`\`\`
优化策略：
├── 插值轨迹
│   ├── 线性插值（简单）
│   ├── 余弦插值（平滑）
│   └── 样条插值（最平滑）
└── 速度规划
    └── 梯形/ S 曲线速度 profile
\`\`\`

**余弦插值实现：**

\`\`\`python
import numpy as np

def cosine_interpolation(start, end, steps):
    """余弦插值生成平滑轨迹"""
    t = np.linspace(0, np.pi, steps)
    return start + (end - start) * (1 - np.cos(t)) / 2

def execute_smooth_motion(hand, start, end, duration=1.0):
    """执行平滑运动"""
    steps = int(duration / 0.02)  # 50Hz
    trajectory = cosine_interpolation(start, end, steps)

    for pos in trajectory:
        hand.set_joint_positions(pos)
        time.sleep(0.02)
\`\`\`

### 3. 预测控制

\`\`\`
原理：根据当前状态预测未来，补偿延迟

实现：
1. 估计当前速度和加速度
2. 预测下一时刻位置
3. 提前发送命令
\`\`\`

**预测控制示例：**

\`\`\`python
class PredictiveController:
    def __init__(self, hand, prediction_horizon=2):
        self.hand = hand
        self.horizon = prediction_horizon
        self.position_history = []
        self.velocity_history = []

    def update(self, target_positions):
        # 记录历史
        current = self.hand.get_joint_positions()
        self.position_history.append(current)

        if len(self.position_history) > 10:
            self.position_history.pop(0)

        # 计算速度和加速度
        if len(self.position_history) >= 3:
            vel = np.diff(self.position_history[-3:], axis=0)
            acc = np.diff(vel, axis=0)

            # 预测未来位置
            predicted = current + vel[-1] * self.horizon + 0.5 * acc[-1] * self.horizon**2

            # 结合目标
            cmd = 0.7 * target_positions + 0.3 * predicted
        else:
            cmd = target_positions

        self.hand.set_joint_positions(cmd)
\`\`\`

### 4. 自适应控制参数

\`\`\`
根据负载自动调整控制参数：

- 轻载时：减小刚度，减少抖动
- 重载时：增大刚度，保证响应
\`\`\`

\`\`\`python
class AdaptiveController:
    def __init__(self, hand):
        self.hand = hand
        self.load_history = []

    def update(self, target_positions):
        # 读取当前负载
        loads = self.hand.get_joint_loads()
        self.load_history.append(loads)

        if len(self.load_history) > 10:
            avg_load = np.mean(self.load_history[-10:], axis=0)

            # 根据负载调整控制
            stiffness = np.clip(avg_load / 1000, 0.3, 1.0)

            # 调整后的命令
            current = self.hand.get_joint_positions()
            cmd = current + stiffness * (target_positions - current)
        else:
            cmd = target_positions

        self.hand.set_joint_positions(cmd)
\`\`\`
      `
    },
    simulationOptimization: {
      title: '仿真性能优化',
      content: `
## 仿真性能优化

### 1. MJX 加速技巧

\`\`\`python
# 技巧1：预热 JIT 编译
# 第一次运行会编译，之后会快很多
_ = step_fn(state, action)  # 预热

# 技巧2：使用静态形状
# 动态形状会阻止 JIT 优化
batch_size = 1024  # 固定

# 技巧3：混合精度
from jax import np as jnp
model = nn.with_precision(jnp.float32)
\`\`\`

### 2. 并行环境配置

\`\`\`python
# 环境数量选择指南：
#
# GPU 内存估算：
# 每个环境 ≈ 10MB
# 策略网络 ≈ 50MB
# 总计 ≈ 10GB for 1024 envs

# 根据你的 GPU 选择：
# 8GB GPU: num_envs=512
# 16GB GPU: num_envs=1024
# 24GB GPU: num_envs=2048
\`\`\`

### 3. 仿真参数优化

\`\`\`xml
<!-- MuJoCo 配置优化 -->
<option>
    <!-- 时间步 -->
    <option timestep="0.002"    <!-- 默认0.002，可增大减少计算 -->
            iterations="50"       <!-- 约束求解迭代 -->
            ls_iterations="10"/> <!-- 线搜索迭代 -->

    <!-- 禁用不必要的计算 -->
    <flag energy="disable"      <!-- 关闭能量计算 -->
          fwdinv="disable"/>    <!-- 关闭前向逆动力学 -->
</option>
\`\`\`

### 4. 检查点策略

\`\`\`python
# 频繁保存会影响训练速度
# 建议：

save_interval = 100000  # 每10万步保存一次
eval_interval = 10000   # 每1万步评估一次

# 使用异步保存
import orbax.checkpoint as ocp

checkpoint_manager = ocp.CheckpointManager(
    '/path/to/checkpoints',
    ocp.PyTreeCheckpointer(),
    # 异步保存，不阻塞训练
    create=True,
)
\`\`\`
      `
    }
  },

  // ========== 调试方法与工具 ==========
  debugging: {
    hardwareDebugging: {
      title: '硬件调试方法',
      content: `
## 硬件调试方法

### 1. 串口通信调试

\`\`\`python
# 启用详细日志
import logging
logging.basicConfig(level=logging.DEBUG)

hand = AeroHand()
# 将显示所有串口通信
\`\`\`

### 2. 逻辑分析仪使用

\`\`\`
推荐工具：Saleae Logic
采样率：至少 10MHz

接线：
- 通道0: ESP32 TX
- 通道1: ESP32 RX
- 通道2: 舵机总线

分析：
1. 确认帧格式正确
2. 检查时序参数
3. 验证校验和
\`\`\`

### 3. 常见问题诊断

\`\`\`
问题：舵机不响应
诊断流程：
1. 检查电源 (5V 3A)
2. 检查串口连接
3. 发送归位命令测试
4. 检查舵机 ID 是否正确

问题：运动不平滑
诊断流程：
1. 检查肌腱张力
2. 检查关节摩擦
3. 降低控制频率测试
4. 检查机械干涉

问题：位置不准确
诊断流程：
1. 重新配置端点
2. 检查肌腱打滑
3. 验证 extend/grasp count
\`\`\`

### 4. 示波器调试

\`\`\`
检查舵机控制信号：
- 确认 PWM 周期正确
- 确认脉宽在规格范围内
- 检查信号完整性
\`\`\`
      `
    },
    softwareDebugging: {
      title: '软件调试方法',
      content: `
## 软件调试方法

### 1. SDK 调试模式

\`\`\`python
# 启用调试模式
hand = AeroHand(debug=True)

# 将输出：
# - 所有发送的命令
# - 所有接收的响应
# - 校验和验证结果
\`\`\`

### 2. 仿真调试工具

\`\`\`python
# 使用 mujoco.viewer 实时调试
import mujoco
import mujoco.viewer

model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

with mujoco.viewer.launch_passive(model, data) as viewer:
    while viewer.is_running():
        # 添加调试可视化
        vis = viewer.lock()
        if vis:
            # 绘制关节角度曲线
            # 绘制力矩分布
            pass
        viewer.sync()
\`\`\`

### 3. RL 训练调试

\`\`\`python
# 1. 首先验证奖励函数
env = AeroGraspEnv()
obs, _ = env.reset()
for _ in range(100):
    # 随机动作
    action = env.action_space.sample()
    obs, reward, done, _, info = env.step(action)

    print(f"Reward: {reward:.3f}, Done: {done}")
    # 检查奖励是否合理

# 2. 检查策略输出
policy = load_policy("checkpoint")
obs = env.reset()
action = policy(obs)
print(f"Action: {action}")
# 确认动作在合理范围内
\`\`\`

### 4. 断点调试技巧

\`\`\`python
# 在关键位置添加日志
class AeroHand:
    def set_joint_positions(self, positions):
        print(f"[DEBUG] 设置位置: {positions}")
        try:
            result = self._send_command(positions)
            print(f"[DEBUG] 命令成功")
            return result
        except Exception as e:
            print(f"[ERROR] 命令失败: {e}")
            raise
\`\`\`
      `
    }
  },

  // ========== 最佳实践与设计模式 ==========
  bestPractices: {
    softwareDesign: {
      title: '软件设计模式',
      content: `
## 最佳实践：软件设计模式

### 1. 状态机模式

\`\`\`python
class HandController:
    """
    使用状态机管理手的状态

    状态转换：
    DISCONNECTED → CONNECTING → CONNECTED
                                    ↓
                              HOMING → READY
                                    ↓
                              CONTROLLING
                                    ↓
                              ERROR ←──┐
                                    │
                                    └──────┘ (重试)
    """

    def __init__(self):
        self.state = "DISCONNECTED"
        self.state_handlers = {
            "DISCONNECTED": self._handle_disconnected,
            "CONNECTING": self._handle_connecting,
            "CONNECTED": self._handle_connected,
            "HOMING": self._handle_homing,
            "READY": self._handle_ready,
            "CONTROLLING": self._handle_controlling,
            "ERROR": self._handle_error,
        }

    def update(self):
        handler = self.state_handlers[self.state]
        self.state = handler()

    def _handle_disconnected(self):
        # 连接逻辑
        if self.try_connect():
            return "CONNECTING"
        return "DISCONNECTED"

    # ... 其他状态处理
\`\`\`

### 2. 策略模式

\`\`\`python
class GraspingStrategy:
    """抓取策略基类"""
    def execute(self, hand, observation):
        raise NotImplementedError

class PinchGrasp(GraspingStrategy):
    """捏取策略"""
    def execute(self, hand, obs):
        # 使用拇指和食指捏取
        return [30, 0, 0, 0, 50, 30]

class PowerGrasp(GraspingStrategy):
    """力量抓取策略"""
    def execute(self, hand, obs):
        # 全手抓取
        return [80, 80, 80, 80, 90, 70]

class StrategySelector:
    """策略选择器"""
    def __init__(self):
        self.strategies = {
            "pinch": PinchGrasp(),
            "power": PowerGrasp(),
        }

    def select(self, object_type):
        if object_type == "small":
            return self.strategies["pinch"]
        else:
            return self.strategies["power"]
\`\`\`

### 3. 观察者模式

\`\`\`python
class HandStateObservable:
    """可观察的手状态"""

    def __init__(self):
        self._observers = []

    def add_observer(self, observer):
        self._observers.append(observer)

    def remove_observer(self, observer):
        self._observers.remove(observer)

    def notify_observers(self, event, data):
        for observer in self._observers:
            observer.on_hand_event(event, data)

class HandLogger:
    """手状态日志记录器"""
    def on_hand_event(self, event, data):
        print(f"[LOG] {event}: {data}")

class HandTelemetry:
    """手状态遥测"""
    def on_hand_event(self, event, data):
        # 发送到监控服务
        send_to_cloudwatch(event, data)
\`\`\`

### 4. 工厂模式

\`\`\`python
class HandFactory:
    """创建不同类型的手"""
    @staticmethod
    def create_left_hand():
        return AeroHand(side="left", port="/dev/ttyUSB0")

    @staticmethod
    def create_right_hand():
        return AeroHand(side="right", port="/dev/ttyUSB1")

    @staticmethod
    def create_simulated_hand():
        return SimulatedAeroHand()
\`\`\`
      `
    },
    hardwareMaintenance: {
      title: '硬件维护指南',
      content: `
## 最佳实践：硬件维护

### 1. 日常维护检查表

\`\`\`
每次使用前：
□ 检查肌腱是否磨损
□ 检查螺丝是否松动
□ 检查关节运动是否顺畅
□ 测试所有舵机响应

每周维护：
□ 清洁关节和滑轮
□ 检查肌腱张力
□ 润滑关节（适当）
□ 检查电缆连接

每月维护：
□ 全面检查所有零件
□ 重新校准端点
□ 检查电源供应
□ 备份配置
\`\`\`

### 2. 肌腱维护

\`\`\`
肌腱寿命：
- Dyneema 钓鱼线：约 100万次循环
- 缝合线：约 50万次循环

更换时机：
- 表面磨损可见
- 拉伸明显增加
- 运动不平滑

更换步骤：
1. 卸下旧肌腱
2. 清洁滑轮和导轨
3. 穿引新肌腱
4. 调整预紧力
5. 测试运动范围
\`\`\`

### 3. 舵机维护

\`\`\`
注意事项：
- 不要堵转（听到滋滋声就停止）
- 保持电源稳定
- 定期检查齿轮磨损

故障排查：
- 舵机不响应 → 检查供电、ID、连接
- 舵机抖动 → 检查负载、摩擦、控制信号
- 舵机发热 → 正常现象（<60°C），过烫需检查
\`\`\`

### 4. 存储和运输

\`\`\`
存储：
- 放置在干燥处
- 避免阳光直射
- 张开手指存放（减少肌腱应力）

运输：
- 使用原包装或软垫
- 固定所有零件
- 标记"易碎"
\`\`\`
      `
    },
    safetyGuidelines: {
      title: '安全操作指南',
      content: `
## 最佳实践：安全操作

### 1. 电气安全

\`\`\`
⚠️ 危险：
- 电源反接 → 烧毁电路
- 电压过高 → 损坏舵机
- 静电放电 → 损坏芯片

预防措施：
✓ 始终确认电源极性
✓ 使用指定电压 (5V)
✓ 触碰前释放静电
✓ 使用带过流保护的电源
\`\`\`

### 2. 机械安全

\`\`\`
⚠️ 危险：
- 手指挤压 → 夹伤
- 肌腱断裂 → 弹射伤害
- 零件脱落 → 飞溅伤害

预防措施：
✓ 运行前检查所有零件
✓ 保持安全距离
✓ 不要超负荷使用
✓ 定期检查紧固件
\`\`\`

### 3. 操作规程

\`\`\`
启动前：
1. 检查所有连接
2. 确认归位完成
3. 测试紧急停止
4. 确认无障碍物

运行中：
1. 观察运动是否正常
2. 监听异常声音
3. 保持安全距离
4. 准备紧急停止

停止后：
1. 复位到安全位置
2. 关闭电源
3. 记录异常情况
\`\`\`

### 4. 紧急处理

\`\`\`
发生意外时：
1. 立即按下紧急停止
2. 切断电源
3. 检查人员伤亡
4. 检查设备损坏
5. 分析原因并记录
\`\`\`
      `
    }
  }
}
