# Aero Hand Open 完全复现指南

## 项目概述

**Aero Hand Open** 是由 TetherIA 公司开发的开源肌腱驱动机械手项目，专为灵巧操作研究设计。该项目旨在提供一个简单、可靠、可访问的机器人手平台，适用于研究实验室、教育机构和机器人爱好者。

### 核心特性
- **7自由度机械手**（5个手指，共16个关节）
- **肌腱驱动架构**，实现平滑自然的运动
- **全3D打印结构**，模块化易组装
- **轻量化设计** - 389克
- **经济实惠** - 完整套件314美元
- **开源硬件和固件**
- **独立的Python SDK**，兼容ESP32和ROS2系统
- **仿真和强化学习支持**（MuJoCo）

### 技术领域
- 机器人学
- 机电一体化
- 3D打印制造
- 嵌入式系统（ESP32-S3）
- ROS2（机器人操作系统）
- 强化学习
- 计算机视觉（手势识别）

### 项目状态
- **最新版本**：1.0.0（2025年11月7日发布）
- **许可证**：软件（Apache-2.0），硬件设计文件（CC BY-NC-SA 4.0）
- **Git状态**：干净，最新提交 890c98b "release: firmware, ros2, sdk (#37)"

---

## 目录结构详解

```
F:\sim\aero\aero-hand-open/
├── assets/                    # 项目资产文件（图片、视频）
├── firmware/                  # 固件代码
│   ├── main/                  # 主固件目录
│   │   ├── assets/           # 固件相关图片
│   │   ├── bin/              # 预编译固件二进制文件
│   │   ├── firmware_v0.1.0.ino  # 主Arduino sketch
│   │   ├── HandConfig.h      # 左右手配置
│   │   ├── Homing.h/.cpp     # 归位功能
│   │   └── LICENSE
│   └── README.md
├── hardware/                  # 硬件设计文件
│   ├── Assembly/             # 组装文件
│   │   ├── BOM.csv          # 物料清单（详细组件列表）
│   │   └── Tools.csv        # 工具清单
│   ├── CAD/                  # CAD设计文件
│   │   ├── Aero_Hand_Open_Left.stp/.Right.stp  # STEP格式
│   │   ├── Molds/           # 硅胶模具
│   │   ├── One_Click_Print_L.3mf/.R.3mf  # 一键打印文件
│   │   └── Robot_Arm_Mounts/ # 机器人手臂安装件
│   ├── PCB/                  # PCB设计文件
│   │   ├── Aero_hand_open_left/  # 左手PCB（KiCad项目）
│   │   ├── Aero_hand_open_right/ # 右手PCB
│   │   └── Components/       # 电子元件库
│   └── README.md
├── ros2/                     # ROS2集成
│   ├── src/
│   │   ├── aero_hand_open/           # 主ROS2节点
│   │   ├── aero_hand_open_description/ # URDF描述文件
│   │   ├── aero_hand_open_msgs/      # 自定义消息
│   │   ├── aero_hand_open_rl/        # 强化学习集成
│   │   ├── aero_hand_open_teleop/    # 遥操作（手势识别）
│   │   └── manus_glove_pkg/          # Manus手套集成
│   └── README.md
├── sdk/                      # Python SDK
│   ├── examples/             # 示例代码
│   ├── src/aero_open_sdk/    # SDK源代码
│   ├── pyproject.toml        # Python项目配置
│   └── README.md
├── sim_rl/                   # 仿真和强化学习
│   ├── README.md
│   ├── mujoco_playground/    # Google DeepMind Mujoco playground（子模块）
│   └── simulation/           # 仿真模型（子模块）
├── CONTRIBUTING.md           # 贡献指南
├── LICENSE.md                # 许可证说明
├── docs/                     # 项目文档
│   ├── README.md             # 主README
│   ├── DEPLOYMENT_GUIDE.md   # 部署指南
│   ├── QUICK_DEPLOY.md       # 快速部署
│   └── START_GUIDE.md        # 快速开始
├── .gitignore
└── .gitmodules              # Git子模块配置
```

---

## 硬件规格与需求

### 核心硬件组件

#### 1. 3D打印部件（18种PLA部件）
- **推荐打印机**：Bambu X1C
- **喷嘴直径**：0.4mm
- **层高**：0.2mm
- **支撑**：树状支撑，仅构建板支撑
- **材料**：PLA（结构强度好，尺寸精度高）

**主要打印部件**：
1. 手指底座 (Finger Base) ×4
2. 手指MCP关节 ×4
3. 手指近节指骨 (Finger Proximal) ×4
4. 手指中节指骨 (Finger Medial) ×4
5. 手指远节指骨 (Finger Distal) ×4
6. 电缆卷轴 (Cable Spool) ×6
7. 拇指外展上伺服盘 ×1
8. 拇指外展下伺服盘 ×1
9. 拇指外展连杆 ×1
10. 拇指CMC底座 ×1
11. 拇指MCP关节 ×1
12. 拇指近节指骨 ×1
13. 拇指远节指骨 ×1
14. 伺服框架 ×1
15. 手掌前框架 ×1
16. 手掌后框架 ×1
17. 硅胶模具顶部 ×1
18. 硅胶模具底部 ×1

#### 2. 铸造部件（硅胶垫）
- **材料**：00-30硅胶（Ecoflex 00-30）
- **部件**：
  - 手指远节垫 ×4
  - 手指近节垫 ×4
  - 拇指远节垫 ×1
  - 手掌框架垫 ×1

#### 3. 采购组件（完整BOM见`hardware/Assembly/BOM.csv`）

**电子组件**：
- **MCU**：Seeed Studio XIAO ESP32-S3（推荐8MB闪存） ×1
- **伺服电机**：Feetech HLS3606M ×7
- **信号转换板**：TTLinker Mini UART Signal Conversion Board ×1
- **可选**：Molex连接器 ×7，原型板 ×1

**机械组件**：
- **弹簧**：
  - PIP返回弹簧（音乐钢丝） ×5
  - MP返回弹簧 ×4
  - CMC返回弹簧 ×1
- **电缆**：
  - 手指拉索（Kevlar/Vectran） ×3
  - 小指拉索 ×1
  - 手指耦合电缆 ×4
  - 拇指CMC弯曲电缆 ×1
  - 拇指拉索 ×1
  - 拇指耦合电缆 ×1
- **轴承**：2x5x2.5轴承 ×23
- **销钉**：
  - 1x10销钉 ×16
  - 2x14销钉 ×12
  - 2x20销钉 ×2
  - 小尺寸2x10销钉 ×19
  - 小尺寸2x20销钉 ×1
  - 小尺寸2x30销钉 ×1
- **螺丝**：
  - M2x6带法兰Torx自攻螺丝 ×25
  - M2x10沉头Torx自攻螺丝 ×12
  - M3x10圆头Torx自攻螺丝 ×9
- **热熔螺母**：M3x5.7热熔螺母 ×4

**电源需求**：
- **伺服电源**：6V，最大电流10A（与USB 5V分开）
- **USB电源**：5V，用于ESP32-S3

### 工具清单（`hardware/Assembly/Tools.csv`）

**必需工具**：
1. **牙线工具** - 布线关键工具
2. **超级胶水** - 固定松动的销钉
3. **硅胶粘合剂** - 硅胶与塑料粘合
4. **锉刀/砂纸** - 清理3D打印件
5. **钢丝钳** - 清理打印件
6. **珠宝钻头套装** - 扩孔
7. **2.1mm钻头** - 特定尺寸钻孔
8. **锋利剪刀/剃须刀片** - 切割电缆
9. **镊子** - 穿线辅助
10. **Torx螺丝刀套装** - 紧固件
11. **十字螺丝刀套装** - 紧固件
12. **柔性延长杆** - 难触及的螺丝
13. **3D打印机** - 打印部件
14. **焊接设备** - 热熔螺母和电线连接
15. **卷尺** - 测量电缆长度
16. **尖嘴钳** - 安装销钉
17. **记号笔/油漆笔** - 标记伺服编号和电缆长度

### PCB设计

**设计文件**：
- **格式**：KiCad项目文件（.kicad_pro, .kicad_sch, .kicad_pcb）
- **Gerber文件**：可用于PCB制造
- **BOM/CPL清单**：CSV格式
- **3D模型**：STEP格式

**关键组件**：
- ESP32-S3接口
- 伺服电机连接器
- 电源管理（XT30连接器）
- 保护电路（保险丝、齐纳二极管）

---

## 软件架构与依赖

### 1. 固件（Firmware）

**目标平台**：Seeed Studio XIAO ESP32-S3
**框架**：Arduino
**编程语言**：C++

**核心文件**：
- `firmware/main/firmware_v0.1.0.ino` - 主控制逻辑
- `firmware/main/HandConfig.h` - 左右手配置选择
- `firmware/main/Homing.h/.cpp` - 归位功能实现

**依赖库**：
- **FTServo库** - Feetech伺服控制
- **Arduino框架** - ESP32-S3支持
- **Preferences库** - 非易失性存储

**串口协议**：
- **波特率**：921600
- **协议格式**：固定16字节二进制协议
- **操作码**：
  - 0x01: 归位 (HOMING)
  - 0x02: 设置ID (SET_ID)
  - 0x03: 微调 (TRIM)
  - 0x11: 位置控制 (CTRL_POS)
  - 0x12: 扭矩控制 (CTRL_TOR)
  - 0x22: 获取位置 (GET_POS)
  - 0x23: 获取速度 (GET_VEL)
  - 0x24: 获取电流 (GET_CURR)
  - 0x25: 获取温度 (GET_TEMP)
  - 0x31: 设置速度 (SET_SPE)
  - 0x32: 设置扭矩 (SET_TOR)

**伺服通道映射（0-6）**：
1. 拇指CMC外展
2. 拇指CMC屈曲
3. 拇指肌腱（弯曲）
4. 食指
5. 中指
6. 无名指
7. 小指

### 2. Python SDK

**Python版本**：≥3.10
**包名称**：`aero-open-sdk`

**核心依赖**：
- `esptool>=5.0.0` - 固件烧录工具

**主要功能**：
- 串口通信管理
- 机械手控制接口
- 归位和校准
- 位置/扭矩控制模式切换
- 伺服微调

**核心类**：`AeroHand`
**安装方式**：
```bash
# 从PyPI安装
pip install aero-open-sdk

# 从源码安装（可编辑模式）
cd sdk
pip install -e .
```

**示例脚本**（`sdk/examples/`）：
- `run_sequence.py` - 运行预定义手势序列
- `joint_control.py` - 关节控制示例
- `perform_homing.py` - 执行归位
- `position_torque_switching.py` - 位置/扭矩模式切换
- `power_grasp.py` - 强力抓握示例
- `torque_control.py` - 扭矩控制示例
- `trim_servo.py` - 伺服微调示例
- `get_info.py` - 获取信息示例

### 3. ROS2集成

**ROS2版本**：Humble Hawksbill（Ubuntu 22.04）
**构建工具**：colcon

**ROS2包结构**：
1. **aero_hand_open** - 主节点
2. **aero_hand_open_description** - URDF描述文件
3. **aero_hand_open_msgs** - 自定义消息类型
4. **aero_hand_open_rl** - 强化学习集成
5. **aero_hand_open_teleop** - 遥操作（手势识别）
6. **manus_glove_pkg** - Manus手套集成
7. **dex_retargeting_ros** - 运动重定向

**遥操作依赖**（`aero_hand_open_teleop/requirements.txt`）：
- `numpy==1.26.4`
- `mediapipe>=0.10,<0.11` - 手势识别
- `opencv-python<4.10` - 计算机视觉
- `pyserial` - 串口通信
- `dex_retargeting` - 运动重定向
- `torch==2.4.1` - PyTorch（CUDA 12.1）
- `torchvision==0.19.1`

**构建命令**：
```bash
cd ros2
colcon build
source install/setup.bash
```

### 4. 仿真与强化学习

**仿真平台**：MuJoCo
**强化学习框架**：基于Google DeepMind的mujoco_playground

**子模块**：
- `sim_rl/mujoco_playground/` - 训练环境
- `sim_rl/simulation/` - 仿真模型文件

**训练策略**：肌腱空间策略训练

---

## 完全复现步骤

### 第一阶段：硬件准备（预计时间：2-4周）

#### 步骤1：采购组件
1. 下载`hardware/Assembly/BOM.csv`
2. 根据BOM清单采购所有组件
3. **备选方案**：从TetherIA商店购买完整套件（$314 USD）

#### 步骤2：3D打印
1. 使用推荐设置：
   - 打印机：Bambu X1C
   - 喷嘴：0.4mm
   - 层高：0.2mm
   - 材料：PLA
   - 支撑：树状支撑，仅构建板支撑
2. 打印所有18个PLA部件
3. 打印硅胶模具（可选，用于铸造硅胶垫）

#### 步骤3：硅胶铸造
1. 准备Ecoflex 00-30硅胶
2. 使用提供的模具铸造：
   - 手指远节垫 ×4
   - 手指近节垫 ×4
   - 拇指远节垫 ×1
   - 手掌框架垫 ×1
3. 固化时间：根据硅胶说明

#### 步骤4：PCB制造
**选项A**：使用提供的Gerber文件制造PCB
1. 提交`hardware/PCB/Aero_hand_open_left/Aero-Hand-Open-Left-Gerber.zip`给PCB制造商
2. 使用BOM和CPL清单进行元器件贴装

**选项B**：购买预组装板（如可用）
**选项C**：使用原型板手动搭建电路

#### 步骤5：准备工具
根据`hardware/Assembly/Tools.csv`准备所有必需工具

### 第二阶段：组装（预计时间：8-16小时）

#### 步骤6：手指模块组装
1. 组装4个手指模块（食指、中指、无名指、小指）
2. 每个手指包括：
   - 底座、MCP关节、近节、中节、远节指骨
   - 轴承和销钉安装
   - 弹簧安装
   - 电缆布线（使用牙线工具）

#### 步骤7：拇指模块组装
1. 拇指结构更复杂，包括：
   - CMC外展机构
   - CMC屈曲机构
   - 拇指肌腱系统
2. 特别注意电缆布线方向

#### 步骤8：手掌框架组装
1. 安装伺服框架
2. 安装7个Feetech HLS3606M伺服电机
3. 连接电缆卷轴系统
4. 安装硅胶垫

#### 步骤9：电子系统集成
1. 安装ESP32-S3控制器
2. 连接TTLinker信号转换板
3. 布线伺服电机连接
4. 电源连接（6V伺服电源与5V USB分开）

#### 步骤10：最终调整
1. 电缆张力调整
2. 关节平滑度检查
3. 伺服归位测试

### 第三阶段：软件设置（预计时间：2-4小时）

#### 步骤11：固件烧录
**方法A：使用SDK GUI（推荐）**
1. 安装Python SDK：`pip install aero-open-sdk`
2. 运行GUI：`aero-open-gui`
3. 连接机械手USB
4. 使用GUI烧录预编译固件（`firmware/main/bin/`）

**方法B：手动编译烧录**
1. **PlatformIO方法**：
   - 安装Visual Studio Code + PlatformIO插件
   - 创建新项目，选择Arduino框架，XIAO ESP32S3板
   - 复制固件文件到项目
   - 在`HandConfig.h`中选择`LEFT_HAND`或`RIGHT_HAND`
   - 配置`platformio.ini`添加FTServo库路径
   - 编译并上传

2. **Arduino IDE方法**：
   - 安装Arduino IDE + ESP32板支持
   - 打开`firmware_v0.1.0.ino`
   - 选择XIAO ESP32S3板
   - 安装FTServo库
   - 修改`HandConfig.h`选择手型
   - 上传

#### 步骤12：Python SDK安装与测试
1. 安装SDK：`pip install aero-open-sdk`
2. 查找串口：
   - **Linux**：`ls /dev/serial/by-id/`
   - **Windows**：设备管理器查看COM端口
3. 运行示例测试：
   ```bash
   cd sdk/examples
   python perform_homing.py  # 首先执行归位
   python joint_control.py   # 测试关节运动
   ```

#### 步骤13：ROS2环境设置（可选）
1. **前提**：Ubuntu 22.04 + ROS2 Humble
2. 安装依赖：
   ```bash
   sudo apt install python3-colcon-common-extensions
   pip install -r ros2/src/aero_hand_open_teleop/requirements.txt
   ```
3. 构建ROS2包：
   ```bash
   cd ros2
   colcon build
   source install/setup.bash
   ```
4. 测试节点：
   ```bash
   ros2 run aero_hand_open aero_hand_node
   ```

#### 步骤14：仿真环境设置（可选）
1. 安装MuJoCo
2. 设置mujoco_playground子模块
3. 运行仿真测试

### 第四阶段：测试与校准（预计时间：2-4小时）

#### 步骤15：基本功能测试
1. **电源测试**：
   - 检查6V伺服电源
   - 检查5V USB电源
   - 测量电流消耗

2. **通信测试**：
   - 串口连接测试
   - 协议响应测试

3. **伺服测试**：
   - 逐个伺服运动测试
   - 方向检查
   - 限位检查

#### 步骤16：归位与校准
1. **执行归位**：
   ```python
   from aero_open_sdk.aero_hand import AeroHand
   hand = AeroHand(port="COM3")  # 或 /dev/ttyACM0
   hand.home()
   ```
2. **校准检查**：
   - 检查所有手指完全展开
   - 检查所有手指完全闭合
   - 调整微调值

3. **伺服微调**：
   - 使用`trim_servo.py`示例
   - 逐个通道微调
   - 保存微调值

#### 步骤17：运动测试
1. **单个关节测试**：
   - 每个自由度单独测试
   - 检查运动范围和速度

2. **协调运动测试**：
   - 预定义手势测试
   - 抓握测试
   - 捏取测试

3. **负载测试**：
   - 轻负载抓握
   - 逐渐增加负载
   - 监控伺服温度和电流

#### 步骤18：高级功能测试
1. **扭矩控制测试**：
   - 切换到扭矩模式
   - 测试力控抓握
   - 安全限制检查

2. **遥操作测试**（如安装）：
   - 手势识别测试
   - 实时控制测试

3. **ROS2集成测试**：
   - 消息发布/订阅测试
   - 服务调用测试
   - TF变换测试

---

## 测试与验证方法

### 1. 硬件测试

#### 机械测试
- **关节自由度检查**：手动移动每个关节，检查自由度数量
- **运动平滑度**：检查有无卡顿或摩擦
- **电缆张力**：检查所有电缆适当张力
- **结构完整性**：检查所有螺丝紧固，无松动部件

#### 电气测试
- **短路测试**：电源与地之间电阻测试
- **连接性测试**：所有电气连接通断测试
- **电源测试**：6V伺服电源稳定性测试
- **信号测试**：UART信号质量测试

### 2. 固件测试

#### 基本功能测试
```python
# 测试脚本示例
from aero_open_sdk.aero_hand import AeroHand
import time

hand = AeroHand(port="COM3")

# 测试1：连接测试
print("连接状态:", hand.is_connected())

# 测试2：归位测试
print("开始归位...")
hand.home()
print("归位完成")

# 测试3：位置获取测试
positions = hand.get_positions()
print("当前位置:", positions)

# 测试4：单个关节运动测试
for i in range(7):
    hand.move_to_position([0]*i + [0.5] + [0]*(6-i))
    time.sleep(1)
```

#### 协议兼容性测试
- **帧格式测试**：16字节帧发送/接收测试
- **操作码测试**：所有支持的操作码测试
- **错误处理测试**：无效操作码处理测试

### 3. 软件集成测试

#### SDK功能测试
- **API完整性测试**：所有公开API功能测试
- **异常处理测试**：无效输入、断开连接等测试
- **性能测试**：控制频率、延迟测试

#### ROS2集成测试
```bash
# 测试1：节点启动测试
ros2 run aero_hand_open aero_hand_node

# 测试2：话题测试
ros2 topic list
ros2 topic echo /aero_hand/joint_states

# 测试3：服务测试
ros2 service list
ros2 service call /aero_hand/home std_srvs/srv/Empty
```

#### 遥操作测试
- **摄像头测试**：视频流测试
- **手势识别测试**：Mediapipe手势检测测试
- **控制延迟测试**：手势到运动的延迟测试

### 4. 系统级测试

#### 功能测试矩阵
| 测试项目 | 测试方法 | 预期结果 | 通过标准 |
|---------|---------|---------|---------|
| 基本连接 | SDK连接测试 | 成功连接 | 返回True |
| 归位功能 | 执行归位命令 | 所有关节归位 | 归位完成无错误 |
| 位置控制 | 设置关节位置 | 关节移动到指定位置 | 位置误差<5% |
| 扭矩控制 | 设置扭矩值 | 施加指定扭矩 | 扭矩响应正确 |
| 连续运行 | 连续运动1小时 | 无过热、无错误 | 温度<80°C |
| 负载测试 | 抓握不同重量 | 保持抓握 | 不滑落、不过热 |

#### 性能基准
- **控制频率**：≥50Hz
- **通信延迟**：<20ms
- **归位时间**：<30秒
- **位置精度**：±1°
- **最大抓握力**：≥1kg（取决于对象）

### 5. 安全测试

#### 机械安全
- **限位检查**：软件限位和机械限位
- **过载保护**：电流限制测试
- **紧急停止**：紧急停止功能测试

#### 电气安全
- **过热保护**：伺服温度监控测试
- **短路保护**：电源短路保护测试
- **隔离测试**：高低压隔离测试

#### 软件安全
- **看门狗测试**：看门狗复位测试
- **数据验证**：输入数据范围检查
- **故障恢复**：通信中断恢复测试

---

## 故障排除指南

### 常见问题与解决方案

#### 1. 硬件问题

**问题：伺服不运动**
- 检查电源连接（6V伺服电源）
- 检查信号线连接
- 检查伺服ID设置
- 测试单个伺服直接连接

**问题：运动方向错误**
- 检查`HandConfig.h`中手型选择（LEFT_HAND/RIGHT_HAND）
- 检查伺服方向设置
- 交换extend_count和grasp_count值

**问题：关节卡顿**
- 检查轴承安装
- 检查电缆张力
- 检查3D打印件清理
- 润滑接触面

**问题：电缆断裂**
- 检查电缆路径有无锐边
- 调整张力
- 使用推荐电缆（Kevlar/Vectran）

#### 2. 固件问题

**问题：无法烧录固件**
- 检查USB连接
- 检查驱动安装
- 检查板型选择（XIAO ESP32S3）
- 检查FTServo库路径

**问题：串口无响应**
- 检查波特率（921600）
- 检查TX/RX引脚连接
- 检查帧格式（16字节）
- 使用串口监视器测试

**问题：归位失败**
- 检查机械限位
- 检查电流限制设置
- 检查归位参数
- 手动测试伺服运动

#### 3. 软件问题

**问题：SDK安装失败**
- 检查Python版本（≥3.10）
- 升级pip：`pip install --upgrade pip`
- 使用虚拟环境
- 检查系统PATH

**问题：串口权限问题（Linux）**
```bash
# 添加用户到dialout组
sudo usermod -a -G dialout $USER
# 重启或重新登录
```

**问题：ROS2构建失败**
- 检查ROS2版本（Humble）
- 检查colcon安装
- 检查依赖安装
- 清理重建：`colcon build --cmake-clean-first`

#### 4. 性能问题

**问题：控制延迟高**
- 降低控制频率
- 检查USB线质量
- 检查电脑性能
- 使用轻量级消息格式

**问题：伺服过热**
- 降低扭矩限制
- 增加休息时间
- 改善散热
- 检查机械负载

**问题：位置漂移**
- 重新归位
- 检查电缆张力
- 检查伺服温度补偿
- 更新微调值

### 调试工具

#### 硬件调试
- **万用表**：电压、电流、通断测试
- **逻辑分析仪**：UART信号分析
- **热成像仪**：温度分布检测

#### 软件调试
- **串口监视器**：Arduino Serial Monitor、picocom、minicom
- **Python调试**：pdb、IPython、Jupyter
- **ROS2调试**：`rqt_graph`、`ros2 topic echo`、`rviz2`

#### 固件调试
- **PlatformIO调试**：VS Code调试器
- **Arduino调试**：Serial.print输出
- **ESP32专用工具**：ESP-IDF监控工具

---

## 许可证与商业使用

### 许可证概述

#### 1. 软件许可证（固件和SDK）
- **许可证**：Apache-2.0
- **允许**：商业使用、修改、分发
- **要求**：保留版权声明和许可证文本
- **注意事项**：修改代码需注明更改

#### 2. 硬件设计文件许可证
- **许可证**：CC BY-NC-SA 4.0
- **允许**：非商业使用、修改、分享
- **要求**：署名、相同方式分享、非商业
- **禁止**：商业制造、销售衍生品

#### 3. 商业集成权限
- **购买单元的商业集成**：允许
- **从设计文件商业制造**：需要商业制造许可证
- **衍生品商业化**：需要许可证

### 商业使用场景

| 场景 | 是否允许 | 许可证要求 |
|------|---------|-----------|
| 购买TetherIA机械手集成到商业产品 | ✅ 允许 | 商业集成权限 |
| 使用SDK/固件在商业产品中 | ✅ 允许 | Apache-2.0（保留声明） |
| 3D打印备件销售 | ❌ 不允许 | 需要商业制造许可证 |
| 修改设计用于学术项目 | ✅ 允许 | CC BY-NC-SA 4.0 |
| 基于设计制造完整机械手销售 | ❌ 不允许 | 需要商业制造许可证 |
| 使用设计文件进行内部制造 | ✅ 允许（非商业） | CC BY-NC-SA 4.0 |

### 商业许可证联系
- **联系邮箱**：contact@tetheria.ai
- **许可证选项**：按单位版税、年度场地许可证、无限许可证
- **限制**：不得向与TetherIA直接竞争的实体发放许可证

### 署名要求（非商业分享）
```
Aero Hand Open — © 2025 TetherIA Inc.
硬件设计文件及文档：CC BY-NC-SA 4.0；固件及SDK：Apache-2.0。
来源：https://github.com/TetherIA/aero-hand-open
```

---

## 社区与支持

### 官方渠道

#### 1. 文档资源
- **项目主页**：https://tetheria.github.io/aero-hand-open/
- **详细文档**：https://docs.tetheria.ai/
- **在线商店**：https://shop.tetheria.ai/

#### 2. 代码仓库
- **主仓库**：https://github.com/TetherIA/aero-hand-open
- **SDK仓库**：https://github.com/TetherIA/aero-open-sdk
- **ROS2仓库**：https://github.com/TetherIA/aero-open-ros2

#### 3. 交流平台
- **GitHub Issues**：bug报告和功能请求
- **GitHub Discussions**：构建帮助、技术讨论、设计提案
- **Discord**：实时调试、语音/屏幕共享、社交聊天、活动
  - 邀请链接：http://discord.gg/ZQKWK7NebQ
- **电子邮件**：support@tetheria.ai

#### 4. 社交媒体
- **X/Twitter**：@TetherIA_ai
- **YouTube**：@TetherIA_ai
- **LinkedIn**：TetherIA公司页面
- **网站**：https://tetheria.ai

### 获取帮助的适当渠道

| 问题类型 | 推荐渠道 | 响应时间 |
|---------|---------|---------|
| Bug报告 | GitHub Issues | 1-3个工作日 |
| 构建帮助 | GitHub Discussions | 几小时-1天 |
| 紧急调试 | Discord | 实时-几小时 |
| 商业咨询 | 电子邮件 | 1-2个工作日 |
| 功能请求 | GitHub Issues/Discussions | 1-7天 |

### 贡献指南

#### 如何贡献
1. **Fork仓库**：创建个人副本
2. **创建分支**：`git checkout -b feature/your-feature`
3. **提交更改**：清晰描述更改内容
4. **推送分支**：`git push origin feature/your-feature`
5. **创建PR**：详细说明更改和测试

#### 贡献领域
- **硬件改进**：CAD优化、新组件设计
- **固件功能**：新操作码、性能优化
- **SDK扩展**：新API、示例代码
- **文档改进**：教程、故障排除指南
- **测试套件**：自动化测试、性能基准

#### 代码规范
- **固件**：遵循Arduino/ESP32编码规范
- **Python**：遵循PEP 8，使用类型提示
- **文档**：使用Markdown，包含示例
- **测试**：包含单元测试和集成测试

---

## 高级应用与扩展

### 1. 研究应用

#### 灵巧操作研究
- **对象操纵**：不同形状、大小、重量物体
- **精细操作**：拧螺丝、插拔连接器
- **双手协调**：两个机械手协同工作

#### 强化学习
- **肌腱空间策略**：基于Google DeepMind框架
- **仿真到现实迁移**：MuJoCo仿真到物理系统
- **自适应控制**：环境变化适应

#### 人机交互
- **手势识别控制**：Mediapipe + 摄像头
- **力反馈**：基于扭矩控制的触觉反馈
- **协作操作**：人机协同任务

### 2. 教育应用

#### 机器人学教学
- **机构设计**：肌腱驱动机制学习
- **控制系统**：PID控制、状态机
- **嵌入式系统**：ESP32编程、实时控制

#### 项目开发
- **课程项目**：毕业设计、研究项目
- **竞赛平台**：机器人竞赛、创新比赛
- **实验室设备**：研究平台、原型开发

### 3. 工业应用

#### 原型开发
- **抓取测试**：新产品抓取可行性测试
- **自动化测试**：重复性测试任务
- **研究平台**：新算法验证平台

#### 定制化扩展
- **末端执行器**：定制夹爪、工具
- **传感器集成**：力传感器、视觉系统
- **通信扩展**：无线控制、网络集成

### 4. 扩展开发

#### 硬件扩展
- **腕部机构**：添加腕部自由度
- **传感器集成**：IMU、力/扭矩传感器
- **模块化设计**：快速更换手指模块

#### 软件扩展
- **高级控制算法**：阻抗控制、自适应控制
- **机器学习集成**：深度学习分类、预测控制
- **云平台集成**：远程监控、数据收集

#### 通信扩展
- **无线控制**：Wi-Fi、蓝牙
- **网络接口**：ROS2分布式系统
- **Web界面**：基于浏览器的控制界面

---

## 维护与保养

### 日常维护

#### 机械维护
- **定期检查**：电缆张力、关节磨损
- **清洁**：清除灰尘、碎屑
- **润滑**：轴承和滑动面适当润滑
- **紧固**：检查螺丝松动

#### 电气维护
- **连接检查**：所有电气连接
- **电缆检查**：磨损、断裂
- **电源检查**：电压稳定性

### 定期保养（每3-6个月）

#### 全面检查
1. **拆卸检查**：部分拆卸检查内部
2. **电缆更换**：磨损电缆更换
3. **轴承检查**：磨损轴承更换
4. **伺服检查**：性能测试、校准

#### 软件更新
1. **固件更新**：最新版本固件
2. **SDK更新**：最新功能和安全修复
3. **备份配置**：微调值、校准数据

### 故障维修

#### 常见维修项目
- **电缆更换**：断裂或磨损电缆
- **轴承更换**：损坏或磨损轴承
- **伺服更换**：故障伺服电机
- **结构件更换**：损坏的3D打印件

#### 维修工具
- **基本工具**：螺丝刀、钳子、镊子
- **专用工具**：牙线工具、电缆张力计
- **测试设备**：万用表、逻辑分析仪

### 备件管理

#### 建议备件
- **易损件**：
  - 电缆（Kevlar/Vectran）
  - 弹簧（各种类型）
  - 轴承（2x5x2.5mm）
  - 销钉（各种尺寸）
- **关键件**：
  - 伺服电机（Feetech HLS3606M）
  - 3D打印结构件（完整套件）
  - 硅胶垫

#### 库存建议
- **实验室环境**：完整备件套件
- **个人使用**：关键易损件备件
- **商业部署**：基于MTBF的备件计划

---

## 结论与展望

### 项目价值

Aero Hand Open 作为一个完整的开源机器人手生态系统，提供了：

1. **可访问性**：低成本、易制造的设计
2. **灵活性**：模块化、可扩展的架构
3. **研究价值**：先进的肌腱驱动机制
4. **教育价值**：完整的学习平台
5. **社区驱动**：活跃的开源社区

### 成功指标

- **成本**：$314美元（远低于商业解决方案）
- **重量**：389克（轻量化设计）
- **自由度**：7DOF（5手指，16关节）
- **开源程度**：硬件、固件、软件全开源
- **社区规模**：活跃的GitHub仓库和Discord社区

### 未来发展

#### 短期路线图（6-12个月）
- 更多仿真平台支持
- 高级控制算法集成
- 扩展文档和教程
- 性能优化和改进

#### 长期愿景（1-3年）
- 商业化版本开发
- 人工智能集成
- 生态系统扩展（手臂、移动平台）
- 标准化和认证

### 开始使用

无论您是：
- **研究人员**：寻找灵巧操作平台
- **教育工作者**：寻找机器人教学工具
- **爱好者**：对机器人技术感兴趣
- **开发者**：想要扩展和贡献

Aero Hand Open 都为您提供了一个强大、灵活、可访问的起点。

**立即开始**：
1. 访问Git仓库：https://github.com/TetherIA/aero-hand-open
2. 加入Discord社区：http://discord.gg/ZQKWK7NebQ
3. 查看详细文档：https://docs.tetheria.ai/
4. 开始您的机器人手之旅！

---

## 附录

### A. 关键文件索引

| 文件路径 | 描述 | 重要性 |
|---------|------|--------|
| `hardware/Assembly/BOM.csv` | 完整物料清单 | ★★★★★ |
| `hardware/Assembly/Tools.csv` | 工具清单 | ★★★★☆ |
| `hardware/CAD/One_Click_Print_L.3mf` | 一键打印文件 | ★★★★★ |
| `firmware/main/firmware_v0.1.0.ino` | 主固件代码 | ★★★★★ |
| `firmware/main/HandConfig.h` | 手型配置 | ★★★★☆ |
| `sdk/pyproject.toml` | Python SDK配置 | ★★★☆☆ |
| `sdk/examples/` | 示例代码目录 | ★★★★☆ |
| `ros2/src/aero_hand_open/` | ROS2主节点 | ★★★★☆ |
| `LICENSE.md` | 许可证指南 | ★★★☆☆ |

### B. 供应商链接（来自BOM）

#### 电子组件
- **Seeed Studio XIAO ESP32-S3**：https://www.seeedstudio.com/XIAO-ESP32S3-p-5627.html
- **Feetech HLS3606M伺服**：https://www.alibaba.com/product-detail/FEETECH-HLS3606M-6V-6Kg-cm-Torque_1601281149843.html
- **TTLinker Mini UART板**：https://www.alibaba.com/product-detail/TTLinker-Mini-UART-Signal-Conversion-Board_60370504430.html

#### 机械组件
- **硅胶（Ecoflex 00-30）**：https://www.amazon.com/Ecoflex-00-30-Super-Platinum-Silicone/dp/B00CA5VY3U
- **Kevlar/Vectran电缆**：https://www.amazon.com/9KM-DWLIFE-Strength-Retardant-Ridgeline/dp/B0B1WKH21R
- **轴承（2x5x2.5）**：https://www.amazon.com/Yodaoke-MR52ZZ-2x5x2-5mm-Miniature-Bearings/dp/B08L7NTVK7

#### 工具
- **牙线工具**：https://www.amazon.com/WLLHYF-Floss-Multifunctional-Deep-Clean/dp/B0C374TM1X
- **珠宝钻头套装**：https://www.amazon.com/Vise-Hand-Drill-Jewelry-Making/dp/B098CF3VMM

### C. 快速参考命令

#### 固件烧录
```bash
# 使用PlatformIO
pio run -t upload

# 使用Arduino IDE
# 通过GUI上传
```

#### SDK使用
```python
from aero_open_sdk.aero_hand import AeroHand

# 初始化
hand = AeroHand(port="COM3")  # Windows
# hand = AeroHand(port="/dev/ttyACM0")  # Linux

# 基本操作
hand.home()                    # 归位
positions = hand.get_positions()  # 获取位置
hand.set_joint_positions([0.5]*16)  # 设置关节位置
```

#### ROS2命令
```bash
# 构建
cd ros2
colcon build

# 运行节点
ros2 run aero_hand_open aero_hand_node

# 查看话题
ros2 topic list
ros2 topic echo /aero_hand/joint_states
```

### D. 安全注意事项

1. **电源安全**：
   - 始终分开6V伺服电源和5V USB电源
   - 使用适当额定值的电源
   - 避免短路

2. **机械安全**：
   - 运动范围内无人
   - 避免夹伤风险
   - 适当固定机械手

3. **热安全**：
   - 监控伺服温度（<80°C）
   - 避免连续高负载运行
   - 提供适当散热

4. **电气安全**：
   - 遵循ESD防护
   - 正确接地
   - 绝缘暴露导体

### E. 版本历史

| 版本 | 日期 | 主要更新 |
|------|------|---------|
| 1.0.0 | 2025-11-07 | 正式发布：固件、ROS2、SDK |
| 预发布 | 2025-10-24 | 硬件和ROS2包发布 |
| 初始发布 | 2025-10-13 | 产品在所有平台启动 |

---

**文档版本**：1.0
**最后更新**：2025-12-15
**文档状态**：完整
**维护者**：Claude Code Assistant
**基于项目**：Aero Hand Open v1.0.0

*本指南旨在提供全面的项目概述和复现指导。具体实施时请参考官方文档和源代码。如有疑问，请通过社区渠道寻求帮助。*
