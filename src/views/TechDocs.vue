<template>
  <div class="tech-docs-page">
    <el-container class="docs-container">
      <!-- 左侧文档列表区域 -->
      <el-aside :width="showDocDetail ? '380px' : '100%'" class="docs-sidebar">
        <div class="sidebar-header card">
          <h1>📚 技术文档中心</h1>
          <p class="subtitle">AI生成的深度技术文档，全面理解Aero Hand Open</p>

          <!-- 搜索栏 -->
          <el-input
            v-model="searchQuery"
            placeholder="搜索文档标题、内容..."
            prefix-icon="Search"
            clearable
            size="default"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 分类标签筛选 -->
          <div class="category-tabs">
            <el-radio-group v-model="selectedCategory" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="api">API文档</el-radio-button>
              <el-radio-button value="architecture">架构设计</el-radio-button>
              <el-radio-button value="protocol">通信协议</el-radio-button>
              <el-radio-button value="data">数据格式</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 标签筛选 -->
          <div class="tag-filter">
            <span class="filter-label">标签：</span>
            <el-check-tag
              v-for="tag in availableTags"
              :key="tag"
              :checked="selectedTags.includes(tag)"
              @change="toggleTag(tag)"
              class="tag-item"
            >
              {{ tag }}
            </el-check-tag>
          </div>

          <!-- 收藏筛选 -->
            <div class="filter-actions">
              <el-button text size="small" @click="showFavoritesOnly = !showFavoritesOnly">
                <el-icon><Star /></el-icon>
                {{ showFavoritesOnly ? '显示全部' : '只看收藏' }}
              </el-button>
              <el-button text size="small" @click="sortByDate">
                <el-icon><Sort /></el-icon>
                {{ sortOrder === 'desc' ? '最新优先' : '最早优先' }}
              </el-button>
            </div>
        </div>

        <!-- 文档列表 -->
        <div class="doc-list" :class="{ 'list-collapsed': showDocDetail }">
          <div
            v-for="doc in filteredAndSortedDocs"
            :key="doc.id"
            class="doc-item"
            :class="{ active: currentDocId === doc.id, favorite: doc.favorite }"
            @click="selectDoc(doc)"
          >
            <div class="doc-item-header">
              <span class="doc-icon">{{ doc.icon }}</span>
              <div class="doc-info">
                <h4>{{ doc.title }}</h4>
                <p class="doc-summary">{{ doc.summary }}</p>
              </div>
              <el-icon v-if="doc.favorite" class="star-icon"><Star /></el-icon>
            </div>
            <div class="doc-item-footer">
              <div class="doc-tags">
                <el-tag v-for="tag in doc.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
              <span class="doc-date">{{ doc.date }}</span>
            </div>
            <div v-if="doc.readProgress > 0 && doc.readProgress < 100" class="read-progress-bar">
              <div class="progress-fill" :style="{ width: doc.readProgress + '%' }"></div>
            </div>
          </div>

          <el-empty v-if="filteredAndSortedDocs.length === 0" description="暂无匹配的文档" />
        </div>
      </el-aside>

      <!-- 右侧文档详情区域 -->
      <el-main v-if="showDocDetail" class="docs-main">
        <div class="doc-detail card">
          <!-- 文档头部 -->
          <div class="detail-header">
            <div class="header-left">
              <el-button text @click="closeDoc">
                <el-icon><ArrowLeft /></el-icon> 返回列表
              </el-button>
              <el-dropdown @command="handleDocAction" trigger="click">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="favorite">
                      <el-icon><Star /></el-icon>
                      {{ currentDoc.favorite ? '取消收藏' : '添加收藏' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="export">
                      <el-icon><Download /></el-icon>
                      导出文档
                    </el-dropdown-item>
                    <el-dropdown-item command="copyLink">
                      <el-icon><Link /></el-icon>
                      复制链接
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="header-right">
              <el-tag :type="currentDoc.categoryType">{{ currentDoc.category }}</el-tag>
              <el-tag v-for="tag in currentDoc.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
            </div>
          </div>

          <!-- 文档标题区 -->
          <div class="detail-title-section">
            <h1>{{ currentDoc.title }}</h1>
            <p class="detail-summary">{{ currentDoc.summary }}</p>
            <div class="detail-meta">
              <span><el-icon><Calendar /></el-icon> {{ currentDoc.date }}</span>
              <span><el-icon><Timer /></el-icon> {{ currentDoc.readTime }}</span>
              <span><el-icon><View /></el-icon> 阅读 {{ currentDoc.readProgress }}%</span>
            </div>
          </div>

          <!-- 文档内容和目录 -->
          <div class="detail-body">
            <!-- 侧边目录 -->
            <el-aside width="220px" class="detail-toc">
              <div class="toc-container">
                <h5>文档目录</h5>
                <ul class="toc-list">
                  <li
                    v-for="item in tableOfContents"
                    :key="item.id"
                    :class="{ active: activeHeading === item.id, [`level-${item.level}`]: true }"
                    @click="scrollToHeading(item.id)"
                  >
                    {{ item.text }}
                  </li>
                </ul>
                <div class="toc-progress">
                  <span>阅读进度</span>
                  <el-progress :percentage="currentDoc.readProgress" :stroke-width="6" />
                </div>
              </div>
            </el-aside>

            <!-- 文档正文 -->
            <div class="detail-content" ref="contentRef" @scroll="handleContentScroll">
              <div class="markdown-body" v-html="renderedMarkdown"></div>

              <!-- 笔记区域 -->
              <div class="notes-section">
                <div class="notes-header">
                  <h4><el-icon><Edit /></el-icon> 笔记</h4>
                  <el-button text size="small" @click="toggleNoteEditor">
                    {{ showNoteEditor ? '收起' : '添加笔记' }}
                  </el-button>
                </div>

                <!-- 笔记列表 -->
                <div v-if="currentDoc.notes && currentDoc.notes.length" class="notes-list">
                  <div v-for="(note, idx) in currentDoc.notes" :key="idx" class="note-item">
                    <div class="note-content">{{ note.content }}</div>
                    <div class="note-footer">
                      <span class="note-time">{{ note.time }}</span>
                      <el-button text size="small" @click="deleteNote(idx)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>

                <!-- 笔记编辑器 -->
                <div v-if="showNoteEditor" class="note-editor">
                  <el-input
                    v-model="newNoteContent"
                    type="textarea"
                    :rows="3"
                    placeholder="写下你的笔记..."
                  />
                  <div class="editor-actions">
                    <el-button type="primary" size="small" @click="addNote">保存笔记</el-button>
                    <el-button size="small" @click="cancelNote">取消</el-button>
                  </div>
                </div>
              </div>

              <!-- 相关文档 -->
              <div v-if="relatedDocs.length" class="related-section">
                <h4><el-icon><Connection /></el-icon> 相关文档</h4>
                <div class="related-list">
                  <div
                    v-for="rel in relatedDocs"
                    :key="rel.id"
                    class="related-item"
                    @click="selectDoc(rel)"
                  >
                    <span class="rel-icon">{{ rel.icon }}</span>
                    <div class="rel-info">
                      <span class="rel-title">{{ rel.title }}</span>
                      <span class="rel-category">{{ rel.category }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 版本历史 -->
              <div class="version-section">
                <h4><el-icon><Timer /></el-icon> 版本历史</h4>
                <el-timeline>
                  <el-timeline-item
                    v-for="ver in currentDoc.versionHistory"
                    :key="ver.version"
                    :timestamp="ver.date"
                  >
                    <div class="version-item">
                      <span class="version-num">v{{ ver.version }}</span>
                      <span class="version-desc">{{ ver.description }}</span>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </div>
        </div>
      </el-main>

      <!-- 未选择文档时的占位 -->
      <el-main v-else class="docs-main">
        <div class="empty-selection card">
          <el-icon class="empty-icon"><Document /></el-icon>
          <h3>选择一个文档开始阅读</h3>
          <p>从左侧列表选择文档，查看详细内容、技术分析和相关资源</p>
          <div class="quick-stats">
            <div class="stat-item">
              <span class="stat-num">{{ totalDocs }}</span>
              <span class="stat-label">篇文档</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ favoriteCount }}</span>
              <span class="stat-label">篇收藏</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ avgReadProgress }}%</span>
              <span class="stat-label">平均进度</span>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>

    <!-- 复制代码成功提示 -->
    <el-message :model-value="copyMessage.visible" :type="copyMessage.type">
      {{ copyMessage.text }}
    </el-message>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import {
  Search,
  Document,
  Clock,
  Reading,
  ArrowRight,
  ArrowLeft,
  Loading,
  DocumentDelete,
  DataAnalysis,
  Star,
  Download,
  Link,
  Calendar,
  Timer,
  View,
  Edit,
  Delete,
  Connection,
  MoreFilled,
  Sort
} from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import cpp from 'highlight.js/lib/languages/cpp'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import Logger from '@/utils/logger.js'

const LOG_LABEL = 'TechDocs'

// 注册 highlight.js 语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', cpp)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)

// Markdown 解析器配置
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        return `<pre class="hljs-code-block"><div class="code-header"><span class="code-lang">${lang}</span><button class="copy-btn" onclick="copyCode(this)"><span class="copy-text">复制</span></button></div><code class="hljs language-${lang}">${highlighted}</code></pre>`
      } catch (e) {
        Logger.error(LOG_LABEL, '代码高亮失败:', e)
      }
    }
    const escaped = md.utils.escapeHtml(str)
    return `<pre class="hljs-code-block"><div class="code-header"><span class="code-lang">${lang || 'text'}</span><button class="copy-btn" onclick="copyCode(this)"><span class="copy-text">复制</span></button></div><code class="hljs">${escaped}</code></pre>`
  }
})

// 状态变量
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedTags = ref([])
const showFavoritesOnly = ref(false)
const sortOrder = ref('desc')
const showDocDetail = ref(false)
const currentDocId = ref(null)
const currentDoc = ref(null)
const showNoteEditor = ref(false)
const newNoteContent = ref('')
const tableOfContents = ref([])
const activeHeading = ref('')
const contentRef = ref(null)
const copyMessage = ref({ visible: false, text: '', type: 'success' })

// 文档数据 - 按新分类组织
const allDocs = ref([
  {
    id: 'api1',
    icon: '📡',
    title: 'SDK API 参考文档',
    summary: 'AeroHand Python SDK 完整API接口文档，包含所有控制方法和参数说明',
    content: `# SDK API 参考文档

## AeroHand 类

### 构造函数

\`\`\`python
hand = AeroHand(port='/dev/ttyUSB0', baudrate=921600)
\`\`\`

### 主要方法

#### connect()
连接到机械手。

\`\`\`python
def connect() -> bool:
    """建立串口连接"""
    pass
\`\`\`

#### disconnect()
断开连接。

#### set_joint_positions(positions)
设置关节角度。

\`\`\`python
def set_joint_positions(self, positions: List[float]) -> bool:
    """
    设置所有关节的目标角度

    Args:
        positions: 6个关节的角度列表 [thumb, index, middle, ring, little, twist]

    Returns:
        bool: 是否成功
    """
    pass
\`\`\`

#### get_joint_positions()
获取当前关节角度。

## 错误码

| 错误码 | 含义 |
|--------|------|
| 0x00 | 成功 |
| 0x01 | 超时 |
| 0x02 | 校验失败 |

## 示例代码

\`\`\`python
from aero_open_sdk import AeroHand

hand = AeroHand('/dev/ttyUSB0')
hand.connect()

# 打开手
positions = [0, 0, 0, 0, 0, 0]
hand.set_joint_positions(positions)
\`\`\`
`,
    category: 'API文档',
    categoryType: 'primary',
    tags: ['SDK', 'Python', 'API'],
    date: '2025-12-29',
    readTime: '15分钟',
    readProgress: 0,
    favorite: false,
    notes: [],
    versionHistory: [
      { version: '1.2', date: '2025-12-30', description: '新增运动学方法' },
      { version: '1.1', date: '2025-12-28', description: '添加错误处理' },
      { version: '1.0', date: '2025-12-20', description: '初始版本' }
    ],
    relatedIds: ['proto1', 'arch1']
  },
  {
    id: 'api2',
    icon: '🐍',
    title: 'Python SDK 快速开始',
    summary: 'Python控制接口的安装、配置和基础使用教程',
    content: `# Python SDK 快速开始

## 安装

\`\`\`bash
pip install aero-open-sdk
\`\`\`

## 环境要求

- Python 3.10+
- pyserial >= 3.5
- numpy >= 1.21

## 快速开始

### 1. 导入并初始化

\`\`\`python
from aero_open_sdk import AeroHand

# 创建实例
hand = AeroHand(port='/dev/ttyUSB0')
\`\`\`

### 2. 连接机械手

\`\`\`python
# 连接
if hand.connect():
    print("连接成功!")
else:
    print("连接失败")
\`\`\`

### 3. 控制机械手

\`\`\`python
# 获取当前状态
positions = hand.get_joint_positions()
print(f"当前角度: {positions}")

# 设置新位置
hand.set_joint_positions([45, 30, 0, 0, 0, 0])
\`\`\`

## 配置

可以传入配置字典：

\`\`\`python
config = {
    'baudrate': 921600,
    'timeout': 1.0,
    'hand_type': 'left'  # 或 'right'
}
hand = AeroHand(port='/dev/ttyUSB0', **config)
\`\`\`
`,
    category: 'API文档',
    categoryType: 'primary',
    tags: ['SDK', 'Python', '教程'],
    date: '2025-12-28',
    readTime: '10分钟',
    readProgress: 0,
    favorite: true,
    notes: [],
    versionHistory: [
      { version: '1.1', date: '2025-12-28', description: '更新安装说明' },
      { version: '1.0', date: '2025-12-20', description: '初始版本' }
    ],
    relatedIds: ['api1', 'proto1']
  },
  {
    id: 'arch1',
    icon: '🏗️',
    title: '系统架构设计文档',
    summary: 'Aero Hand Open 整体系统架构、各模块职责和交互方式',
    content: `# 系统架构设计文档

## 整体架构

系统采用分层架构设计：

\`\`\`
┌─────────────────────────────────────┐
│         应用层 (Application)         │
├─────────────────────────────────────┤
│    ROS2 层    │    SDK 层    │  GUI  │
├─────────────────────────────────────┤
│            通信层 (Protocol)          │
├─────────────────────────────────────┤
│         固件层 (Firmware)             │
├─────────────────────────────────────┤
│         硬件层 (Hardware)             │
└─────────────────────────────────────┘
\`\`\`

## 模块职责

### 硬件层
- 机械结构设计
- PCB 电路设计
- 传感器接口

### 固件层
- ESP32-S3 微控制器
- 舵机控制协议
- 串口通信

\`\`\`cpp
// 固件核心结构
struct ServoCommand {
    uint8_t header;    // 0xFF
    uint8_t id;        // 舵机ID
    uint8_t cmd;       // 命令码
    uint8_t data[11];  // 数据
    uint8_t checksum;  // 校验和
};
\`\`\`

### SDK 层
- Python 控制接口
- 运动学计算
- 错误处理

### ROS2 层
- 话题通信
- 节点管理
- 遥操作

## 通信流程

1. 用户调用 SDK 方法
2. SDK 序列化为 16 字节协议
3. 通过串口发送到固件
4. 固件解析并控制舵机
5. 状态反馈回 SDK
`,
    category: '架构设计',
    categoryType: 'success',
    tags: ['架构', '系统设计', '分层'],
    date: '2025-12-27',
    readTime: '20分钟',
    readProgress: 0,
    favorite: false,
    notes: [],
    versionHistory: [
      { version: '2.0', date: '2025-12-27', description: '重构架构设计' },
      { version: '1.0', date: '2025-12-15', description: '初始架构' }
    ],
    relatedIds: ['api1', 'proto1']
  },
  {
    id: 'arch2',
    icon: '🔄',
    title: 'ROS2 系统集成方案',
    summary: 'ROS2 节点设计、话题定义和服务调用详解',
    content: `# ROS2 系统集成方案

## 节点架构

\`\`\`
                    ┌──────────────┐
                    │  Hand Ctrl  │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │ Teleop  │       │  RL     │       │  Sim    │
   │ Node    │       │ Agent   │       │ Node    │
   └─────────┘       └─────────┘       └─────────┘
\`\`\`

## 话题定义

### 关节控制

\`\`\`bash
# 发布关节角度
ros2 topic pub /hand/joint_cmd sensor_msgs/JointState "{position: [0, 0, 0, 0, 0, 0]}"
\`\`\`

### 状态反馈

\`\`\`bash
# 订阅状态
ros2 topic echo /hand/joint_state sensor_msgs/JointState
\`\`\`

## 服务定义

\`\`\`python
from ros2_introspection.srv import HandControl

def callback(request):
    return HandControl.Response(success=True)
\`\`\`
`,
    category: '架构设计',
    categoryType: 'success',
    tags: ['ROS2', '集成', '节点'],
    date: '2025-12-26',
    readTime: '18分钟',
    readProgress: 0,
    favorite: false,
    notes: [],
    versionHistory: [
      { version: '1.0', date: '2025-12-26', description: '初始版本' }
    ],
    relatedIds: ['api1', 'arch1']
  },
  {
    id: 'proto1',
    icon: '📝',
    title: '串口通信协议详解',
    summary: '16字节二进制协议的帧格式、命令码和校验机制',
    content: `# 串口通信协议详解

## 协议概述

采用固定 16 字节帧格式，基于 RS485 半双工通信。

## 帧格式

| 字节 | 字段 | 说明 |
|------|------|------|
| 0 | Header | 0xFF 固定 |
| 1 | ID | 目标舵机ID (0x01-0x06) |
| 2 | Length | 数据长度 |
| 3-14 | Data | 数据区 |
| 15 | Checksum | 校验和 |

## 命令码

| 命令码 | 功能 | 示例 |
|--------|------|------|
| 0x01 | 位置控制 | 设置目标角度 |
| 0x02 | 速度控制 | 设置运动速度 |
| 0x03 | 读取状态 | 获取当前位置 |
| 0x04 | 扭矩控制 | 开启/关闭扭矩 |

## 校验和计算

\`\`\`python
def calculate_checksum(frame):
    """计算校验和"""
    checksum = 0
    for i in range(1, 15):
        checksum ^= frame[i]
    return checksum & 0xFF
\`\`\`

## 完整示例

\`\`\`python
import struct

def create_position_cmd(servo_id, position, speed=100):
    """创建位置控制命令"""
    frame = bytearray(16)
    frame[0] = 0xFF        # Header
    frame[1] = servo_id    # ID
    frame[2] = 0x01        # 位置控制命令
    struct.pack_into('<H', frame, 3, position)  # 位置 2字节
    struct.pack_into('<H', frame, 5, speed)     # 速度 2字节
    frame[15] = calculate_checksum(frame)
    return frame
\`\`\`
`,
    category: '通信协议',
    categoryType: 'warning',
    tags: ['协议', '串口', '固件'],
    date: '2025-12-29',
    readTime: '25分钟',
    readProgress: 0,
    favorite: true,
    notes: [],
    versionHistory: [
      { version: '1.3', date: '2025-12-29', description: '补充校验示例' },
      { version: '1.2', date: '2025-12-25', description: '添加命令码表' },
      { version: '1.1', date: '2025-12-20', description: '完善帧格式' },
      { version: '1.0', date: '2025-12-15', description: '初始协议' }
    ],
    relatedIds: ['api1', 'data1']
  },
  {
    id: 'proto2',
    icon: '🔧',
    title: '舵机通信调试指南',
    summary: '串口调试工具使用、常见问题和排查方法',
    content: `# 舵机通信调试指南

## 调试工具

### 串口监视器

推荐使用以下工具：
- **ESPlorer** - Lua/Python 串口调试
- **CoolTerm** - 通用串口工具
- **minicom** - Linux 串口工具

### 调试命令

\`\`\`bash
# 使用 minicom 连接
minicom -D /dev/ttyUSB0 -b 921600

# 使用 screen
screen /dev/ttyUSB0 921600
\`\`\`

## 常见问题

### 1. 连接超时

检查项：
- 波特率是否匹配 (921600)
- 串口权限 (通常需要 sudo)
- 硬件连接是否正常

### 2. 数据校验失败

检查项：
- 校验和计算是否正确
- 数据帧是否完整
- 是否有干扰

### 3. 舵机不响应

解决步骤：

\`\`\`bash
# 1. 检查舵机ID
# 发送广播查询命令
echo -ne '\\xff\\x00\\x03\\x00\\x00' > /dev/ttyUSB0

# 2. 检查舵机状态
# 读取返回的状态数据
\`\`\`
`,
    category: '通信协议',
    categoryType: 'warning',
    tags: ['调试', '串口', '故障排除'],
    date: '2025-12-28',
    readTime: '15分钟',
    readProgress: 0,
    favorite: false,
    notes: [],
    versionHistory: [
      { version: '1.1', date: '2025-12-28', description: '添加故障排除' },
      { version: '1.0', date: '2025-12-22', description: '初始版本' }
    ],
    relatedIds: ['proto1']
  },
  {
    id: 'data1',
    icon: '📊',
    title: '数据格式规范',
    summary: '关节角度、舵机位置和传感器数据的格式定义',
    content: `# 数据格式规范

## 关节数据

### 关节角度格式

6个灵巧手指 + 1个旋转关节：

| 索引 | 名称 | 范围 | 单位 |
|------|------|------|------|
| 0 | 拇指 | 0-90 | 度 |
| 1 | 食指 | 0-90 | 度 |
| 2 | 中指 | 0-90 | 度 |
| 3 | 无名指 | 0-90 | 度 |
| 4 | 小指 | 0-90 | 度 |
| 5 | 旋转 | 0-180 | 度 |

### 舵机位置格式

\`\`\`python
# 舵机位置数据结构
struct ServoPosition:
    servo_id: uint8      # 0x01-0x06
    position: uint16     # 0-4096 (12位精度)
    speed: uint16        # 0-65535
    torque: uint8        # 0-100 (百分比)
    temperature: uint8   # 摄氏度
    current: uint16      # mA
\`\`\`

## 传感器数据

### 电流数据

\`\`\`json
{
  "timestamp": 1703001234567,
  "currents": [120, 115, 118, 110, 125, 90],
  "voltage": 11.8,
  "temperature": 35
}
\`\`\`

### IMU 数据

\`\`\`json
{
  "accel": [0.01, 0.02, 9.81],
  "gyro": [0.1, -0.05, 0.02],
  "quat": [1.0, 0.0, 0.0, 0.0]
}
\`\`\`
`,
    category: '数据格式',
    categoryType: 'info',
    tags: ['数据', '格式', '传感器'],
    date: '2025-12-27',
    readTime: '12分钟',
    readProgress: 0,
    favorite: false,
    notes: [],
    versionHistory: [
      { version: '1.2', date: '2025-12-27', description: '添加IMU数据格式' },
      { version: '1.1', date: '2025-12-24', description: '补充传感器数据' },
      { version: '1.0', date: '2025-12-20', description: '初始版本' }
    ],
    relatedIds: ['proto1', 'arch1']
  },
  {
    id: 'data2',
    icon: '🎯',
    title: '运动学数据模型',
    summary: '肌腱驱动运动学模型、关节限位和校准参数',
    content: `# 运动学数据模型

## 肌腱驱动原理

肌腱驱动通过钢丝牵引实现关节运动：

\`\`\`
      肌腱
    ────▼────
    │      │
    │ 关节  │
    │      │
    └───▲──┘
      牵引点
\`\`\`

## 运动学参数

### 关节限位

| 关节 | 最小角度 | 最大角度 | 肌腱长度变化 |
|------|----------|----------|--------------|
| MCP | -20° | 90° | 0-30mm |
| PIP | 0° | 100° | 0-25mm |
| DIP | 0° | 90° | 0-20mm |

### 校准参数

\`\`\`python
CALIBRATION_PARAMS = {
    'thumb': {
        'offset': [5, 10, 8],
        'scale': [0.98, 1.02, 0.99]
    },
    'finger': {
        'offset': [3, 5, 4],
        'scale': [1.0, 1.0, 1.0]
    }
}
\`\`\`

## 正向运动学

\`\`\`python
import numpy as np

def forward_kinematics(joint_angles):
    """
    根据关节角度计算末端位置

    Args:
        joint_angles: [mcp, pip, dip] 角度列表

    Returns:
        end_effector_position: [x, y, z] 末端位置
    """
    # DH 参数法计算
    positions = []
    cumulative_angle = 0

    for i, angle in enumerate(joint_angles):
        cumulative_angle += angle
        link_length = LINK_LENGTHS[i]
        x = link_length * np.cos(np.radians(cumulative_angle))
        y = link_length * np.sin(np.radians(cumulative_angle))
        positions.append([x, y])

    return positions
\`\`\`
`,
    category: '数据格式',
    categoryType: 'info',
    tags: ['运动学', '肌腱', '校准'],
    date: '2025-12-26',
    readTime: '20分钟',
    readProgress: 0,
    favorite: false,
    notes: [],
    versionHistory: [
      { version: '1.0', date: '2025-12-26', description: '初始版本' }
    ],
    relatedIds: ['data1', 'arch1']
  }
])

// 计算属性
const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const availableTags = computed(() => {
  const tags = new Set()
  allDocs.value.forEach(doc => doc.tags.forEach(tag => tags.add(tag)))
  return Array.from(tags)
})

const filteredAndSortedDocs = computed(() => {
  let docs = allDocs.value

  // 搜索过滤
  if (normalizedQuery.value) {
    docs = docs.filter(doc =>
      doc.title.toLowerCase().includes(normalizedQuery.value) ||
      doc.summary.toLowerCase().includes(normalizedQuery.value) ||
      doc.content.toLowerCase().includes(normalizedQuery.value) ||
      doc.tags.some(tag => tag.toLowerCase().includes(normalizedQuery.value))
    )
  }

  // 分类过滤
  if (selectedCategory.value !== 'all') {
    const categoryMap = {
      'api': 'API文档',
      'architecture': '架构设计',
      'protocol': '通信协议',
      'data': '数据格式'
    }
    docs = docs.filter(doc => doc.category === categoryMap[selectedCategory.value])
  }

  // 标签过滤
  if (selectedTags.value.length > 0) {
    docs = docs.filter(doc =>
      selectedTags.value.every(tag => doc.tags.includes(tag))
    )
  }

  // 收藏过滤
  if (showFavoritesOnly.value) {
    docs = docs.filter(doc => doc.favorite)
  }

  // 排序
  docs = [...docs].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })

  return docs
})

const totalDocs = computed(() => allDocs.value.length)
const favoriteCount = computed(() => allDocs.value.filter(d => d.favorite).length)
const avgReadProgress = computed(() => {
  if (allDocs.value.length === 0) return 0
  const total = allDocs.value.reduce((sum, d) => sum + d.readProgress, 0)
  return Math.round(total / allDocs.value.length)
})

const renderedMarkdown = computed(() => {
  if (!currentDoc.value) return ''
  return md.render(currentDoc.value.content)
})

const relatedDocs = computed(() => {
  if (!currentDoc.value || !currentDoc.value.relatedIds) return []
  return allDocs.value.filter(doc => currentDoc.value.relatedIds.includes(doc.id))
})

// 方法
function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(idx, 1)
  }
}

function sortByDate() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

function selectDoc(doc) {
  currentDocId.value = doc.id
  currentDoc.value = allDocs.value.find(d => d.id === doc.id)
  showDocDetail.value = true
  showNoteEditor.value = false
  newNoteContent.value = ''

  // 生成目录
  generateTableOfContents()

  // 模拟阅读进度
  if (currentDoc.value.readProgress === 0) {
    currentDoc.value.readProgress = 10
  }
}

function closeDoc() {
  showDocDetail.value = false
  currentDocId.value = null
  currentDoc.value = null
}

function handleDocAction(command) {
  switch (command) {
    case 'favorite':
      toggleFavorite()
      break
    case 'export':
      exportDoc()
      break
    case 'copyLink':
      copyLink()
      break
  }
}

function toggleFavorite() {
  if (currentDoc.value) {
    currentDoc.value.favorite = !currentDoc.value.favorite
    showMessage(currentDoc.value.favorite ? '已添加收藏' : '已取消收藏', 'success')
  }
}

function exportDoc() {
  if (!currentDoc.value) return
  const blob = new Blob([currentDoc.value.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentDoc.value.title}.md`
  a.click()
  URL.revokeObjectURL(url)
  showMessage('文档已导出', 'success')
}

function copyLink() {
  const url = `${window.location.origin}/docs/${currentDoc.value.id}`
  navigator.clipboard.writeText(url)
  showMessage('链接已复制', 'success')
}

function showMessage(text, type = 'success') {
  copyMessage.value = { visible: true, text, type }
  setTimeout(() => {
    copyMessage.value.visible = false
  }, 2000)
}

function toggleNoteEditor() {
  showNoteEditor.value = !showNoteEditor.value
}

function addNote() {
  if (!newNoteContent.value.trim() || !currentDoc.value) return
  if (!currentDoc.value.notes) currentDoc.value.notes = []
  currentDoc.value.notes.push({
    content: newNoteContent.value,
    time: new Date().toLocaleString('zh-CN')
  })
  newNoteContent.value = ''
  showNoteEditor.value = false
}

function cancelNote() {
  newNoteContent.value = ''
  showNoteEditor.value = false
}

function deleteNote(idx) {
  if (currentDoc.value && currentDoc.value.notes) {
    currentDoc.value.notes.splice(idx, 1)
  }
}

function generateTableOfContents() {
  if (!currentDoc.value) return

  const headingRegex = /^#{1,6}\s+(.+)$/gm
  const headings = []
  let match

  while ((match = headingRegex.exec(currentDoc.value.content)) !== null) {
    const level = match[0].indexOf(' ')
    const text = match[1]
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    headings.push({ level, text, id })
  }

  tableOfContents.value = headings
}

function scrollToHeading(id) {
  const element = document.getElementById(id)
  if (element && contentRef.value) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleContentScroll() {
  if (!contentRef.value || !tableOfContents.value.length) return

  const scrollTop = contentRef.value.scrollTop
  const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')

  for (let i = headings.length - 1; i >= 0; i--) {
    if (headings[i].offsetTop <= scrollTop + 100) {
      activeHeading.value = headings[i].id
      break
    }
  }
}

// 初始化复制代码函数
onMounted(() => {
  window.copyCode = function(btn) {
    const codeBlock = btn.closest('.hljs-code-block')
    const code = codeBlock.querySelector('code').textContent
    navigator.clipboard.writeText(code).then(() => {
      const textSpan = btn.querySelector('.copy-text')
      textSpan.textContent = '已复制!'
      setTimeout(() => {
        textSpan.textContent = '复制'
      }, 2000)
    })
  }
})

// 监听内容变化更新目录
watch(() => currentDoc.value?.content, () => {
  nextTick(() => generateTableOfContents())
})
</script>

<style scoped>
.tech-docs-page {
  height: calc(100vh - 120px);
  padding: 0;
}

.docs-container {
  height: 100%;
  background: #f5f7fa;
}

.docs-sidebar {
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}

.docs-sidebar.list-collapsed {
  border-right: none;
}

.sidebar-header {
  padding: 20px;
  border-radius: 0;
  box-shadow: none;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h1 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #303133;
}

.sidebar-header .subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0 0 16px 0;
}

.search-input {
  margin-bottom: 12px;
}

.category-tabs {
  margin-bottom: 12px;
}

.category-tabs :deep(.el-radio-button__inner) {
  padding: 6px 10px;
  font-size: 12px;
}

.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 12px;
}

.filter-label {
  font-size: 12px;
  color: #909399;
}

.tag-item {
  cursor: pointer;
  font-size: 12px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.doc-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.doc-item {
  padding: 14px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.doc-item:hover {
  background: #f0f7ff;
  border-color: #c6e2ff;
}

.doc-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.doc-item.favorite {
  background: #fffef0;
}

.doc-item-header {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.doc-item .doc-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.doc-item .doc-info {
  flex: 1;
  min-width: 0;
}

.doc-item h4 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.doc-summary {
  font-size: 12px;
  color: #909399;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-icon {
  color: #e6a23c;
  flex-shrink: 0;
}

.doc-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.doc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.doc-tags :deep(.el-tag) {
  font-size: 10px;
  padding: 0 4px;
  height: 18px;
  line-height: 16px;
}

.doc-date {
  font-size: 11px;
  color: #c0c4cc;
}

.read-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #e4e7ed;
  border-radius: 0 0 8px 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s;
}

/* 文档详情区域 */
.docs-main {
  padding: 20px;
  overflow: hidden;
}

.doc-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  gap: 8px;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.detail-title-section {
  margin-bottom: 20px;
}

.detail-title-section h1 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.detail-summary {
  font-size: 15px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.detail-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 13px;
}

.detail-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-body {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.detail-toc {
  flex-shrink: 0;
}

.toc-container {
  position: sticky;
  top: 0;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.toc-container h5 {
  font-size: 13px;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.toc-list li {
  padding: 6px 8px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-list li:hover {
  background: #e6f3ff;
  color: #409eff;
}

.toc-list li.active {
  background: #409eff;
  color: white;
}

.toc-list li.level-2 { padding-left: 16px; }
.toc-list li.level-3 { padding-left: 24px; font-size: 11px; }
.toc-list li.level-4 { padding-left: 32px; font-size: 11px; }

.toc-progress {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.toc-progress span {
  font-size: 11px;
  color: #909399;
  display: block;
  margin-bottom: 6px;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

/* Markdown 样式 */
.markdown-body {
  font-size: 14px;
  line-height: 1.8;
}

.markdown-body :deep(h1) {
  font-size: 26px;
  color: #303133;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 12px;
  margin: 30px 0 20px;
}

.markdown-body :deep(h2) {
  font-size: 20px;
  color: #303133;
  margin: 25px 0 15px;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.markdown-body :deep(h3) {
  font-size: 17px;
  color: #303133;
  margin: 20px 0 12px;
}

.markdown-body :deep(h4) {
  font-size: 15px;
  color: #303133;
  margin: 15px 0 10px;
}

.markdown-body :deep(p) {
  margin: 12px 0;
  color: #606266;
}

.markdown-body :deep(code) {
  background: #f0f7ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown-body :deep(.hljs-code-block) {
  position: relative;
  background: #1e1e1e;
  border-radius: 8px;
  margin: 16px 0;
  overflow: hidden;
}

.markdown-body :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.markdown-body :deep(.code-lang) {
  color: #909399;
  font-size: 12px;
  text-transform: uppercase;
}

.markdown-body :deep(.copy-btn) {
  background: transparent;
  border: 1px solid #4a4a4a;
  color: #c0c4cc;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.markdown-body :deep(.copy-btn:hover) {
  background: #3d3d3d;
  color: white;
}

.markdown-body :deep(pre) {
  background: transparent;
  padding: 14px;
  margin: 0;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: #d4d4d4;
  padding: 0;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 22px;
  margin: 12px 0;
}

.markdown-body :deep(li) {
  margin: 6px 0;
  color: #606266;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  background: #f0f7ff;
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 0 8px 8px 0;
}

.markdown-body :deep(blockquote p) {
  margin: 0;
  color: #606266;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #e4e7ed;
  padding: 10px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: #fafafa;
  font-weight: 600;
  color: #303133;
}

.markdown-body :deep(tr:hover) {
  background: #f5f7fa;
}

.markdown-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

/* 笔记区域 */
.notes-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #e4e7ed;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.notes-header h4 {
  font-size: 15px;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notes-list {
  margin-bottom: 16px;
}

.note-item {
  background: #fffef0;
  border: 1px solid #f5e6c8;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.note-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-time {
  font-size: 11px;
  color: #c0c4cc;
}

.note-editor {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px;
}

.editor-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: flex-end;
}

/* 相关文档 */
.related-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #e4e7ed;
}

.related-section h4 {
  font-size: 15px;
  color: #303133;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.related-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.rel-icon {
  font-size: 20px;
}

.rel-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rel-title {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.rel-category {
  font-size: 11px;
  color: #909399;
}

/* 版本历史 */
.version-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #e4e7ed;
}

.version-section h4 {
  font-size: 15px;
  color: #303133;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.version-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.version-num {
  background: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.version-desc {
  font-size: 13px;
  color: #606266;
}

/* 空状态 */
.empty-selection {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.empty-selection h3 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 10px 0;
}

.empty-selection p {
  font-size: 14px;
  color: #909399;
  margin: 0 0 30px 0;
}

.quick-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

/* 响应式 */
@media (max-width: 1024px) {
  .detail-toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .docs-sidebar {
    width: 100% !important;
  }

  .detail-body {
    flex-direction: column;
  }
}
</style>
