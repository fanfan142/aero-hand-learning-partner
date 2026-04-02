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
