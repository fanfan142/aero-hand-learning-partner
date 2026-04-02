<template>
  <div class="mindmap-page">
    <!-- 顶部控制栏 -->
    <div class="control-panel">
      <el-card class="control-card">
        <div class="control-content">
          <div class="control-info">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
            <span>点击节点查看详情 | 滚轮缩放 | 拖拽移动</span>
          </div>
          <div class="control-actions">
            <!-- 搜索框 -->
            <el-input
              v-model="searchText"
              placeholder="搜索知识点..."
              size="small"
              clearable
              class="search-input"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <!-- 图例开关 -->
            <el-button @click="showLegend = !showLegend" size="small" :type="showLegend ? 'primary' : ''">
              <el-icon><Collection /></el-icon>
              图例
            </el-button>

            <!-- 路径追踪开关 -->
            <el-button @click="togglePathTrace" size="small" :type="pathTraceEnabled ? 'primary' : ''">
              <el-icon><Guide /></el-icon>
              路径
            </el-button>

            <!-- 重置视图 -->
            <el-button @click="resetView" size="small">
              <el-icon><RefreshRight /></el-icon>
            </el-button>

            <!-- 导出分享 -->
            <el-dropdown @command="handleExport" trigger="click">
              <el-button size="small">
                <el-icon><Share /></el-icon>
                导出
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="png">导出为 PNG</el-dropdown-item>
                  <el-dropdown-item command="json">导出数据 JSON</el-dropdown-item>
                  <el-dropdown-item command="svg">导出为 SVG</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图例面板 -->
    <transition name="fade-slide">
      <div v-if="showLegend" class="legend-panel">
        <div class="legend-title">
          <el-icon><Collection /></el-icon>
          <span>知识领域</span>
          <el-button text @click="showLegend = false" class="legend-close">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="legend-items">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="legend-item"
            :class="{ active: selectedCategory === cat.name }"
            @click="filterByCategory(cat.name)"
          >
            <div class="legend-color" :style="{ backgroundColor: cat.color }"></div>
            <span class="legend-label">{{ cat.label }}</span>
            <span class="legend-count">{{ getCategoryNodeCount(cat.name) }}</span>
          </div>
        </div>
        <div class="legend-actions">
          <el-button size="small" text @click="clearFilters">清除筛选</el-button>
        </div>
      </div>
    </transition>

    <!-- 脑图容器 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 路径追踪面板 -->
    <transition name="fade-slide">
      <div v-if="pathTraceEnabled && currentPath.length > 0" class="path-trace-panel">
        <div class="path-trace-header">
          <el-icon><Guide /></el-icon>
          <span>当前路径</span>
          <el-button text @click="pathTraceEnabled = false"><el-icon><Close /></el-icon></el-button>
        </div>
        <div class="path-trace-breadcrumb">
          <span
            v-for="(node, index) in currentPath"
            :key="node.id"
            class="path-node"
            @click="focusNode(node.id)"
          >
            <span :style="{ color: getNodeColor(node.category) }">{{ node.name }}</span>
            <el-icon v-if="index < currentPath.length - 1"><ArrowRight /></el-icon>
          </span>
        </div>
      </div>
    </transition>

    <!-- 搜索结果高亮提示 -->
    <transition name="fade-slide">
      <div v-if="searchText && searchResults.length > 0" class="search-results-tip">
        找到 {{ searchResults.length }} 个相关节点
      </div>
    </transition>

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
              <div class="node-category-badge" :style="{ backgroundColor: getNodeColor(selectedNode.category) }">
                {{ getCategoryLabel(selectedNode.category) }}
              </div>
              <span class="node-name">{{ selectedNode.name }}</span>
            </div>
          </template>
          <div class="node-description">
            <p>{{ selectedNode.description }}</p>
          </div>
          <div class="node-meta">
            <el-tag size="small" :type="getCategoryType(selectedNode.category)">
              {{ getCategoryLabel(selectedNode.category) }}
            </el-tag>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              <el-icon><Link /></el-icon>
              {{ selectedNode.related?.length || 0 }} 个关联
            </span>
          </div>
        </el-card>

        <!-- 路径追踪 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Guide /></el-icon>
              <span>学习路径</span>
            </div>
          </template>
          <div class="learning-path">
            <el-steps :active="currentPath.length" direction="vertical" size="small">
              <el-step
                v-for="(node, index) in getPathToNode(selectedNode.id)"
                :key="node.id"
                :title="node.name"
                :description="getCategoryLabel(node.category)"
                @click="focusNode(node.id)"
              />
            </el-steps>
          </div>
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
              <span>关联功能 ({{ selectedNode.related.length }})</span>
            </div>
          </template>
          <div class="related">
            <div
              v-for="relatedId in selectedNode.related"
              :key="relatedId"
              class="related-item"
              @click="navigateToRelated(relatedId)"
            >
              <div class="related-icon" :style="{ backgroundColor: getNodeColor(findNodeById(relatedId)?.category) }">
                <el-icon><ArrowRight /></el-icon>
              </div>
              <div class="related-info">
                <span class="related-name">{{ findNodeById(relatedId)?.name }}</span>
                <span class="related-category">{{ getCategoryLabel(findNodeById(relatedId)?.category) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="node-actions">
          <el-button type="primary" @click="focusNodeInGraph(selectedNode.id)">
            <el-icon><View /></el-icon>
            在图中定位
          </el-button>
          <el-button @click="collapseNode(selectedNode.id)">
            <el-icon>{{ isNodeCollapsed(selectedNode.id) ? 'FolderOpened' : 'Folder' }}</el-icon>
            {{ isNodeCollapsed(selectedNode.id) ? '展开关联' : '折叠关联' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 缩放控制 -->
    <div class="zoom-controls">
      <el-button circle @click="zoomIn" size="small">
        <el-icon><Plus /></el-icon>
      </el-button>
      <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      <el-button circle @click="zoomOut" size="small">
        <el-icon><Minus /></el-icon>
      </el-button>
    </div>

    <!-- 展开折叠控制 -->
    <div class="layout-controls">
      <el-button-group>
        <el-button @click="expandAll" size="small" title="展开全部">
          <el-icon><FolderOpened /></el-icon>
        </el-button>
        <el-button @click="collapseAll" size="small" title="折叠全部">
          <el-icon><Folder /></el-icon>
        </el-button>
        <el-button @click="switchLayout('force')" :type="currentLayout === 'force' ? 'primary' : ''" size="small" title="力导向布局">
          <el-icon><Connection /></el-icon>
        </el-button>
        <el-button @click="switchLayout('circular')" :type="currentLayout === 'circular' ? 'primary' : ''" size="small" title="环形布局">
          <el-icon><CircleClose /></el-icon>
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import * as echarts from 'echarts'
import {
  InfoFilled,
  RefreshRight,
  Search,
  Collection,
  Guide,
  Share,
  Close,
  CircleCheck,
  Reading,
  DocumentCopy,
  CopyDocument,
  Link,
  Connection,
  ArrowRight,
  View,
  Folder,
  FolderOpened,
  Plus,
  Minus,
  CircleClose
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'

const chartContainer = ref(null)
const detailDrawerVisible = ref(false)
const selectedNode = ref(null)
const searchText = ref('')
const searchResults = ref([])
const showLegend = ref(false)
const selectedCategory = ref(null)
const pathTraceEnabled = ref(false)
const currentPath = ref([])
const zoomLevel = ref(1)
const currentLayout = ref('force')
const collapsedNodes = ref(new Set())

let chart = null
let animationFrame = null
let allNodes = []
let allLinks = []

// 知识图谱数据
const knowledgeGraph = {
  nodes: [
    // 核心节点
    {
      id: 'root',
      name: 'Aero Hand',
      category: 'root',
      description: '肌腱驱动灵巧机械手 - 开源机器人项目。旨在为研究实验室、教育机构和机器人爱好者提供一个经济实惠但功能强大的操作平台。',
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
      description: '包含3D打印结构、ESP32-S3主控板和HLS3606M智能舵机的完整硬件系统。采用肌腱驱动方式实现自然平滑的运动。',
      symbolSize: 60,
      prerequisites: ['电子学基础', '3D打印'],
      related: ['esp32', 'servo', 'mechanical', 'pcb'],
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
      description: '乐鑫科技出品的高性能MCU，集成WiFi和蓝牙，用于主控和舵机通信。',
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
      description: 'Feetech智能总线舵机，4096级分辨率，支持位置反馈和力矩控制。',
      symbolSize: 45,
      prerequisites: ['舵机原理', 'PWM控制'],
      related: ['servo-protocol', 'firmware'],
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
      description: '3D打印的肌腱驱动结构，包含手掌模块和五个手指模块。',
      symbolSize: 45,
      prerequisites: ['机械设计', '3D建模'],
      related: ['hardware'],
      code: `// 打印参数
材料: PLA
层高: 0.2mm
填充: 20%
支撑: 是
打印时间: ~8小时`
    },
    {
      id: 'pcb',
      name: 'PCB设计',
      category: 'hardware',
      description: '自定义PCB实现舵机阵列供电和信号路由。',
      symbolSize: 40,
      prerequisites: ['电路设计', 'KiCad'],
      related: ['hardware', 'esp32'],
      code: `// PCB规格
层数: 2层
尺寸: 60x80mm
供电: 7.4V LiPo
通信: UART @ 921600`
    },
    // 固件
    {
      id: 'firmware',
      name: 'ESP32固件',
      category: 'firmware',
      description: '基于Arduino框架的固件，负责串口协议解析和舵机控制。',
      symbolSize: 50,
      prerequisites: ['C++', 'Arduino框架'],
      related: ['servo-protocol', 'uart', 'homing'],
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
      description: 'Feetech舵机串口通信协议，16字节固定帧格式。',
      symbolSize: 40,
      prerequisites: ['串口通信'],
      related: ['firmware', 'servo'],
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
      description: '921600波特率高速串口通信，确保实时控制。',
      symbolSize: 40,
      prerequisites: ['串口协议'],
      related: ['firmware', 'esp32'],
      code: `// UART配置
波特率: 921600
数据位: 8
停止位: 1
校验: 无`
    },
    {
      id: 'homing',
      name: '归位程序',
      category: 'firmware',
      description: '机械手归位和校准程序，确保各关节位置准确。',
      symbolSize: 40,
      prerequisites: ['舵机控制'],
      related: ['firmware'],
      code: `void homing() {
  for (int i = 1; i <= 7; i++) {
    servo.move(i, HOME_POS[i], 1000);
    delay(100);
  }
}`
    },
    // SDK
    {
      id: 'sdk',
      name: 'Python SDK',
      category: 'sdk',
      description: 'Python控制接口，提供简洁易用的API和GUI工具。',
      symbolSize: 55,
      prerequisites: ['Python编程', '串口通信'],
      related: ['aerohand-class', 'gui', 'examples'],
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
      description: 'SDK核心类，封装所有手部控制功能。',
      symbolSize: 45,
      prerequisites: ['面向对象编程'],
      related: ['sdk'],
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
      description: '图形化舵机配置界面，支持端点设置和运动测试。',
      symbolSize: 40,
      prerequisites: ['PyQt/PySide'],
      related: ['sdk'],
      code: `# 启动GUI
python -m aero_open_sdk.gui_chinese

# 功能：
# - 配置舵机端点
# - 测试舵机运动
# - 保存配置到ESP32`
    },
    {
      id: 'examples',
      name: '示例脚本',
      category: 'sdk',
      description: '丰富的示例代码，展示各种控制功能。',
      symbolSize: 40,
      prerequisites: ['Python基础'],
      related: ['sdk', 'aerohand-class'],
      code: `# 运行示例
python examples/run_sequence.py
python examples/gui_control.py
python examples/calibration.py`
    },
    // 仿真
    {
      id: 'simulation',
      name: 'MuJoCo仿真',
      category: 'simulation',
      description: '基于MuJoCo物理引擎的高保真仿真环境。',
      symbolSize: 55,
      prerequisites: ['物理引擎', 'Python'],
      related: ['mujoco-xml', 'mjx', 'sim2real'],
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
      description: '仿真模型定义文件，描述刚体和关节结构。',
      symbolSize: 40,
      prerequisites: ['XML', 'MuJoCo基础'],
      related: ['simulation'],
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
      description: 'JAX加速的MuJoCo后端，支持GPU并行仿真。',
      symbolSize: 40,
      prerequisites: ['JAX', 'GPU加速'],
      related: ['simulation', 'rl'],
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
      description: '完整的ROS2 Humble集成，支持遥操作和高级应用。',
      symbolSize: 50,
      prerequisites: ['ROS2基础', 'Linux'],
      related: ['ros2-topics', 'ros2-nodes', 'ros2-services'],
      code: `# 发布手部命令
ros2 topic pub /hand_commands \\
  aero_hand_msgs/msg/HandCommand \\
  "{grasp: 0.5}"

# 订阅手部状态
ros2 topic echo /hand_state`
    },
    {
      id: 'ros2-topics',
      name: 'ROS2话题',
      category: 'ros2',
      description: '发布/订阅通信接口，传输手部命令和状态。',
      symbolSize: 40,
      prerequisites: ['ROS2话题'],
      related: ['ros2'],
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
      description: '功能模块节点：控制、遥操作、状态发布。',
      symbolSize: 40,
      prerequisites: ['ROS2节点'],
      related: ['ros2'],
      code: `# 节点列表
- hand_controller: 控制硬件
- teleop: 遥操作接口
- state_publisher: 状态发布
- policy_server: 策略推理`
    },
    {
      id: 'ros2-services',
      name: 'ROS2服务',
      category: 'ros2',
      description: '同步服务调用，用于配置和查询手部状态。',
      symbolSize: 40,
      prerequisites: ['ROS2服务'],
      related: ['ros2'],
      code: `# 服务类型
/hand/calibrate: 校准服务
/hand/get_status: 获取状态
/hand/set_mode: 设置模式`
    },
    // 强化学习
    {
      id: 'rl',
      name: '强化学习',
      category: 'rl',
      description: '使用PPO算法在仿真环境中训练灵巧操作策略。',
      symbolSize: 55,
      prerequisites: ['强化学习', 'PPO算法'],
      related: ['ppo', 'wandb', 'sim2real', 'learning'],
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
      description: '近端策略优化算法，稳定高效策略更新。',
      symbolSize: 40,
      prerequisites: ['策略梯度'],
      related: ['rl'],
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
      description: 'Weights & Biases训练可视化与实验追踪。',
      symbolSize: 35,
      prerequisites: [],
      related: ['rl'],
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
      description: '仿真到实物转移技术，域随机化提升迁移能力。',
      symbolSize: 45,
      prerequisites: ['域随机化'],
      related: ['rl', 'simulation'],
      code: `# Sim2Real流程
# 1. 仿真训练 (with domain randomization)
# 2. 导出策略
# 3. 部署到硬件
# 4. 微调优化

policy.train_in_simulation()
policy.export()
hardware.deploy(policy)
hardware.fine_tune(policy)`
    },
    {
      id: 'learning',
      name: '训练任务',
      category: 'rl',
      description: '定义各种灵巧操作训练任务，如抓取、放置等。',
      symbolSize: 40,
      prerequisites: ['RL环境'],
      related: ['rl'],
      code: `# 任务定义
class GraspTask:
    def __init__(self):
        self.goal = 'grasp object'
        self.reward_fn = grasp_reward

    def reset(self):
        return self.env.reset()

    def step(self, action):
        return self.env.step(action)`
    }
  ],
  links: []
}

// 生成连线
knowledgeGraph.nodes.forEach(node => {
  if (node.related) {
    node.related.forEach(targetId => {
      // 避免重复添加连线
      const linkExists = knowledgeGraph.links.some(
        l => (l.source === node.id && l.target === targetId) ||
             (l.source === targetId && l.target === node.id)
      )
      if (!linkExists) {
        knowledgeGraph.links.push({
          source: node.id,
          target: targetId,
          lineStyle: {
            curveness: 0.2
          }
        })
      }
    })
  }
})

// 存储原始数据
allNodes = JSON.parse(JSON.stringify(knowledgeGraph.nodes))
allLinks = JSON.parse(JSON.stringify(knowledgeGraph.links))

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

// 获取某类别节点数量
function getCategoryNodeCount(categoryName) {
  return allNodes.filter(n => n.category === categoryName).length
}

// 查找节点
function findNodeById(id) {
  return allNodes.find(n => n.id === id)
}

// 获取到某节点的路径
function getPathToNode(nodeId) {
  const path = []
  const visited = new Set()

  function traverse(currentId) {
    if (visited.has(currentId)) return
    visited.add(currentId)

    const node = findNodeById(currentId)
    if (node) {
      path.push(node)
    }

    // 如果是root或者还没找到目标
    if (currentId !== 'root') {
      // 找父节点（关联到当前节点的节点）
      const parents = allLinks
        .filter(l => l.target === currentId)
        .map(l => typeof l.source === 'object' ? l.source.id : l.source)

      for (const parentId of parents) {
        if (!visited.has(parentId)) {
          traverse(parentId)
          break
        }
      }
    }
  }

  traverse('root')

  // 重新从目标节点往回找
  const finalPath = []
  const nodeMap = new Map()

  function buildPath(id) {
    if (nodeMap.has(id)) return
    nodeMap.set(id, true)

    const node = findNodeById(id)
    if (node) {
      if (id === 'root') {
        finalPath.unshift(node)
        return
      }
      const parents = allLinks
        .filter(l => l.target === id)
        .map(l => typeof l.source === 'object' ? l.source.id : l.source)

      if (parents.length > 0) {
        buildPath(parents[0])
      }
      finalPath.unshift(node)
    }
  }

  buildPath(nodeId)
  return finalPath
}

// 聚焦节点
function focusNode(id) {
  const node = findNodeById(id)
  if (node) {
    selectedNode.value = node
    currentPath.value = getPathToNode(id)
    detailDrawerVisible.value = true
  }
}

// 聚焦图中的节点
function focusNodeInGraph(nodeId) {
  if (!chart) return

  const node = findNodeById(nodeId)
  if (node) {
    chart.dispatchAction({
      type: 'focusNodeAdjacency',
      dataIndex: allNodes.findIndex(n => n.id === nodeId)
    })

    chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: allNodes.findIndex(n => n.id === nodeId)
    })
  }
}

// 导航到关联节点
function navigateToRelated(relatedId) {
  detailDrawerVisible.value = false
  nextTick(() => {
    focusNode(relatedId)
  })
}

// 复制代码
function copyCode(code) {
  navigator.clipboard.writeText(code)
  ElMessage.success('代码已复制到剪贴板')
}

// 搜索处理
function handleSearch() {
  if (!chart || !searchText.value.trim()) {
    searchResults.value = []
    clearHighlight()
    return
  }

  const query = searchText.value.toLowerCase()
  searchResults.value = allNodes.filter(node =>
    node.name.toLowerCase().includes(query) ||
    node.description?.toLowerCase().includes(query)
  )

  if (searchResults.value.length > 0) {
    highlightSearchResults()
  }
}

// 高亮搜索结果
function highlightSearchResults() {
  if (!chart) return

  const query = searchText.value.toLowerCase()

  chart.setOption({
    series: [{
      data: allNodes.map(node => {
        const isMatch = node.name.toLowerCase().includes(query) ||
                       node.description?.toLowerCase().includes(query)

        return {
          ...node,
          itemStyle: {
            color: isMatch ? '#ffd700' : getNodeColor(node.category),
            borderColor: isMatch ? '#fff' : '#fff',
            borderWidth: isMatch ? 3 : 2,
            shadowBlur: isMatch ? 30 : 20,
            shadowColor: isMatch ? '#ffd700' : getNodeColor(node.category)
          },
          symbolSize: isMatch ? node.symbolSize * 1.2 : node.symbolSize
        }
      })
    }]
  })
}

// 清除高亮
function clearHighlight() {
  if (!chart) return

  chart.setOption({
    series: [{
      data: allNodes.map(node => ({
        ...node,
        itemStyle: {
          color: selectedCategory.value && node.category !== selectedCategory.value
            ? 'rgba(150,150,150,0.5)'
            : getNodeColor(node.category),
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 20,
          shadowColor: getNodeColor(node.category)
        },
        symbolSize: node.symbolSize
      }))
    }]
  })
}

// 按类别筛选
function filterByCategory(categoryName) {
  if (selectedCategory.value === categoryName) {
    selectedCategory.value = null
  } else {
    selectedCategory.value = categoryName
  }

  if (!chart) return

  chart.setOption({
    series: [{
      data: allNodes.map(node => {
        const isHighlight = !selectedCategory.value || node.category === selectedCategory.value
        return {
          ...node,
          itemStyle: {
            color: isHighlight ? getNodeColor(node.category) : 'rgba(100,100,100,0.4)',
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: isHighlight ? 20 : 5,
            shadowColor: isHighlight ? getNodeColor(node.category) : 'transparent',
            opacity: isHighlight ? 1 : 0.4
          },
          symbolSize: isHighlight ? node.symbolSize : node.symbolSize * 0.8
        }
      })
    }]
  })
}

// 清除筛选
function clearFilters() {
  selectedCategory.value = null
  searchText.value = ''
  searchResults.value = []
  clearHighlight()
}

// 切换路径追踪
function togglePathTrace() {
  pathTraceEnabled.value = !pathTraceEnabled.value
  if (pathTraceEnabled.value && selectedNode.value) {
    currentPath.value = getPathToNode(selectedNode.value.id)
  } else {
    currentPath.value = []
  }
}

// 节点是否折叠
function isNodeCollapsed(nodeId) {
  return collapsedNodes.value.has(nodeId)
}

// 折叠/展开节点关联
function collapseNode(nodeId) {
  if (collapsedNodes.value.has(nodeId)) {
    collapsedNodes.value.delete(nodeId)
  } else {
    collapsedNodes.value.add(nodeId)
  }

  updateGraphData()
}

// 更新图形数据
function updateGraphData() {
  if (!chart) return

  const visibleLinks = collapsedNodes.value.size === 0
    ? allLinks
    : allLinks.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
        const targetId = typeof link.target === 'object' ? link.target.id : link.target
        return !collapsedNodes.value.has(sourceId) && !collapsedNodes.value.has(targetId)
      })

  chart.setOption({
    series: [{
      data: allNodes,
      links: visibleLinks
    }]
  })
}

// 展开全部
function expandAll() {
  collapsedNodes.value.clear()
  updateGraphData()
  ElMessage.success('已展开全部节点')
}

// 折叠全部
function collapseAll() {
  allNodes.forEach(node => {
    if (node.id !== 'root') {
      collapsedNodes.value.add(node.id)
    }
  })
  updateGraphData()
  ElMessage.success('已折叠全部节点')
}

// 切换布局
function switchLayout(layout) {
  currentLayout.value = layout
  if (!chart) return

  chart.setOption({
    series: [{
      layout: layout
    }]
  })
}

// 缩放控制
function zoomIn() {
  if (!chart) return
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
  chart.dispatchAction({
    type: 'zoom',
    dataIndex: 0,
    zoom: 1.2
  })
}

function zoomOut() {
  if (!chart) return
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.3)
  chart.dispatchAction({
    type: 'zoom',
    dataIndex: 0,
    zoom: 0.8
  })
}

// 导出处理
function handleExport(command) {
  switch (command) {
    case 'png':
      exportAsPNG()
      break
    case 'json':
      exportAsJSON()
      break
    case 'svg':
      exportAsSVG()
      break
  }
}

// 导出PNG
function exportAsPNG() {
  if (!chart) return

  const url = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#0a0e27'
  })

  const link = document.createElement('a')
  link.download = 'aero-hand-knowledge-graph.png'
  link.href = url
  link.click()

  ElMessage.success('已导出PNG图片')
}

// 导出JSON
function exportAsJSON() {
  const data = {
    nodes: allNodes,
    links: allLinks,
    categories: categories,
    exportTime: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = 'aero-hand-knowledge-graph.json'
  link.href = url
  link.click()
  URL.revokeObjectURL(url)

  ElMessage.success('已导出JSON数据')
}

// 导出SVG
function exportAsSVG() {
  ElNotification({
    title: '提示',
    message: 'SVG导出需要ECharts 5.4.0以上版本，请使用PNG或JSON导出',
    type: 'info'
  })
}

// 重置视图
function resetView() {
  if (!chart) return
  chart.dispatchAction({
    type: 'restore'
  })
  zoomLevel.value = 1
}

// 初始化图表
function initChart() {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)

  const option = {
    backgroundColor: '#0a0e27',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20, 30, 60, 0.95)',
      borderColor: '#667eea',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      formatter: (params) => {
        if (params.dataType === 'node') {
          const node = params.data
          return `
            <div style="padding: 12px; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${getNodeColor(node.category)};"></div>
                <strong style="font-size: 14px;">${node.name}</strong>
              </div>
              <div style="color: #aaa; font-size: 12px; margin-bottom: 8px;">${node.description || ''}</div>
              <div style="color: #667eea; font-size: 11px;">点击查看详情</div>
            </div>
          `
        } else if (params.dataType === 'edge') {
          return ''
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
        data: allNodes.map(node => ({
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
            position: 'bottom',
            formatter: '{b}'
          }
        })),
        links: allLinks.map(link => ({
          ...link,
          lineStyle: {
            color: 'rgba(102, 126, 234, 0.4)',
            width: 2,
            curveness: 0.2
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
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [6, 10],
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10
        },
        lineStyle: {
          color: 'source',
          curveness: 0.2,
          width: 2
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4,
            color: '#667eea'
          },
          itemStyle: {
            shadowBlur: 30,
            shadowColor: '#667eea',
            borderWidth: 3
          }
        },
        force: {
          repulsion: 400,
          edgeLength: [80, 200],
          gravity: 0.1,
          friction: 0.6,
          layoutAnimation: true
        },
        scaleLimit: {
          min: 0.3,
          max: 3
        },
        zlevel: 1
      }
    ]
  }

  chart.setOption(option)

  // 点击事件
  chart.on('click', (params) => {
    if (params.dataType === 'node') {
      selectedNode.value = params.data
      currentPath.value = getPathToNode(params.data.id)
      detailDrawerVisible.value = true
    }
  })

  // 缩放事件
  chart.on('datazoom', (params) => {
    if (params.batch) {
      zoomLevel.value = params.batch[0]?.end / 100 || 1
    }
  })
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
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
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
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

/* 控制面板 */
.control-panel {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 95%;
  max-width: 1000px;
}

.control-card {
  background: rgba(20, 30, 60, 0.95) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  backdrop-filter: blur(10px);
}

.control-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.control-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-size: 13px;
}

.info-icon {
  font-size: 20px;
  color: #667eea;
}

.control-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 180px;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.search-input :deep(.el-input__inner) {
  color: #fff;
}

/* 图例面板 */
.legend-panel {
  position: absolute;
  top: 100px;
  left: 20px;
  z-index: 100;
  background: rgba(20, 30, 60, 0.95);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  backdrop-filter: blur(10px);
}

.legend-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-close {
  margin-left: auto;
  color: #fff;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.legend-item:hover,
.legend-item.active {
  background: rgba(102, 126, 234, 0.3);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  color: #fff;
  font-size: 13px;
  flex: 1;
}

.legend-count {
  color: #667eea;
  font-size: 12px;
  background: rgba(102, 126, 234, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.legend-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

/* 路径追踪面板 */
.path-trace-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(20, 30, 60, 0.95);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  backdrop-filter: blur(10px);
  max-width: 90%;
}

.path-trace-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 12px;
}

.path-trace-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.path-node {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.path-node:hover {
  background: rgba(102, 126, 234, 0.2);
}

/* 搜索结果提示 */
.search-results-tip {
  position: absolute;
  top: 100px;
  right: 20px;
  z-index: 100;
  background: rgba(102, 126, 234, 0.9);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 100%;
}

/* 缩放控制 */
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 30, 60, 0.9);
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.zoom-level {
  color: #fff;
  font-size: 12px;
  min-width: 45px;
  text-align: center;
}

/* 布局控制 */
.layout-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100;
}

/* 详情抽屉 */
.detail-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
  margin-bottom: 0;
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

.node-category-badge {
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.node-name {
  font-size: 18px;
  color: #303133;
}

.node-description {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
  margin-bottom: 12px;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #909399;
  font-size: 12px;
}

.meta-divider {
  color: #dcdfe6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 学习路径 */
.learning-path {
  padding: 10px 0;
}

.learning-path :deep(.el-step__title) {
  cursor: pointer;
}

.learning-path :deep(.el-step__title:hover) {
  color: #667eea;
}

/* 前置知识 */
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
  background: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  padding-top: 50px;
}

.code-block pre {
  margin: 0;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #9cdcfe;
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
  gap: 12px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

.related-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.related-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.related-name {
  font-weight: 500;
  color: #303133;
}

.related-category {
  font-size: 12px;
  color: #909399;
}

/* 节点操作按钮 */
.node-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式 */
@media (max-width: 768px) {
  .control-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .search-input {
    width: 100%;
  }

  .legend-panel {
    left: 10px;
    right: 10px;
    min-width: auto;
  }

  .path-trace-panel {
    left: 10px;
    right: 10px;
    transform: none;
  }

  .zoom-controls {
    bottom: 80px;
  }

  .layout-controls {
    bottom: 80px;
  }
}
</style>
