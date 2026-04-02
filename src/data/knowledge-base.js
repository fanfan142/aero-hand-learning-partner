/**
 * Aero Hand 学习知识库
 * 包含完整的技术原理、架构说明、代码示例
 *
 * 结构说明：
 * - 每个知识点包含：基础概念 → 原理详解 → 实际应用 → 代码示例
 * - [进阶] 标记的内容供高级用户深入学习
 * - 包含常见问题和故障排查章节
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
        summary: '理解 Aero Hand Open 各组件之间的关系和数据流，掌握从应用到硬件的完整控制路径。',
        tags: ['架构', '概述'],
        content: `
## 系统组成

Aero Hand Open 由 5 个核心模块组成，每一层都有其独特的职责和设计考量：

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                        上层应用                           │
│          (RL训练、遥操作、任务执行、视觉反馈)              │
│    例如：PPO训练脚本、遥操作界面、抓取规划器               │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   SDK / ROS2 接口层                      │
│        Python API、ROS2话题、服务、动作服务器              │
│    提供：set_joint_positions()、get_joint_states()       │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                        ESP32 固件                         │
│     串口协议编解码、舵机PWM生成、归位逻辑、EEPROM存储      │
│     实时性要求：控制周期 ≤ 10ms                           │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                    HLS3606M 舵机阵列                      │
│         7个智能总线舵机、4096级精度、串联总线             │
│         通信：9600bps，指令响应延迟约 2ms                 │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                     肌腱驱动机械结构                       │
│          3D打印部件、肌腱绳、滑轮系统、关节约束             │
│     力学特性：肌腱只能拉不能推、欠驱动、耦合运动           │
└─────────────────────────────────────────────────────────┘
\`\`\`

## 数据流向详解

### 控制流（从上到下）

控制命令从用户指令到手指运动的完整路径：

\`\`\`
1. 用户/算法
   └─→ 生成目标关节位置 [0, 30, 45, 50, 55, 50, 40]（百分比）

2. SDK 层 (aero_open_sdk)
   ├─→ 位置验证：确保所有值在 0-100 范围内
   ├─→ 映射计算：将百分比转换为舵机计数值
   │    例如：50% → count = extend_count + (grasp_count - extend_count) * 0.5
   └─→ 协议封装：构建 16 字节数据包

3. 串口通信 (USB-UART)
   ├─→ 波特率：921600 bps（高速，减少延迟）
   ├─→ 帧格式：8N1（8数据位、无校验、1停止位）
   └─→ 传输时间：每帧约 0.14ms

4. ESP32 固件
   ├─→ 帧解析：提取命令码和数据载荷
   ├─→ 指令执行：更新舵机目标位置
   └─→ PWM 生成：向舵机总线发送位置指令

5. HLS3606M 舵机
   ├─→ 接收指令：解析总线上的串行数据
   ├─→ 内部控制：PID 控制电机到达目标位置
   └─→ 物理运动：电机驱动滑轮，牵拉肌腱

6. 机械结构
   └─→ 肌腱传动 → 关节旋转 → 手指运动
\`\`\`

### 反馈流（从下到上）

状态信息从手指运动返回到用户界面的完整路径：

\`\`\`
1. HLS3606M 舵机
   ├─→ 位置传感器：12位 ADC，精度 4096 级
   ├─→ 当前角度：0-360° 对应 0-4095 计数
   └─→ 负载感知：检测堵转和异常

2. ESP32 固件
   ├─→ 查询指令：定期轮询各舵机状态
   ├─→ 数据整合：收集 7 个舵机的位置/负载
   └─→ 状态封装：构建反馈数据包

3. SDK 层
   ├─→ 帧解析：从串口读取反馈数据
   ├─→ 校验检查：验证数据完整性
   └─→ 逆映射：将计数值转换回百分比

4. 用户/算法
   └─→ 获取状态：joint_positions = [45, 32, 47, 51, 54, 48, 38]
\`\`\`

## 各层职责详解

| 层级 | 职责 | 技术实现 | 关键考量 |
|------|------|----------|----------|
| **应用层** | 实现具体任务（抓取、操作等） | Python, C++, JAX | 任务泛化能力、奖励函数设计 |
| **接口层** | 提供标准化的控制API | Python SDK, ROS2 | API 易用性、错误处理 |
| **固件层** | 实时控制、串口通信 | C++ (Arduino) | 实时性 ≤10ms、协议稳定 |
| **驱动层** | 执行运动指令 | Feetech HLS3606M | 精度、响应速度、可靠性 |
| **机械层** | 传递运动、产生抓取力 | 肌腱、滑轮、3D件 | 效率、死区、寿命 |

## 设计哲学

### 为什么选择肌腱驱动？

\`\`\`
肌腱驱动 vs 直接驱动 对比：

肌腱驱动优势：
✓ 轻量化：执行器可放在手掌外
✓ 紧凑性：关节处无需大电机
✓ 仿生性：更接近人手结构
✓ 成本低：7个小电机 vs 7个大电机

肌腱驱动挑战：
✗ 非线性：肌腱拉伸、摩擦损耗
✗ 欠驱动：手指间存在耦合
✗ 调试复杂：预紧力难以精确设置
✗ 寿命问题：绳索磨损
\`\`\`

### 为什么选择 ESP32-S3？

\`\`\`
选择理由：
1. 双核处理器 - 一个核处理通信，一个核处理控制
2. 丰富的外设 - UART、I2C、PWM 全部内置
3. WiFi/BT 支持 - 未来可扩展无线控制
4. 低成本 - 约 $5/片
5. 生态成熟 - Arduino 支持完善

性能参数：
- 主频：240MHz
- SRAM：512KB
- Flash：4MB（外部）
- UART：3个硬件 UART
\`\`\`

### 通信协议设计考量

选择 16 字节固定帧格式的原因：

\`\`\`
1. 确定性：固定长度易于解析和校验
2. 效率：避免变长帧的解析开销
3. 可靠性：固定格式便于实现 CRC 校验
4. 实时性：确定性的传输时间

帧结构设计：
- 帧头 0x7E：明确标记帧开始
- 命令码：一个字节，区分不同指令
- 数据载荷：12字节，足够承载 7 个舵机位置
- 校验和：简单的 XOR 校验
- 帧尾 0x7E：确认帧完整

为什么不用标准协议（如 Modbus）？
- Modbus 太复杂，很多功能用不到
- 自定义协议更紧凑
- 可以根据需求灵活扩展
\`\`\`

---

## [进阶] 延迟分析

### 控制延迟来源

\`\`\`
总延迟 = Σ(各层延迟)

典型延迟分解：
┌──────────────────────────────────────────────────────────────┐
│ 1. SDK处理延迟        ~1ms                                   │
│    - 位置验证、映射计算、协议封装                              │
├──────────────────────────────────────────────────────────────┤
│ 2. USB/UART传输延迟    ~0.15ms (16字节 @ 921600 bps)          │
│    - 实际传输时间 = 帧长×8/波特率                              │
│    - 理论值 = 16×8/921600 ≈ 0.139ms                          │
├──────────────────────────────────────────────────────────────┤
│ 3. ESP32帧解析延迟    ~0.1ms                                  │
│    - 固定开销                                                         │
├──────────────────────────────────────────────────────────────┤
│ 4. 舵机指令处理延迟    ~2ms (HLS3606M响应时间)                 │
│    - 舵机内部处理、PID计算                                      │
├──────────────────────────────────────────────────────────────┤
│ 5. 舵机运动时间        200-1000ms (取决于运动幅度)            │
│    - 这是主要延迟来源！                                          │
└──────────────────────────────────────────────────────────────┘

结论：对于位置控制类任务，舵机物理运动时间是主导因素（90%+）
      通信延迟（<5ms）对整体性能影响很小
\`\`\`

### 带宽计算

\`\`\`
理论带宽：
- 921600 bps = 115200 bytes/s
- 每帧16字节 = 7200帧/秒
- 每帧控制7个舵机 = 50400个舵机位置/秒

实际使用（考虑反馈）：
- 控制频率：20Hz（50ms周期）
- 每次发送+接收：32字节
- 实际带宽利用率：32×20 = 640 bytes/s = 0.56%

结论：通信带宽非常充裕，不是瓶颈
\`\`\`

---

## 常见问题

### Q1: 控制指令没有生效？

**排查步骤：**
\`\`\`
1. 检查串口连接
   └─→ hand.serial.is_open 是否为 True

2. 检查固件运行状态
   └─→ 发送0x30归位命令，看舵机是否有反应

3. 检查舵机供电
   └─→ 5V 3A电源是否连接
   └─→ 单独测试舵机（连接一个舵机）

4. 检查端点配置
   └─→ extend_count 和 grasp_count 是否合理
\`\`\`

### Q2: 舵机运动不平滑？

**原因分析：**
\`\`\`
1. 控制频率太低
   └─→ 增加发送频率（当前20Hz可以提高到50Hz）

2. 命令间隔不均匀
   └→ 使用定时器而非 sleep()

3. 目标位置变化太大
   └→ 使用轨迹插值（见SDK代码示例）

4. 肌腱打滑
   └→ 检查肌腱张力，重新预紧
\`\`\`

### Q3: 手指抖动？

**可能原因：**
\`\`\`
1. 肌腱太松
   └→ 增加预紧力

2. 控制信号干扰
   └→ 检查USB线质量，加磁环

3. PID参数不合适 [进阶]
   └→ 调整舵机内部P/I参数（需要Feetech软件）

4. 关节摩擦不均匀
   └→ 润滑关节，检查3D打印件质量
\`\`\`
        `
      },
      {
        id: 'firmware-architecture',
        title: '固件架构详解',
        summary: '深入解析 ESP32 固件的核心模块：串口协议、舵机控制、归位程序的实现原理。',
        tags: ['固件', 'ESP32', '架构'],
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

---

## [进阶] 串口协议时序详解

### 完整通信时序图

\`\`\`
发送命令（SDK → ESP32）：
═══════════════════════════════════════════════════════════

     ┌─────┐ ┌────┐ ┌──────────┐ ┌─────────┐ ┌────┐ ┌─────┐
     │0x7E │ │CMD │ │  DATA    │ │ CHECKSUM│ │0x7E│ │空闲 │
     └──┬──┘ └──┬─┘ └────┬─────┘ └───┬───┘ └──┬──┘ └──┬──┘
        │       │        │           │        │       │
        ▼       ▼        ▼           ▼        ▼       ▼
     ───┴───┬───┴───┬───┴─────┬─────┴───┬───┴───┬───┴─────────
     帧头   命令   数据[0-11]  校验和   帧尾    空闲
     1字节  1字节   12字节     1字节    1字节  ≥1字节

接收响应（ESP32 → SDK）：
═══════════════════════════════════════════════════════════

     ┌─────┐ ┌────┐ ┌──────────┐ ┌─────────┐ ┌────┐
     │0x7E │ │ACK │ │  STATUS  │ │ CHECKSUM│ │0x7E│
     └──┬──┘ └──┬─┘ └────┬─────┘ └───┬───┘ └──┬──┘
        │       │        │           │        │
        ▼       ▼        ▼           ▼        ▼
     ───┴───┬───┴───┬───┴─────┬─────┴───┬───┴─────────
     帧头   命令   状态数据   校验和   帧尾
     1字节  1字节   N字节     1字节    1字节

注意：响应帧长度可能与命令帧不同！
\`\`\`

### 数据帧格式详解

#### 设置多关节位置命令 (0x01)

\`\`\`
字节索引： 0     1      2-13         14      15
           │     │      │            │       │
           ▼     ▼      ▼            ▼       ▼
        ┌─────┬────┬─────────────┬────────┬─────┐
        │0x7E │0x01│D0 D1...D11 │ CHECK  │0x7E │
        └─────┴────┴─────────────┴────────┴─────┘

数据字段 D0-D11 含义：
┌─────────────────────────────────────────────────────────────┐
│ D0      = 舵机0 ID (0-6)                                    │
│ D1-D2   = 舵机0 位置（低字节在前，16位）                     │
│ D3      = 舵机1 ID                                          │
│ D4-D5   = 舵机1 位置                                        │
│ ...                                                         │
│ D9      = 舵机3 ID                                          │
│ D10-D11 = 舵机3 位置 (或保留，若不足6个舵机)                 │
└─────────────────────────────────────────────────────────────┘

位置计算公式：
position = D[n+1] | (D[n+2] << 8)  // 小端序

示例：设置舵机0到位置2000
D0 = 0x00 (舵机ID)
D1 = 0xD0 (2000低字节)  = 0x07D0 = 208
D2 = 0x07 (2000高字节)  = 0x07 << 8 = 1792
合计 = 208 + 1792 = 2000 ✓
\`\`\`

#### 读取舵机位置命令 (0x10)

\`\`\`
发送：
字节： 0     1      2        3      4     5
        │     │      │        │      │     │
        ▼     ▼      ▼        ▼      ▼     ▼
     ┌─────┬────┬────────┬────────┬────┐
     │0x7E │0x10│ SERVO_ID│CHECK │0x7E│
     └─────┴────┴────────┴────────┴────┘

响应：
字节： 0     1      2-3       4      5
        │     │      │        │      │
        ▼     ▼      ▼        ▼      ▼
     ┌─────┬────┬────────┬────────┬────┐
     │0x7E │0x10│ POS_L|H│CHECK │0x7E│
     └─────┴────┴────────┴────────┴────┘
\`\`\`

---

## [进阶] CRC/XOR 校验详解

### 校验算法原理

\`\`\`
校验计算方法：XOR（异或）校验

计算公式：
checksum = CMD ^ DATA[0] ^ DATA[1] ^ ... ^ DATA[11]

示例计算过程：
────────────────
CMD    = 0x01
DATA[0]= 0x00  (舵机0 ID)
DATA[1]= 0xD0  (位置低字节)
DATA[2]= 0x07  (位置高字节)
DATA[3-11] = 0x00

计算：
step1 = 0x01 ^ 0x00 = 0x01
step2 = 0x01 ^ 0xD0 = 0xD1
step3 = 0xD1 ^ 0x07 = 0xD6
step4 = 0xD6 ^ 0x00 = 0xD6
...   (继续与剩余DATA XOR)
最终 checksum = 0xD6
\`\`\`

### 校验失败处理

\`\`\`cpp
bool verifyPacket(const uint8_t* packet, uint8_t length) {
    // 提取校验和
    uint8_t received_checksum = packet[length - 2]; // 倒数第二个字节

    // 计算校验和
    uint8_t calculated = 0;
    for (int i = 1; i < length - 2; i++) { // 跳过帧头、帧尾
        calculated ^= packet[i];
    }

    // 比较
    if (calculated != received_checksum) {
        Serial.printf("Checksum mismatch: expected 0x%02X, got 0x%02X\\n",
                      calculated, received_checksum);
        return false;
    }
    return true;
}
\`\`\`

### 为什么选择 XOR 而非 CRC？

\`\`\`
XOR校验 vs CRC校验 对比：
┌─────────────────────────────────────────────────────────────┐
│ 特性         │ XOR校验         │ CRC校验                  │
├─────────────────────────────────────────────────────────────┤
│ 计算复杂度   │ O(1) 按位异或   │ O(n) 多项式除法          │
│ 错误检测能力 │ 只能检测单位翻转│ 可检测突发错误、多位错误 │
│ 开销         │ 1字节           │ 1-4字节                  │
│ 适用场景     │ 低速、短帧      │ 高速、长帧               │
└─────────────────────────────────────────────────────────────┘

本协议选择XOR的原因：
1. 帧长仅16字节，错误概率低
2. USB链路已有物理层校验
3. 计算开销极低，适合嵌入式
4. 足够检测常见传输错误
\`\`\`

### [进阶] 增强校验方案

如需更高可靠性，可使用CRC-16：

\`\`\`cpp
uint16_t crc16_calc(const uint8_t* data, size_t len) {
    uint16_t crc = 0xFFFF;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int j = 0; j < 8; j++) {
            if (crc & 0x0001) {
                crc = (crc >> 1) ^ 0xA001;
            } else {
                crc >>= 1;
            }
        }
    }
    return crc;
}
\`\`\`

---

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

## [进阶] 归位程序详解

### 状态机实现

\`\`\`cpp
enum HomingState {
    HOMING_IDLE,        // 空闲
    HOMING_START,       // 开始归位
    HOMING_MOVING,      // 移动中
    HOMING_WAIT,        // 等待到位
    HOMING_COMPLETE,    // 归位完成
    HOMING_ERROR        // 错误
};

class HomingController {
    HomingState state = HOMING_IDLE;
    unsigned long start_time;
    static constexpr uint16_t HOMING_TIMEOUT = 10000; // 10秒超时
    static constexpr uint16_t HOMING_SPEED = 500;      // 归位速度

public:
    void start() {
        state = HOMING_START;
        start_time = millis();
        // 发送归位命令到所有舵机
        for (int i = 0; i < 7; i++) {
            setServoTarget(i, extend_count, HOMING_SPEED);
        }
    }

    void update() {
        switch (state) {
            case HOMING_START:
                state = HOMING_MOVING;
                break;

            case HOMING_MOVING:
                // 检查是否所有舵机都到达目标
                if (allServosAtTarget()) {
                    state = HOMING_COMPLETE;
                }
                // 检查超时
                else if (millis() - start_time > HOMING_TIMEOUT) {
                    state = HOMING_ERROR;
                }
                break;

            case HOMING_COMPLETE:
                Serial.println("Homing complete!");
                break;

            case HOMING_ERROR:
                Serial.println("Homing error: timeout!");
                break;
        }
    }

    bool allServosAtTarget() {
        for (int i = 0; i < 7; i++) {
            if (!isServoAtTarget(i)) {
                return false;
            }
        }
        return true;
    }
};
\`\`\`

### 归位过程中的位置变化

\`\`\`
归位位置示意图：

初始状态（未知）          归位过程              最终状态
     │                          │                      │
     ▼                          ▼                      ▼

  ╭─────╮                   ╭─────╮               ╭─────╮
  │握紧 │                   │半握 │               │张开 │
  │状态 │   ───────▶       │状态 │   ───────▶    │状态 │
  │     │   归位运动        │     │   等待到位     │     │
  ╰──┬──╯                   ╰──┬──╯               ╰──┬──╯
     │                          │                      │
     ▼                          ▼                      ▼

  grasp_count ─────────────────────────▶  extend_count
  (最大弯曲)      ◀──────────────────────  (完全伸直)

  注意：归位过程手指只能单向运动（从弯曲到伸直）
        这是因为归位使用 extend_count 作为目标
\`\`\`

---

## 代码位置

主要源文件：
- \`firmware/main/firmware_v0.1.0.ino\` - 主程序
- \`firmware/main/Homing.cpp\` - 归位逻辑
- \`firmware/main/HandConfig.h\` - 配置定义

## 常见问题

### Q1: 归位失败？

**排查步骤：**
\`\`\`
1. 检查舵机供电
   └─→ 5V 3A 电源是否正常

2. 检查肌腱是否打滑
   └─→ 手动弯曲手指，应该有阻力

3. 检查归位超时设置
   └─→ 10秒内是否能完成归位

4. 检查 extend_count 配置
   └─→ 是否设置在安全范围内
\`\`\`

### Q2: 串口通信不稳定？

**排查步骤：**
\`\`\`
1. 检查USB线质量
   └─→ 使用带屏蔽的USB线

2. 检查波特率设置
   └─→ 固件和SDK必须一致（921600）

3. 检查校验和
   └─→ 校验失败会导致丢包

4. 添加延时
   └─→ 舵机指令间添加1-2ms延时
\`\`\`

### Q3: 如何调试固件？

**方法：**
\`\`\`
1. 串口监视器
   └─→ Arduino IDE 串口监视器，115200波特

2. 添加调试日志
   └─→ Serial.printf("Debug: %d\\n", value);

3. LED指示
   └─→ ESP32板载LED闪烁表示状态

4. 逻辑分析仪
   └─→ 抓取UART信号，分析时序
\`\`\`
        `
      },
      {
        id: 'sdk-internals',
        title: 'SDK 内部实现',
        summary: 'Python SDK 架构详解，AeroHand 核心类、位置映射算法和 GUI 工具的使用方法。',
        tags: ['SDK', 'Python', '架构'],
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

---

## [进阶] 错误处理机制

### 异常类型定义

\`\`\`python
class AeroHandError(Exception):
    """基础异常类"""
    pass

class ConnectionError(AeroHandError):
    """连接相关错误"""
    pass

class CommunicationError(AeroHandError):
    """通信错误（校验失败、超时等）"""
    pass

class ConfigurationError(AeroHandError):
    """配置错误（端点未设置等）"""
    pass

class ServoError(AeroHandError):
    """舵机相关错误（堵转、超时等）"""
    pass
\`\`\`

### 重试机制实现

\`\`\`python
def with_retry(func, max_retries=3, retry_delay=0.1):
    """
    带重试的函数装饰器

    适用于通信失败的重试场景
    """
    def wrapper(*args, **kwargs):
        last_exception = None
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except (CommunicationError, SerialException) as e:
                last_exception = e
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
        raise last_exception
    return wrapper

class AeroHand:
    @with_retry(max_retries=3, retry_delay=0.1)
    def _read_position(self, servo_id):
        """读取位置（带重试）"""
        self._send_read_command(servo_id)
        response = self._read_response()
        if not self._verify_checksum(response):
            raise CommunicationError("Checksum mismatch")
        return self._parse_position(response)
\`\`\`

### 超时处理

\`\`\`python
import threading
import queue

class ReadTimeout(Exception):
    """读取超时异常"""
    pass

class AeroHand:
    def __init__(self, port=None, timeout=1.0):
        self.timeout = timeout
        self._response_queue = queue.Queue()

    def _read_with_timeout(self):
        """
        带超时的读取操作

        防止串口阻塞导致程序无响应
        """
        try:
            response = self._response_queue.get(
                timeout=self.timeout
            )
            return response
        except queue.Empty:
            raise ReadTimeout(
                f"读取超时 ({self.timeout}秒)"
            )

    def get_joint_position(self, servo_id):
        """读取单个关节位置"""
        self._clear_buffer()
        self._send_read_command(servo_id)

        try:
            response = self._read_with_timeout()
            return self._parse_position(response)
        except ReadTimeout:
            # 超时后尝试重试一次
            self._send_read_command(servo_id)
            response = self._read_with_timeout()
            return self._parse_position(response)
\`\`\`

---

## [进阶] 连接管理与状态机

### 连接状态机

\`\`\`python
from enum import Enum, auto

class ConnectionState(Enum):
    DISCONNECTED = auto()    # 未连接
    CONNECTING = auto()      # 连接中
    CONNECTED = auto()       # 已连接
    HOMING = auto()           # 归位中
    READY = auto()            # 就绪
    ERROR = auto()            # 错误状态

class AeroHand:
    def __init__(self, port=None):
        self._state = ConnectionState.DISCONNECTED
        self._state_lock = threading.Lock()

    @property
    def state(self):
        with self._state_lock:
            return self._state

    def _set_state(self, new_state):
        with self._state_lock:
            old_state = self._state
            self._state = new_state
            print(f"状态变更: {old_state.name} → {new_state.name}")

    def connect(self, port=None):
        """建立连接"""
        if self.state != ConnectionState.DISCONNECTED:
            raise ConnectionError("Already connected")

        self._set_state(ConnectionState.CONNECTING)
        try:
            self.serial = self._establish_connection(port)
            self._set_state(ConnectionState.CONNECTED)
        except Exception as e:
            self._set_state(ConnectionState.ERROR)
            raise ConnectionError(f"连接失败: {e}")

    def home(self):
        """执行归位"""
        if self.state != ConnectionState.CONNECTED:
            raise ConnectionError("Not connected")

        self._set_state(ConnectionState.HOMING)
        self._send_homing_command()

        # 等待归位完成
        while not self._check_homing_complete():
            time.sleep(0.1)

        self._set_state(ConnectionState.READY)

    def is_ready(self):
        """检查是否就绪"""
        return self.state == ConnectionState.READY
\`\`\`

### 自动重连机制

\`\`\`python
class AeroHand:
    def __init__(self, port=None, auto_reconnect=True):
        self.auto_reconnect = auto_reconnect
        self._should_reconnect = True

    def _connection_monitor(self):
        """
        后台线程：监控连接状态，自动重连
        """
        while self._should_reconnect:
            if self.state == ConnectionState.CONNECTED:
                # 检测连接是否断开
                if not self._is_serial_connected():
                    self._handle_disconnect()

            time.sleep(0.5)

    def _handle_disconnect(self):
        """处理断开连接"""
        if not self.auto_reconnect:
            self._set_state(ConnectionState.ERROR)
            return

        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                print(f"尝试重连 ({attempt+1}/{max_attempts})...")
                self.serial = self._establish_connection(self.port)
                self._set_state(ConnectionState.CONNECTED)
                print("重连成功!")
                return
            except Exception as e:
                print(f"重连失败: {e}")
                time.sleep(1)

        self._set_state(ConnectionState.ERROR)
        raise ConnectionError("重连失败")

    def close(self):
        """关闭连接"""
        self._should_reconnect = False
        if self.serial and self.serial.is_open:
            self.serial.close()
        self._set_state(ConnectionState.DISCONNECTED)
\`\`\`

---

## [进阶] 线程安全

### 并发控制问题

\`\`\`
多线程使用场景：

┌─────────────────────────────────────────────────────────────┐
│ 线程1: 主循环（控制）     │ 线程2: UI更新（读取状态）        │
│   └─→ set_joint_position() │   └─→ get_joint_position()      │
│         ↓                           ↓                       │
│   ┌────┴────┐                 ┌────┴────┐                 │
│   │ 写锁    │                 │ 读锁    │                 │
│   └────┬────┘                 └────┬────┘                 │
│         ↓                           ↓                       │
│   ┌────┴────┐                 ┌────┴────┐                 │
│   │ 串口写入 │                 │ 串口读取 │                 │
│   └─────────┘                 └─────────┘                 │
└─────────────────────────────────────────────────────────────┘

问题：
1. 读写串口同时进行 → 数据干扰
2. 状态不一致 → 读取到半更新的数据
3. 命令堆积 → 读取响应错位
\`\`\`

### 线程安全实现

\`\`\`python
import threading
from contextlib import contextmanager

class ThreadSafeAeroHand:
    """线程安全的AeroHand封装"""

    def __init__(self, port=None):
        self._hand = AeroHand(port)
        self._lock = threading.RLock()  # 可重入锁
        self._read_event = threading.Event()
        self._last_response = None

    @contextmanager
    def _serial_lock(self, timeout=5.0):
        """
        串口访问锁

        使用with语句确保锁释放
        """
        acquired = self._lock.acquire(timeout=timeout)
        if not acquired:
            raise TimeoutError("获取锁超时")
        try:
            yield
        finally:
            self._lock.release()

    def set_joint_positions(self, positions):
        """设置关节位置（线程安全）"""
        with self._serial_lock():
            self._hand.set_joint_positions(positions)

    def get_joint_positions(self):
        """读取关节位置（线程安全）"""
        with self._serial_lock():
            return self._hand.get_joint_positions()

    def execute_command(self, cmd_func):
        """
        执行需要原子操作的命令

        参数:
            cmd_func: 需要原子执行的函数
        """
        with self._serial_lock():
            return cmd_func(self._hand)
\`\`\`

### 批量命令的原子性

\`\`\`python
class AeroHand:
    def set_all_joints_atomic(self, positions):
        """
        原子设置所有关节

        确保所有位置在同一时刻生效
        """
        with self._serial_lock():
            # 1. 构建完整帧
            frame = self._build_position_frame(positions)

            # 2. 发送
            self.serial.write(frame)

            # 3. 等待响应（可选）
            if self.wait_for_ack():
                return True
            return False

    def set_joint_positions_safely(self, positions):
        """
        安全设置关节（带验证）

        设置后验证位置是否生效
        """
        # 先设置
        self.set_joint_positions(positions)

        # 短暂等待
        time.sleep(0.05)

        # 验证
        current = self.get_joint_positions()

        # 检查偏差
        max_deviation = 5  # 允许5%的偏差
        for cmd, actual in zip(positions, current):
            if abs(cmd - actual) > max_deviation:
                raise ServoError(
                    f"位置验证失败: 命令={cmd}, 实际={actual}"
                )

        return True
\`\`\`

---

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

## 常见问题

### Q1: 通信超时？

**排查步骤：**
\`\`\`
1. 检查USB连接
   └─→ 更换USB线或端口

2. 检查固件是否运行
   └─→ 发送归位命令测试

3. 降低波特率
   └─→ 从921600降到460800

4. 增加超时时间
   └─→ timeout参数设为2.0或更大
\`\`\`

### Q2: 数据校验失败？

**原因：**
\`\`\`
1. 串口信号干扰
   └─→ 添加延时或使用屏蔽线

2. 波特率不匹配
   └→ 固件和SDK使用相同波特率

3. 供电不足
   └→ 舵机供电不足导致响应异常

4. 多线程并发
   └→ 使用线程安全封装类
\`\`\`

### Q3: 如何实现平滑运动？

**推荐方法：**
\`\`\`python
import numpy as np

def smooth_trajectory(start, end, steps=20):
    """生成平滑轨迹（余弦插值）"""
    t = np.linspace(0, np.pi, steps)
    trajectory = start + (end - start) * (1 - np.cos(t)) / 2
    return trajectory

# 使用
hand = AeroHand()
start = [0, 0, 0, 0, 0, 0]
end = [100, 100, 100, 100, 100, 100]

for positions in smooth_trajectory(start, end, steps=30):
    hand.set_joint_positions(positions)
    time.sleep(0.03)  # ~33Hz
\`\`\`
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
        summary: 'PWM 信号原理、HLS3606M 串行总线协议、4096 级分辨率的详解。',
        tags: ['舵机', 'PWM', '原理'],
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

---

## [进阶] PID 控制原理

### 什么是 PID？

PID（比例-积分-微分）控制器是舵机内部的核心控制算法：

\`\`\`
PID 控制器框图：

        ┌─────────────────────────────────────────┐
        │                                         │
        │    ┌──────┐     ┌──────┐     ┌──────┐  │
target ──→(+)─→│  P   │─→(+)?─→│  I   │─→(+)?─→│  D   │─→ output
        │    └──────┘     └──────┘     └──────┘  │
        │      ↑            ↑            ↑        │
        │      │            │            │        │
        │      └────────────┴────────────┘        │
        │                  │                    │
        └──────────────────│────────────────────┘
                           │
                       feedback
\`\`\`

**三个控制分量：**

\`\`\`
1. P（比例）- 现在
   作用：根据当前误差大小控制
   公式：u_p = Kp * e(t)

2. I（积分）- 过去
   作用：消除稳态误差
   公式：u_i = Ki * ∫e(t)dt

3. D（微分）- 未来
   作用：预测趋势，抑制震荡
   公式：u_d = Kd * de(t)/dt

总输出：u(t) = Kp*e(t) + Ki*∫e(t)dt + Kd*de(t)/dt
\`\`\`

### PID 参数对响应的影响

\`\`\`
参数过大（响应太快/震荡）：
┌──────────────────────────────────────────────┐
│ 响应曲线：                                    │
│                                              │
│ 目标 ───────┐                                 │
│            ╱ ╲  ← 过冲（Overshoot）           │
│           ╱   ╲                               │
│          ╱     ╲                              │
│         ╱       ╲← 震荡                       │
│        ╱         ╲                            │
│ ───────┴──────────╲─────────────────────────→ │
│                    ╲                          │
│                                              │
│ 现象：手指抖动、抖动、机械振动                  │
│ 解决：减小 Kp, Kd                             │
└──────────────────────────────────────────────┘

参数过小（响应太慢）：
┌──────────────────────────────────────────────┐
│ 响应曲线：                                    │
│                                              │
│ 目标 ────────────────────────────┐            │
│                                 ╱             │
│                                ╱              │
│                               ╱               │
│                              ╱                │
│ ──────────────────────────────╱─────────────→ │
│                                → 上升时间太长  │
│                                              │
│ 现象：手指移动迟缓、响应不及时                  │
│ 解决：增大 Kp, Ki                             │
└──────────────────────────────────────────────┘

合适参数（快速平稳）：
┌──────────────────────────────────────────────┐
│ 响应曲线：                                    │
│                                              │
│ 目标 ────────────────────────────┐            │
│                                 │             │
│                                │              │
│                               │               │
│                              │                │
│ ──────────────────────────────┴─────────────→ │
│                                              │
│ 现象：无过冲、无震荡、快速到达目标              │
│ 特征：上升时间快、 settling time 短             │
└──────────────────────────────────────────────┘
\`\`\`

---

## [进阶] 位置环/速度环/力矩环

### 三环控制架构

HLS3606M 内部采用**三环PID级联控制**：

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   位置环（最外层）                                            │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 输入：目标位置（count）                                │   │
│   │ 输出：目标速度                                        │   │
│   │                                                      │   │
│   │   e_position = target_pos - current_pos               │   │
│   │   target_vel = Kp_pos * e_position                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                            ↓                                │
│   速度环（中间层）                                            │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 输入：目标速度                                        │   │
│   │ 输出：目标力矩                                        │   │
│   │                                                      │   │
│   │   e_velocity = target_vel - current_vel               │   │
│   │   target_torque = Kp_vel * e_velocity                 │   │
│   │                 + Ki_vel * ∫e_velocity               │   │
│   └─────────────────────────────────────────────────────┘   │
│                            ↓                                │
│   力矩环（最内层）                                            │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 输入：目标力矩                                        │   │
│   │ 输出：PWM占空比                                       │   │
│   │                                                      │   │
│   │   e_torque = target_torque - current_torque          │   │
│   │   pwm = Kp_torque * e_torque                        │   │
│   └─────────────────────────────────────────────────────┘   │
│                            ↓                                │
│                         电机                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### 各环作用详解

\`\`\`
1. 位置环（Position Loop）
   - 任务：到达目标位置
   - 关注：最终位置是否正确
   - 参数：Kp_pos（比例）
   - 调整：位置超调时减小，正常时增大

2. 速度环（Velocity Loop）
   - 任务：平滑速度变化
   - 关注：避免速度突变
   - 参数：Kp_vel, Ki_vel
   - 调整：速度震荡时增加阻尼

3. 力矩环（Torque/Current Loop）
   - 任务：输出所需力矩
   - 关注：响应速度、效率
   - 参数：Kp_torque
   - 调整：电机抖动时减小

为什么用三环？
- 每环只关注一个目标，参数调节简单
- 内环响应快，外环响应慢
- 避免"既要位置准又要速度快"的矛盾
\`\`\`

### 调试技巧

\`\`\`
从内到外调试：

1. 力矩环（最内层）
   - 轻载测试，确认电机运转平稳
   - 如果抖动：减小 Kp_torque

2. 速度环
   - 给定恒定速度，检查是否恒定
   - 如果速度不稳：增加 Ki_vel（积分）

3. 位置环（最外层）
   - 给定目标位置，检查到位情况
   - 如果超调：减小 Kp_pos
   - 如果响应慢：增大 Kp_pos

注意：HLS3606M 是内置闭环，用户无法直接修改 PID 参数
      只能通过 Feetech 软件调整
\`\`\`

---

## [进阶] 堵转检测与保护

### 堵转原因

\`\`\`
堵转（Stall）发生在：舵机无法移动但电机继续输出力矩

┌────────────────────────────────────────────────────────────┐
│                                                            │
│   正常情况：                                  │
│   手指运动 ──────────────────────────→ 位置变化         │
│   电机力矩 = 所需力矩（很小）                      │
│                                                            │
│   堵转情况：                                              │
│   手指卡住 ──────→ 位置不变 ──────→ 力矩持续增加        │
│   电机力矩 = 最大输出（可能烧毁）                       │
│                                                            │
└────────────────────────────────────────────────────────────┘

常见原因：
1. 机械卡死（零件干涉、螺丝松动）
2. 肌腱断裂
3. 负载过大（抓取太重物体）
4. 关节过载（超出运动范围）
\`\`\`

### 堵转检测方法

\`\`\`
HLS3606M 检测堵转的两种方式：

1. 位置误差检测
   - 比较目标位置和实际位置
   - 误差持续 > 阈值 → 堵转

   代码逻辑：
   if (abs(target_pos - current_pos) > THRESHOLD &&
       duration > TIME_LIMIT) {
       // 堵转！
   }

2. 负载检测
   - 监测电机电流
   - 电流持续 > 阈值 → 堵转

   代码逻辑：
   if (motor_current > CURRENT_THRESHOLD &&
       duration > TIME_LIMIT) {
       // 堵转！
   }
\`\`\`

### 堵转保护措施

\`\`\`
1. 固件层保护（ESP32）
   - 检测到堵转后停止发送位置命令
   - 记录错误状态
   - 发送错误通知

2. 舵机层保护（HLS3606M）
   - 内置堵转检测
   - 自动降低输出（软保护）
   - 可能进入保护模式

3. 应用层保护（SDK）
   - 检测持续大电流
   - 定期检查位置误差
   - 超时强制停止

示例代码（SDK）：
\`\`\`python
def safe_move(hand, positions, max_attempts=3):
    """带堵转检测的安全移动"""
    for attempt in range(max_attempts):
        hand.set_joint_positions(positions)
        time.sleep(0.5)

        # 检查是否到达目标
        current = hand.get_joint_positions()
        error = sum(abs(c - t) for c, t in zip(current, positions))

        if error < 5:  # 5% 容差
            return True

        # 检测大误差
        if error > 30:
            print(f"警告：位置误差 {error}%")
            if attempt == max_attempts - 1:
                raise ServoError("堵转检测：无法到达目标位置")

    return False
\`\`\`
        `
      },
      {
        id: 'endpoint-configuration',
        title: '端点配置详解',
        summary: '掌握 extend_count 和 grasp_count 的配置方法，通过 GUI 工具校准舵机安全运动范围。',
        tags: ['舵机', '配置', '教程'],
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
        summary: 'MuJoCo 模型文件结构详解：Body、Tendon、Actuator、Site 的配置和使用技巧。',
        tags: ['仿真', 'MuJoCo', 'XML'],
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
        summary: '使用 mujoco.viewer 实现交互式仿真控制，键盘控制脚本和策略加载方法。',
        tags: ['仿真', 'MuJoCo', '代码'],
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
        summary: 'JAX 加速的 MuJoCo 训练框架，mujoco_playground 使用指南和 PPO 训练配置。',
        tags: ['仿真', 'RL', 'MJX'],
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
└── ...
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

---

## [进阶] MJX 与标准 MuJoCo 对比

### 功能对比

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│ 特性             │ 标准 MuJoCo      │ MJX (MuJoCo-JAX)        │
├─────────────────────────────────────────────────────────────────┤
│ 计算后端         │ C++ (CPU)        │ JAX (GPU/TPU)            │
│ 并行化           │ 手动多线程       │ 自动向量化                │
│ 训练速度         │ ~1K steps/s     │ ~100K steps/s            │
│ 调试方式         │ 实时可视化       │ 离线分析                 │
│ 物理准确性       │ ✓ 完全一致       │ ✓ 基本一致               │
│ 自定义物理       │ 需要修改C++      │ JAX函数可自定义          │
│ 部署方式         │ 直接运行         │ 需转换为推理模式          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### 使用场景选择

\`\`\`
选择标准 MuJoCo：
- 交互式调试和可视化
- 验证物理模型正确性
- 少量步骤的精确仿真
- 实时控制（hardware-in-the-loop）

选择 MJX：
- 大规模强化学习训练
- 需要 GPU 加速
- 批量数据生成
- 研究和实验迭代
\`\`\`

### 代码切换示例

\`\`\`python
# 标准 MuJoCo（交互式）
import mujoco

model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

with mujoco.viewer.launch_passive(model, data) as viewer:
    while viewer.is_running():
        mujoco.mj_step(model, data)
        viewer.sync()

# MJX（批量训练）
import mujoco_or弻ect as mjx

# 注意：使用 mjx 而不是 mujoco
model = mjx.make_model("aero_hand.xml")
state = mjx.make_data(model)

# 批量模拟
states = mjx.sample_data(model, num_samples=1024)

# JIT 编译的步进函数
step_fn = jax.jit(mjx.step)
states = step_fn(states, actions)
\`\`\`

---

## [进阶] GPU 配置指南

### 检查 GPU 可用性

\`\`\`python
import jax

# 检查 JAX 可见的设备
print(jax.devices())

# 输出示例：
# [CpuDevice(id=0), GpuDevice(id=0), ...]

# 检查是否使用 GPU
if 'gpu' in str(jax.devices()):
    print("✓ GPU 可用")
else:
    print("⚠ 仅使用 CPU")
\`\`\`

### 环境变量配置

\`\`\`bash
# 设置 GPU 内存增长（避免 OOM）
export JAX_PLATFORMS=cuda        # 优先使用 GPU
export CUDA_VISIBLE_DEVICES=0     # 使用第一块 GPU
export XLA_PYTHON_CLIENT_MEM_FRACTION=0.75  # 使用 75% GPU 内存

# 多 GPU 配置
export CUDA_VISIBLE_DEVICES=0,1   # 使用前两块 GPU
\`\`\`

### 常见 GPU 问题

**问题1: GPU 内存不足 (OOM)**

\`\`\`
症状：
jax.errors.OutOfMemoryError: RESOURCE_EXHAUSTED

解决：
1. 减少并行环境数
   --num_envs=512  # 从1024减到512

2. 减少 batch_size
   --batch_size=1024  # 从2048减到1024

3. 启用梯度检查点
   --checkpointing=True

4. 使用更小的模型
\`\`\`

**问题2: GPU 未被使用**

\`\`\`
诊断：
python -c "import jax; print(jax.devices())"

如果只有 CPU：
1. 检查 NVIDIA 驱动
   nvidia-smi

2. 检查 CUDA 安装
   nvcc --version

3. 检查 JAX GPU 版本
   pip install jax[cuda12] -f https://storage.googleapis.com/jax-releases/jax_cuda_releases.html
\`\`\`

**问题3: 多 GPU 负载不均衡**

\`\`\`
# 正确：JAX 自动处理多 GPU
# 错误：手动指定设备

# 这样是错误的：
with jax.default_device(jax.devices()[1]):
    ...

# 正确：让 JAX 自动分配
parallel_step = jax.pmap(step_fn)  # 自动在所有 GPU 上并行
\`\`\`

### 性能调优

\`\`\`python
# 1. 预热 JIT 编译
# 第一次运行会很慢（编译时间），之后会变快
_ = step_fn(states, actions)  # 触发编译

# 2. 使用静态参数
# 动态值会阻止 JIT 优化
@jax.jit
def step_fn(state, action):
    # 避免在函数内部创建大数组
    ...

# 3. 混合精度训练
# 减少内存使用，提高速度
from jax import numpy as jnp
from flax.training import train_state
from flax.training.train_state import TrainState

# 使用 float32 但在关键计算用 float32
model = nn.with_precision(jnp.float32)
\`\`\`

---

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
        summary: 'ROS2 与 SDK 的对比分析，Topic、Message、Node 等核心概念详解。',
        tags: ['ROS2', '架构', '概念'],
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
        summary: 'Ubuntu 22.04 安装 ROS2 Humble、Aero Hand ROS2 包编译和运行示例节点。',
        tags: ['ROS2', '安装', '教程'],
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
git clone https://github.com/TetherIA/aero-hand-ros2.git

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
        summary: 'Proximal Policy Optimization 算法核心原理，Actor-Critic 架构和裁剪机制。',
        tags: ['RL', 'PPO', '原理'],
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

---

## [进阶] 奖励函数设计技巧

### 奖励函数基本原则

\`\`\`
奖励函数 = 任务奖励 + 辅助奖励

1. 任务奖励（必须）
   - 定义任务目标（如：抓取成功 +10）
   - 稀疏但明确

2. 辅助奖励（可选）
   - 引导学习（如：靠近物体 +0.1）
   - 密集但辅助
\`\`\`

### 常见奖励模式

\`\`\`
模式1：稀疏奖励（Sparse）
   只在完成目标时给奖励
   +10 (成功) / 0 (其他)
   优点：明确目标
   缺点：学习慢

模式2：密集奖励（Dense）
   每步都给奖励
   基于与目标的距离
   优点：学习快
   缺点：可能学偏

模式3：混合奖励（推荐）
   任务奖励 + 塑形奖励
   = 稀疏 × 0.8 + 密集 × 0.2
   综合两者优点
\`\`\`

### Aero Hand 抓取任务奖励设计

\`\`\`python
def compute_reward(self, obs, action, next_obs, info):
    """
    抓取任务奖励函数设计

    组成部分：
    1. 任务成功奖励（稀疏）
    2. 接触奖励（塑形）
    3. 动作惩罚（平滑）
    """
    reward = 0.0

    # 1. 任务成功奖励
    if info['is_success']:
        reward += 10.0  # 抓取成功

    # 2. 接触奖励（鼓励接触物体）
    contact_reward = self._compute_contact_reward(next_obs)
    reward += 0.5 * contact_reward

    # 3. 速度奖励（鼓励快速抓取）
    velocity_reward = self._compute_velocity_reward(next_obs)
    reward += 0.2 * velocity_reward

    # 4. 动作惩罚（避免过大动作）
    action_penalty = -0.01 * np.sum(np.square(action))
    reward += action_penalty

    # 5. 边界惩罚（避免手指过度弯曲）
    boundary_penalty = self._compute_boundary_penalty(next_obs)
    reward += 0.1 * boundary_penalty

    return reward

def _compute_contact_reward(self, obs):
    """
    接触奖励：手指与物体接触时给奖励
    """
    finger_positions = obs[:7]
    object_position = obs[7:10]

    # 计算手指到物体的距离
    min_distance = min_distance_finger_to_object(
        finger_positions, object_position
    )

    # 接触奖励（距离越小奖励越大）
    if min_distance < 0.01:  # 接触阈值
        return 1.0
    else:
        return max(0, 1.0 - min_distance / 0.1)

def _compute_velocity_reward(self, obs):
    """
    速度奖励：鼓励快速移动手指
    """
    velocities = obs[14:21]  # 假设速度在 obs 中的位置
    return np.mean(np.abs(velocities))
\`\`\`

### 奖励塑形技巧

\`\`\`
技巧1：势能函数塑形
使用势能函数引导学习：
reward += potential(next_state) - potential(state)

例如：
potential = -distance_to_target

技巧2：混合多目标
reward = task_reward + α * shaping_reward

其中 α 随训练递减：
α = α0 * (1 - progress)

技巧3：分解奖励分量
分清楚什么是"必须学到的"和"最好学到的"
只用稀疏的任务奖励定义成功
\`\`\`

### 调试奖励函数

\`\`\`
问题：策略学到钻空子
症状：找到漏洞获得高奖励但不是真正完成任务

解决：
1. 仔细检查奖励条件
2. 添加额外约束（如必须保持物体在手中）
3. 使用更复杂的状态评估

问题：策略完全不学习
症状：奖励一直是初始值

解决：
1. 检查奖励计算是否有 bug
2. 检查奖励是否过小（需要放缩）
3. 添加更多塑形奖励

问题：策略行为不稳定
症状：动作幅度忽大忽小

解决：
1. 增加动作惩罚系数
2. 添加平滑奖励（惩罚动作变化）
3. 减小学习率
\`\`\`

---

## [进阶] 多任务学习

### 什么是多任务学习？

\`\`\`
单任务 vs 多任务：

单任务：
  任务A → 策略A
  任务B → 策略B  (需要重新训练)
  ...

多任务：
  任务A、B、C → 共享策略 → 统一表示

优点：
  ✓ 知识迁移
  ✓ 样本效率高
  ✓ 策略更鲁棒
\`\`\`

### 多任务架构设计

\`\`\`
架构1：共享特征提取器
┌─────────────────────────────────────────┐
│         共享特征层 (MLP)                 │
│         ↓           ↓                   │
│    ┌────────┐  ┌────────┐             │
│    │ 头A    │  │ 头B    │  ...         │
│    └────────┘  └────────┘             │
│         ↑           ↑                   │
│       任务A       任务B                 │
└─────────────────────────────────────────┘

架构2：注意机制
┌─────────────────────────────────────────┐
│         共享特征层                       │
│              ↓                          │
│         Attention                       │
│              ↓                          │
│    ┌─────────────────────────┐         │
│    │    任务特定输出          │         │
│    └─────────────────────────┘         │
└─────────────────────────────────────────┘
\`\`\`

### Aero Hand 多任务示例

\`\`\`python
class MultiTaskAeroHandEnv(gym.Env):
    """
    多任务环境：支持多个不同任务
    """

    TASKS = {
        'grasp': {
            'obs': ['joint_pos', 'object_pos'],
            'reward_fn': compute_grasp_reward,
            'success_fn': is_object_grasped,
        },
        'push': {
            'obs': ['joint_pos', 'object_pos', 'target_pos'],
            'reward_fn': compute_push_reward,
            'success_fn': is_object_at_target,
        },
        'rotate': {
            'obs': ['joint_pos', 'object_pos', 'object_quat'],
            'reward_fn': compute_rotate_reward,
            'success_fn': is_object_rotated,
        },
    }

    def __init__(self, task='grasp'):
        self.task = task
        self.task_config = self.TASKS[task]

    def reset(self):
        # 任务特定初始化
        obs = self._reset_task_specific()
        return obs

    def step(self, action):
        obs, reward, done, info = self._step_task_specific(action)
        return obs, reward, done, info

    def _compute_grasp_reward(self, obs, action, info):
        """抓取任务奖励"""
        # ... 实现
        return reward

    def _compute_push_reward(self, obs, action, info):
        """推动任务奖励"""
        # ... 实现
        return reward
\`\`\`

### 任务平衡策略

\`\`\`
问题：某些任务学得好，某些任务学得差

原因：
- 不同任务的难度不同
- 奖励规模不同
- 样本数量不均衡

解决方案：

1. 任务加权采样
   优先采样困难任务
   weights = 1.0 / success_rate

2. 奖励归一化
   每个任务的奖励除以各自的标准差

3. 课程学习
   从简单任务开始，逐步引入复杂任务

4. HGR 损失
   添加辅助损失鼓励任务解耦
\`\`\`
        `
      },
      {
        id: 'domain-randomization',
        title: '域随机化',
        summary: 'Sim2Real 挑战的解决方案，域随机化策略和 Aero Hand 的渐进式训练方法。',
        tags: ['RL', 'Sim2Real', '训练'],
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
        summary: '训练策略导出、SDK 和 ROS2 部署方法、现实世界调整技巧和安全检查。',
        tags: ['RL', '部署', 'Sim2Real'],
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
        summary: 'Python SDK 安装、连接初始化、归位、单关节和多关节控制、平滑运动轨迹。',
        tags: ['SDK', '代码', '教程'],
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
        summary: '基础仿真脚本、键盘交互控制、轨迹跟踪、关节角度和肌腱张力可视化。',
        tags: ['仿真', '代码', 'MuJoCo'],
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
  },
  // ========== 快速开始指南 ==========
  {
    id: 'quickStart',
    title: '快速开始',
    icon: 'Rocket',
    description: '从零开始的完整上手指南，包括环境搭建、首次运行和基础操作',
    articles: [
      {
        id: 'environment-setup',
        title: '环境搭建指南',
        summary: '手把手教你搭建 Aero Hand 开发环境，包括软件安装和硬件连接。',
        tags: ['环境', '安装', '配置'],
        content: `
## 环境要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 双核 2GHz | 四核 3GHz+ |
| 内存 | 4GB | 8GB+ |
| 存储 | 10GB 可用 | 20GB+ SSD |
| USB | USB 2.0 | USB 3.0 |
| 操作系统 | Windows 10 / Ubuntu 20.04 / macOS 11 | Windows 11 / Ubuntu 22.04 |

### 软件要求

\`\`\`
必须安装：
├─ Python 3.10+ (必须)
├─ Git (必须)
├─ Arduino IDE 或 PlatformIO (固件开发)
└─ USB 驱动程序 (CH340/CP2102)

推荐安装：
├─ VS Code (代码编辑)
├─ MuJoCo (仿真)
├─ ROS2 Humble (高级应用)
└─ Docker (容器化开发)
\`\`\`

---

## 第一步：软件安装

### 1.1 安装 Python

\`\`\`bash
# Windows
# 下载 https://www.python.org/downloads/
# 安装时勾选 "Add Python to PATH"

# 验证安装
python --version
# 应显示 Python 3.10.x 或更高

# Linux/macOS
sudo apt install python3.10  # Ubuntu
brew install python3          # macOS
\`\`\`

### 1.2 安装 Git

\`\`\`bash
# Windows
# 下载 https://git-scm.com/download/win

# Linux
sudo apt install git

# macOS (已预装)
git --version
\`\`\`

### 1.3 克隆项目

\`\`\`bash
# 克隆主仓库
git clone https://github.com/TetherIA/aero-hand-open.git

# 进入目录
cd aero-hand-open

# 查看结构
ls -la
\`\`\`

### 1.4 安装 SDK

\`\`\`bash
# 进入 SDK 目录
cd sdk

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\\Scripts\\activate   # Windows

# 安装依赖
pip install -e .
pip install pyserial numpy

# 验证安装
python -c "from aero_open_sdk import AeroHand; print('SDK OK')"
\`\`\`

### 1.5 安装固件工具

\`\`\`bash
# Arduino IDE
# 1. 下载 https://www.arduino.cc/en/software
# 2. 安装 ESP32 开发板支持：
#    文件 → 首选项 → 附加开发板管理器网址
#    添加：https://dl.espressif.com/dl/package_esp32_index.json
# 3. 工具 → 开发板 → 开发板管理器 → 安装 ESP32

# 或使用 PlatformIO
pip install platformio
pio --version
\`\`\`

---

## 第二步：硬件连接

### 2.1 检查组件

\`\`\`
发货清单检查：
□ ESP32-S3 开发板 × 1
□ USB-C 数据线 × 1
□ 5V 3A 电源适配器 × 1
□ HLS3606M 舵机 × 7 (已安装在手上)

注意：如果是散件，需要先完成组装！
\`\`\`

### 2.2 连接步骤

\`\`\`
1. 将 USB-C 线连接到 ESP32-S3
2. 将另一端连接到电脑
3. 确认电源开关处于 OFF 状态（如果有）
4. 不要在首次连接时接通舵机电源！

首次连接只给 ESP32 供电，避免意外损坏
\`\`\`

### 2.3 验证连接

\`\`\`bash
# Windows - 检查设备管理器
# 找到 "USB Serial Device (COMX)"

# Linux - 检查 /dev/ttyUSB*
ls -l /dev/ttyUSB*
# 或
ls -l /dev/ttyACM*

# macOS - 检查 /dev/tty.*
ls -l /dev/tty.*
\`\`\`

---

## 第三步：首次运行

### 3.1 测试 SDK 连接

\`\`\`python
# test_connection.py
from aero_open_sdk import AeroHand
import time

print("正在连接...")
hand = AeroHand()

print("连接成功!")
print(f"端口: {hand.serial.port}")
print(f"状态: {hand.state}")

# 测试归位
print("\\n执行归位...")
hand.home()
print("归位完成!")

# 测试运动
print("\\n测试运动...")
hand.set_joint_positions([50, 50, 50, 50, 50, 50, 50])
time.sleep(1)

print("复位...")
hand.set_joint_positions([0, 0, 0, 0, 0, 0, 0])

print("\\n全部测试通过!")
\`\`\`

### 3.2 运行示例脚本

\`\`\`bash
# 进入示例目录
cd sdk/examples

# 运行序列示例
python run_sequence.py

# 应该看到：
# 开始执行动作序列...
# 动作 1: [0, 0, 0, 0, 0, 0, 0]
# 当前位置: [0, 0, 0, 0, 0, 0, 0]
# ...
# 序列执行完成!
\`\`\`

---

## 常见问题

### Q: Python 找不到 aero_open_sdk？

**解决方法：**
\`\`\`bash
# 确认安装
pip list | grep aero

# 如果没有，重新安装
pip install -e .

# 检查 Python 路径
python -c "import sys; print('\\n'.join(sys.path))"
\`\`\`

### Q: 串口权限被拒绝？

**Linux 解决方法：**
\`\`\`bash
# 添加用户到 dialout 组
sudo usermod -a -G dialout $USER

# 重新登录后生效
# 或直接执行
sudo chmod 666 /dev/ttyUSB0
\`\`\`

### Q: 找不到 ESP32 端口？

**检查步骤：**
1. 确认 USB 线支持数据传输（有些仅供充电）
2. 尝试不同的 USB 端口
3. 安装/更新 CH340 或 CP2102 驱动
4. 如果使用虚拟机，确认 USB 穿透配置
        `
      },
      {
        id: 'first-demo',
        title: '首次运行演示',
        summary: '运行你的第一个 Aero Hand 演示程序，了解基本控制流程。',
        tags: ['演示', '入门', '控制'],
        content: `
## 演示概览

本指南将带你运行一个完整的演示程序，涵盖：

\`\`\`
1. 初始化和归位
2. 基本运动控制
3. 读取传感器数据
4. 执行预设手势
5. 清理和复位
\`\`\`

---

## 完整演示代码

\`\`\`python
# first_demo.py
from aero_open_sdk import AeroHand
import time

def main():
    """首次演示程序"""

    print("=" * 50)
    print("Aero Hand 首次演示")
    print("=" * 50)

    # 1. 初始化
    print("\\n[1/5] 初始化机械手...")
    hand = AeroHand()

    # 2. 归位
    print("[2/5] 执行归位...")
    hand.home()
    time.sleep(1)
    print("归位完成!")

    # 3. 读取当前位置
    print("\\n[3/5] 读取当前位置...")
    positions = hand.get_joint_positions()
    print(f"当前关节位置: {positions}")

    # 4. 执行手势序列
    print("\\n[4/5] 执行手势序列...")

    gestures = [
        ("张开", [0, 0, 0, 0, 0, 0, 0]),
        ("半握", [30, 30, 30, 30, 40, 30, 0]),
        ("握拳", [80, 80, 80, 80, 90, 70, 0]),
        ("OK手势", [0, 100, 100, 100, 80, 50, 0]),
        ("点赞", [0, 100, 100, 100, 0, 0, 0]),
    ]

    for name, positions in gestures:
        print(f"  - {name}...")
        hand.set_joint_positions(positions)
        time.sleep(1.5)

    # 5. 复位
    print("\\n[5/5] 复位到初始状态...")
    hand.set_joint_positions([0, 0, 0, 0, 0, 0, 0])
    time.sleep(1)

    print("\\n" + "=" * 50)
    print("演示完成!")
    print("=" * 50)

if __name__ == "__main__":
    main()
\`\`\`

---

## 代码解析

### 初始化过程

\`\`\`
 AeroHand() 内部流程：

 1. 扫描可用串口
    └─→ 查找包含 "USB" 或 "ACM" 的设备

 2. 尝试连接
    └─→ 使用默认参数 921600 波特率

 3. 发送心跳检测
    └─→ 验证固件响应

 4. 初始化状态
    └─→ 设置内部状态机为 READY

 典型输出：
 "正在连接..."
 "连接成功!"
 "端口: /dev/ttyUSB0"
 "状态: READY"
\`\`\`

### 归位过程

\`\`\`
 hand.home() 执行步骤：

 1. 发送归位命令 (0x30)
 2. 所有舵机移动到 extend_count
 3. 等待运动完成（最多10秒）
 4. 更新内部位置状态

 机械运动：
 - 所有手指从当前位置
 - 缓慢张开到完全伸直位置
 - 到达后归位完成

 目的：建立已知参考位置
\`\`\`

### 位置控制

\`\`\`
 set_joint_positions([0, 0, 0, 0, 0, 0, 0])
           │
           ▼
 数据格式：7个关节的百分比 (0-100)
           │
           ▼
 关节映射：
 - [0] 食指弯曲
 - [1] 中指弯曲
 - [2] 无名指弯曲
 - [3] 小指弯曲
 - [4] 拇指内收
 - [5] 拇指弯曲
 - [6] 备用

 注意：只有6个关节用于主要控制
\`\`\`

---

## 扩展练习

### 练习 1：自定义手势

\`\`\`python
# 创建你的手势
my_gesture = [
    50,   # 食指 - 中等弯曲
    0,    # 中指 - 完全伸直
    100,  # 无名指 - 完全弯曲
    50,   # 小指 - 中等弯曲
    70,   # 拇指内收 - 较强内收
    60,   # 拇指弯曲 - 中等弯曲
    0     # 备用
]

hand.set_joint_positions(my_gesture)
\`\`\`

### 练习 2：平滑过渡

\`\`\`python
import numpy as np

def smooth_move(hand, start, end, duration=2.0, steps=50):
    """平滑移动到目标位置"""
    for i in range(steps):
        t = i / steps
        # 余弦插值
        alpha = (1 - np.cos(np.pi * t)) / 2
        current = [s + (e - s) * alpha for s, e in zip(start, end)]
        hand.set_joint_positions(current)
        time.sleep(duration / steps)

# 使用
smooth_move(hand, [0,0,0,0,0,0,0], [100,100,100,100,100,100,0], duration=3.0)
\`\`\`

### 练习 3：连续动作

\`\`\`python
def wave_motion(hand, cycles=3, speed=0.1):
    """波动手势"""
    import numpy as np

    for _ in range(cycles):
        for t in np.linspace(0, 2*np.pi, 20):
            positions = [
                50 + 50 * np.sin(t + i * 0.5)
                for i in range(6)
            ]
            hand.set_joint_positions(positions)
            time.sleep(speed)

wave_motion(hand, cycles=2, speed=0.05)
\`\`\`

---

## 下一步

完成首次演示后，你可以：

1. **修改示例代码** - 创建自己的手势
2. **阅读技术文档** - 深入了解系统架构
3. **尝试仿真** - 在 MuJoCo 中训练 RL 策略
4. **组装硬件** - 如果收到散件，开始组装
        `
      },
      {
        id: 'hardware-assembly-quick',
        title: '快速组装指南',
        summary: '简明的组装流程，帮助你快速完成硬件装配。',
        tags: ['硬件', '组装', '快速'],
        content: `
## 组装概述

Aero Hand Open 的组装流程分为 5 个主要阶段：

\`\`\`
组装流程：
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ 电子件  │ →  │ 安装   │ →  │ 手指   │ →  │ 肌腱   │ →  │ 最终  │
│ 准备   │    │ ESP32  │    │ 组装   │    │ 穿引   │    │ 测试  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘

预计时间：2-4 小时（取决于经验）
工具需求：基础螺丝刀套装、镊子、剪钳
\`\`\`

---

## 阶段 1：电子件准备

### 检查零件

\`\`\`
电子元件清单：
□ ESP32-S3 开发板 × 1
□ HLS3606M 舵机 × 7（已安装在3D打印件中）
□ USB-C 数据线 × 1
□ 5V 3A 电源适配器 × 1
□ 排针若干（用于接线）

3D 打印件清单：
□ palm_left.stl / palm_right.stl（手掌）
□ finger_*.stl（4个手指 + 拇指的所有部件）
□ wrist_mount.stl（腕部安装座）
□ pulley_*.stl（滑轮组件）
\`\`\`

### 测试舵机

**重要：先测试舵机再组装！**

\`\`\`python
# test_servos.py
from aero_open_sdk import AeroHand

hand = AeroHand()

# 逐个测试舵机
for servo_id in range(7):
    print(f"测试舵机 {servo_id}...")

    # 发送测试命令
    hand.set_joint_position(servo_id, 50)
    input("按 Enter 继续...")  # 等待手动确认

print("所有舵机测试完成!")
\`\`\`

---

## 阶段 2：安装 ESP32

### 位置和方向

\`\`\`
ESP32 安装位置：手掌中心

安装要求：
- USB 接口朝向腕部方向
- ESP32 芯片朝向外侧（便于散热）
- 使用 2× M2.5 螺丝固定

固定点：
  ┌─────────────────────┐
  │                     │
  │    ┌───────┐       │
  │    │ ESP32 │       │ ← 居中放置
  │    └───────┘       │
  │                     │
  │   ○             ○   │ ← 螺丝孔位
  │                     │
  └─────────────────────┘
\`\`\`

### 接线

\`\`\`
ESP32 → 舵机总线

接线定义（参考 HandConfig.h）：
GPIO 18 → 舵机数据线
GPIO 19 → (备用)

电源：
- ESP32 5V → 舵机电源 (5V)
- GND → 共地

注意：确保电源极性正确！
\`\`\`

---

## 阶段 3：手指组装

### 手指结构

\`\`\`
单个手指的组件：
┌───────────┬─────────────┬──────────┐
│ Proximal  │ Intermediate │  Distal  │
│ (近端)    │   (中端)     │  (远端)  │
│           │              │          │
│ ◯─────◯──│──◯─────◯──│──◯      │
│ 滑轮     │ 滑轮        │ 滑轮     │
└───────────┴─────────────┴──────────┘

关节连接：
- 近端 ↔ 中端：关节销钉
- 中端 ↔ 远端：关节销钉
\`\`\`

### 组装步骤

\`\`\`bash
# 1. 安装滑轮到指骨
#    - 近端指骨：2个3mm滑轮
#    - 中端指骨：1个3mm滑轮
#    - 远端指骨：1个5mm滑轮

# 2. 连接指骨
#    - 使用关节销钉连接
#    - 确保运动顺畅，无卡顿

# 3. 重复 4 次（食指、中指、无名指、小指）
#    - 拇指组装略有不同（见下文）
\`\`\`

### 拇指组装

\`\`\`
拇指特点：
- 位于手掌侧面
- 有额外的内旋关节
- 需要单独校准

安装位置：
     ┌──────────┐
     │  拇指    │ ← 拇指座
     └────┬─────┘
          │
   ┌─────┴─────┐
   │  掌骨     │
   └───────────┘
\`\`\`

---

## 阶段 4：肌腱穿引

### 肌腱路径

\`\`\`
肌腱穿引路径（以食指为例）：

1. 起点：掌心底部的肌腱锚点
   ↓
2. 近端滑轮（绕过外侧）
   ↓
3. 中端滑轮（绕过内侧）
   ↓
4. 远端滑轮
   ↓
5. 终点：指尖固定点

路径示意图：
┌─────────────────────────────┐
│ 锚点 ●                      │
│      ╲                      │
│       ╲   ┌─────┐          │
│        ╲──│滑轮1│          │
│           └─────┘          │
│            │               │
│            ╲              │
│             ╲   ┌─────┐   │
│              ╲──│滑轮2│   │
│                 └─────┘   │
│                  │        │
│                  ╲       │
│                   ╲ ┌───┐│
│                    ╲│滑轮││
│                     └───┘│
│                      ● 终点│
└─────────────────────────────┘
\`\`\`

### 穿引技巧

\`\`\`
技巧1：使用穿引针
- 购买或自制细长穿引针
- 先穿针再带线

技巧2：保持肌腱平整
- 避免扭曲或打结
- 预留适当余量（约10mm）

技巧3：预紧力调整
- 太松：手指不能完全弯曲
- 太紧：手指不能完全伸直
- 合适：自然下垂时手指半弯曲

技巧4：固定方式
- 打结 + 少量胶水
- 或使用微型线夹
\`\`\`

---

## 阶段 5：最终测试

### 测试清单

\`\`\`
最终检查清单：

□ 所有螺丝已紧固
□ 肌腱路径正确
□ 关节运动顺畅
□ 无异常摩擦或卡顿
□ 舵机连接正确
□ 肌腱张力适中
□ USB 连接正常
□ 电源连接正确

功能测试：
□ 归位功能正常
□ 所有手指响应控制
□ 位置精度满足要求
□ 运动范围正常
\`\`\`

### 测试脚本

\`\`\`python
# final_test.py
from aero_open_sdk import AeroHand
import time

def final_test():
    hand = AeroHand()
    hand.home()
    time.sleep(1)

    print("执行最终测试...")

    # 测试每个手指
    for i in range(7):
        print(f"测试关节 {i}...")

        # 张开
        hand.set_joint_position(i, 0)
        time.sleep(0.5)

        # 弯曲
        hand.set_joint_position(i, 100)
        time.sleep(0.5)

    # 全开
    hand.set_joint_positions([0]*7)
    time.sleep(1)

    # 全闭
    hand.set_joint_positions([100]*7)
    time.sleep(1)

    # 复位
    hand.home()
    print("测试完成!")

final_test()
\`\`\`

---

## 常见问题

### Q: 关节运动有异响？

**检查：**
1. 关节销钉是否润滑
2. 3D 打印件是否有毛刺
3. 滑轮是否与指骨摩擦

**解决：**
- 使用砂纸轻轻打磨毛刺
- 在关节处添加少量润滑剂
- 调整滑轮位置

### Q: 肌腱总是松脱？

**原因：**
1. 打结方式不正确
2. 胶水粘接力不足
3. 滑轮边缘磨损肌腱

**解决：**
- 使用更可靠的结型（如外科结）
- 使用强力胶（氰基丙烯酸酯）
- 更换滑轮或用砂纸打磨边缘

### Q: 手指运动方向相反？

**检查：**
- 舵机方向设置（servo_direction）
- 固件配置中的方向参数

**解决：**
- 在 HandConfig.h 中调整方向
- 或使用 SDK 的方向参数反转
        `
      }
    ]
  },
  // ========== 常见错误排查 ==========
  {
    id: 'troubleshooting',
    title: '错误排查',
    icon: 'Tools',
    description: '完整的故障诊断和解决方案，帮助你快速定位和解决各类问题',
    articles: [
      {
        id: 'connection-issues',
        title: '连接问题诊断',
        summary: '串口连接、固件通信问题的完整诊断流程和解决方案。',
        tags: ['连接', '串口', '诊断'],
        content: `
## 连接问题概览

\`\`\`
连接问题分类：

┌─────────────────────────────────────────────────────────┐
│                    连接问题树                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   无法连接                                               │
│   ├─ 硬件问题                                           │
│   │  ├─ USB 线不支持数据传输                             │
│   │  ├─ 串口驱动未安装                                   │
│   │  └─ ESP32 损坏                                       │
│   │                                                         │
│   └─ 软件问题                                           │
│      ├─ 端口被占用                                       │
│      ├─ 波特率不匹配                                     │
│      └─ 权限不足                                         │
│                                                         │
│   连接不稳定                                             │
│   ├─ USB 线质量差                                        │
│   ├─ 供电不足                                           │
│   └─ 信号干扰                                           │
│                                                         │
│   通信超时                                               │
│   ├─ 固件未运行                                         │
│   ├─ 串口参数错误                                       │
│   └─ 程序阻塞                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 问题 1：找不到串口设备

### 症状

\`\`\`
错误信息：
- "No serial port found"
- "Port not found: /dev/ttyUSB0"
- "Could not open port 'COM3'"

可能原因：
1. USB 线仅供充电，不支持数据
2. 驱动未安装
3. 端口名称错误
\`\`\`

### 诊断步骤

**步骤 1：确认 USB 线**

\`\`\`
测试方法：
1. 使用手机数据线（通常支持数据传输）
2. 连接后电脑应识别到新设备
3. 观察设备管理器是否有新条目

好的 USB 线特征：
- 通常更粗
- 可能有 "数据" 标志
- 连接到电脑后能识别到设备
\`\`\`

**步骤 2：检查驱动**

\`\`\`
Windows 驱动：
- CH340: https://www.wch.cn/downloads/CH341SER_ZIP.html
- CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

安装后检查：
设备管理器 → 端口(COM 和 LPT)
应该有 "USB Serial Device" 或类似条目

Linux 驱动：
# CH340 通常内核自带
lsmod | grep ch341

# 如果没有，加载模块
sudo modprobe ch341
\`\`\`

**步骤 3：检查端口权限**

\`\`\`bash
# Linux 检查
ls -l /dev/ttyUSB*
# 或
ls -l /dev/ttyACM*

# 当前用户权限
groups $USER
# 应该包含 dialout 组

# 临时解决方案
sudo chmod 666 /dev/ttyUSB0

# 永久解决方案
sudo usermod -a -G dialout $USER
# 然后重新登录
\`\`\`

### 解决方案汇总

| 问题 | 解决方案 |
|------|---------|
| USB 线不支持数据 | 更换支持数据传输的 USB 线 |
| CH340 驱动未安装 | 下载并安装 CH341SER |
| CP2102 驱动未安装 | 下载并安装 CP2102 VCP |
| Linux 权限不足 | 添加用户到 dialout 组 |
| Windows 端口被占用 | 关闭其他使用串口的程序 |

---

## 问题 2：连接后无响应

### 症状

\`\`\`
现象：
- 串口打开成功
- 发送命令无反应
- 读取返回为空或超时

可能原因：
1. 固件未烧录
2. 固件损坏
3. 波特率不匹配
\`\`\`

### 诊断步骤

**步骤 1：验证固件**

\`\`\`bash
# 使用 esptool 检查芯片
pip install esptool
esptool.py --chip esp32s3 --port /dev/ttyUSB0 flash_id

# 预期输出：
# Chip type: ESP32-S3
# Chip features: WiFi/BT/BLE
# MAC address: ...
\`\`\`

**步骤 2：检查波特率**

\`\`\`
常见波特率：9600, 115200, 460800, 921600

Aero Hand 使用：921600

检查方法：
1. 打开串口监视器（Arduino IDE）
2. 设置不同波特率
3. 观察是否有输出

如果看到乱码：波特率不匹配
\`\`\`

**步骤 3：手动发送心跳**

\`\`\`python
# 手动测试固件响应
import serial

port = '/dev/ttyUSB0'  # 或 'COM3'
baudrate = 921600

with serial.Serial(port, baudrate, timeout=1) as ser:
    # 发送归位命令 (0x30)
    ser.write(bytes([0x7E, 0x30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x30, 0x7E]))

    # 读取响应
    response = ser.read(16)
    print(f"响应: {response.hex()}")

    if response:
        print("固件有响应!")
    else:
        print("固件无响应 - 可能未烧录固件")
\`\`\`

### 解决方案

\`\`\`
方案1：重新烧录固件
- 使用 PlatformIO 或 Arduino IDE
- 确保选择正确的开发板 (ESP32-S3)
- 烧录后重启

方案2：检查波特率配置
- SDK 默认 921600
- 如需更改，同时修改固件和 SDK

方案3：检查供电
- ESP32 需要稳定供电
- USB 供电可能不足，使用外部 5V 电源
\`\`\`

---

## 问题 3：通信不稳定

### 症状

\`\`\`
现象：
- 偶发性通信失败
- 数据校验错误
- 命令丢失

可能原因：
1. USB 线过长或质量差
2. 供电不稳定
3. 信号干扰
\`\`\`

### 诊断方法

**方法 1：检查信号质量**

\`\`\`
示波器观察：
- 检查 TX/RX 信号完整性
- 确认电平正确（3.3V）
- 检查是否有噪声

逻辑分析仪观察：
- 采样率 ≥ 10MHz
- 捕获串口数据
- 分析时序是否正确
\`\`\`

**方法 2：检查供电**

\`\`\`
万用表测量：
- USB 供电电压：5V ± 0.25V
- ESP32 供电电压：3.3V
- 舵机供电电压：5V ± 0.25V

问题症状：
- 电压偏低 → 供电不足
- 电压波动 → 电源噪声
\`\`\`

### 解决方案

| 问题 | 解决方案 |
|------|---------|
| USB 线过长 | 使用更短的 USB 线（< 1米） |
| USB 供电不足 | 使用带独立供电的 USB Hub |
| 信号干扰 | 添加磁环，使用屏蔽线 |
| 串口缓冲区溢出 | 降低发送频率，添加延时 |
| 校验和错误 | 检查波特率是否精确匹配 |

---

## 问题 4：舵机不响应

### 症状

\`\`\`
现象：
- ESP32 连接正常
- 舵机不动
- 无错误提示

可能原因：
1. 舵机供电未连接
2. 舵机 ID 配置错误
3. 舵机损坏
\`\`\`

### 诊断步骤

**步骤 1：检查供电**

\`\`\`
必须检查：
1. 5V 3A 电源是否连接
2. 电源开关是否打开（如果有）
3. 舵机电源线是否正确连接

警告：舵机需要独立供电，不能仅靠 USB 供电！
\`\`\`

**步骤 2：测试单个舵机**

\`\`\`python
# 测试单个舵机
from aero_open_sdk import AeroHand

hand = AeroHand()

# 测试舵机 0
print("测试舵机 0...")
hand.set_joint_position(0, 50)

# 等待几秒
import time
time.sleep(2)

# 检查是否有反应
# 如果舵机不动，尝试
print("尝试其他位置...")
hand.set_joint_position(0, 0)
time.sleep(1)
hand.set_joint_position(0, 100)
\`\`\`

**步骤 3：检查总线连接**

\`\`\`
舵机总线拓扑：
┌─────────────┐
│   ESP32    │
│  TX →      │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
   ┌───────┐         ┌───────┐
   │舵机 0 │         │舵机 1 │
   └───────┘         └───────┘
       │                 │
       ▼                 ▼
   ┌───────┐         ┌───────┐
   │舵机 2 │         │舵机 3 │ ...
   └───────┘         └───────┘

注意：最后一个舵机应接终端电阻（120Ω）
\`\`\`

### 解决方案

| 问题 | 解决方案 |
|------|---------|
| 舵机供电未连接 | 连接 5V 3A 电源 |
| 舵机 ID 冲突 | 检查 HandConfig.h 中 ID 配置 |
| 终端电阻缺失 | 在最后一个舵机添加 120Ω 电阻 |
| 舵机损坏 | 更换舵机（联系供应商） |
| 总线断路 | 检查接线，重新焊接 |

---

## 高级诊断工具

### 串口监视器

\`\`\`bash
# 使用 screen 或 minicom
sudo apt install screen

# 连接
screen /dev/ttyUSB0 921600

# 退出：按 Ctrl+A 然后按 K
\`\`\`

### 逻辑分析仪

\`\`\`
推荐工具：Saleae Logic
采样率：至少 10MHz

接线：
- 通道 0: ESP32 TX
- 通道 1: ESP32 RX
- 通道 2: 舵机总线（可选）

分析：
1. 捕获通信数据
2. 验证帧格式
3. 检查时序参数
\`\`\`

### 示波器

\`\`\`
检查点：
1. ESP32 TX 信号完整性
2. 舵机控制信号
3. 电源纹波

正常信号特征：
- 干净的方波
- 上升/下降时间 < 1μs
- 无明显噪声
\`\`\`
        `
      },
      {
        id: 'motion-problems',
        title: '运动异常排查',
        summary: '手指运动不平滑、抖动、位置不准确等问题的诊断和解决。',
        tags: ['运动', '舵机', '调试'],
        content: `
## 运动问题概览

\`\`\`
运动问题分类：

┌─────────────────────────────────────────────────────────┐
│                  运动问题诊断树                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   手指不动                                               │
│   ├─ 舵机问题                                           │
│   │  ├─ 供电不足                                        │
│   │  ├─ 舵机损坏                                        │
│   │  └─ ID 配置错误                                     │
│   │                                                         │
│   └─ 机械问题                                           │
│      ├─ 肌腱断裂                                        │
│      ├─ 关节卡住                                        │
│      └─ 滑轮脱落                                        │
│                                                         │
│   运动不平滑                                             │
│   ├─ 控制频率不当                                       │
│   ├─ 命令间隔不均匀                                     │
│   └─ 肌腱张力问题                                       │
│                                                         │
│   位置不准确                                             │
│   ├─ 端点配置错误                                       │
│   ├─ 肌腱打滑                                           │
│   └─ 负载过大                                           │
│                                                         │
│   抖动/振荡                                             │
│   ├─ 肌腱太松                                           │
│   ├─ PID 参数不当                                       │
│   └─ 控制信号干扰                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 问题 1：手指完全不动

### 诊断流程

\`\`\`
检查顺序（按优先级）：

1. 供电检查
   └─→ 5V 3A 电源是否连接？
   └─→ 电源开关是否打开？

2. 连接检查
   └─→ 舵机总线是否连接？
   └─→ 尝试单独测试一个舵机

3. 机械检查
   └─→ 手动弯曲手指是否有阻力？
   └─→ 肌腱是否可见断裂？

4. 舵机检查
   └─→ 听是否有嗡嗡声（供电但卡住）
   └─→ 闻是否有焦味（可能损坏）
\`\`\`

### 具体诊断

**诊断：手动测试**

\`\`\`
方法：
1. 断开舵机电源（或关闭总电源）
2. 手动弯曲手指
3. 感受阻力

结果分析：
- 有阻力 → 机械正常，问题在舵机/控制
- 无阻力 → 肌腱可能断裂或脱落
- 卡顿感 → 关节或滑轮问题
\`\`\`

**诊断：听舵机声音**

\`\`\`
正常声音：
- 通电时：轻微的嗡嗡声（~1秒）
- 运动时：电机运转声
- 到位后：安静

异常声音：
- 持续的滋滋声 → 可能堵转
- 咔嗒声 → 齿轮打滑
- 完全安静 → 舵机未通电或损坏
\`\`\`

### 解决方案

| 症状 | 可能原因 | 解决方案 |
|------|----------|----------|
| 手动弯曲无阻力 | 肌腱断裂/脱落 | 重新穿引肌腱 |
| 通电后舵机嗡嗡响但不动 | 堵转或负载过大 | 检查机械干涉 |
| 通电后完全安静 | 供电或舵机损坏 | 检查供电/更换舵机 |
| 部分手指不动 | 总线连接问题 | 检查接线 |

---

## 问题 2：运动不平滑

### 原因分析

\`\`\`
不平滑的可能原因：

1. 控制频率问题
   - 频率太低 → 步进运动
   - 频率太高 → 命令堆积

2. 命令间隔不均匀
   - 使用 sleep() 导致间隔不稳定
   - 计算导致的延迟

3. 肌腱问题
   - 张力不均匀
   - 滑轮摩擦

4. 目标位置变化过大
   - 跳跃式命令
\`\`\`

### 诊断方法

**方法：记录运动轨迹**

\`\`\`python
# motion_logger.py
from aero_open_sdk import AeroHand
import time

hand = AeroHand()
hand.home()

# 记录位置变化
positions = []

for i in range(100):
    hand.set_joint_positions([50]*7)
    current = hand.get_joint_positions()
    positions.append(current)
    time.sleep(0.05)  # 固定间隔

# 分析
import numpy as np
positions = np.array(positions)

for i in range(7):
    diffs = np.diff(positions[:, i])
    print(f"关节 {i}: 平均变化={diffs.mean():.2f}, 标准差={diffs.std():.2f}")

# 标准差大 = 运动不平滑
\`\`\`

### 解决方案

**方案 1：增加控制频率**

\`\`\`python
# 优化前
for pos in target_positions:
    hand.set_joint_positions(pos)
    time.sleep(0.1)  # 10Hz

# 优化后
for pos in target_positions:
    hand.set_joint_positions(pos)
    time.sleep(0.02)  # 50Hz
\`\`\`

**方案 2：使用定时器**

\`\`\`python
import threading
import time

class PeriodicController:
    def __init__(self, hand, period=0.05):
        self.hand = hand
        self.period = period
        self.running = False
        self.target = [0]*7

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._loop)
        self.thread.start()

    def _loop(self):
        last_time = time.perf_counter()
        while self.running:
            current_time = time.perf_counter()
            elapsed = current_time - last_time

            if elapsed >= self.period:
                self.hand.set_joint_positions(self.target)
                last_time = current_time

            time.sleep(0.001)  # 避免忙等待

    def set_target(self, target):
        self.target = target

    def stop(self):
        self.running = False
\`\`\`

**方案 3：平滑轨迹插值**

\`\`\`python
import numpy as np

def smooth_interpolation(start, end, steps=50):
    """生成平滑轨迹"""
    t = np.linspace(0, np.pi, steps)
    # 余弦插值
    trajectory = start + (end - start) * (1 - np.cos(t)) / 2
    return trajectory

# 使用
hand = AeroHand()

start = [0, 0, 0, 0, 0, 0, 0]
end = [100, 100, 100, 100, 100, 100, 0]

for pos in smooth_interpolation(start, end, steps=50):
    hand.set_joint_positions(pos)
    time.sleep(0.03)
\`\`\`

---

## 问题 3：位置不准确

### 原因分析

\`\`\`
位置误差来源：

1. 端点配置错误
   - extend_count / grasp_count 不准确
   - 每个舵机配置不同

2. 机械问题
   - 肌腱打滑
   - 关节松动
   - 负载变化

3. 通信问题
   - 命令丢失
   - 校验错误

4. 物理特性
   - 温度漂移
   - 弹性变形
\`\`\`

### 诊断方法

**方法：校准测试**

\`\`\`python
# calibration_test.py
from aero_open_sdk import AeroHand
import time

hand = AeroHand()

print("校准测试...")
print("=" * 50)

for target in [0, 25, 50, 75, 100]:
    print(f"\\n目标位置: {target}%")

    hand.set_joint_positions([target]*7)
    time.sleep(1.5)  # 等待稳定

    actual = hand.get_joint_positions()
    error = [abs(t - a) for t, a in zip([target]*7, actual)]

    print(f"实际位置: {actual}")
    print(f"误差: {error}")

print("=" * 50)
\`\`\`

### 解决方案

**方案 1：重新配置端点**

\`\`\`python
# 手动配置端点
hand = AeroHand()

# 获取当前配置
print(f"当前 grasp_count: {hand.servos[0].grasp_count}")
print(f"当前 extend_count: {hand.servos[0].extend_count}")

# 修改配置
hand.servos[0].grasp_count = 3500  # 闭合端点
hand.servos[0].extend_count = 500  # 张开端点

# 保存到 EEPROM
hand.save_configuration()
\`\`\`

**方案 2：添加误差补偿**

\`\`\`python
class CalibratedHand:
    """带误差补偿的手控制"""

    def __init__(self, hand):
        self.hand = hand
        # 校准偏移量（通过测试获得）
        self.calibration = {
            0: -2,  # 关节 0 偏移 -2%
            1: 1,   # 关节 1 偏移 +1%
            # ...
        }

    def set_joint_positions(self, positions):
        calibrated = [
            pos + self.calibration.get(i, 0)
            for i, pos in enumerate(positions)
        ]
        # 限制范围
        calibrated = [max(0, min(100, p)) for p in calibrated]
        self.hand.set_joint_positions(calibrated)
\`\`\`

---

## 问题 4：抖动和振荡

### 原因分析

\`\`\`
抖动的原因：

1. 控制信号问题
   - 肌腱太松
   - 控制信号干扰
   - 电源噪声

2. PID 参数问题
   - P 太大 → 振荡
   - I 太大 → 积分饱和
   - D 太小 → 阻尼不足

3. 机械问题
   - 关节摩擦不均匀
   - 滑轮不平衡
\`\`\`

### 诊断方法

**方法：观察抖动模式**

\`\`\`
抖动类型分析：

1. 高频微抖动（~数Hz）
   → 通常是控制信号问题或肌腱过松

2. 低频大幅度振荡（~1Hz）
   → PID 参数不当

3. 不规则抖动
   → 可能是机械干涉或障碍物
\`\`\`

### 解决方案

**方案 1：调整肌腱张力**

\`\`\`
检查方法：
- 手指自然下垂时应该微弯
- 太快回弹 → 张力过大
- 缓慢下落 → 张力过松

调整：
1. 找到肌腱调整点
2. 增加/减少预紧力
3. 重新测试
\`\`\`

**方案 2：添加低通滤波**

\`\`\`python
class FilteredHand:
    """带滤波的手控制"""

    def __init__(self, hand, alpha=0.7):
        self.hand = hand
        self.alpha = alpha  # 滤波系数 (0-1)
        self.last_positions = None

    def set_joint_positions(self, positions):
        if self.last_positions is None:
            self.last_positions = positions
        else:
            # 指数移动平均
            filtered = [
                self.alpha * new + (1 - self.alpha) * old
                for new, old in zip(positions, self.last_positions)
            ]
            self.last_positions = filtered
            self.hand.set_joint_positions(filtered)
\`\`\`

**方案 3：降低控制增益**

\`\`\`python
class SoftHand:
    """软控制模式 - 减少抖动"""

    def __init__(self, hand):
        self.hand = hand
        self.gain = 0.5  # 降低增益

    def set_joint_positions(self, target):
        current = self.hand.get_joint_positions()

        # 渐进式移动
        new_positions = [
            curr + self.gain * (tgt - curr)
            for curr, tgt in zip(current, target)
        ]

        self.hand.set_joint_positions(new_positions)
\`\`\`
        `
      },
      {
        id: 'sim2real-issues',
        title: 'Sim2Real 问题排查',
        summary: '仿真到实物转移过程中的常见问题，包括域差距、性能调优等。',
        tags: ['Sim2Real', '仿真', 'RL'],
        content: `
## Sim2Real 问题概览

\`\`\`
Sim2Real 挑战分类：

┌─────────────────────────────────────────────────────────┐
│                 Sim2Real 问题地图                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   域差距 (Domain Gap)                                   │
│   ├─ 物理参数差异                                       │
│   │  ├─ 质量/惯性                                       │
│   │  ├─ 摩擦系数                                        │
│   │  ├─ 关节阻尼                                        │
│   │  └─ 肌腱刚度                                        │
│   │                                                         │
│   └─ 观测差异                                           │
│      ├─ 传感器噪声                                      │
│      ├─ 延迟差异                                        │
│      └─ 视角/光照                                       │
│                                                         │
│   性能差距                                              │
│   ├─ 训练成功率高，部署成功率低                         │
│   ├─ 仿真动作流畅，真实动作抖动                         │
│   └─ 位置精度差                                         │
│                                                         │
│   训练问题                                              │
│   ├─ 训练不收敛                                        │
│   ├─ 策略崩溃                                           │
│   └─ 奖励异常                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 问题 1：训练不收敛

### 症状

\`\`\`
现象：
- 奖励曲线平坦
- 损失不下降
- 策略不学习

可能原因：
1. 奖励函数设计不当
2. 动作/观测空间错误
3. 学习率问题
4. 环境随机化不足
\`\`\`

### 诊断方法

**方法：检查奖励曲线**

\`\`\`python
# 监控训练
import wandb

wandb.init(project="aero-hand")

for iteration in range(num_iterations):
    # 训练...
    reward = evaluate(env, policy)

    wandb.log({
        "iteration": iteration,
        "reward": reward,
        "policy_loss": loss,
        "entropy": entropy,
    })

# 查看 wandb 仪表板
# 正常曲线应该是上升的
\`\`\`

**方法：验证环境**

\`\`\`python
# test_env.py
env = AeroGraspEnv()

# 测试随机动作
obs, _ = env.reset()
for _ in range(100):
    action = env.action_space.sample()  # 随机动作
    obs, reward, done, _, info = env.step(action)

    print(f"Reward: {reward:.3f}, Done: {done}")

    if done:
        obs, _ = env.reset()

# 检查奖励是否合理
# 随机动作应该得到接近0的奖励
\`\`\`

### 解决方案

**方案 1：检查奖励函数**

\`\`\`python
# 奖励函数设计原则：
# 1. 有梯度的奖励（稀疏奖励难以学习）
# 2. 有界的奖励（避免数值爆炸）
# 3. 合理的缩放

# 好的奖励函数示例：
def compute_reward(self):
    reward = 0.0

    # 进度奖励（强）
    progress = self.target_angle - self.current_angle
    reward += -progress * 0.1

    # 接触奖励（中）
    if self.check_contact():
        reward += 0.5

    # 成功奖励（强但稀疏）
    if abs(progress) < 0.1:
        reward += 10.0

    # 动作惩罚（弱）
    reward -= 0.01 * np.sum(np.square(self.action))

    return reward
\`\`\`

**方案 2：调整学习率**

\`\`\`python
# 学习率调度
config = {
    "learning_rate": 3e-4,      # 初始学习率
    "lr_decay": 0.98,           # 每轮衰减
    "min_lr": 1e-5,             # 最低学习率
}

# 或使用 warmup
def lr_lambda(step):
    if step < 1000:
        return step / 1000  # 线性 warmup
    return 1.0  # 恒定
\`\`\`

---

## 问题 2：Sim2Real 性能差距

### 症状

\`\`\`
现象：
- 仿真中成功率 90%+
- 真实部署成功率 < 50%
- 动作在仿真中流畅，真实中抖动

可能原因：
1. 物理参数不匹配
2. 执行延迟差异
3. 观测噪声差异
4. 控制频率差异
\`\`\`

### 诊断方法

**方法：比较响应曲线**

\`\`\`python
# sim_vs_real.py
import numpy as np
import matplotlib.pyplot as plt

# 仿真响应
sim_time = []
sim_positions = []

# 真实响应
real_time = []
real_positions = []

# 施加相同动作，观察响应差异
test_action = [50, 50, 50, 50, 50, 50, 50]

# 仿真中
for t in range(100):
    sim_positions.append(get_sim_position(t))
    sim_time.append(t * 0.05)

# 真实中
for t in range(100):
    real_positions.append(get_real_position(t))
    real_time.append(t * 0.05)

# 绘图比较
plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
plt.plot(sim_time, sim_positions, label='Simulation')
plt.plot(real_time, real_positions, label='Real')
plt.xlabel('Time (s)')
plt.ylabel('Position (%)')
plt.legend()
plt.title('Response Comparison')

plt.subplot(1, 2, 2)
gap = np.array(sim_positions) - np.array(real_positions)
plt.plot(sim_time, gap)
plt.xlabel('Time (s)')
plt.ylabel('Error')
plt.title('Sim2Real Gap')
plt.show()

print(f"Average gap: {np.mean(np.abs(gap)):.2f}")
\`\`\`

### 解决方案

**方案 1：域随机化**

\`\`\`python
# domain_randomization.py
class RandomizableEnv:
    def __init__(self):
        self.base_params = {
            "tendon_stiffness": 1000.0,
            "joint_damping": 0.1,
            "friction": 0.8,
        }

    def randomize(self):
        """随机化物理参数"""
        self.tendon_stiffness = self.base_params["tendon_stiffness"] * np.random.uniform(0.8, 1.2)
        self.joint_damping = self.base_params["joint_damping"] * np.random.uniform(0.5, 1.5)
        self.friction = self.base_params["friction"] * np.random.uniform(0.7, 1.3)

    def reset(self):
        self.randomize()  # 每次重置时随机化
        return self._get_obs()
\`\`\`

**方案 2：系统辨识**

\`\`\`python
# system_identification.py
"""
步骤：
1. 在仿真中对每个参数进行扫描
2. 在真实硬件上进行相同测试
3. 找到使两者匹配的参数

参数扫描范围：
- tendon_stiffness: [500, 2000]
- joint_damping: [0.01, 1.0]
- actuator_delay: [0.001, 0.1]  # 秒
- sensor_noise: [0.0, 0.1]
"""

# 使用优化算法找到最佳参数
from scipy.optimize import minimize

def objective(params):
    stiffness, damping, delay = params

    # 仿真响应
    sim_response = simulate(stiffness, damping, delay)

    # 真实响应
    real_response = get_real_response()

    # 计算误差
    error = np.sum((sim_response - real_response) ** 2)
    return error

# 优化
result = minimize(
    objective,
    x0=[1000, 0.1, 0.02],
    bounds=[(500, 2000), (0.01, 1.0), (0.001, 0.1)],
    method='L-BFGS-B'
)

print(f"Best params: {result.x}")
\`\`\`

**方案 3：延迟补偿**

\`\`\`python
# latency_compensation.py
class LatencyCompensatedController:
    def __init__(self, hand, latency=0.05):
        self.hand = hand
        self.latency = latency  # 估计的延迟（秒）
        self.position_buffer = []
        self.time_buffer = []

    def predict_position(self):
        """预测延迟后的位置"""
        if len(self.position_buffer) < 3:
            return self.position_buffer[-1] if self.position_buffer else [50]*7

        # 线性外推
        dt = self.time_buffer[-1] - self.time_buffer[-2]
        vel = (self.position_buffer[-1] - self.position_buffer[-2]) / dt

        # 预测
        predicted = self.position_buffer[-1] + vel * self.latency
        return predicted.tolist()

    def set_joint_positions(self, target):
        self.position_buffer.append(target)
        self.time_buffer.append(time.time())

        # 使用预测位置
        predicted = self.predict_position()
        self.hand.set_joint_positions(predicted)
\`\`\`

---

## 问题 3：策略崩溃

### 症状

\`\`\`
现象：
- 训练中途策略突然变差
- 损失突然爆炸
- 动作值超出范围

可能原因：
1. 学习率过大
2. 梯度爆炸
3. 经验回放缓冲区问题
4. 奖励函数问题
\`\`\`

### 诊断方法

**方法：监控梯度**

\`\`\`python
# 梯度监控
for batch in dataloader:
    loss = compute_loss(batch)

    # 反向传播
    loss.backward()

    # 检查梯度
    total_norm = 0
    for p in model.parameters():
        if p.grad is not None:
            param_norm = p.grad.data.norm(2)
            total_norm += param_norm.item() ** 2
    total_norm = total_norm ** 0.5

    print(f"Gradient norm: {total_norm:.2f}")

    if total_norm > 10.0:  # 阈值
        print("WARNING: Gradient explosion!")

    optimizer.step()
    optimizer.zero_grad()
\`\`\`

### 解决方案

**方案 1：梯度裁剪**

\`\`\`python
# PPO 中的梯度裁剪
config = {
    "max_grad_norm": 0.5,  # 梯度裁剪阈值
}

# 训练循环中
for batch in dataloader:
    loss = compute_loss(batch)
    loss.backward()

    # 裁剪梯度
    torch.nn.utils.clip_grad_norm_(
        model.parameters(),
        max_norm=config["max_grad_norm"]
    )

    optimizer.step()
    optimizer.zero_grad()
\`\`\`

**方案 2：学习率衰减**

\`\`\`python
# 学习率调度器
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode='min',
    factor=0.5,
    patience=10,
    min_lr=1e-6
)

# 或使用余弦退火
scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(
    optimizer,
    T_0=1000,
    T_mult=2
)
\`\`\`

**方案 3：奖励裁剪**

\`\`\`python
# 奖励裁剪
def compute_reward(self):
    reward = self._compute_raw_reward()

    # 裁剪奖励
    reward = np.clip(reward, -10.0, 10.0)

    return reward
\`\`\`
        `
      }
    ]
  },
  // ========== 性能调优实战 ==========
  {
    id: 'performanceTuning',
    title: '性能调优',
    icon: 'DataAnalysis',
    description: '系统性能优化实战指南，包括控制优化、仿真加速和资源利用',
    articles: [
      {
        id: 'control-optimization',
        title: '控制性能优化',
        summary: '提升舵机控制响应速度和控制精度的实用技巧。',
        tags: ['控制', '优化', '舵机'],
        content: `
## 控制性能优化概述

\`\`\`
优化目标：
├─ 响应速度：命令到运动的时间
├─ 控制精度：实际位置与目标位置的误差
├─ 运动平滑度：加速度/加加速度
└─ 稳定性：抗干扰能力

典型瓶颈：
1. 通信延迟 (~1ms)
2. 舵机响应时间 (~20-50ms)
3. 机械惯性
4. 控制频率不足
\`\`\`

---

## 优化 1：批量命令

### 问题背景

\`\`\`
默认情况下，我们逐个发送舵机命令：

# 低效方式
for i in range(7):
    hand.set_joint_position(i, positions[i])
    time.sleep(0.01)

问题：
- 每舵机 ~1ms 通信时间
- 总共 ~7ms（可以合并）
- 控制不同步
\`\`\`

### 优化实现

\`\`\`python
# 高效方式：一次性发送所有位置
hand.set_joint_positions(positions)  # 一次发送
time.sleep(0.05)  # 等待响应

# 通信时间对比：
# 逐个发送：7舵机 × 1ms = 7ms
# 批量发送：1次 × 1ms = 1ms
# 效率提升：7倍
\`\`\`

### 批量命令协议

\`\`\`
批量命令帧格式：

字节： 0     1      2-13          14      15
       │     │      │             │       │
       ▼     ▼      ▼             ▼       ▼
    ┌─────┬────┬─────────────┬────────┬────┐
    │0x7E │0x01│D0 D1...D11 │ CHECK  │0x7E│
    └─────┴────┴─────────────┴────────┴────┘

D0-D1: 舵机0位置 (ID + 16位位置)
D2-D3: 舵机1位置
D4-D5: 舵机2位置
D6-D7: 舵机3位置
D8-D9: 舵机4位置
D10-D11: 舵机5位置

优势：
- 一次通信控制所有舵机
- 确保同步性
- 减少总线冲突
\`\`\`

---

## 优化 2：预测控制

### 原理

\`\`\`
预测控制原理：

基于历史数据预测未来状态，提前发出命令

时间线：
─────────────────────────────────────────────────────→
        │                │                │
     当前时刻         预测时刻         目标时刻
        │                │                │
        ▼                ▼                ▼
     读取位置 ───→ 预测位置 ───→ 发送命令
     (延迟)        (提前)         (补偿)

优势：
- 补偿固有的通信延迟
- 减少跟踪误差
\`\`\`

### 实现代码

\`\`\`python
class PredictiveController:
    def __init__(self, hand, horizon=2):
        self.hand = hand
        self.horizon = horizon  # 预测步数
        self.history = []

    def update(self, target_positions):
        # 记录历史
        current = self.hand.get_joint_positions()
        self.history.append(current)

        if len(self.history) > 10:
            self.history.pop(0)

        # 计算速度和加速度
        if len(self.history) >= 3:
            vel = (self.history[-1] - self.history[-2])
            acc = (self.history[-1] - 2*self.history[-2] + self.history[-3])

            # 预测
            predicted = [
                curr + v * self.horizon + 0.5 * a * self.horizon**2
                for curr, v, a in zip(self.history[-1], vel, acc)
            ]

            # 限制范围
            predicted = [max(0, min(100, p)) for p in predicted]
        else:
            predicted = target_positions

        # 组合目标与预测
        alpha = 0.5  # 预测权重
        command = [
            alpha * t + (1 - alpha) * p
            for t, p in zip(target_positions, predicted)
        ]

        self.hand.set_joint_positions(command)
\`\`\`

---

## 优化 3：自适应控制

### 原理

\`\`\`
自适应控制：根据负载动态调整控制参数

场景：
- 空载时：响应快，刚度低
- 重载时：响应慢，刚度高

优势：
- 节能
- 减少机械磨损
- 适应不同任务
\`\`\`

### 实现代码

\`\`\`python
class AdaptiveController:
    def __init__(self, hand):
        self.hand = hand
        self.load_history = []
        self.gain = 1.0

    def update(self, target_positions):
        # 读取当前负载
        loads = self.hand.get_joint_loads()
        self.load_history.append(loads)

        if len(self.load_history) > 10:
            self.load_history.pop(0)

        # 计算平均负载
        avg_load = np.mean(self.load_history, axis=0)

        # 动态调整增益
        # 负载大时减小增益（避免过冲）
        # 负载小时增大增益（提高响应）
        self.gain = np.clip(1.0 - avg_load / 2000, 0.3, 1.0)

        # 获取当前位置
        current = self.hand.get_joint_positions()

        # 渐进式移动
        command = [
            curr + self.gain * (tgt - curr)
            for curr, tgt in zip(current, target_positions)
        ]

        self.hand.set_joint_positions(command)

# 使用
controller = AdaptiveController(hand)

for target in targets:
    controller.update(target)
    time.sleep(0.05)
\`\`\`

---

## 优化 4：平滑轨迹

### 轨迹类型

\`\`\`
轨迹类型对比：

1. 线性轨迹（最常用）
   - 简单实现
   - 速度恒定
   - 加速度不连续（冲击）

2. 余弦轨迹
   - 平滑起止
   - 速度连续
   - 加速度连续

3. 多项式轨迹
   - 最平滑
   - 可控制速度和加速度
   - 计算复杂

4. 梯形速度轨迹
   - 有匀速段
   - 启停平滑
   - 适合长距离运动
\`\`\`

### 实现代码

\`\`\`python
import numpy as np

class TrajectoryGenerator:
    """轨迹生成器"""

    @staticmethod
    def linear(start, end, steps):
        """线性轨迹"""
        t = np.linspace(0, 1, steps)
        trajectory = [start + (end - start) * tt for tt in t]
        return trajectory

    @staticmethod
    def cosine(start, end, steps):
        """余弦轨迹"""
        t = np.linspace(0, np.pi, steps)
        trajectory = [start + (end - start) * (1 - np.cos(tt)) / 2 for tt in t]
        return trajectory

    @staticmethod
    def trapezoidal(start, end, steps, ramp_ratio=0.2):
        """梯形速度轨迹"""
        # ramp_ratio: 加速/减速段占总时间的比例
        ramp_steps = int(steps * ramp_ratio)
        cruise_steps = steps - 2 * ramp_steps

        trajectory = []

        # 加速段（线性）
        for i in range(ramp_steps):
            t = i / ramp_steps
            pos = start + (end - start) * t * ramp_ratio
            trajectory.append(pos)

        # 匀速段
        for i in range(cruise_steps):
            t = ramp_ratio + (1 - 2 * ramp_ratio) * i / cruise_steps
            pos = start + (end - start) * t
            trajectory.append(pos)

        # 减速段（线性）
        for i in range(ramp_steps):
            t = (ramp_steps - i) / ramp_steps
            pos = start + (end - start) * (1 - (1 - t) * ramp_ratio)
            trajectory.append(pos)

        return trajectory

# 使用
gen = TrajectoryGenerator()

start = [0, 0, 0, 0, 0, 0, 0]
end = [100, 100, 100, 100, 100, 100, 0]

# 生成轨迹
trajectory = TrajectoryGenerator.cosine(start, end, steps=100)

# 执行
for pos in trajectory:
    hand.set_joint_positions(pos)
    time.sleep(0.02)
\`\`\`

---

## 优化 5：通信压缩

### 原理

\`\`\`
通信压缩策略：

1. 增量更新
   - 只发送变化的舵机
   - 减少数据量

2. 阈值过滤
   - 变化小于阈值时不发送
   - 减少不必要的通信

3. 预测+校正
   - 发送预测值
   - 接收端校正误差
\`\`\`

### 实现代码

\`\`\`python
class CompressedController:
    def __init__(self, hand, threshold=2.0):
        self.hand = hand
        self.threshold = threshold  # 变化阈值 (%)
        self.last_sent = None

    def update(self, target_positions):
        if self.last_sent is None:
            self.last_sent = target_positions
            self.hand.set_joint_positions(target_positions)
            return

        # 找出需要更新的舵机
        to_update = []
        for i, (curr, target) in enumerate(zip(self.last_sent, target_positions)):
            if abs(target - curr) >= self.threshold:
                to_update.append((i, target))

        # 如果有变化
        if to_update:
            # 构建增量命令
            new_positions = self.last_sent.copy()
            for i, pos in to_update:
                new_positions[i] = pos

            # 发送
            self.hand.set_joint_positions(new_positions)
            self.last_sent = new_positions

# 使用
controller = CompressedController(hand, threshold=1.0)

for target in smooth_targets:
    controller.update(target)
    time.sleep(0.02)
\`\`\`

---

## 性能对比

| 优化方法 | 响应速度 | 平滑度 | 实现复杂度 | 适用场景 |
|----------|----------|--------|------------|----------|
| 批量命令 | +++ | - | 低 | 通用 |
| 预测控制 | ++ | ++ | 中 | 低延迟要求 |
| 自适应控制 | + | +++ | 中 | 变负载任务 |
| 平滑轨迹 | - | +++ | 低 | 精细操作 |
| 通信压缩 | + | + | 中 | 资源受限场景 |

+++ 显著提升  ++ 中等提升  + 略有提升  - 无变化
        `
      },
      {
        id: 'simulation-optimization',
        title: '仿真性能优化',
        summary: 'MuJoCo 仿真环境配置优化、训练加速和资源利用最佳实践。',
        tags: ['仿真', 'MuJoCo', '优化'],
        content: `
## 仿真性能优化概述

\`\`\`
仿真性能瓶颈分析：

┌─────────────────────────────────────────────────────────┐
│                   计算时间分布                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Physics step (MuJoCo)           ████████████   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ JAX/NumPy computation           ██████           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Data transfer (CPU↔GPU)         ████            │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ I/O (checkpoint, logging)        ██              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  优化策略：                                             │
│  1. 减少物理步数（ timestep↑）                         │
│  2. JIT 编译加速计算                                    │
│  3. 批量处理减少传输                                   │
│  4. 异步 I/O                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 优化 1：MuJoCo 配置

### 时间步调整

\`\`\`xml
<!-- aero_hand.xml -->

<mujoco model="aero_hand">
    <!-- 默认 timestep=0.002 -->
    <!-- 可增大到 0.005-0.01 减少计算量 -->

    <option timestep="0.005"
            iterations="20"
            ls_iterations="5">
        <!-- 约束求解迭代 -->
        <!-- 减少迭代次数（在不严重影响精度时） -->

        <flag energy="disable"
              fwdinv="disable"
              sensornoise="disable"/>
        <!-- 禁用不必要的计算 -->
    </option>
</mujoco>
\`\`\`

### 几何简化

\`\`\`xml
<!-- 简化碰撞检测 -->

<option>
    <flag contact="enable"/>
</option>

<!-- 对于抓取任务，可以使用简化的碰撞几何 -->
<worldbody>
    <geom type="box" size="0.1 0.1 0.1"  <!-- 使用盒子替代复杂网格 -->
          friction="1 0.1 0.1"/>
</worldbody>
\`\`\`

---

## 优化 2：MJX 加速

### JIT 预热

\`\`\`python
import jax
import jax.numpy as jnp

# 预热 JIT 编译
# 第一次调用会触发编译，后续调用会使用缓存

def step_fn(state, action):
    # 仿真步进
    data = step(state, action)
    return data

# 预热
_ = step_fn(initial_state, random_action)

# 实际使用 - 会很快
for _ in range(1000):
    state = step_fn(state, action)
\`\`\`

### 批量并行

\`\`\`python
# 利用 JAX 的 vmap 进行批量并行

from jax import vmap

# 单个环境
def env_step(state, action):
    return step_fn(state, action)

# 批量环境
num_envs = 1024
batched_env_step = vmap(env_step, in_axes=(0, 0))

# 一次性计算所有环境
states = batched_env_step(states, actions)
\`\`\`

---

## 优化 3：并行环境配置

### 环境数量选择

\`\`\`
环境数量选择指南：

GPU 内存估算：
- 每个环境 ≈ 10-20MB（取决于状态维度）
- 策略网络 ≈ 50MB
- 总计 ≈ 10GB for 512 envs

选择建议：
- 8GB GPU: num_envs=256-512
- 16GB GPU: num_envs=512-1024
- 24GB GPU: num_envs=1024-2048

注意：实际需求可能因任务复杂度而异
\`\`\`

### 配置示例

\`\`\`python
# training_config.py
config = {
    # 并行环境数
    "num_envs": 1024,

    # 训练步数
    "num_train_steps": 10_000_000,

    # 批量大小
    "batch_size": 2048,

    # Epoch 数
    "ppo_epochs": 8,

    # 学习率
    "learning_rate": 3e-4,

    # 评估间隔
    "eval_interval": 10000,
    "eval_episodes": 100,
}
\`\`\`

---

## 优化 4：检查点策略

### 异步保存

\`\`\`python
import orbax.checkpoint as ocp
import asyncio

# 创建检查点管理器
checkpoint_manager = ocp.CheckpointManager(
    '/path/to/checkpoints',
    ocp.PyTreeCheckpointer(),
    create=True,
    # 异步操作
    options={
        "save_interval": 100000,  # 每10万步保存一次
    }
)

# 训练循环
for step in range(10_000_000):
    # 训练...
    train_step()

    # 定期评估
    if step % 10000 == 0:
        reward = evaluate()
        metrics = {"reward": reward}

        # 异步保存（不阻塞训练）
        checkpoint_manager.save(step, metrics)
\`\`\`

### 增量保存

\`\`\`python
# 只保存必要的部分，减少保存时间

def save_incremental(checkpoint_manager, step, policy, optimizer):
    """增量保存策略"""
    # 只保存参数，不保存优化器状态（可以重置）
    params = policy.params

    # 使用异步保存
    checkpoint_manager.save(
        step,
        {"params": params}
    )
\`\`\`

---

## 优化 5：GPU 利用

### 内存管理

\`\`\`python
# 清理未使用的内存
import jax

# 在循环中定期清理
for iteration in range(1000):
    # 训练...

    # 每100次迭代清理一次
    if iteration % 100 == 0:
        # 触发垃圾回收
        jax.clear_caches()

# 或使用 reset 释放内存
jax.random.normal(jax.random.PRNGKey(0), (1000, 1000))
del _  # 删除引用
\`\`\`

### 混合精度

\`\`\`python
# 使用 float32 加速
from jax import numpy as jnp

# 创建模型时指定精度
params = {
    "w1": jnp.zeros((256, 128), dtype=jnp.float32),
    "b1": jnp.zeros((128,), dtype=jnp.float32),
}

# JAX 会自动使用硬件加速（如 TensorCore）
# 不需要手动指定 float16
\`\`\`

---

## 性能监控

### 训练监控

\`\`\`python
# 使用 wandb 监控性能
import wandb

wandb.init(project="aero-hand", name="optimized-run")

for iteration in range(num_iterations):
    # 训练
    t0 = time.time()
    train_step()
    train_time = time.time() - t0

    # 评估
    if iteration % eval_interval == 0:
        t1 = time.time()
        reward = evaluate()
        eval_time = time.time() - t1

        wandb.log({
            "iteration": iteration,
            "train_time": train_time,
            "eval_time": eval_time,
            "reward": reward,
            "steps_per_second": num_envs * episode_length / train_time,
        })
\`\`\`

### 瓶颈分析

\`\`\`python
# 性能分析
import cProfile
import pstats

pr = cProfile.Profile()
pr.enable()

# 运行训练
train()

pr.disable()

# 输出统计
stats = pstats.Stats(pr)
stats.sort_stats('cumulative')
stats.print_stats(20)  # 显示前20个最耗时的函数
\`\`\`

---

## 优化效果对比

| 优化项 | 预期加速 | 注意事项 |
|--------|----------|----------|
| timestep 0.002→0.005 | 2-3x | 可能影响精度 |
| 约束迭代 50→20 | 2x | 可能不稳定 |
| JIT 预热 | 10-50x | 首次编译慢 |
| 批量环境 512→1024 | 2x | 需要更多内存 |
| 异步检查点 | 1.1-1.2x | 不影响训练 |
| float32 (默认) | 2x vs float64 | 精度损失可接受 |

---

## 实用配置模板

\`\`\`python
# optimized_config.py

# MuJoCo 配置
MUJOCO_CONFIG = {
    "timestep": 0.005,
    "iterations": 20,
    "ls_iterations": 5,
}

# 训练配置
TRAINING_CONFIG = {
    "num_envs": 1024,
    "batch_size": 2048,
    "ppo_epochs": 8,
    "learning_rate": 3e-4,
    "num_train_steps": 10_000_000,
    "save_interval": 100000,
    "eval_interval": 10000,
}

# 资源利用
RESOURCE_CONFIG = {
    "num_envs_per_core": 64,  # 每个 CPU 核的环境数
    "preallocate_memory": True,
    "use_float32": True,
}
\`\`\`
        `
      },
      {
        id: 'system-optimization',
        title: '系统资源调优',
        summary: '整体系统资源管理，包括内存、CPU 和 IO 优化。',
        tags: ['系统', '资源', '优化'],
        content: `
## 系统资源调优概述

\`\`\`
资源调优层次：

┌─────────────────────────────────────────────────────────┐
│                    系统资源层次                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   应用层                                                │
│   ├─ Python 对象 / JAX 数组                             │
│   ├─ 训练循环 / 数据处理                                 │
│   └─ 策略推理                                           │
│                                                         │
│   ─────────────────────────────────────────────        │
│                                                         │
│   运行时                                                │
│   ├─ Python GC                                          │
│   ├─ JAX 内存管理                                       │
│   └─ 操作系统调度                                        │
│                                                         │
│   ─────────────────────────────────────────────        │
│                                                         │
│   硬件层                                                │
│   ├─ CPU 缓存                                          │
│   ├─ GPU 内存                                          │
│   └─ 磁盘 IO                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘

调优原则：
1. 减少不必要的数据复制
2. 预分配内存，避免运行时分配
3. 批量处理，减少函数调用开销
4. 异步 IO，不阻塞计算
\`\`\`

---

## 优化 1：内存管理

### JAX 内存

\`\`\`python
# JAX 内存配置
import jax

# 设置 JAX 内存 fraction
# 默认使用 90% 的可用内存
os.environ['XLA_PYTHON_CLIENT_MEM_FRACTION'] = '0.8'

# 或使用 preallocate
os.environ['XLA_PYTHON_CLIENT_PREALLOCATE'] = 'true'

# 在代码中强制垃圾回收
import jax
import jax.numpy as jnp

# 训练循环
for iteration in range(1000):
    # ... 训练代码 ...

    # 每100次迭代清理
    if iteration % 100 == 0:
        jax.clear_caches()
\`\`\`

### Python GC 控制

\`\`\`python
import gc

class MemoryOptimizer:
    def __init__(self):
        self.gc_interval = 50

    def step(self, iteration):
        if iteration % self.gc_interval == 0:
            gc.collect()

# 使用
optimizer = MemoryOptimizer()

for iteration in range(10000):
    # 训练代码
    train_step()

    optimizer.step(iteration)
\`\`\`

---

## 优化 2：数据处理

### 预分配缓冲区

\`\`\`python
import numpy as np

class PreallocatedBuffers:
    """预分配数据缓冲区"""

    def __init__(self, num_envs, obs_dim, action_dim):
        self.num_envs = num_envs

        # 预分配
        self.obs_buffer = np.zeros((num_envs, obs_dim), dtype=np.float32)
        self.action_buffer = np.zeros((num_envs, action_dim), dtype=np.float32)
        self.reward_buffer = np.zeros(num_envs, dtype=np.float32)

        # 只在需要时创建新数组
        self.temp_buffer = None

    def update(self, new_obs):
        # 就地更新，避免分配新内存
        np.copyto(self.obs_buffer, new_obs)

    def get_temp(self, shape):
        """获取临时缓冲区"""
        if self.temp_buffer is None or self.temp_buffer.shape != shape:
            self.temp_buffer = np.zeros(shape, dtype=np.float32)
        return self.temp_buffer
\`\`\`

### 批量操作

\`\`\`python
# 批量处理代替循环
import numpy as np

# 低效
positions = []
for i in range(1000):
    pos = compute_position(i)
    positions.append(pos)
positions = np.array(positions)

# 高效
indices = np.arange(1000)
positions = compute_positions_batch(indices)  # 向量化函数
\`\`\`

---

## 优化 3：IO 优化

### 异步日志

\`\`\`python
import asyncio
import json
from queue import Queue
import threading

class AsyncLogger:
    """异步日志记录器"""

    def __init__(self, filename):
        self.filename = filename
        self.queue = Queue()
        self.running = True

        # 后台线程处理 IO
        self.thread = threading.Thread(target=self._writer)
        self.thread.start()

    def log(self, data):
        self.queue.put(data)

    def _writer(self):
        with open(self.filename, 'a') as f:
            while self.running:
                try:
                    data = self.queue.get(timeout=0.1)
                    f.write(json.dumps(data) + '\\n')
                    f.flush()
                except:
                    continue

    def stop(self):
        self.running = False
        self.thread.join()
\`\`\`

### 内存映射文件

\`\`\`python
import numpy as np
import tempfile
import os

class MappedArray:
    """使用内存映射文件存储大数据"""

    def __init__(self, shape, dtype, filename=None):
        if filename is None:
            # 使用临时文件
            self.temp_file = tempfile.NamedTemporaryFile(delete=False)
            filename = self.temp_file.name
        else:
            self.temp_file = None

        self.shape = shape
        self.dtype = dtype

        # 创建内存映射
        self.data = np.memmap(filename, dtype=dtype, mode='w+',
                              shape=shape)

    def __getitem__(self, key):
        return self.data[key]

    def __setitem__(self, key, value):
        self.data[key] = value

    def flush(self):
        self.data.flush()
\`\`\`

---

## 优化 4：CPU 利用

### 多进程数据处理

\`\`\`python
from multiprocessing import Pool, cpu_count
import numpy as np

def process_trajectory(trajectory_data):
    """处理单条轨迹"""
    # CPU 密集型处理
    features = extract_features(trajectory_data)
    return features

# 使用多进程
if __name__ == "__main__":
    num_workers = cpu_count() - 1

    with Pool(num_workers) as pool:
        results = pool.map(process_trajectory, all_trajectories)

    # 结果聚合
    all_features = np.array(results)
\`\`\`

### 缓存优化

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=128)
def compute_expensive(state_tuple):
    """缓存计算结果"""
    # 将 numpy 数组转换为 tuple 以便缓存
    return expensive_computation(state_tuple)

# 使用缓存
for state in states:
    state_key = tuple(state)  # 转换为可哈希类型
    result = compute_expensive(state_key)
\`\`\`

---

## 优化 5：监控工具

### 资源监控

\`\`\`python
import psutil
import time
import threading

class ResourceMonitor:
    """资源监控器"""

    def __init__(self):
        self.running = False
        self.thread = None
        self.samples = []

    def start(self, interval=1.0):
        self.running = True
        self.interval = interval
        self.thread = threading.Thread(target=self._monitor)
        self.thread.start()

    def _monitor(self):
        process = psutil.Process()

        while self.running:
            sample = {
                'time': time.time(),
                'cpu_percent': process.cpu_percent(),
                'memory_mb': process.memory_info().rss / 1024 / 1024,
                'num_threads': process.num_threads(),
            }
            self.samples.append(sample)
            time.sleep(self.interval)

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()

    def report(self):
        import numpy as np
        cpu = [s['cpu_percent'] for s in self.samples]
        mem = [s['memory_mb'] for s in self.samples]

        print(f"CPU: mean={np.mean(cpu):.1f}%, max={np.max(cpu):.1f}%")
        print(f"Memory: mean={np.mean(mem):.1f}MB, max={np.max(mem):.1f}MB")

# 使用
monitor = ResourceMonitor()
monitor.start()

# ... 运行代码 ...

monitor.stop()
monitor.report()
\`\`\`

---

## 综合配置建议

\`\`\`python
# system_config.py

import os

# JAX 配置
os.environ['XLA_PYTHON_CLIENT_MEM_FRACTION'] = '0.8'
os.environ['XLA_FLAGS'] = '--xla_gpu_enable_async_collectives=true'

# Python 配置
import gc
gc.setthreshold(70000, 10000, 10000)  # 调整 GC 阈值

# 训练配置建议
RECOMMENDED_CONFIG = {
    # 并行度
    'num_envs': 1024,
    'num_workers': max(1, os.cpu_count() - 2),

    # 内存
    'preallocate_buffers': True,
    'gc_interval': 50,

    # IO
    'async_logging': True,
    'checkpoint_interval': 100000,

    # 监控
    'enable_monitoring': True,
    'monitor_interval': 10,
}
\`\`\`
        `
      }
    ]
  },
  // ========== 项目案例 ==========
  {
    id: 'projectCases',
    title: '项目案例',
    icon: 'Briefcase',
    description: '完整的项目实现案例，展示从需求到交付的全流程',
    articles: [
      {
        id: 'grasp-project',
        title: '抓取机器人完整实现',
        summary: '从需求分析到 Sim2Real 部署的完整抓取机器人项目。',
        tags: ['抓取', 'Sim2Real', '完整项目'],
        content: `
## 项目概述

\`\`\`
项目目标：实现一个能够抓取随机位置物体的机器人

技术要求：
- 视觉系统检测物体位置
- 灵巧手完成抓取
- 成功率 > 80%
- 抓取时间 < 3 秒

技术路线：
1. 仿真环境搭建
2. 域随机化训练
3. Sim2Real 部署
4. 持续优化
\`\`\`

---

## 阶段 1：需求分析

### 功能需求

\`\`\`
抓取机器人功能列表：

F1: 物体检测
- 使用深度相机获取点云
- 检测物体位置和姿态
- 过滤背景物体

F2: 抓取规划
- 基于视觉信息选择抓取点
- 计算抓取姿态
- 避免碰撞检测

F3: 抓取执行
- 移动到预抓取位置
- 闭合手指
- 验证抓取成功

F4: 放置任务
- 移动到目标位置
- 释放物体
- 返回初始位置
\`\`\`

### 非功能需求

\`\`\`
性能指标：
- 抓取成功率：≥ 85%
- 抓取周期：≤ 3 秒
- 最大物体重量：200g

可靠性：
- 连续运行 100 次无故障
- 故障自动恢复

环境要求：
- 标准室内光照
- 固定相机位置
- 平面工作台
\`\`\`

---

## 阶段 2：仿真环境搭建

### 环境定义

\`\`\`python
# grasp_env.py
import gymnasium as gym
import numpy as np
import mujoco

class GraspingEnv(gym.Env):
    """抓取仿真环境"""

    def __init__(self, xml_path="aero_hand_grasp.xml"):
        super().__init__()

        # 加载模型
        self.model = mujoco.MjSpec.from_file(xml_path).to_model()
        self.data = mujoco.MjData(self.model)

        # 动作空间：7个关节
        self.action_space = gym.spaces.Box(
            low=-1, high=1, shape=(7,), dtype=np.float32
        )

        # 观测空间
        obs_dim = 7 + 3 + 4 + 3  # 关节 + 位置 + 旋转 + 速度
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(obs_dim,), dtype=np.float32
        )

    def reset(self, seed=None):
        super().reset(seed=seed)

        # 随机化物体的位置和姿态
        self._randomize_object()

        # 重置仿真
        mujoco.mj_reset(self.model, self.data)

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
        info = self._get_info()

        return self._get_obs(), reward, done, False, info

    def _compute_reward(self):
        """奖励函数设计"""
        reward = 0.0

        # 1. 接触奖励
        if self._check_contact():
            reward += 0.5

        # 2. 抬起奖励
        object_height = self.data.body("object").xpos[2]
        if object_height > 0.05:
            reward += 1.0

        # 3. 抓取成功
        if self._check_grasp_success():
            reward += 10.0

        # 4. 动作惩罚
        reward -= 0.01 * np.sum(np.square(self.data.ctrl[:7]))

        return reward

    def _check_grasp_success(self):
        """检查抓取成功"""
        # 物体在手掌内且被握住
        object_pos = self.data.body("object").xpos
        palm_pos = self.data.body("palm").xpos
        distance = np.linalg.norm(object_pos - palm_pos)

        finger_closed = np.mean(self.data.ctrl[:4]) > 0.8

        return distance < 0.05 and finger_closed
\`\`\`

### 域随机化配置

\`\`\`python
# domain_randomization.py
class DomainRandomizer:
    """域随机化配置"""

    def __init__(self):
        self.randomization_ranges = {
            # 物理参数
            'tendon_stiffness': (800, 1200),
            'joint_damping': (0.05, 0.2),
            'friction': (0.6, 1.0),

            # 物体属性
            'object_mass': (0.05, 0.15),
            'object_size': (0.03, 0.08),

            # 观测噪声
            'position_noise': (0, 0.01),
            'delay': (0, 0.05),
        }

    def randomize(self, env):
        """应用随机化到环境"""
        for param, (low, high) in self.randomization_ranges.items():
            value = np.random.uniform(low, high)
            setattr(env, param, value)
\`\`\`

---

## 阶段 3：策略训练

### PPO 配置

\`\`\`python
# ppo_config.py
PPO_CONFIG = {
    # 环境
    'env_name': 'GraspingEnv',
    'num_envs': 512,
    'num_train_steps': 20_000_000,

    # 算法
    'learning_rate': 3e-4,
    'gamma': 0.99,
    'GAE_lambda': 0.95,
    'clip_epsilon': 0.2,
    'entropy_cost': 1e-2,

    # 训练
    'batch_size': 2048,
    'ppo_epochs': 8,
    'max_grad_norm': 0.5,

    # 保存
    'save_interval': 100000,
    'eval_interval': 10000,
}
\`\`\`

### 训练脚本

\`\`\`python
# train_grasp.py
import gymnasium as gym
from mujoco_playground import harness

def main():
    # 创建环境
    env = gym.make('GraspingEnv')

    # 训练
    harness.train(PPO_CONFIG, env)

    # 评估
    success_rate = harness.evaluate(num_episodes=100)
    print(f"Success rate: {success_rate:.2%}")

if __name__ == '__main__':
    main()
\`\`\`

---

## 阶段 4：Sim2Real 部署

### 部署架构

\`\`\`
部署架构图：

┌─────────────────────────────────────────────────────────┐
│                    部署系统架构                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐       │
│   │  深度相机 │───▶│  工控机   │───▶│  ESP32   │       │
│   │  (RealSense)│ │  (推理)   │    │  (控制)   │       │
│   └───────────┘    └─────┬─────┘    └─────┬─────┘       │
│                          │                  │           │
│                          ▼                  ▼           │
│                   ┌───────────┐        ┌───────────┐    │
│                   │  视觉算法 │        │  HLS3606M │    │
│                   │  检测/定位│        │   舵机   │    │
│                   └───────────┘        └───────────┘    │
│                          │                  │           │
│                          ▼                  ▼           │
│                   ┌───────────┐        ┌───────────┐    │
│                   │  抓取规划 │        │  机械手   │    │
│                   └───────────┘        └───────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 部署代码

\`\`\`python
# deploy_grasp.py
import numpy as np
from aero_open_sdk import AeroHand
import time

class GraspingDeployer:
    """抓取部署器"""

    def __init__(self, policy_path):
        # 加载策略
        self.policy = self._load_policy(policy_path)

        # 连接硬件
        self.hand = AeroHand()
        self.hand.home()
        time.sleep(1)

        # 视觉系统
        self.vision = RealSenseCamera()

    def _load_policy(self, path):
        """加载训练好的策略"""
        import torch
        policy = GRASPOLICY()  # 你的策略类
        policy.load_state_dict(torch.load(path))
        policy.eval()
        return policy

    def get_obs(self):
        """获取当前观测"""
        # 视觉观测
        depth_image = self.vision.get_depth()
        point_cloud = self.vision.depth_to_points(depth_image)

        # 物体检测
        object_pos, object_rot = self.detect_object(point_cloud)

        # 关节位置
        joint_pos = np.array(self.hand.get_joint_positions()) / 100.0

        # 组合
        obs = np.concatenate([joint_pos, object_pos, object_rot])

        return obs

    def detect_object(self, point_cloud):
        """检测物体位置和姿态"""
        # 使用点云处理检测物体
        # 返回位置 (3,) 和旋转四元数 (4,)
        pass

    def run(self):
        """运行抓取"""
        print("等待物体就位...")

        while True:
            # 获取观测
            obs = self.get_obs()

            # 策略推理
            with torch.no_grad():
                action = self.policy(torch.FloatTensor(obs))

            # 转换为控制命令
            command = self._action_to_command(action)

            # 执行
            self.hand.set_joint_positions(command)

            # 检查抓取状态
            if self._check_grasp_complete():
                print("抓取完成!")
                break

            time.sleep(0.05)  # 20Hz

    def _action_to_command(self, action):
        """将策略动作转换为控制命令"""
        # action 是归一化的 [-1, 1]
        # 转换为百分比 [0, 100]
        command = ((action.numpy() + 1) * 50).tolist()
        return command

    def _check_grasp_complete(self):
        """检查抓取是否完成"""
        # 检查物体是否被握住
        joint_positions = self.hand.get_joint_positions()
        avg_closed = np.mean(joint_positions[:4])

        return avg_closed > 75  # 手指大部分闭合
\`\`\`

---

## 阶段 5：测试与优化

### 测试计划

\`\`\`
测试阶段：

T1: 仿真测试
- 1000 次随机抓取
- 记录成功/失败
- 分析失败原因

T2: 实验室测试
- 10 种不同物体
- 100 次抓取/物体
- 统计成功率

T3: 长时间测试
- 连续运行 8 小时
- 记录故障次数
- 评估稳定性
\`\`\`

### 性能优化

\`\`\`python
# optimization.py
class PerformanceOptimizer:
    """性能优化器"""

    def __init__(self, deployer):
        self.deployer = deployer
        self.metrics = []

    def add_metrics(self, success, time_taken):
        """记录指标"""
        self.metrics.append({
            'success': success,
            'time': time_taken,
        })

    def get_report(self):
        """生成性能报告"""
        import numpy as np

        successes = [m['success'] for m in self.metrics]
        times = [m['time'] for m in self.metrics]

        return {
            'success_rate': np.mean(successes),
            'avg_time': np.mean(times),
            'max_time': np.max(times),
        }

    def suggest_improvements(self):
        """根据数据分析提出改进建议"""
        report = self.get_report()

        suggestions = []

        if report['success_rate'] < 0.85:
            suggestions.append("成功率偏低，建议增加域随机化范围")

        if report['avg_time'] > 2.5:
            suggestions.append("抓取时间偏长，建议优化轨迹")

        return suggestions
\`\`\`

---

## 项目交付物

\`\`\`
交付清单：

D1: 仿真环境代码
- grasp_env.py
- domain_randomization.py
- train_grasp.py

D2: 训练好的策略
- grasp_policy.pt
- 训练曲线图

D3: 部署代码
- deploy_grasp.py
- vision_utils.py
- hardware_interface.py

D4: 测试报告
- 测试数据
- 性能分析
- 问题清单

D5: 文档
- 用户手册
- 维护指南
- 故障排查
\`\`\`
        `
      },
      {
        id: 'teleop-project',
        title: '遥操作控制系统',
        summary: '基于人手控制的遥操作系统实现，支持数据采集和策略学习。',
        tags: ['遥操作', '数据采集', 'BC'],
        content: `
## 项目概述

\`\`\`
项目目标：实现一个人体动作捕捉驱动的遥操作系统

核心功能：
- 实时捕捉人手动作
- 动作映射到机械手
- 数据记录用于学习

应用场景：
- 演示展示
- 数据采集
- 远程控制
\`\`\`

---

## 系统架构

### 硬件组成

\`\`\`
硬件清单：

1. 捕捉设备
   - Leap Motion (手势捕捉)
   - 或 Intel RealSense D455 (深度相机)
   - 或 CyberGlove (数据手套)

2. 计算平台
   - 工控机 (Intel NUC)
   - 或 Jetson NX

3. 机械手
   - Aero Hand Open
   - ESP32-S3 控制器

4. 显示设备
   - 显示器 (实时反馈)
   - VR 头显 (可选，沉浸式)
\`\`\`

### 软件架构

\`\`\`
遥操作软件栈：

┌─────────────────────────────────────────────────────────┐
│                    应用层                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │  动作捕捉   │  │  动作映射   │  │  数据记录   │   │
│   └─────────────┘  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    接口层                               │
│   ┌─────────────────────────────────────────────────┐  │
│   │              Aero Hand SDK                       │  │
│   └─────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    控制层                               │
│   ┌─────────────────────────────────────────────────┐  │
│   │              ESP32 固件                          │  │
│   └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 动作捕捉实现

### Leap Motion 接口

\`\`\`python
# leap_motion.py
import Leap
import numpy as np

class LeapMotionTracker:
    """Leap Motion 动作捕捉"""

    def __init__(self):
        self.controller = Leap.Controller()
        self.controller.set_policy_flags(
            Leap.Controller.POLICY_OPTIMIZE_HMD
        )

    def get_hand_data(self):
        """获取手部数据"""
        frame = self.controller.frame()

        if not frame.hands:
            return None

        hand = frame.hands[0]

        # 提取关键点位置
        fingers = []
        for finger in hand.fingers:
            bones = []
            for bone in finger.bones:
                bones.append({
                    'start': bone.prev_joint.tolist(),
                    'end': bone.next_joint.tolist(),
                })
            fingers.append(bones)

        return {
            'palm_position': hand.palm_position.tolist(),
            'palm_normal': hand.palm_normal.tolist(),
            'direction': hand.direction.tolist(),
            'fingers': fingers,
        }

    def close(self):
        self.controller.remove_listener(self)
\`\`\`

### 动作映射

\`\`\`python
# hand_mapping.py
import numpy as np

class HandMapper:
    """人手到机械手的动作映射"""

    def __init__(self):
        # 映射配置
        self.mapping = {
            # 人手关节 → 机械手关节
            'thumb_cmc': 4,  # 拇指内收
            'thumb_mcp': 5,  # 拇指弯曲
            'index_mcp': 0,  # 食指
            'middle_mcp': 1, # 中指
            'ring_mcp': 2,   # 无名指
            'pinky_mcp': 3,  # 小指
        }

        # 角度映射比例
        self.scale = {
            0: 1.0,  # 食指
            1: 1.0,  # 中指
            2: 1.0,  # 无名指
            3: 1.0,  # 小指
            4: 1.2,  # 拇指内收
            5: 0.8,  # 拇指弯曲
        }

    def map(self, human_hand_data):
        """
        将人手动作映射到机械手

        参数:
            human_hand_data: Leap Motion 手部数据

        返回:
            aero_hand_positions: 7个关节的目标位置 [0-100]
        """
        if human_hand_data is None:
            return [0] * 7

        # 提取关键角度
        angles = self._extract_angles(human_hand_data)

        # 应用映射
        positions = []
        for aero_joint, human_joint in self.mapping.items():
            angle = angles.get(human_joint, 0)
            scaled = angle * self.scale.get(aero_joint, 1.0)
            positions.append(np.clip(scaled * 100, 0, 100))

        return positions

    def _extract_angles(self, hand_data):
        """从手部数据提取关节角度"""
        # 实现角度计算
        pass
\`\`\`

---

## 遥操作控制

### 主控制器

\`\`\`python
# teleop_controller.py
import numpy as np
import time
from leap_motion import LeapMotionTracker
from hand_mapping import HandMapper
from aero_open_sdk import AeroHand

class TeleopController:
    """遥操作控制器"""

    def __init__(self):
        # 初始化组件
        self.tracker = LeapMotionTracker()
        self.mapper = HandMapper()
        self.hand = AeroHand()

        # 状态
        self.recording = False
        self.trajectory = []

        # 参数
        self.control_frequency = 30  # Hz
        self.latency_compensation = True

    def start(self):
        """启动遥操作"""
        print("遥操作系统启动...")

        # 归位
        self.hand.home()
        time.sleep(1)

        print("准备就绪！")

        try:
            while True:
                # 获取手部数据
                hand_data = self.tracker.get_hand_data()

                # 映射到机械手
                target_positions = self.mapper.map(hand_data)

                # 延迟补偿
                if self.latency_compensation:
                    target_positions = self._compensate_latency(
                        target_positions
                    )

                # 发送控制命令
                self.hand.set_joint_positions(target_positions)

                # 记录数据
                if self.recording:
                    self._record_frame(hand_data, target_positions)

                # 控制频率
                time.sleep(1.0 / self.control_frequency)

        except KeyboardInterrupt:
            print("\\n停止遥操作")
            self.stop()

    def _compensate_latency(self, target):
        """延迟补偿"""
        # 简单的线性预测
        if not hasattr(self, 'target_history'):
            self.target_history = []

        self.target_history.append(target)

        if len(self.target_history) > 5:
            self.target_history.pop(0)

        if len(self.target_history) >= 2:
            # 线性外推
            diff = np.array(target) - np.array(self.target_history[-2])
            predicted = np.array(target) + diff * 0.5
            return predicted.tolist()

        return target

    def _record_frame(self, hand_data, target):
        """记录一帧数据"""
        frame = {
            'timestamp': time.time(),
            'hand_data': hand_data,
            'target': target,
            'actual': self.hand.get_joint_positions(),
        }
        self.trajectory.append(frame)

    def start_recording(self):
        """开始记录"""
        self.recording = True
        self.trajectory = []
        print("开始记录...")

    def stop_recording(self):
        """停止记录"""
        self.recording = False
        print(f"记录完成，共 {len(self.trajectory)} 帧")

    def save_trajectory(self, path):
        """保存轨迹数据"""
        import pickle

        with open(path, 'wb') as f:
            pickle.dump(self.trajectory, f)

        print(f"轨迹已保存到 {path}")

    def stop(self):
        """停止系统"""
        self.hand.set_joint_positions([0] * 7)
        self.tracker.close()
\`\`\`

---

## 数据采集

### 采集配置

\`\`\`python
# data_collection.py
import numpy as np

class DataCollector:
    """数据采集器"""

    def __init__(self, controller):
        self.controller = controller
        self.tasks = [
            {
                'name': '抓取盒子',
                'duration': 30,  # 秒
                'description': '抓取桌上的小盒子',
            },
            {
                'name': '放置物品',
                'duration': 30,
                'description': '将物品放到指定位置',
            },
            {
                'name': '旋转物体',
                'duration': 30,
                'description': '将物体旋转180度',
            },
            # ... 更多任务
        ]

    def collect_for_task(self, task_name, num_episodes=10):
        """为特定任务采集数据"""
        task = self._find_task(task_name)

        print(f"开始采集任务: {task['name']}")

        for episode in range(num_episodes):
            print(f"\\nEpisode {episode + 1}/{num_episodes}")

            # 重置环境
            self.controller.hand.home()
            time.sleep(1)

            # 开始记录
            self.controller.start_recording()

            # 运行任务
            start_time = time.time()
            while time.time() - start_time < task['duration']:
                self.controller.start()  # 主循环迭代

            # 停止记录
            self.controller.stop_recording()

            # 保存数据
            filename = f"trajectory_{task_name}_{episode}.pkl"
            self.controller.save_trajectory(filename)

            print(f"Episode {episode + 1} 完成")

    def _find_task(self, name):
        return next(t for t in self.tasks if t['name'] == name)
\`\`\`

### 数据格式

\`\`\`
轨迹数据结构：

trajectory = [
    {
        'timestamp': 1234567890.123,
        'hand_data': {
            'palm_position': [x, y, z],
            'fingers': [...],
        },
        'target': [pos0, pos1, ..., pos6],  # 目标位置
        'actual': [pos0, pos1, ..., pos6],  # 实际位置
    },
    ...
]

总数据量估算：
- 30 秒 @ 30Hz = 900 帧
- 每帧约 1KB
- 每次采集约 1MB
\`\`\`

---

## 行为克隆

### 训练数据预处理

\`\`\`python
# bc_preprocessing.py
import numpy as np
import pickle

def load_trajectory(path):
    """加载轨迹数据"""
    with open(path, 'rb') as f:
        return pickle.load(f)

def prepare_bc_data(trajectories):
    """
    准备行为克隆训练数据

    返回:
        states: (N, state_dim) 状态
        actions: (N, action_dim) 动作
    """
    all_states = []
    all_actions = []

    for traj in trajectories:
        for frame in traj:
            # 提取状态
            state = extract_state(frame['hand_data'])

            # 提取动作（使用目标位置作为标签）
            action = np.array(frame['target']) / 100.0  # 归一化

            all_states.append(state)
            all_actions.append(action)

    return np.array(all_states), np.array(all_actions)

def extract_state(hand_data):
    """从手部数据提取状态"""
    # 提取手掌位置和方向
    palm_pos = np.array(hand_data['palm_position'])
    palm_normal = np.array(hand_data['palm_normal'])
    direction = np.array(hand_data['direction'])

    # 拼接
    state = np.concatenate([palm_pos, palm_normal, direction])

    return state
\`\`\`

### BC 训练

\`\`\`python
# bc_training.py
import torch
import torch.nn as nn

class BCPolicy(nn.Module):
    """行为克隆策略"""

    def __init__(self, state_dim, action_dim):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, action_dim),
            nn.Tanh()
        )

    def forward(self, state):
        return self.network(state)

def train_bc(states, actions, epochs=100, batch_size=256):
    """训练 BC 策略"""
    policy = BCPolicy(
        state_dim=states.shape[1],
        action_dim=actions.shape[1]
    )

    optimizer = torch.optim.Adam(policy.parameters(), lr=1e-3)
    loss_fn = nn.MSELoss()

    dataset = torch.utils.data.TensorDataset(
        torch.FloatTensor(states),
        torch.FloatTensor(actions)
    )
    dataloader = torch.utils.data.DataLoader(
        dataset, batch_size=batch_size, shuffle=True
    )

    for epoch in range(epochs):
        total_loss = 0

        for batch_states, batch_actions in dataloader:
            # 前向传播
            pred_actions = policy(batch_states)

            # 计算损失
            loss = loss_fn(pred_actions, batch_actions)

            # 反向传播
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        if epoch % 10 == 0:
            avg_loss = total_loss / len(dataloader)
            print(f"Epoch {epoch}, Loss: {avg_loss:.4f}")

    return policy
\`\`\`

---

## 项目交付物

\`\`\`
交付清单：

D1: 遥操作软件
- teleop_controller.py
- leap_motion.py
- hand_mapping.py

D2: 数据采集
- data_collection.py
- bc_preprocessing.py

D3: 训练代码
- bc_training.py
- policy.py

D4: 配置
- mapping_config.yaml
- task_definitions.yaml

D5: 文档
- 快速开始指南
- 校准说明
- 故障排查
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
