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
  },

  // ========== 调试日志解读 ==========
  debugLogs: {
    firmwareLogs: {
      title: '固件日志解读',
      content: `
## 固件日志详解

### 启动日志

\`\`\`
ESP32 启动时输出：

ESP-ROM:esp32s3-rc4-20220823
Build:Aug 29 2023
rst:0x1 (POWERON),boot:0x8 (SPI_FAST_FLASH_BOOT)
ets_main.c 329  __start
SPIWP:0xee
mode:DIO, clock div:2
load:0x3fce3808,len:0x09bc
load:0x40375768,len:0x8c34
load:0x3fce8810,len:0x54c
load:0x40391600,len:0x3cb8
entry 0x403d68f8

解读：
- rst:0x1 (POWERON) → 正常上电启动
- boot:0x8 → SPI Flash 启动模式
- 后续地址加载了固件代码
\`\`\`

### 串口协议日志

\`\`\`
发送命令格式：
[7E] [CMD] [DATA0-11] [CHECKSUM] [7E]

示例 - 设置位置命令：
7E 01 00 D0 07 01 ... 00 XX 7E
│  │  │  │   │  │      │  │   │
│  │  │  │   │  │      │  │   └── 校验和
│  │  │  │   │  │      │  └─────── 帧尾
│  │  │  │   │  │      └────────── 保留/数据
│  │  │  │   │  └──────────────── 舵机1位置(低)
│  │  │  │   └─────────────────── 舵机1位置(高)
│  │  │  └──────────────────────── 舵机0位置(低)
│  │  └──────────────────────────── 舵机0位置(高)
│  └─────────────────────────────── 舵机0 ID
└──────────────────────────────── 帧头(0x7E)
\`\`\`

### 归位日志

\`\`\`
归位过程日志：

[Homing] Starting homing sequence...
[Homing] Moving to extend position...
[Homing] Servo 0 at target: YES
[Homing] Servo 1 at target: YES
[Homing] Servo 2 at target: YES
[Homing] Servo 3 at target: NO  ← 注意这个
[Homing] Retrying servo 3...
[Homing] Servo 3 at target: YES
[Homing] All servos homed successfully!

解读：
- 逐个检查舵机到位状态
- 如果某个舵机未到位，会重试
- 全部完成后输出成功消息
\`\`\`

### 错误日志

\`\`\`
常见错误码：

0xE1 - 校验和错误
→ 可能原因：通信干扰、波特率不匹配

0xE2 - 命令格式错误
→ 可能原因：数据长度不对、参数越界

0xE3 - 舵机超时
→ 可能原因：舵机供电不足、总线断路

0xE4 - 舵机错误
→ 可能原因：舵机故障、ID冲突

0xE5 - 归位失败
→ 可能原因：机械卡住、超时

示例：
[ERROR] Checksum mismatch: expected=0xD6, got=0xA3
[ERROR] Servo 3 timeout
[ERROR] Homing failed after 3 retries
\`\`\`

### 调试模式输出

\`\`\`
启用调试模式后，增加以下输出：

[DEBUG] Received: 7E 01 00 D0 07 ...
[DEBUG] Checksum OK
[DEBUG] CMD: SET_POSITION, Servo: 0, Pos: 2000
[DEBUG] Sending to servo bus...
[DEBUG] Servo 0 ACK received
[DEBUG] Response time: 2.3ms

解读：
- 每一步操作都有详细记录
- 可以追踪命令执行流程
- 便于定位通信问题
      `
    },
    sdkLogs: {
      title: 'SDK 日志分析',
      content: `
## SDK 日志详解

### 连接日志

\`\`\`
正常连接日志：

[SDK] Initializing AeroHand...
[SDK] Scanning serial ports...
[SDK] Found ports: ['COM3', 'COM4', '/dev/ttyUSB0']
[SDK] Trying port: /dev/ttyUSB0
[SDK] Opening port at 921600 baud...
[SDK] Port opened successfully
[SDK] Sending ping...
[SDK] Ping successful, firmware version: 1.0.0
[SDK] Hand initialized successfully

解读：
- 完整记录了连接过程
- 可以看到扫描到的所有端口
- ping 成功确认固件响应
\`\`\`

### 控制日志

\`\`\`
设置位置时的日志：

[SDK] set_joint_positions([50, 50, 50, 50, 50, 50, 50])
[SDK] Validating positions...
[SDK] Position validation passed
[SDK] Converting to servo counts...
[SDK] Servo 0: 50% → count 2000
[SDK] Servo 1: 50% → count 2000
[SDK] ...
[SDK] Building packet: 7E 01 00 D0 07 ...
[SDK] Sending packet (16 bytes)...
[SDK] Waiting for response...
[SDK] Response received: 7E 01 00 D0 07 ... (16 bytes)
[SDK] Checksum verified
[SDK] Command completed successfully

解读：
- 显示所有位置的验证过程
- 百分比到计数值的转换
- 完整的发送接收过程
\`\`\`

### 错误日志

\`\`\`
通信错误：

[SDK] ERROR: Failed to send command
[SDK] ERROR DETAILS: SerialException: Write timeout
[SDK] RETRY: Attempt 1/3
[SDK] Retrying...
[SDK] ERROR: Failed to send command
[SDK] ERROR DETAILS: SerialException: Write timeout
[SDK] RETRY: Attempt 2/3
[SDK] Retrying...
[SDK] ERROR: Failed after 3 retries
[SDK] RAISING: CommunicationError

解读：
- 详细的错误信息
- 自动重试过程
- 最终失败的异常类型

校验错误：

[SDK] Response received: 7E 01 00 D0 07 ...
[SDK] Checksum mismatch!
[SDK] Expected: 0xD6
[SDK] Got: 0xA3
[SDK] Dropping packet
[SDK] RAISING: ChecksumError
\`\`\`

### 状态日志

\`\`\`
状态查询日志：

[SDK] get_joint_positions()
[SDK] Building query packet: 7E 10 00 ...
[SDK] Sending query to servo 0...
[SDK] Response: pos=1980
[SDK] Querying servo 1...
[SDK] Response: pos=2020
[SDK] ...
[SDK] All servos queried
[SDK] Returning: [49, 50, 50, 50, 50, 50, 50]

解读：
- 每个舵机的查询过程
- 解析响应数据
- 最终返回的关节位置
      `
    },
    simulationLogs: {
      title: '仿真日志解读',
      content: `
## 仿真日志详解

### 训练日志

\`\`\`
PPO 训练日志：

[Train] Step: 100000 / 10000000
[Train] Episode reward: 125.3
[Train] Running reward: 118.7 ± 15.2
[Train] Loss: 0.023
[Train] Entropy: 2.15
[Train] KL divergence: 0.012
[Train] Learning rate: 0.0003
[Train] Steps/sec: 1523
[Train] GPU memory: 4.2GB / 8GB

解读：
- Step: 当前步数 / 总步数
- Episode reward: 当前 episode 奖励
- Running reward: 滑动平均奖励
- Loss: 策略/价值损失
- Entropy: 策略熵（衡量探索）
- KL: KL 散度（策略变化幅度）
- Steps/sec: 训练速度
\`\`\`

### 环境日志

\`\`\`
环境步进日志：

[Env] Reset
[Env] Object position: [0.15, -0.02, 0.05]
[Env] Object rotation: [0.71, 0.0, 0.71, 0.0]
[Env] Step 0: action=[0.1, 0.2, ...], reward=0.5
[Env] Step 1: action=[0.15, 0.18, ...], reward=0.8
[Env] Step 2: action=[0.2, 0.15, ...], reward=1.2
[Env] Done: success=True, total_reward=15.3

解读：
- 每步的动作和奖励
- 累加的总奖励
- 最终是否成功
\`\`\`

### 评估日志

\`\`\`
策略评估日志：

[Eval] Starting evaluation (100 episodes)
[Eval] Episode 1/100: success=True, time=2.3s
[Eval] Episode 2/100: success=True, time=1.9s
[Eval] Episode 3/100: success=False, reason=object_dropped
[Eval] Episode 4/100: success=True, time=2.1s
...
[Eval] Episode 100/100: success=True, time=2.5s
[Eval] ========================================
[Eval] Success rate: 87.0%
[Eval] Average time: 2.31s
[Eval] Average reward: 12.45
[Eval] ========================================

解读：
- 逐 episode 记录
- 失败原因分析
- 汇总统计
\`\`\`

### 错误日志

\`\`\`
物理仿真错误：

[Sim] ERROR: Physics instability detected
[Sim] Joint 3 velocity exceeds limit (15.2 > 10.0)
[Sim] Reducing timestep...
[Sim] Retrying step...
[Sim] Step successful

或

[Sim] ERROR: Collision detection failed
[Sim] Geometries: box vs sphere
[Sim] Contact points: 0
[Sim] Skipping collision

解读：
- MuJoCo 物理引擎警告
- 自动尝试恢复
- 严重错误会终止仿真
      `
    }
  },

  // ========== 额外实战案例 ==========
  additionalCases: {
    cubeRotate: {
      title: '魔方旋转完整案例',
      content: `
## 案例：魔方旋转任务

### 项目目标

\`\`\`
目标：训练一个策略，使机械手能够将魔方旋转180度

成功标准：
- 魔方绕Z轴旋转 ≥ 180°
- 魔方保持在手中（不掉落）
- 完成时间 ≤ 10秒
\`\`\`

### 环境定义

\`\`\`python
# cube_rotate_env.py
import gymnasium as gym
import mujoco
import numpy as np

class CubeRotateEnv(gym.Env):
    def __init__(self):
        self.model = mujoco.MjSpec.from_file(
            "aero_cube_rotate.xml"
        ).to_model()
        self.data = mujoco.MjData(self.model)

        # 动作空间：7个关节
        self.action_space = gym.spaces.Box(
            low=-1, high=1, shape=(7,), dtype=np.float32
        )

        # 观测空间：关节位置 + 魔方姿态
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(7 + 4,), dtype=np.float32
        )

    def reset(self, seed=None):
        super().reset(seed=seed)
        mujoco.mj_reset(self.data)

        # 初始抓取位置
        self.data.ctrl[:] = [50, 50, 50, 50, 60, 40, 0]

        return self._get_obs(), {}

    def step(self, action):
        # 应用动作
        self._apply_action(action)

        # 物理步进
        mujoco.mj_step(self.model, self.data)

        # 计算奖励
        reward = self._compute_reward()

        # 检查完成
        done = self._is_done()

        return self._get_obs(), reward, done, False, {}

    def _get_obs(self):
        """获取观测"""
        joint_pos = self.data.qpos[:7]
        cube_quat = self.data.body("cube").xquat
        return np.concatenate([joint_pos, cube_quat])

    def _compute_reward(self):
        """计算奖励"""
        # 获取当前旋转角度
        current_angle = self._get_z_rotation()

        # 目标角度
        target_angle = np.pi  # 180度

        # 奖励：越接近目标越好
        error = abs(current_angle - target_angle)
        reward = -error * 10

        # 成功奖励
        if error < 0.1:
            reward += 20.0

        # 保持抓取的奖励
        if self._check_grasp_maintained():
            reward += 0.5

        return reward

    def _get_z_rotation(self):
        """获取魔方Z轴旋转角度"""
        quat = self.data.body("cube").xquat
        # 从四元数提取Z轴旋转
        # ...
        return angle_z

    def _check_grasp_maintained(self):
        """检查是否保持抓取"""
        cube_pos = self.data.body("cube").xpos
        palm_pos = self.data.body("palm").xpos
        return np.linalg.norm(cube_pos - palm_pos) < 0.1
\`\`\`

### 域随机化

\`\`\`python
class DomainRandomizer:
    def __init__(self):
        self.params = {
            'tendon_stiffness': (800, 1200),
            'joint_damping': (0.05, 0.2),
            'cube_mass': (0.08, 0.12),
            'cube_friction': (0.3, 0.7),
        }

    def randomize(self, env):
        for name, (low, high) in self.params.items():
            value = np.random.uniform(low, high)
            setattr(env, name, value)
\`\`\`

### 训练配置

\`\`\`python
TRAINING_CONFIG = {
    'env_name': 'CubeRotateEnv',
    'num_envs': 512,
    'num_train_steps': 10_000_000,
    'learning_rate': 3e-4,
    'batch_size': 2048,
    'ppo_epochs': 8,
    'save_interval': 100000,
}
\`\`\`

### Sim2Real 部署

\`\`\`python
# deploy_cube_rotate.py
import numpy as np
from aero_open_sdk import AeroHand
import time

class CubeRotator:
    def __init__(self, policy_path):
        self.policy = load_policy(policy_path)
        self.hand = AeroHand()
        self.hand.home()

    def get_observation(self):
        joint_pos = np.array(self.hand.get_joint_positions()) / 100.0
        # 需要视觉系统获取魔方位置
        # 这里简化处理
        cube_quat = np.array([1, 0, 0, 0])
        return np.concatenate([joint_pos, cube_quat])

    def run(self):
        print("开始旋转任务...")
        step = 0

        while step < 200:
            obs = self.get_observation()
            action = self.policy(obs)

            # 转换动作
            command = ((action + 1) * 50).tolist()
            self.hand.set_joint_positions(command)

            time.sleep(0.05)
            step += 1

        print("任务完成")

    def _action_to_command(self, action):
        return ((action + 1) * 50).tolist()
\`\`\`
      `
    },
    assemblySequence: {
      title: '装配序列规划案例',
      content: `
## 案例：装配序列规划

### 项目背景

\`\`\`
目标：使用机械手完成简单的装配任务
任务：将零件 A 装配到零件 B 上
难度：中等，需要精确的视觉定位和力控制
\`\`\`

### 系统架构

\`\`\`
装配系统组成：

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  工业相机   │───▶│   工控机    │───▶│  Aero Hand  │
│ (视觉定位)  │    │ (规划控制)  │    │   (执行)    │
└──────────────┘    └──────────────┘    └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  力传感器   │
                   │ (力反馈)   │
                   └──────────────┘
\`\`\`

### 视觉定位

\`\`\`python
# vision_localization.py
import cv2
import numpy as np

class VisionLocalizer:
    def __init__(self, camera_params):
        self.camera_matrix = camera_params['matrix']
        self.dist_coeffs = camera_params['dist']

    def localize_part(self, image):
        """从图像中定位零件"""
        # 边缘检测
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        # 找轮廓
        contours, _ = cv2.findContours(
            edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        # 筛选目标零件
        target = self._select_target_contour(contours)

        # 计算位置
        if target is not None:
            pos_2d = self._get_center(target)
            pos_3d = self._pixel_to_3d(pos_2d)
            angle = self._get_orientation(target)
            return {'position': pos_3d, 'angle': angle}

        return None

    def _pixel_to_3d(self, pixel):
        """像素坐标转3D坐标"""
        # 使用PnP算法
        # ...
        return [x, y, z]
\`\`\`

### 力控制

\`\`\`python
# force_control.py
import numpy as np

class ForceController:
    def __init__(self, hand):
        self.hand = hand
        self.force_threshold = 2.0  # N

    def insert_with_force(self, target_pos, approach_dir):
        """力控制插入"""
        # 接近阶段
        self._approach(target_pos, approach_dir)

        # 搜索阶段 - 小幅探索
        for _ in range(10):
            force = self._read_force()

            if force < self.force_threshold:
                # 继续插入
                self._move_down(0.001)
            else:
                # 检测到接触，调整位置
                adjustment = self._compute_adjustment(force)
                self._adjust_position(adjustment)

        # 确认插入完成
        return self._check_insertion_complete()

    def _read_force(self):
        """读取当前力"""
        # 从力传感器读取
        # 这里简化处理
        return self.hand.get_joint_loads()
\`\`\`

### 装配任务执行

\`\`\`python
# assembly_task.py
class AssemblyTask:
    def __init__(self):
        self.hand = AeroHand()
        self.vision = VisionLocalizer(camera_params)
        self.force_ctrl = ForceController(self.hand)

    def execute(self, part_a, part_b):
        """执行装配任务"""
        print(f"开始装配: {part_a} → {part_b}")

        # 1. 视觉定位零件A
        pos_a = self._locate_part(part_a)
        print(f"零件A位置: {pos_a}")

        # 2. 视觉定位零件B
        pos_b = self._locate_part(part_b)
        print(f"零件B位置: {pos_b}")

        # 3. 移动到零件A
        self._move_to(pos_a)
        print("已到达零件A")

        # 4. 抓取零件A
        self._grasp(part_a)
        print("已抓取零件A")

        # 5. 移动到零件B上方
        target = self._compute_target(pos_a, pos_b)
        self._move_to(target)
        print("已到达目标位置")

        # 6. 力控制插入
        success = self.force_ctrl.insert_with_force(
            target,
            approach_dir=[0, 0, -1]
        )

        if success:
            print("装配成功!")
        else:
            print("装配失败")

        # 7. 释放
        self._release()
        return success
\`\`\`
      `
    },
    handwritingRobot: {
      title: '写字机器人案例',
      content: `
## 案例：写字机器人

### 项目目标

\`\`\`
目标：使用机械手控制笔书写文字或图形

技术要点：
- 末端执行器（笔）控制
- 轨迹跟踪
- 力控制（保持书写压力）
\`\`\`

### 末端执行器设计

\`\`\`
笔夹设计：

3D打印零件：
- pen_holder.stl - 笔夹主体
- pen_clamp_x.stl - X轴夹爪
- pen_clamp_y.stl - Y轴夹爪

安装：
- 替换拇指指尖
- 使用肌腱驱动夹爪
- 预留笔的插入空间

夹持力调节：
- 通过预紧力调整
- 夹持力过大会阻碍笔运动
- 夹持力过小笔会滑落
\`\`\`

### 轨迹生成

\`\`\`python
# trajectory_generator.py
import numpy as np

class TrajectoryGenerator:
    def __init__(self):
        self.stroke_width = 2.0  # mm
        self.stroke_height = 50.0  # mm

    def generate_from_text(self, text):
        """从文本生成书写轨迹"""
        from svg.path import parse_path

        # 将文字转换为SVG路径
        svg = self._text_to_svg(text)

        # 解析路径
        paths = parse_path(svg)

        # 采样轨迹点
        trajectory = []
        for path in paths:
            points = self._sample_path(path, num_points=100)
            trajectory.extend(points)

        return np.array(trajectory)

    def _sample_path(self, path, num_points):
        """采样路径点"""
        points = []
        for i in range(num_points):
            t = i / num_points
            point = path.point(t)
            points.append([point.real, point.imag])

        return points

    def smooth_trajectory(self, trajectory, lookahead=5):
        """轨迹平滑（Savitzky-Golay滤波）"""
        from scipy.signal import savgol_filter

        # 分离X和Y
        x = trajectory[:, 0]
        y = trajectory[:, 1]

        # 滤波
        x_smooth = savgol_filter(x, lookahead*2+1, 3)
        y_smooth = savgol_filter(y, lookahead*2+1, 3)

        return np.column_stack([x_smooth, y_smooth])
\`\`\`

### 书写控制

\`\`\`python
# handwriting_controller.py
import numpy as np
import time

class HandwritingController:
    def __init__(self, hand):
        self.hand = hand

        # 书写参数
        self.paper_height = 0.1  # 纸张高度
        self.stroke_speed = 20.0  # mm/s
        self.down_force = 0.5     # 下压力

        # 关节配置：保持笔竖直
        self.pen_angle = [0, 0, 0, 0, 50, 80, 0]

    def write_text(self, text):
        """书写文本"""
        traj_gen = TrajectoryGenerator()
        trajectory = traj_gen.generate_from_text(text)

        # 平滑轨迹
        trajectory = traj_gen.smooth_trajectory(trajectory)

        print(f"书写轨迹: {len(trajectory)} 点")

        # 执行书写
        self._execute_trajectory(trajectory)

    def _execute_trajectory(self, trajectory):
        """执行书写轨迹"""
        # 计算总长度和时间
        lengths = np.sqrt(np.sum(np.diff(trajectory, axis=0)**2, axis=1))
        total_length = np.sum(lengths)
        duration = total_length / self.stroke_speed

        # 降下笔
        self._pen_down()
        time.sleep(0.2)

        # 跟随轨迹
        steps = len(trajectory)
        for i in range(steps):
            target = trajectory[i]
            self._move_to(target)

            # 控制频率
            time.sleep(duration / steps)

        # 抬起笔
        self._pen_up()

    def _pen_down(self):
        """笔下降到纸张"""
        # 调整拇指角度增加压力
        target = self.pen_angle.copy()
        target[5] = 90  # 增加拇指压力
        self.hand.set_joint_positions(target)

    def _pen_up(self):
        """笔抬起"""
        self.hand.set_joint_positions(self.pen_angle)

    def _move_to(self, target_2d):
        """移动到目标位置（2D）"""
        # 简单的位置控制
        # 实际需要更复杂的逆运动学
        target = self._compute_joint_positions(target_2d)
        self.hand.set_joint_positions(target)

    def _compute_joint_positions(self, target_2d):
        """计算达到目标位置的关节位置"""
        # 简化的映射
        x, y = target_2d

        # 关节0-3 控制X方向
        joint_x = np.interp(x, [-50, 50], [0, 100])

        # 关节4-5 控制Y方向
        joint_y = np.interp(y, [0, 100], [0, 100])

        positions = self.pen_angle.copy()
        positions[0:4] = [joint_x] * 4
        positions[4:6] = [joint_y] * 2

        return positions
\`\`\`
      `
    }
  },

  // ========== 最佳实践总结 ==========
  bestPracticesSummary: {
    developmentCycle: {
      title: '开发周期最佳实践',
      content: `
## 开发周期最佳实践

### 敏捷开发流程

\`\`\`
Sprint 周期：2周

Sprint 计划 (第1天)
├─ 回顾上Sprint
├─ 确定本Sprint目标
└─ 分解任务

日常开发 (第2-10天)
├─ 每日站会 (15分钟)
├─ 持续集成
└─ 代码审查

Sprint 结束 (第11-14天)
├─ 功能演示
├─ 回顾会议
└─ 文档更新
\`\`\`

### 代码管理

\`\`\`
Git 工作流：

main (稳定版本)
  ↑
  │ 合并
  │
develop (开发分支)
  ↑
  │ 创建特性分支
  │
feature/xxx (特性分支)
  - 功能开发完成后合并到 develop
  - 需要通过所有测试和代码审查

发布流程：
1. 从 develop 创建 release 分支
2. 发布测试
3. 合并到 main 并打标签
\`\`\`

### 代码审查清单

\`\`\`
代码审查要点：

□ 功能正确性
  - 是否实现了需求？
  - 边界条件处理？
  - 错误处理？

□ 代码质量
  - 命名规范？
  - 函数长度 < 50行？
  - 重复代码提取？

□ 测试覆盖
  - 单元测试？
  - 集成测试？
  - 测试覆盖率 > 80%？

□ 文档
  - 函数文档字符串？
  - 复杂逻辑有注释？
  - 更新了 README？

□ 性能
  - 无明显性能问题？
  - 资源释放？
\`\`\`

### CI/CD 流程

\`\`\`
持续集成：

1. 提交代码
   ↓
2. 自动构建
   ├─ 安装依赖
   ├─ 编译固件
   └─ 打包 SDK
   ↓
3. 自动测试
   ├─ 单元测试
   ├─ 集成测试
   └─ 静态分析
   ↓
4. 报告结果
   ↓
5. 部署到测试环境

部署阶段：
- 测试环境：自动部署
- 预生产：手动触发
- 生产：批准后部署
\`\`\`
      `
    },
    testingPractices: {
      title: '测试最佳实践',
      content: `
## 测试最佳实践

### 测试金字塔

\`\`\`
测试金字塔：

         ┌───────────────┐
         │     E2E       │  ← 少量，重要
         │   (端到端)     │
         ├───────────────┤
         │  Integration  │  ← 中等
         │   (集成测试)   │
         ├───────────────┤
         │     Unit      │  ← 大量
         │   (单元测试)   │
         └───────────────┘

比例建议：
- 单元测试：70%
- 集成测试：20%
- E2E测试：10%
\`\`\`

### 单元测试

\`\`\`python
# test_servo_control.py
import pytest
from aero_open_sdk import AeroHand

class TestServoControl:
    def test_position_mapping(self):
        """测试位置映射"""
        hand = AeroHand()

        # 测试边界
        assert hand._percent_to_count(0, 0) == hand.servos[0].extend_count
        assert hand._percent_to_count(0, 100) == hand.servos[0].grasp_count

        # 测试中间值
        mid = hand._percent_to_count(0, 50)
        expected = (hand.servos[0].extend_count +
                    hand.servos[0].grasp_count) // 2
        assert abs(mid - expected) <= 1

    def test_position_clamping(self):
        """测试位置限制"""
        hand = AeroHand()

        # 超出范围应被限制
        assert hand._percent_to_count(0, -10) == 0
        assert hand._percent_to_count(0, 110) == 100

    @pytest.mark.parametrize("servo_id", range(7))
    def test_all_servos(self, servo_id):
        """参数化测试所有舵机"""
        hand = AeroHand()
        pos = hand._percent_to_count(servo_id, 50)
        assert 0 <= pos <= 4095
\`\`\`

### 集成测试

\`\`\`python
# test_integration.py
import pytest
import time
from aero_open_sdk import AeroHand

class TestIntegration:
    @pytest.fixture
    def hand(self):
        """测试夹具"""
        h = AeroHand()
        h.home()
        yield h
        h.set_joint_positions([0]*7)

    def test_full_motion_range(self, hand):
        """测试完整运动范围"""
        # 张开
        hand.set_joint_positions([0]*7)
        time.sleep(1)
        positions = hand.get_joint_positions()
        assert all(p < 10 for p in positions)

        # 闭合
        hand.set_joint_positions([100]*7)
        time.sleep(1)
        positions = hand.get_joint_positions()
        assert all(p > 90 for p in positions)

    def test_sequence_execution(self, hand):
        """测试序列执行"""
        sequence = [
            [0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50],
            [100, 100, 100, 100, 100, 100, 100],
        ]

        for positions in sequence:
            hand.set_joint_positions(positions)
            time.sleep(0.5)
            # 验证（允许一定误差）
            current = hand.get_joint_positions()
            assert all(abs(c-p) < 15 for c, p in zip(current, positions))
\`\`\`

### 仿真测试

\`\`\`python
# test_simulation.py
import pytest
import numpy as np
from grasp_env import GraspingEnv

class TestGraspingEnv:
    @pytest.fixture
    def env(self):
        return GraspingEnv()

    def test_reset(self, env):
        """测试环境重置"""
        obs, _ = env.reset()
        assert obs.shape == env.observation_space.shape
        assert not np.any(np.isnan(obs))

    def test_action_space(self, env):
        """测试动作空间"""
        action = env.action_space.sample()
        obs, reward, done, _, _ = env.step(action)

        assert obs.shape == env.observation_space.shape
        assert isinstance(reward, float)
        assert isinstance(done, bool)

    def test_reward_shaping(self, env):
        """测试奖励塑形"""
        env.reset()

        # 测试奖励计算
        action = env.action_space.sample()
        obs, reward, done, _, _ = env.step(action)

        # 奖励应该在合理范围内
        assert -100 < reward < 100
\`\`\`

### 测试覆盖率

\`\`\`bash
# 运行覆盖率测试
pytest --cov=src --cov-report=html tests/

# 生成报告
coverage report
coverage html

# 覆盖率要求
- 行覆盖率 > 80%
- 函数覆盖率 > 90%
- 分支覆盖率 > 70%
\`\`\`
      `
    },
    deploymentPractices: {
      title: '部署最佳实践',
      content: `
## 部署最佳实践

### 部署环境

\`\`\`
环境分层：

┌─────────────────────────────────────────┐
│           生产环境 (Production)           │
│  - 真实硬件                             │
│  - 稳定版本                             │
│  - 监控告警                             │
├─────────────────────────────────────────┤
│           预生产 (Staging)               │
│  - 真实硬件                             │
│  - 最新发布候选                          │
│  - 全面测试                             │
├─────────────────────────────────────────┤
│           开发 (Development)             │
│  - 仿真环境                             │
│  - 快速迭代                             │
└─────────────────────────────────────────┘
\`\`\`

### 部署检查清单

\`\`\`
部署前检查：

□ 代码审查通过
□ 所有测试通过
□ 更新了文档
□ 备份了配置
□ 通知了相关人员
□ 准备了回滚方案

部署后检查：

□ 功能测试通过
□ 性能指标正常
□ 日志无错误
□ 监控系统正常
□ 用户反馈正常
\`\`\`

### 固件部署

\`\`\`bash
# 固件部署脚本
#!/bin/bash

VERSION=$1
ENV=$2

echo "部署固件 v$VERSION 到 $ENV"

# 构建固件
pio run --environment release

# 签名（生产环境）
if [ "$ENV" == "production" ]; then
    ./sign_firmware.sh build/firmware.bin
fi

# 上传到服务器
scp build/firmware.bin deploy@server:/firmware/

# 通知设备更新
curl -X POST https://api.example.com/deploy \\
    -d "version=$VERSION" \\
    -d "environment=$ENV"

echo "部署完成"
\`\`\`

### SDK 部署

\`\`\`python
# 发布脚本
#!/bin/bash

VERSION=$1

# 更新版本号
sed -i "s/version=.*/version='$VERSION'/" setup.py

# 构建分发包
python -m build

# 上传到 PyPI
twine upload dist/*

# 创建 GitHub Release
gh release create v$VERSION \\
    --title "Release $VERSION" \\
    --notes "$(cat CHANGELOG.md)"
\`\`\`

### 回滚方案

\`\`\`
回滚触发条件：
- 成功率 < 95%
- 错误率上升 > 10%
- 用户反馈严重问题

回滚步骤：

1. 停止部署
   curl -X POST /api/deploy/stop

2. 切换到旧版本
   if [ "$ENV" == "production" ]; then
       ./rollback.sh v1.2.3
   fi

3. 验证功能
   pytest tests/ -v

4. 通知团队
   slack通知 "已回滚到 v1.2.3"
\`\`\`

### 监控和告警

\`\`\`python
# 监控指标

关键指标：
- 请求成功率
- 响应延迟 (P50, P95, P99)
- 错误率
- 资源使用率 (CPU, Memory)

告警规则：
- 成功率 < 99%: 警告
- 成功率 < 95%: 严重
- P95延迟 > 1s: 警告
- P95延迟 > 5s: 严重

监控工具：
- Prometheus + Grafana
- ELK Stack (日志)
- Sentry (错误跟踪)
\`\`\`
      `
    },
    collaborationPractices: {
      title: '协作最佳实践',
      content: `
## 协作最佳实践

### 代码协作

\`\`\`
Pull Request 流程：

1. 创建分支
   git checkout -b feature/my-feature

2. 开发并提交
   git commit -m "feat: add new feature"

3. 推送并创建 PR
   git push origin feature/my-feature

4. 代码审查
   - 至少 1 人审查
   - 所有评论已解决

5. 合并
   - Squash and merge
   - 删除分支

PR 描述模板：
\`\`\`
## 描述
[简短描述改动]

## 类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档

## 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] 手动测试

## 截图 (UI改动)
\`\`\`
\`\`\`

### 文档协作

\`\`\`
文档维护：

1. 代码内文档
   - 函数文档字符串
   - 复杂逻辑注释
   - 类型注解

2. API 文档
   - 自动生成 (Sphinx/Docusaurus)
   - 示例代码
   - 更新日志

3. Wiki/知识库
   - 项目文档
   - 常见问题
   - 教程

文档评审：
- PR 需要包含文档更新
- 文档错误也算 bug
\`\`\`

### 视觉追踪

\`\`\`
项目可视化：

工具：Notion, Linear, Jira

工作项类型：
- Epic (大特性)
- Story (用户故事)
- Task (任务)
- Bug (缺陷)

工作流：
Backlog → Todo → In Progress → Review → Done

常用字段：
- 标题
- 描述
- 负责人
- 优先级
- 标签
- 截止日期
- 关联 PR
\`\`\`

### 知识共享

\`\`\`
团队知识管理：

1. 技术分享会 (每周)
   - 主题：新技术、踩坑记录、最佳实践
   - 时长：30 分钟
   - 录制：供后人查看

2. 文档中心
   - 架构决策记录 (ADR)
   - 设计文档
   - API 文档

3. 代码巡览
   - 新成员：代码走读
   - 季度：架构演进

4. 外部交流
   - 参与开源社区
   - 发表技术博客
   - 参加会议演讲
\`\`\`

### 远程协作

\`\`\`
时区差异处理：

重叠时间窗口：
- 异步优先，同步其次
- 核心讨论在重叠时间

异步沟通：
- 详细记录决策
- 视频替代会议
- 清晰的书面沟通

工具：
- 即时通讯：Slack
- 视频会议：Zoom/Meet
- 文档协作：Google Docs/Notion
- 代码协作：GitHub
\`\`\`
      `
    }
  }
}
