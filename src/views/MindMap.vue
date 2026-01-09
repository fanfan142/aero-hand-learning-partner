<template>
  <div class="mindmap-page">
    <!-- 顶部控制栏 -->
    <div class="control-panel">
      <el-card class="control-card">
        <div class="control-content">
          <div class="control-info">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
            <span>🌌 点击节点展开/折叠 | 滚轮缩放 | 拖拽移动</span>
          </div>
          <div class="control-buttons">
            <el-button @click="resetView" size="small">
              <el-icon><RefreshRight /></el-icon>
              重置视图
            </el-button>
            <el-button @click="toggleAutoMove" :type="autoMove ? 'primary' : ''" size="small">
              <el-icon><VideoPlay /></el-icon>
              {{ autoMove ? '暂停漂浮' : '开始漂浮' }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 脑图容器 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 节点详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      :title="selectedNode?.name || '节点详情'"
      direction="rtl"
      size="45%"
      class="detail-drawer"
    >
      <div v-if="selectedNode" class="node-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon :color="getNodeColor(selectedNode.category)"><Circle /></el-icon>
              <span class="node-name">{{ selectedNode.name }}</span>
            </div>
          </template>
          <div class="node-description">
            <p>{{ selectedNode.description }}</p>
          </div>
          <el-tag :type="getCategoryType(selectedNode.category)" size="small">
            {{ getCategoryLabel(selectedNode.category) }}
          </el-tag>
        </el-card>

        <!-- 前置知识 -->
        <el-card v-if="selectedNode.prerequisites?.length" class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Reading /></el-icon>
              <span>前置知识</span>
            </div>
          </template>
          <div class="prerequisites">
            <el-tag
              v-for="prereq in selectedNode.prerequisites"
              :key="prereq"
              class="prereq-tag"
              size="small"
              type="info"
            >
              {{ prereq }}
            </el-tag>
          </div>
        </el-card>

        <!-- 实现代码 -->
        <el-card v-if="selectedNode.code" class="detail-card code-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><DocumentCopy /></el-icon>
              <span>实现代码</span>
            </div>
          </template>
          <div class="code-block">
            <pre><code>{{ selectedNode.code }}</code></pre>
            <el-button
              size="small"
              @click="copyCode(selectedNode.code)"
              class="copy-btn"
            >
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </el-card>

        <!-- 相关资源 -->
        <el-card v-if="selectedNode.resources?.length" class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Link /></el-icon>
              <span>相关资源</span>
            </div>
          </template>
          <div class="resources">
            <a
              v-for="resource in selectedNode.resources"
              :key="resource.url"
              :href="resource.url"
              target="_blank"
              class="resource-link"
            >
              <el-icon><Link /></el-icon>
              {{ resource.title }}
            </a>
          </div>
        </el-card>

        <!-- 关联功能 -->
        <el-card v-if="selectedNode.related?.length" class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              <span>关联功能</span>
            </div>
          </template>
          <div class="related">
            <div
              v-for="relatedId in selectedNode.related"
              :key="relatedId"
              class="related-item"
              @click="focusNode(relatedId)"
            >
              <el-icon><ArrowRight /></el-icon>
              {{ findNodeById(relatedId)?.name }}
            </div>
          </div>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  InfoFilled,
  RefreshRight,
  VideoPlay,
  Circle,
  Reading,
  DocumentCopy,
  CopyDocument,
  Link,
  Connection,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const chartContainer = ref(null)
const detailDrawerVisible = ref(false)
const selectedNode = ref(null)
const autoMove = ref(true)
let chart = null
let animationFrame = null

// 知识图谱数据
const knowledgeGraph = {
  nodes: [
    // 核心节点
    {
      id: 'root',
      name: 'Aero Hand',
      category: 'root',
      description: '肌腱驱动灵巧机械手 - 开源机器人项目',
      symbolSize: 80,
      prerequisites: [],
      related: ['hardware', 'firmware', 'sdk', 'simulation', 'ros2', 'rl'],
      resources: [
        { title: '官方文档', url: 'https://tetheria.github.io/aero-hand-open/' },
        { title: 'GitHub仓库', url: 'https://github.com/TetherIA/aero-hand-open' }
      ]
    },
    // 硬件
    {
      id: 'hardware',
      name: '硬件系统',
      category: 'hardware',
      description: '3D打印结构、ESP32-S3、HLS3606M舵机',
      symbolSize: 60,
      prerequisites: ['电子学基础', '3D打印'],
      related: ['esp32', 'servo', 'mechanical'],
      code: `// 硬件连接示例
ESP32-S3 <--UART--> HLS3606M舵机群
     |
     +-- 舵机1: 拇指
     +-- 舵机2: 食指
     +-- 舵机3: 中指
     +-- 舵机4: 无名指
     +-- 舵机5: 小指
     +-- 舵机6: 手腕
     +-- 舵机7: 拇指基底`
    },
    {
      id: 'esp32',
      name: 'ESP32-S3',
      category: 'hardware',
      description: '主控芯片，负责舵机控制',
      symbolSize: 45,
      prerequisites: ['嵌入式开发', 'Arduino'],
      related: ['firmware', 'uart'],
      code: `#include <HardwareSerial.h>
HardwareSerial Serial1(1);

void setup() {
  Serial1.begin(921600, SERIAL_8N1, 18, 17);
}`
    },
    {
      id: 'servo',
      name: 'HLS3606M舵机',
      category: 'hardware',
      description: '智能总线舵机，4096级分辨率',
      symbolSize: 45,
      prerequisites: ['舵机原理', 'PWM控制'],
      related: ['servo-protocol'],
      code: `// 舵机控制命令格式
// 0x01: 写入位置
// 0x10: 读取位置
byte command[] = {
  0x01,  // 舵机ID
  0x10,  // 命令码
  0x00, 0x00,  // 地址
  0x00, 0x02,  // 长度
  0x04,        // 数据长度
  0x00, 0x00,  // 位置高字节
  0x10, 0x00   // 位置低字节
};`
    },
    {
      id: 'mechanical',
      name: '机械结构',
      category: 'hardware',
      description: '3D打印的肌腱驱动结构',
      symbolSize: 45,
      prerequisites: ['机械设计', '3D建模'],
      related: [],
      code: `// 打印参数
材料: PLA
层高: 0.2mm
填充: 20%
支撑: 是
打印时间: ~8小时`
    },
    // 固件
    {
      id: 'firmware',
      name: 'ESP32固件',
      category: 'firmware',
      description: 'Arduino框架，处理串口通信',
      symbolSize: 50,
      prerequisites: ['C++', 'Arduino框架'],
      related: ['servo-protocol', 'uart'],
      code: `void loop() {
  if (Serial.available() >= 16) {
    byte buffer[16];
    Serial.readBytes(buffer, 16);
    processCommand(buffer);
  }
}`
    },
    {
      id: 'servo-protocol',
      name: '舵机协议',
      category: 'firmware',
      description: 'Feetech舵机串口通信协议',
      symbolSize: 40,
      prerequisites: ['串口通信'],
      related: [],
      code: `// 命令帧结构 (16字节)
// [ID][CMD][ADDR_L][ADDR_H][LEN_L][LEN_H][DATA...][CRC_L][CRC_H]
struct ServoCommand {
  uint8_t id;        // 舵机ID (1-7)
  uint8_t cmd;       // 命令码
  uint16_t address;  // 寄存器地址
  uint16_t length;   // 数据长度
  uint8_t data[8];   // 数据
  uint16_t crc;      // 校验和
};`
    },
    {
      id: 'uart',
      name: 'UART通信',
      category: 'firmware',
      description: '921600波特率串口通信',
      symbolSize: 40,
      prerequisites: ['串口协议'],
      related: [],
      code: `// UART配置
波特率: 921600
数据位: 8
停止位: 1
校验: 无`
    },
    // SDK
    {
      id: 'sdk',
      name: 'Python SDK',
      category: 'sdk',
      description: 'Python控制接口',
      symbolSize: 55,
      prerequisites: ['Python编程', '串口通信'],
      related: ['aerohand-class', 'gui'],
      code: `from aero_open_sdk import AeroHand

# 创建手部对象
hand = AeroHand()

# 打开手
hand.open()

# 握拳
hand.make_fist()

# 闭合
hand.close()`
    },
    {
      id: 'aerohand-class',
      name: 'AeroHand类',
      category: 'sdk',
      description: 'SDK核心类',
      symbolSize: 45,
      prerequisites: ['面向对象编程'],
      related: [],
      code: `class AeroHand:
    def __init__(self, port='/dev/ttyUSB0'):
        self.serial = Serial(port, 921600)

    def open(self):
        """张开手"""
        self._send_command(OPEN_CMD)

    def close(self):
        """闭合手"""
        self._send_command(CLOSE_CMD)`
    },
    {
      id: 'gui',
      name: 'GUI配置工具',
      category: 'sdk',
      description: '图形化舵机配置界面',
      symbolSize: 40,
      prerequisites: ['PyQt/PySide'],
      related: [],
      code: `# 启动GUI
python -m aero_open_sdk.gui_chinese

# 功能：
# - 配置舵机端点
# - 测试舵机运动
# - 保存配置到ESP32`
    },
    // 仿真
    {
      id: 'simulation',
      name: 'MuJoCo仿真',
      category: 'simulation',
      description: '物理引擎仿真环境',
      symbolSize: 55,
      prerequisites: ['物理引擎', 'Python'],
      related: ['mujoco-xml', 'mjx'],
      code: `import mujoco

# 加载模型
model = mujoco.MjModel.from_xml_path('aero_hand.xml')
data = mujoco.MjData(model)

# 仿真循环
for _ in range(1000):
    mujoco.mj_step(model, data)`
    },
    {
      id: 'mujoco-xml',
      name: 'MuJoCo XML',
      category: 'simulation',
      description: '仿真模型定义文件',
      symbolSize: 40,
      prerequisites: ['XML'],
      related: [],
      code: `<mujoco model="aero_hand">
  <worldbody>
    <body name="palm">
      <geom type="mesh" mesh="palm_mesh"/>
      <body name="finger1">
        <joint name="knuckle1" type="hinge"/>
        <body name="finger1_phalanx1">
          <geom type="mesh" mesh="phalanx1_mesh"/>
        </body>
      </body>
    </body>
  </worldbody>
</mujoco>`
    },
    {
      id: 'mjx',
      name: 'MJX',
      category: 'simulation',
      description: 'JAX加速的MuJoCo后端',
      symbolSize: 40,
      prerequisites: ['JAX'],
      related: ['rl'],
      code: `import mujoco.mjx as mjx

# JIT编译加速
import jax
mjx.step = jax.jit(mjx.step)

# 批量仿真
batch_data = mjx.step(model, batch_data)`
    },
    // ROS2
    {
      id: 'ros2',
      name: 'ROS2集成',
      category: 'ros2',
      description: '机器人操作系统2',
      symbolSize: 50,
      prerequisites: ['ROS2基础', 'Linux'],
      related: ['ros2-topics', 'ros2-nodes'],
      code: `# 发布手部命令
ros2 topic pub /hand_commands \
  aero_hand_msgs/msg/HandCommand \
  "{grasp: 0.5}"

# 订阅手部状态
ros2 topic echo /hand_state`
    },
    {
      id: 'ros2-topics',
      name: 'ROS2话题',
      category: 'ros2',
      description: '发布/订阅通信',
      symbolSize: 40,
      prerequisites: [],
      related: [],
      code: `# 话题类型
aero_hand_msgs/msg/HandCommand:
  float32 grasp      # 0-1: 张开-闭合
  float32[] finger_pos  # 各手指位置

aero_hand_msgs/msg/HandState:
  float32[] current_pos
  float32[] target_pos
  bool[] is_moving`
    },
    {
      id: 'ros2-nodes',
      name: 'ROS2节点',
      category: 'ros2',
      description: '功能模块',
      symbolSize: 40,
      prerequisites: [],
      related: [],
      code: `# 节点列表
- hand_controller: 控制硬件
- teleop: 遥操作接口
- state_publisher: 状态发布
- policy_server: 策略推理`
    },
    // 强化学习
    {
      id: 'rl',
      name: '强化学习',
      category: 'rl',
      description: 'PPO算法训练',
      symbolSize: 55,
      prerequisites: ['强化学习', 'PPO算法'],
      related: ['ppo', 'wandb', 'sim2real'],
      code: `from mujoco_playground import train

# 训练配置
config = {
    'env': 'aero_hand',
    'algorithm': 'PPO',
    'learning_rate': 3e-4,
    'num_epochs': 1000,
    'domain_randomization': True
}

# 开始训练
train.train(config)`
    },
    {
      id: 'ppo',
      name: 'PPO算法',
      category: 'rl',
      description: '近端策略优化',
      symbolSize: 40,
      prerequisites: ['策略梯度'],
      related: [],
      code: `# PPO核心思想
# 1. 收集经验
# 2. 计算优势函数
# 3. 裁剪策略更新
# 4. 价值函数更新

loss = policy_loss + value_loss + entropy_loss`
    },
    {
      id: 'wandb',
      name: 'W&B监控',
      category: 'rl',
      description: '训练可视化',
      symbolSize: 35,
      prerequisites: [],
      related: [],
      code: `import wandb

wandb.init(project='aero-hand-rl')

# 记录指标
wandb.log({
    'reward': episode_reward,
    'success_rate': success_rate,
    'loss': policy_loss
})`
    },
    {
      id: 'sim2real',
      name: 'Sim2Real',
      category: 'rl',
      description: '仿真到实物转移',
      symbolSize: 45,
      prerequisites: ['域随机化'],
      related: [],
      code: `# Sim2Real流程
# 1. 仿真训练 (with domain randomization)
# 2. 导出策略
# 3. 部署到硬件
# 4. 微调优化

policy.train_in_simulation()
policy.export()
hardware.deploy(policy)
hardware.fine_tune(policy)`
    }
  ],
  links: []
}

// 生成连线
knowledgeGraph.nodes.forEach(node => {
  if (node.related) {
    node.related.forEach(targetId => {
      knowledgeGraph.links.push({
        source: node.id,
        target: targetId,
        lineStyle: {
          curveness: 0.3
        }
      })
    })
  }
})

// 类别配置
const categories = [
  { name: 'root', color: '#667eea', label: '根节点' },
  { name: 'hardware', color: '#e74c3c', label: '硬件' },
  { name: 'firmware', color: '#f39c12', label: '固件' },
  { name: 'sdk', color: '#2ecc71', label: 'SDK' },
  { name: 'simulation', color: '#3498db', label: '仿真' },
  { name: 'ros2', color: '#9b59b6', label: 'ROS2' },
  { name: 'rl', color: '#1abc9c', label: '强化学习' }
]

// 获取节点颜色
function getNodeColor(category) {
  const cat = categories.find(c => c.name === category)
  return cat ? cat.color : '#95a5a6'
}

// 获取类别标签
function getCategoryLabel(category) {
  const cat = categories.find(c => c.name === category)
  return cat ? cat.label : category
}

// 获取类别类型
function getCategoryType(category) {
  const typeMap = {
    root: 'danger',
    hardware: 'danger',
    firmware: 'warning',
    sdk: 'success',
    simulation: 'primary',
    ros2: 'warning',
    rl: 'success'
  }
  return typeMap[category] || 'info'
}

// 查找节点
function findNodeById(id) {
  return knowledgeGraph.nodes.find(n => n.id === id)
}

// 聚焦节点
function focusNode(id) {
  const node = findNodeById(id)
  if (node) {
    selectedNode.value = node
    detailDrawerVisible.value = true
  }
}

// 复制代码
function copyCode(code) {
  navigator.clipboard.writeText(code)
  ElMessage.success('代码已复制到剪贴板')
}

// 初始化图表
function initChart() {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)

  const option = {
    backgroundColor: '#0a0e27',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20, 30, 60, 0.9)',
      borderColor: '#667eea',
      textStyle: {
        color: '#fff'
      },
      formatter: (params) => {
        if (params.dataType === 'node') {
          const node = params.data
          return `
            <div style="padding: 8px;">
              <strong style="color: ${getNodeColor(node.category)}">${node.name}</strong><br/>
              <span style="color: #ccc;">${node.description || ''}</span><br/>
              <span style="font-size: 12px; color: #888;">点击查看详情</span>
            </div>
          `
        }
        return ''
      }
    },
    legend: {
      show: false
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: knowledgeGraph.nodes.map(node => ({
          ...node,
          itemStyle: {
            color: getNodeColor(node.category),
            borderColor: '#fff',
            borderWidth: 2,
            shadowColor: getNodeColor(node.category),
            shadowBlur: 20
          },
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            position: 'bottom'
          }
        })),
        links: knowledgeGraph.links.map(link => ({
          ...link,
          lineStyle: {
            color: 'rgba(102, 126, 234, 0.3)',
            width: 2,
            curveness: 0.3
          }
        })),
        categories: categories.map(cat => ({
          name: cat.name,
          itemStyle: {
            color: cat.color
          }
        })),
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          width: 2
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          },
          itemStyle: {
            shadowBlur: 30,
            shadowColor: '#667eea'
          }
        },
        force: {
          repulsion: 500,
          edgeLength: [100, 300],
          gravity: 0.1,
          friction: 0.6
        },
        scaleLimit: {
          min: 0.3,
          max: 3
        }
      }
    ]
  }

  chart.setOption(option)

  // 点击事件
  chart.on('click', (params) => {
    if (params.dataType === 'node') {
      selectedNode.value = params.data
      detailDrawerVisible.value = true
    }
  })

  // 启动漂浮动画
  startFloatingAnimation()
}

// 漂浮动画
function startFloatingAnimation() {
  if (!autoMove.value) return

  let time = 0

  function animate() {
    if (!chart || !autoMove.value) return

    time += 0.01

    // 为每个节点添加微小的漂浮运动
    const nodes = knowledgeGraph.nodes.map((node, index) => {
      const angle = index * 0.5 + time
      const radius = 2
      return {
        ...node,
        x: node.x || 0 + Math.cos(angle) * radius,
        y: node.y || 0 + Math.sin(angle) * radius
      }
    })

    chart.setOption({
      series: [{
        data: nodes
      }]
    })

    animationFrame = requestAnimationFrame(animate)
  }

  animate()
}

// 停止漂浮动画
function stopFloatingAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

// 重置视图
function resetView() {
  if (!chart) return
  chart.dispatchAction({
    type: 'restore'
  })
}

// 切换自动漂浮
function toggleAutoMove() {
  autoMove.value = !autoMove.value
  if (autoMove.value) {
    startFloatingAnimation()
  } else {
    stopFloatingAnimation()
  }
}

// 响应式调整
function handleResize() {
  if (chart) {
    chart.resize()
  }
}

onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  stopFloatingAnimation()
  if (chart) {
    chart.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.mindmap-page {
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0a0e27 100%);
}

/* 星空背景动画 */
.mindmap-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0));
  background-size: 200px 200px;
  background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 160px 200px;
  animation: stars 20s linear infinite;
  pointer-events: none;
  opacity: 0.6;
}

@keyframes stars {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-200px);
  }
}

/* 控制面板 */
.control-panel {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 90%;
  max-width: 800px;
}

.control-card {
  background: rgba(20, 30, 60, 0.9) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  backdrop-filter: blur(10px);
}

.control-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.control-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-size: 14px;
}

.info-icon {
  font-size: 20px;
  color: #667eea;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 100%;
}

/* 详情抽屉 */
.detail-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
}

.detail-drawer :deep(.el-drawer__body) {
  padding: 20px;
  background: #f5f7fa;
}

.node-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.node-name {
  font-size: 18px;
  color: #303133;
}

.node-description {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

.prerequisites {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.prereq-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.prereq-tag:hover {
  transform: translateY(-2px);
}

/* 代码块 */
.code-card :deep(.el-card__body) {
  padding: 0;
}

.code-block {
  position: relative;
  background: #e6f3ff;
  border-radius: 8px;
  padding: 20px;
  padding-top: 50px;
  border: 1px solid #b3d9ff;
}

.code-block pre {
  margin: 0;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #1a1a1a;
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* 资源链接 */
.resources {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  text-decoration: none;
  color: #409eff;
  transition: all 0.3s;
}

.resource-link:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

/* 关联功能 */
.related {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

/* 响应式 */
@media (max-width: 768px) {
  .control-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-buttons {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
