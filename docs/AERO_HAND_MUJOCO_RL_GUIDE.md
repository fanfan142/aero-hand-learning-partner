# Aero Hand Open - MuJoCo 仿真与强化学习训练完整指南

## 🎯 项目概述
Aero Hand Open 是一个开源、肌腱驱动的灵巧机械手，本指南帮助你在 Ubuntu 22.04（VMware 虚拟化）环境中复现 MuJoCo 仿真和强化学习训练，实现机械手玩魔方（立方体旋转）任务。

**你的硬件环境**：5800x3d + 5700XT，硬盘直通到 VMware 中的 Ubuntu 22.04 系统。

## 📋 前置要求

### 1. Ubuntu 22.04 基础配置
```bash
# 更新系统并安装基础工具
sudo apt update
sudo apt install -y git python3.10 python3.10-venv python3-pip build-essential
sudo apt install -y libgl1-mesa-glx libosmesa6 libstdc++6

# 如果无 GUI 环境，安装虚拟显示
sudo apt install -y xvfb
```

### 2. 项目结构认知
```
aero-hand-open/
├── sim_rl/                    # 仿真与强化学习模块
│   ├── simulation/           # 基础 MuJoCo 模型
│   │   ├── right_hand.xml    # 右手模型（主要）
│   │   ├── left_hand.xml     # 左手模型
│   │   ├── scene_right.xml   # 场景配置
│   │   └── assets/*.STL      # 50+个网格文件
│   └── mujoco_playground/    # DeepMind 训练框架
│       ├── learning/         # 训练脚本
│       │   ├── train_jax_ppo.py    # JAX PPO 训练
│       │   └── train_rsl_rl.py     # RSL-RL 训练
│       └── mujoco_playground/_src/manipulation/aero_hand/
│           ├── rotate_z.py          # Z轴旋转任务
│           ├── aero_hand_constants.py # 常量定义
│           └── xmls/                # 集成模型文件
```

### 3. 硬件资源建议
- **CPU**：分配给虚拟机至少 6-8 核（5800x3d 有 8 核 16 线程）
- **内存**：至少 12GB，推荐 16GB
- **存储**：预留 20GB+ 空间（训练日志和检查点）
- **显卡**：AMD 5700XT 在 VMware 中可能无法直通，建议先用 CPU 训练

## 🚀 完整安装与训练步骤

### 步骤 1：克隆项目并进入目录
```bash
cd ~
git clone https://github.com/tetheria/aero-hand-open.git
cd aero-hand-open/sim_rl
```

### 步骤 2：创建 Python 虚拟环境
```bash
# 使用 Python 3.10（项目要求）
python3.10 -m venv .venv
source .venv/bin/activate

# 升级 pip 和构建工具
pip install --upgrade pip setuptools wheel
```

### 步骤 3：安装核心依赖
```bash
# 方案 A：使用 pip 直接安装（推荐）
pip install mujoco>=3.3.6.dev        # MuJoCo 本体
pip install playground               # mujoco_playground 框架
pip install wandb tensorboardX mediapy  # 可选工具

# 方案 B：如果方案 A 失败，从源码安装
git clone https://github.com/google-deepmind/mujoco.git
cd mujoco
pip install -e ./mjx                 # 安装 mujoco-mjx
cd ~/aero-hand-open/sim_rl
pip install -e ./mujoco_playground   # 本地安装
```

### 步骤 4：验证安装
创建测试脚本 `test_install.py`：
```python
import sys
try:
    import mujoco
    print("✓ MuJoCo 安装成功")
    print(f"  MuJoCo 版本: {mujoco.__version__}")
except Exception as e:
    print(f"✗ MuJoCo 导入失败: {e}")

try:
    import mujoco_playground
    print("✓ mujoco_playground 安装成功")
except Exception as e:
    print(f"✗ mujoco_playground 导入失败: {e}")

try:
    import jax
    print(f"✓ JAX 安装成功 - 后端: {jax.default_backend()}")
    print(f"  JAX 设备: {jax.devices()}")
except Exception as e:
    print(f"✗ JAX 导入失败: {e}")

try:
    from mujoco_playground import registry
    aero_envs = [e for e in registry.ALL_ENVS if 'Aero' in e or 'Tetheria' in e]
    print(f"✓ Aero Hand 环境: {aero_envs}")
except Exception as e:
    print(f"✗ 环境注册查询失败: {e}")
```

运行验证：
```bash
python test_install.py
```

### 步骤 5：确定正确的环境名称
```bash
# 进入训练目录
cd mujoco_playground/learning

# 方法1：列出所有环境
python -c "from mujoco_playground import registry; print('可用环境:', list(registry.ALL_ENVS))"

# 方法2：查找 Aero Hand 相关环境
python -c """
from mujoco_playground import registry
import re
envs = [e for e in registry.ALL_ENVS if 'Aero' in e or 'Tetheria' in e or 'Cube' in e]
print('Aero Hand 环境:', envs)
"""

# 可能的名称：
# - AeroCubeRotateZAxis（代码中注册的名称）
# - TetheriaCubeRotateZAxis（文档中提到的名称）
```

### 步骤 6：小规模验证训练
```bash
# 先用 Cartpole 测试环境是否正常工作
python train_jax_ppo.py --env_name=CartpoleBalance --num_timesteps=10000

# 如果成功，尝试 Aero Hand 环境
# 假设环境名称为 AeroCubeRotateZAxis
python train_jax_ppo.py \
  --env_name=AeroCubeRotateZAxis \
  --num_timesteps=50000 \
  --num_envs=64 \
  --eval_every=10000 \
  --log_dir=logs/test_run
```

### 步骤 7：完整训练配置
```bash
# 优化 CPU 训练参数（针对虚拟机）
export OMP_NUM_THREADS=4
export MKL_NUM_THREADS=4
export XLA_FLAGS="--xla_cpu_multi_thread_eigen=false intra_op_parallelism_threads=4"

# 启动完整训练（100万步，约4-8小时）
python train_jax_ppo.py \
  --env_name=AeroCubeRotateZAxis \
  --num_timesteps=1000000 \
  --num_envs=128 \
  --batch_size=64 \
  --num_minibatches=4 \
  --num_updates_per_batch=2 \
  --learning_rate=3e-4 \
  --entropy_cost=0.01 \
  --discounting=0.99 \
  --reward_scaling=0.1 \
  --gradient_clipping=0.5 \
  --normalize_observations=True \
  --normalize_rewards=True \
  --eval_every=50000 \
  --save_every=100000 \
  --log_dir=logs/full_training \
  --use_wandb=False  # 首次可关闭 wandb
```

### 步骤 8：无 GUI 环境训练（使用 xvfb）
```bash
# 如果遇到 GLFW 错误，使用 xvfb
xvfb-run -a -s "-screen 0 1280x1024x24" python train_jax_ppo.py \
  --env_name=AeroCubeRotateZAxis \
  --num_timesteps=50000 \
  --num_envs=256 \
  --batch_size=32
```

### 步骤 9：运行预训练策略（可视化）
```bash
# 加载训练好的检查点进行可视化
python train_jax_ppo.py \
  --env_name=AeroCubeRotateZAxis \
  --play_only \
  --load_checkpoint_path=logs/full_training/YYYYMMDD-HHMMSS/checkpoints/...
```

## ⚙️ 硬件特定优化

### AMD 5700XT + 5800x3d 配置建议
1. **CPU 模式优先**：VMware 中 AMD GPU 直通可能不可用，先用 CPU 训练。
2. **线程配置**：
   ```bash
   # 限制线程数，避免虚拟机过载
   export XLA_FLAGS="--xla_cpu_multi_thread_eigen=false intra_op_parallelism_threads=6"
   export OMP_NUM_THREADS=6
   export MKL_NUM_THREADS=6
   ```
3. **内存优化**：
   - 减少 `--num_envs`（默认 1024，可降至 128-256）
   - 增大 `--batch_size`（32-64）

### 如果尝试 ROCm（AMD GPU）支持
```bash
# 安装 ROCm（复杂，可能不适合 VMware）
wget https://repo.radeon.com/amdgpu-install/6.2/ubuntu/jammy/amdgpu-install_6.2.60202-1_all.deb
sudo apt install ./amdgpu-install_6.2.60202-1_all.deb
sudo amdgpu-install --usecase=rocm

# 安装 JAX ROCm 版本
pip install --upgrade "jax-rocm==0.4.28" jaxlib
```

## 📊 训练监控与调试

### 实时监控
```bash
# 查看训练日志
tail -f logs/$(ls -t logs | head -1)/train.log

# 使用 TensorBoard
pip install tensorboard
tensorboard --logdir logs --port 6006
# 浏览器访问 http://localhost:6006

# 关键指标检查
# 1. 奖励曲线应持续上升
# 2. 回合长度应接近最大长度（1000）
# 3. 价值损失应稳定下降
# 4. 策略熵应缓慢下降（保持探索）
```

### 性能调优参数
| 参数 | 推荐值（CPU） | 说明 |
|------|--------------|------|
| `--num_envs` | 128-256 | 并行环境数，减少内存使用 |
| `--batch_size` | 32-64 | 批次大小，增大提高稳定性 |
| `--num_minibatches` | 4-8 | 减少 minibatch 数 |
| `--num_updates_per_batch` | 2-4 | 减少更新次数 |
| `--learning_rate` | 3e-4 | 保守学习率 |
| `--entropy_cost` | 0.01-0.05 | 增加探索 |

## 🐛 常见问题与解决方案

### 错误：`ModuleNotFoundError: No module named 'mujoco'`
```bash
# MuJoCo 安装失败
pip install mujoco>=3.3.6.dev --no-cache-dir
# 或从 mujoco.org 下载预编译包
```

### 错误：`GLFW error` 或 `No available video device`
```bash
# 安装 OpenGL 库
sudo apt install libglfw3 libglfw3-dev
# 或使用 xvfb 虚拟显示
xvfb-run -a python train_jax_ppo.py ...
```

### 错误：`jaxlib not found`
```bash
# 安装 JAX CPU 版本
pip install jax jaxlib
# 确认后端
python -c "import jax; print(jax.default_backend())"
```

### 错误：`MemoryError` 或 `OOM`
```bash
# 减少并行环境数
python train_jax_ppo.py --env_name=... --num_envs=64
# 增加批次大小
python train_jax_ppo.py --env_name=... --batch_size=128
```

### 错误：`KeyError: 'AeroCubeRotateZAxis'`
```bash
# 确认环境名称
python -c "from mujoco_playground import registry; print(list(registry.ALL_ENVS))"
# 尝试其他可能名称
python train_jax_ppo.py --env_name=TetheriaCubeRotateZAxis
```

### 训练速度极慢
```bash
# 优化 CPU 设置
export XLA_FLAGS="--xla_cpu_multi_thread_eigen=false intra_op_parallelism_threads=4"
export OMP_NUM_THREADS=4

# 减少环境复杂度
python train_jax_ppo.py --num_envs=64 --batch_size=32 --num_timesteps=100000
```

## 🔄 备选方案（如果本地训练太慢）

### 1. Google Colab（免费 GPU）
- 上传项目到 Google Drive
- 使用 Colab Notebook 运行训练
- 免费 GPU（T4/P100）加速

### 2. 云 GPU 服务
- **Lambda Labs**：按小时计费，RTX 4090 等
- **RunPod**：AMD 和 NVIDIA GPU
- **Vast.ai**：价格较低的选择

### 3. 分布式训练
```bash
# 如果有多台机器
# 主节点
python train_jax_ppo.py --distributed --master_addr=192.168.1.100

# 工作节点
python train_jax_ppo.py --distributed --worker_addr=192.168.1.100
```

## 📈 训练成功标准

### 短期目标（5-10万步）
- 环境能正常运行，无崩溃
- 奖励曲线开始上升
- 策略能完成基础动作

### 中期目标（50-100万步）
- 奖励持续稳定上升
- 策略能稳定抓取立方体
- 开始出现旋转动作

### 长期目标（500-1000万步）
- 奖励收敛到较高水平
- 策略能熟练旋转立方体
- 训练曲线平滑稳定

## 📁 项目文件关键位置

### 模型文件
- `sim_rl/simulation/right_hand.xml` - 主要右手模型
- `sim_rl/mujoco_playground/mujoco_playground/_src/manipulation/aero_hand/xmls/` - 集成模型

### 训练脚本
- `sim_rl/mujoco_playground/learning/train_jax_ppo.py` - 主训练脚本
- `sim_rl/mujoco_playground/learning/train_rsl_rl.py` - 备选训练脚本

### 任务定义
- `sim_rl/mujoco_playground/mujoco_playground/_src/manipulation/aero_hand/rotate_z.py` - Z轴旋转任务

### 常量定义
- `sim_rl/mujoco_playground/mujoco_playground/_src/manipulation/aero_hand/aero_hand_constants.py` - 机械手常量

## 🎯 快速参考命令

### 安装与验证
```bash
# 创建环境
python3.10 -m venv .venv && source .venv/bin/activate

# 安装依赖
pip install mujoco>=3.3.6.dev playground

# 验证
python -c "import mujoco_playground; from mujoco_playground import registry; print(list(registry.ALL_ENVS))"
```

### 快速训练测试
```bash
cd sim_rl/mujoco_playground/learning
python train_jax_ppo.py --env_name=AeroCubeRotateZAxis --num_timesteps=50000 --num_envs=64
```

### 监控训练
```bash
# 查看最新日志
tail -f logs/$(ls -t logs | head -1)/train.log

# TensorBoard
tensorboard --logdir logs --port 6006
```

## 📚 参考文档

1. **官方文档**：
   - [Aero Hand 仿真文档](https://docs.tetheria.ai/docs/hand_sim/)
   - [MuJoCo Playground GitHub](https://github.com/google-deepmind/mujoco_playground)

2. **技术参考**：
   - [MuJoCo 文档](https://mujoco.readthedocs.io/)
   - [JAX 文档](https://jax.readthedocs.io/)
   - [Brax PPO 算法](https://github.com/google/brax)

3. **硬件优化**：
   - [ROCm 安装指南](https://rocm.docs.amd.com/)
   - [JAX ROCm 支持](https://jax.readthedocs.io/en/latest/rocm.html)

---

**最后更新**：2025-12-17
**适用环境**：Ubuntu 22.04 (VMware 虚拟化)
**硬件配置**：AMD 5800x3d + 5700XT
**项目版本**：Aero Hand Open 最新版本

**下一步建议**：从步骤1开始，按顺序执行。如果遇到问题，记录完整错误信息并参考故障排除部分。