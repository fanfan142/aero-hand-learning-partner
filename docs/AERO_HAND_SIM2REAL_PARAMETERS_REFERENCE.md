# Aero Hand Open - Sim2Real 参数完整参考

## 概述

本文档详细列出Sim2Real过程中所有需要定义或可修改的参数，按功能分类，包含默认值、可调范围和调优建议。

---

## 目录

1. [训练阶段参数（仿真端）](#训练阶段参数仿真端)
2. [部署阶段参数（硬件端）](#部署阶段参数硬件端)
3. [Sim2Real转换参数](#sim2real转换参数)
4. [硬件限制与安全参数](#硬件限制与安全参数)
5. [控制循环参数](#控制循环参数)
6. [参数调优优先级](#参数调优优先级)

---

## 训练阶段参数（仿真端）

### 1.1 环境配置参数

| 参数名 | 类型 | 默认值 | 可调范围 | 说明 |
|--------|------|--------|----------|------|
| `ctrl_dt` | float | 0.05 | 0.01~0.1 | 控制时间步(秒)，对应20Hz控制频率 |
| `sim_dt` | float | 0.01 | 0.001~0.02 | 仿真物理步长(秒) |
| `action_repeat` | int | 1 | 1~5 | 每个控制动作重复的仿真步数 |
| `episode_length` | int | 500 | 100~2000 | 每回合最大步数 |

**来源**: `rotate_z.py` - `default_config()`

**调优建议**:
- `ctrl_dt`: 与硬件控制频率保持一致（推荐0.05即20Hz）
- `sim_dt`: 越小仿真越精确，但计算量越大
- `action_repeat`: 增大可加快训练，但可能降低控制精度

```python
# 在 rotate_z.py 中修改
def default_config():
    return config_dict.create(
        ctrl_dt=0.05,        # 控制频率 20Hz
        sim_dt=0.01,         # 物理步长 10ms
        action_repeat=1,     # 每步执行1次
        episode_length=500,  # 25秒回合
    )
```

---

### 1.2 动作空间参数

| 参数名 | 类型 | 默认值 | 维度 | 说明 |
|--------|------|--------|------|------|
| `action_scale` | list[float] | [0.02, 0.02, 0.02, 0.02, 0.7, 0.003, 0.012] | 7 | 每个执行器的动作缩放系数 |

**对应执行器**:
```python
# 索引:     0      1      2      3      4      5        6
# 名称:   拇指   拇指   拇指   食指   中指   拇指   拇指
#        外展   屈曲   肌腱   肌腱   肌腱   屈曲   外展
```

**来源**: `rotate_z.py` - `default_config()`

**调优建议**:
- 拇指外展(索引0): 较小值，避免过度外展
- 拇指屈曲(索引1): 中等值，控制屈曲幅度
- 四指肌腱(索引2-4): 较大值(0.7)，主要抓取动作
- 拇指CMC关节(索引5-6): 极小值，微调用

**典型调优场景**:
```python
# 保守策略（动作幅度小）
action_scale = [0.01, 0.01, 0.01, 0.01, 0.5, 0.002, 0.008]

# 激进策略（动作幅度大）
action_scale = [0.03, 0.03, 0.03, 0.03, 1.0, 0.005, 0.015]

# 任务特定调整（如精细操作）
action_scale = [0.015, 0.015, 0.015, 0.015, 0.6, 0.002, 0.010]
```

---

### 1.3 观察空间参数

#### 1.3.1 噪声配置

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `noise_config.level` | float | 1.0 | 噪声全局开关（0=关闭，1=开启） |
| `noise_config.scales.joint_pos` | float | 0.05 | 关节位置噪声幅度（弧度） |
| `noise_config.scales.tendon_length` | float | 0.005 | 肌腱长度噪声幅度（米） |

**来源**: `rotate_z.py` - `default_config()`

**调优建议**:
- 训练初期: 降低噪声(level=0.5)，帮助策略快速学习
- 训练后期: 增加噪声(level=1.5)，提高泛化能力
- 部署前: 用真实噪声水平校准

```python
# 训练阶段
noise_config=config_dict.create(
    level=1.0,  # 噪声开关
    scales=config_dict.create(
        joint_pos=0.05,      # ±0.05弧度噪声
        tendon_length=0.005, # ±5mm噪声
    ),
)

# 测试时关闭噪声
noise_config.level = 0.0
```

---

#### 1.3.2 观察历史长度

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `history_len` | int | 1 | 观察历史步数 |

**计算公式**: 实际观察维度 = 基础观察维度 × history_len

- `history_len=1`: 观察维度 = 14
- `history_len=2`: 观察维度 = 28
- `history_len=3`: 观察维度 = 42

**基础观察构成** (14维):
```
[6个肌腱长度传感器 + 1个关节角度传感器 + 7个上一步动作] = 14
```

**调优建议**:
- 简单任务: `history_len=1`
- 动态任务: `history_len=2` 或 `3`
- 注意: 增加历史长度会增大策略网络输入维度

---

### 1.4 奖励函数参数

| 参数名 | 默认值 | 说明 |
|--------|--------|------|
| `reward_config.scales.angvel` | 1.0 | 角速度奖励权重（主要目标） |
| `reward_config.scales.linvel` | 0.0 | 线速度惩罚权重 |
| `reward_config.scales.pose` | 0.0 | 姿态正则化权重 |
| `reward_config.scales.torques` | 0.0 | 扭矩平方惩罚权重 |
| `reward_config.scales.energy` | 0.0 | 能量消耗惩罚权重 |
| `reward_config.scales.action_rate` | -1.0 | 动作变化率惩罚权重（平滑控制） |
| `reward_config.scales.termination` | -100.0 | 提前终止惩罚 |

**来源**: `rotate_z.py` - `_get_reward()`

**调优建议**:
```python
# 快速旋转（激进）
reward_config.scales.angvel = 2.0
reward_config.scales.action_rate = -0.5

# 平滑控制（保守）
reward_config.scales.angvel = 0.5
reward_config.scales.action_rate = -2.0

# 节能模式
reward_config.scales.energy = -0.1
reward_config.scales.torques = -0.01

# 防止掉落
reward_config.scales.termination = -200.0
```

---

### 1.5 域随机化参数

用于提高Sim2Real泛化能力。

| 参数类别 | 参数名 | 默认范围 | 说明 |
|----------|--------|----------|------|
| **摩擦** | `cube_friction` | U(0.1, 0.5) | 立方体摩擦系数 |
|  | `fingertip_friction` | U(0.5, 1.0) | 指尖摩擦系数 |
| **质量** | `cube_mass` | ×U(0.8, 1.2) | 立方体质量缩放 |
|  | `hand_mass` | ×U(0.9, 1.1) | 手指质量缩放 |
| **位置** | `cube_position` | ±5mm | 立方体质心偏移 |
|  | `qpos0` | ±0.05rad | 关节初始位置抖动 |
| **动力学** | `dof_frictionloss` | ×U(0.5, 2.0) | 关节摩擦缩放 |
|  | `dof_armature` | ×U(1.0, 1.05) | 关节惯量缩放 |
|  | `dof_damping` | ×U(0.8, 1.2) | 关节阻尼缩放 |
| **控制** | `actuator_kp` | ×U(0.8, 1.2) | 位置控制增益 |
|  | `actuator_kd` | ×U(0.8, 1.2) | 速度控制增益 |

**来源**: `rotate_z.py` - `domain_randomize()`

**调优建议**:
- 初次部署: 使用默认随机化范围
- 遇到Reality Gap: 扩大随机化范围
- 特定问题（如摩擦不匹配）: 单独调整对应参数

```python
# 示例：针对摩擦问题
cube_friction = jax.random.uniform(key, minval=0.05, maxval=0.8)  # 扩大范围
fingertip_friction = jax.random.uniform(key, minval=0.3, maxval=1.5)
```

---

### 1.6 训练超参数

| 参数名 | 默认值 | 说明 |
|--------|--------|------|
| `learning_rate` | 3e-4 | 策略网络学习率 |
| `batch_size` | 256 | PPO批量大小 |
| `num_epochs` | 8 | 每批次更新轮数 |
| `clip_epsilon` | 0.2 | PPO裁剪参数 |
| `entropy_coef` | 0.01 | 熵正则化系数（探索） |
| `gamma` | 0.99 | 折扣因子 |
| `lambda_gae` | 0.95 | GAE参数 |

**调优建议**:
- 学习率过小: 训练慢；过大: 不稳定
- 批量大小: 受GPU内存限制
- 熵系数: 训练初期可增大(0.02)，后期减小(0.005)

---

## 部署阶段参数（硬件端）

### 2.1 硬件连接参数

| 参数名 | 类型 | 默认值 | 示例值 | 说明 |
|--------|------|--------|--------|------|
| `port` | str | None | "/dev/ttyACM0" | 串口设备路径 |
| `baudrate` | int | 921600 | 921600 | 串口波特率 |

**来源**: `aero_hand.py` - `AeroHand.__init__()`

**平台特定值**:
```python
# Linux
port = "/dev/ttyACM0"
port = "/dev/serial/by-id/usb-Espressif_USB_JTAG_serial_debug_unit_..."

# Windows
port = "COM3"
port = "COM4"

# macOS
port = "/dev/tty.usbserial-..."
```

**自动检测**:
```python
# Linux下可自动检测
hand = AeroHand()  # 自动查找 /dev/serial/by-id/

# 其他平台需手动指定
hand = AeroHand(port="COM3")
```

---

### 2.2 舵机配置参数

#### 2.2.1 舵机ID和电流限制

| 参数名 | 类型 | 范围 | 说明 |
|--------|------|------|------|
| `id` | int | 0~6 | 舵机ID（0=拇指外展, 1=拇指屈曲, ..., 6=小指） |
| `current_limit` | int | 0~1023 | 电流限制（单位：约6.5mA/单位） |

**默认电流限制**: 通常设为 500-800 (约3.3-5.2A)

**示例**:
```python
# 设置舵机ID和电流限制（首次配置时）
hand.set_id(id=0, current_limit=600)  # 拇指外展
hand.set_id(id=1, current_limit=700)  # 拇指屈曲
hand.set_id(id=2, current_limit=800)  # 拇指肌腱
# ... 以此类推
```

---

#### 2.2.2 舵机速度限制

| 参数名 | 类型 | 范围 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `speed` | int | 0~32766 | 32766 | 舵机最大速度（RPM×系数） |

**转换**: 1单位 ≈ 0.732 RPM

**示例**:
```python
# 设置单个舵机速度
hand.set_speed(id=0, speed=20000)  # 约14650 RPM

# 实际应用中
speed_fast = 32766   # 全速
speed_medium = 20000 # 中速
speed_slow = 10000   # 慢速（精细操作）
```

---

#### 2.2.3 舵机扭矩限制

| 参数名 | 类型 | 范围 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `torque` | int | 0~1000 | 1000 | 舵机最大扭矩 |

**示例**:
```python
# 降低扭矩用于安全操作
hand.set_torque(id=2, torque=500)  # 50%扭矩

# 恢复全扭矩
hand.set_torque(id=2, torque=1000)  # 100%扭矩
```

---

#### 2.2.4 舵机端点微调（Trim）

| 参数名 | 类型 | 范围 | 说明 |
|--------|------|------|------|
| `id` | int | 0~6 | 舵机ID |
| `degrees` | int | -360~360 | 微调角度（度） |

**用途**: 补偿机械装配误差、肌腱长度差异

**示例**:
```python
# 微调拇指肌腱位置
hand.trim_servo(id=2, degrees=5)   # +5度
hand.trim_servo(id=2, degrees=-3)  # -3度
```

---

## Sim2Real转换参数

### 3.1 默认姿态参数

| 参数名 | 类型 | 默认值 | 维度 | 说明 |
|--------|------|--------|------|------|
| `default_tendon` | list[float] | 见下表 | 7 | 默认肌腱位置（弧度或度） |

**来源**: 仿真环境的 `home` keyframe

**默认值（弧度）**:
```python
# 从 rotate_z.py 的 home keyframe 获取
default_tendon = np.array([
    0.1745,  # 拇指外展 (10°)
    0.0,     # 拇指屈曲 (0°)
    0.3491,  # 拇指肌腱 (20°)
    0.3491,  # 食指肌腱 (20°)
    0.3491,  # 中指肌腱 (20°)
    0.3491,  # 无名指肌腱 (20°)
    0.3491,  # 小指肌腱 (20°)
])
```

**注意事项**:
- 必须与仿真环境的初始位置一致
- 归位后应接近此位置
- 可根据实际硬件微调

**获取方法**:
```python
# 从仿真XML的keyframe读取
home_key = mj_model.keyframe("home")
default_tendon = home_key.ctrl  # 7维
```

---

### 3.2 动作缩放参数（关键！）

| 参数名 | 类型 | 默认值 | 维度 | 说明 |
|--------|------|--------|------|------|
| `action_scale` | list[float] | [0.02, 0.02, 0.02, 0.02, 0.7, 0.003, 0.012] | 7 | 策略输出到实际位置的缩放 |

**部署时必须与训练时完全一致！**

**完整映射**:
```python
action_scale = [
    0.02,   # [0] 拇指外展: ±0.02弧度 ≈ ±1.15°
    0.02,   # [1] 拇指屈曲: ±0.02弧度 ≈ ±1.15°
    0.02,   # [2] 拇指肌腱: ±0.02弧度 ≈ ±1.15°
    0.02,   # [3] 食指肌腱: ±0.02弧度 ≈ ±1.15°
    0.7,    # [4] 中指肌腱: ±0.7弧度 ≈ ±40°
    0.003,  # [5] 拇指CMC屈曲: ±0.003弧度 ≈ ±0.17°
    0.012,  # [6] 拇指CMC外展: ±0.012弧度 ≈ ±0.69°
]
```

**调优场景**:
```python
# 如果硬件动作太激进（震动、不稳定）
action_scale = [v * 0.5 for v in default_action_scale]

# 如果硬件动作太保守（不够快）
action_scale = [v * 1.5 for v in default_action_scale]

# 单独调整某个执行器
action_scale[4] = 0.5  # 降低中指幅度
```

---

### 3.3 观察归一化参数

| 参数名 | 类型 | 来源 | 说明 |
|--------|------|------|------|
| `actuation_lower_limits` | tuple[float] | SDK常量 | 执行器下限（弧度） |
| `actuation_upper_limits` | tuple[float] | SDK常量 | 执行器上限（弧度） |

**SDK默认值**:
```python
# 来自 aero_hand_constants.py
actuation_lower_limits = (0.0, 0.0, -15.2789, 0.0, 0.0, 0.0, 0.0)
actuation_upper_limits = (100.0, 104.1250, 247.1500, 288.1603, 288.1603, 288.1603, 288.1603)
```

**归一化公式**:
```python
normalized = (current_position - lower_limit) / (upper_limit - lower_limit)
```

**注意事项**:
- 确保仿真和硬件使用相同的限制值
- 归一化后的值应在 [0, 1] 范围内

---

### 3.4 单位转换参数

| 转换类型 | 公式 | 说明 |
|----------|------|------|
| 度→弧度 | rad = deg × π/180 | SDK使用度，仿真使用弧度 |
| 弧度→度 | deg = rad × 180/π | 发送命令时转换 |
| 肌腱长度→角度 | angle = length / pulley_radius | MOTOR_PULLEY_RADIUS ≈ 0.005m |
| 角度→肌腱长度 | length = angle × pulley_radius | 反向转换 |

**常量定义**:
```python
# SDK中
_RAD_TO_DEG = 180.0 / 3.141592653589793
_DEG_TO_RAD = 3.141592653589793 / 180.0
MOTOR_PULLEY_RADIUS = 0.005  # 米（示例，需验证）
```

---

## 硬件限制与安全参数

### 4.1 执行器位置限制

| 参数名 | 类型 | 值 | 说明 |
|--------|------|-----|------|
| `actuation_lower_limits` | tuple[7] | (0.0, 0.0, -15.2789, 0.0, 0.0, 0.0, 0.0) | 下限（弧度） |
| `actuation_upper_limits` | tuple[7] | (100.0, 104.1250, 247.1500, 288.1603, 288.1603, 288.1603, 288.1603) | 上限（弧度） |

**来源**: `sdk/src/aero_open_sdk/aero_hand_constants.py`

**详细分解**:

| 索引 | 名称 | 下限（弧度） | 上限（弧度） | 下限（度） | 上限（度） |
|------|------|-------------|-------------|-----------|-----------|
| 0 | thumb_cmc_abd_act | 0.0 | 100.0 | 0° | 100° |
| 1 | thumb_cmc_flex_act | 0.0 | 104.1250 | 0° | ~59.6° |
| 2 | thumb_tendon_act | -15.2789 | 247.1500 | ~-8.75° | ~141.6° |
| 3 | index_tendon_act | 0.0 | 288.1603 | 0° | ~165.1° |
| 4 | middle_tendon_act | 0.0 | 288.1603 | 0° | ~165.1° |
| 5 | ring_tendon_act | 0.0 | 288.1603 | 0° | ~165.1° |
| 6 | pinky_tendon_act | 0.0 | 288.1603 | 0° | ~165.1° |

**安全裁剪代码**:
```python
def clip_actuations(actuations, lower_limits, upper_limits):
    """裁剪执行器位置到安全范围"""
    return np.clip(actuations, lower_limits, upper_limits)

# 使用
actuations_safe = clip_actuations(
    actuations,
    consts.actuation_lower_limits,
    consts.actuation_upper_limits
)
```

---

### 4.2 关节位置限制

| 参数名 | 类型 | 值 | 说明 |
|--------|------|-----|------|
| `joint_lower_limits` | tuple[16] | 全0 | 关节下限（度） |
| `joint_upper_limits` | tuple[16] | 混合值 | 关节上限（度） |

**来源**: `sdk/src/aero_open_sdk/aero_hand_constants.py`

**详细值**:
```python
joint_upper_limits = (
    100.0,  # [0] thumb_cmc_abd
    55.0,   # [1] thumb_cmc_flex
    90.0,   # [2] thumb_mcp
    90.0,   # [3] thumb_ip
    90.0,   # [4-6] index joints
    90.0,   # [7-9] middle joints
    90.0,   # [10-12] ring joints
    90.0,   # [13-15] pinky joints
)
```

---

### 4.3 电流安全限制

| 参数名 | 类型 | 范围 | 推荐值 | 说明 |
|--------|------|------|--------|------|
| `current_limit` | int | 0~1023 | 500-800 | 舵机电流限制 |
| `max_current_mA` | float | - | ~6500 | 最大电流（mA） |

**电流-实际值转换**:
```python
# Feetech 舵机规格: 1 unit = 6.5 mA
current_mA = current_limit * 6.5

# 示例
current_limit = 600  # 设置值
actual_current = 600 * 6.5 = 3900 mA = 3.9 A
```

**安全建议**:
```python
# 长时间运行: 降低到 500-600
# 短时间爆发: 可到 800-1000
# 异常检测: 监控 `get_actuator_currents()` 返回值
```

---

### 4.4 温度安全限制

| 参数名 | 类型 | 警告值 | 危险值 | 说明 |
|--------|------|--------|--------|------|
| `temperature_warning` | float | 60°C | 75°C | 舵机温度阈值 |

**监控代码**:
```python
def check_temperature(hand):
    temps = hand.get_actuator_temperatures()
    if temps is None:
        return

    for i, temp in enumerate(temps):
        if temp > 75:
            print(f"警告: 舵机 {i} 温度过高: {temp:.1f}°C")
            # 执行紧急停止
        elif temp > 60:
            print(f"注意: 舵机 {i} 温度升高: {temp:.1f}°C")
```

---

### 4.5 串口超时参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `timeout` | float | 0.5 | 串口读写超时（秒） |
| `write_timeout` | float | 0.5 | 串口写超时（秒） |
| `ack_timeout` | float | 2.0~175.0 | ACK确认超时（秒） |

**来源**: `aero_hand.py`

**不同操作的超时**:
```python
# 普通操作
ser = Serial(port, baudrate, timeout=0.5, write_timeout=0.5)

# 归位操作（较慢）
hand.send_homing(timeout_s=175.0)  # 最多等待175秒

# 配置操作
hand.set_id(id, current_limit)  # 内部超时约5秒
hand.set_speed(id, speed)        # 内部超时约2秒
hand.trim_servo(id, degrees)     # 内部超时约2秒
```

---

## 控制循环参数

### 5.1 控制频率参数

| 参数名 | 类型 | 默认值 | 范围 | 说明 |
|--------|------|--------|------|------|
| `ctrl_rate` | float | 20 | 10~50 | 控制循环频率（Hz） |
| `ctrl_dt` | float | 0.05 | 0.02~0.1 | 控制周期（秒）= 1/ctrl_rate |

**与训练参数对应**:
```python
# 训练时
ctrl_dt = 0.05  # 20Hz

# 部署时（必须一致）
ctrl_rate = 20  # Hz
dt = 1.0 / ctrl_rate  # 0.05秒
```

**调优建议**:
- 最低: 10Hz（实时性要求低）
- 推荐: 20Hz（平衡性能和实时性）
- 最高: 50Hz（高性能机器，需要）

**控制循环实现**:
```python
def control_loop(policy):
    ctrl_rate = 20  # Hz
    dt = 1.0 / ctrl_rate

    while True:
        start = time.time()

        # 执行一步
        policy.step()

        # 维持频率
        elapsed = time.time() - start
        sleep_time = dt - elapsed
        if sleep_time > 0:
            time.sleep(sleep_time)
        else:
            print(f"超时: {elapsed:.3f}s > {dt:.3f}s")
```

---

### 5.2 轨迹插值参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `trajectory_rate` | int | 100 | 轨迹插值频率（Hz） |

**来源**: `aero_hand.py` - `create_trajectory()`

**使用示例**:
```python
# 定义轨迹关键点
trajectory = [
    (start_pose, duration_1),  # 从start_pose出发
    (mid_pose, duration_2),    # duration_2秒后到达mid_pose
    (end_pose, duration_3),    # duration_3秒后到达end_pose
]

# 内部会以100Hz插值生成平滑轨迹
hand.run_trajectory(trajectory)
```

---

### 5.3 观察滤波参数

可选的滤波器参数，用于减少传感器噪声。

| 滤波器类型 | 参数 | 典型值 | 说明 |
|-----------|------|--------|------|
| 指数移动平均 | `alpha` | 0.1~0.3 | 新观察权重 |
| 卡尔曼滤波 | `Q`, `R` | 依赖系统 | 过程噪声、测量噪声 |
| 中值滤波 | `window_size` | 3~5 | 滑动窗口大小 |

**示例**:
```python
class ExponentialMovingAverage:
    def __init__(self, alpha=0.2):
        self.alpha = alpha
        self.value = None

    def update(self, new_value):
        if self.value is None:
            self.value = new_value
        else:
            self.value = self.alpha * new_value + (1 - self.alpha) * self.value
        return self.value

# 使用
ema_filter = ExponentialMovingAverage(alpha=0.2)
filtered_obs = ema_filter.update(raw_obs)
```

---

### 5.4 异常处理参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `max_consecutive_failures` | int | 10 | 连续失败后停止 |
| `retry_delay` | float | 0.1 | 失败后重试延迟（秒） |
| `emergency_stop_current` | float | 5000 | 紧急停止电流阈值（mA） |

**示例**:
```python
def safe_control_loop(policy, max_failures=10):
    consecutive_failures = 0

    while consecutive_failures < max_failures:
        try:
            success = policy.step()
            if success:
                consecutive_failures = 0
            else:
                consecutive_failures += 1
                time.sleep(0.1)

            # 检查电流
            currents = policy.hand.get_actuator_currents()
            if max(currents) > 5000:
                print("电流过高，紧急停止！")
                break

        except Exception as e:
            print(f"错误: {e}")
            consecutive_failures += 1
            time.sleep(0.1)
```

---

## 参数调优优先级

### 第一优先级（必须正确）

| 参数 | 原因 | 调优方法 |
|------|------|----------|
| `action_scale` | 直接决定策略输出 | 从仿真配置复制，部署后微调 |
| `default_tendon` | 初始位置基准 | 从仿真keyframe读取 |
| `ctrl_rate` | 时序一致性 | 与训练的`ctrl_dt`一致 |
| 端口配置(`port`) | 硬件连接基础 | 自动检测或手动指定 |

**检查清单**:
- [ ] `action_scale` 与训练完全一致
- [ ] `default_tendon` 从仿真导出
- [ ] `ctrl_rate = 1 / ctrl_dt`
- [ ] 硬件连接正常

---

### 第二优先级（影响性能）

| 参数 | 影响 | 调优方向 |
|------|------|----------|
| 舵机速度(`speed`) | 动作响应速度 | 快速任务: 32766; 精细: 10000 |
| 舵机扭矩(`torque`) | 力量/安全性 | 强力抓取: 1000; 安全: 500 |
| 观察噪声(`noise_config`) | 泛化能力 | 初期低, 后期高 |
| 域随机化范围 | Sim2Real差距 | 遇到问题时扩大 |

---

### 第三优先级（优化体验）

| 参数 | 影响 | 调优方向 |
|------|------|----------|
| 舵机微调(`trim`) | 机械误差补偿 | 根据实际装配调整 |
| 奖励权重(`reward_config`) | 行为风格 | 快速 vs 平滑 |
| 滤波器参数 | 观察质量 | 噪声大时启用 |
| 安全限制(`current_limit`) | 长期可靠性 | 根据使用场景调整 |

---

## 完整参数配置示例

### 示例1: 基础部署配置

```python
# sim2real_config.py

class Sim2RealConfig:
    # ========== 硬件连接 ==========
    port = "/dev/ttyACM0"  # Linux
    # port = "COM3"         # Windows
    baudrate = 921600

    # ========== 控制参数 ==========
    ctrl_rate = 20  # Hz (必须与训练的 ctrl_dt = 0.05 对应)

    # ========== 动作空间 ==========
    action_scale = [0.02, 0.02, 0.02, 0.02, 0.7, 0.003, 0.012]

    # ========== 默认姿态 ==========
    default_tendon = [10.0, 0.0, 20.0, 20.0, 20.0, 20.0, 20.0]  # 度

    # ========== 限制参数 ==========
    actuation_lower_limits = [0.0, 0.0, -15.2789, 0.0, 0.0, 0.0, 0.0]
    actuation_upper_limits = [100.0, 104.1250, 247.1500, 288.1603, 288.1603, 288.1603, 288.1603]

    # ========== 安全参数 ==========
    current_limit = 600      # 舵机电流限制
    max_current_mA = 5000    # 紧急停止阈值
    temperature_warning = 60 # 温度警告
    temperature_max = 75     # 温度危险

    # ========== 观察处理 ==========
    use_filter = True
    filter_alpha = 0.2

    # ========== 异常处理 ==========
    max_consecutive_failures = 10
    retry_delay = 0.1
```

### 示例2: 调优后的配置

```python
class TunedConfig:
    # 硬件连接
    port = "/dev/ttyACM0"
    baudrate = 921600

    # 控制参数（提高频率）
    ctrl_rate = 30  # Hz

    # 动作空间（降低幅度，更平滑）
    action_scale = [0.015, 0.015, 0.015, 0.015, 0.5, 0.002, 0.010]

    # 默认姿态（微调后）
    default_tendon = [12.0, 2.0, 22.0, 18.0, 20.0, 20.0, 19.0]  # 度

    # 舵机速度（中等速度）
    servo_speed = 20000

    # 舵机扭矩（安全模式）
    servo_torque = 700

    # 安全参数
    current_limit = 500  # 降低电流限制
    max_current_mA = 4500
    temperature_warning = 55  # 更保守
    temperature_max = 70

    # 观察处理（启用滤波）
    use_filter = True
    filter_alpha = 0.15  # 更强的滤波

    # 微调值（补偿机械误差）
    trim_values = [0, 0, 3, -2, 0, 1, 0]  # 度
```

---

## 参数调优流程

### 阶段1: 初始配置

```python
# 1. 从仿真复制参数
action_scale = copy_from_training_config()
default_tendon = get_from_simulation_keyframe()

# 2. 连接硬件
hand = AeroHand(port=auto_detect_port())

# 3. 执行归位
hand.send_homing()
```

### 阶段2: 基础测试

```python
# 1. 测试默认位置
hand.set_actuations(default_tendon)

# 2. 测试动作幅度
for i in range(7):
    test_action = np.zeros(7)
    test_action[i] = 1.0  # 最大动作
    # 观察硬件响应

# 3. 调整action_scale
if response_too_aggressive:
    action_scale = [v * 0.5 for v in action_scale]
elif response_too_slow:
    action_scale = [v * 1.2 for v in action_scale]
```

### 阶段3: 策略部署

```python
# 1. 加载策略
policy = load_policy(checkpoint_path)

# 2. 部署测试
for episode in range(10):
    state = reset()
    for step in range(500):
        obs = get_observation()
        action = policy(obs)
        send_action(action)
        monitor_safety()

# 3. 分析结果
if performance_good:
    print("部署成功!")
elif performance_poor:
    # 调整参数
    analyze_failure_mode()
```

### 阶段4: 精细调优

```python
# 1. 微调舵机
for i in range(7):
    hand.trim_servo(i, trim_values[i])

# 2. 调整速度/扭矩
hand.set_speed(id=ALL, speed=servo_speed)
hand.set_torque(id=ALL, torque=servo_torque)

# 3. 优化滤波
if observation_noisy:
    filter_alpha = 0.1  # 更强滤波
```

---

## 常见参数问题速查

| 问题 | 可能原因 | 检查参数 | 解决方法 |
|------|----------|----------|----------|
| 硬件不动 | `action_scale`太小 | `action_scale` | 增大2-3倍 |
| 硬件震动 | `action_scale`太大 | `action_scale` | 减小50% |
| 速度太慢 | 舵机速度限制 | `set_speed()` | 提高速度值 |
| 力量不够 | 舵机扭矩限制 | `set_torque()` | 提高扭矩值 |
| 行为不稳定 | 观察噪声大 | `noise_config` | 训练时增大噪声 |
| 时序错乱 | 控制频率不匹配 | `ctrl_rate` | 与`ctrl_dt`对应 |
| 掉东西 | 摩擦不匹配 | 域随机化 | 扩大摩擦随机范围 |
| 电流过大 | 动作太激进 | `action_scale` | 减小并监控电流 |
| 温度过高 | 持续高负载 | 休息间隔 | 添加冷却时间 |

---

## 总结

### 关键参数速记卡

```
┌─────────────────────────────────────────────────────────────┐
│              Sim2Real 必备参数（复制值）                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  action_scale   = [0.02, 0.02, 0.02, 0.02, 0.7, 0.003, 0.012] │
│  default_tendon = [10.0, 0.0, 20.0, 20.0, 20.0, 20.0, 20.0]   │
│  ctrl_rate      = 20  (Hz)                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              安全限制（建议值）                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  current_limit    = 600    (单位)                           │
│  max_current_mA   = 5000   (mA)                             │
│  temperature_max  = 75     (°C)                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              硬件连接（平台特定）                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Linux:   port = "/dev/ttyACM0"                             │
│  Windows: port = "COM3"                                     │
│  baudrate = 921600                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*文档版本: 1.0*
*最后更新: 2025-12-30*
*作者: Claude Code*
