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
  }
}
