<template>
  <div class="hardware-checklist">
    <!-- 顶部说明 -->
    <div class="page-header card mb-3">
      <div class="header-content">
        <div class="header-text">
          <h2>🔧 Aero Hand 硬件准备清单</h2>
          <p>完整的零件采购清单，支持勾选追踪进度、预算计算和采购链接</p>
        </div>
        <div class="budget-summary">
          <div class="budget-item">
            <span class="budget-label">预算总计</span>
            <span class="budget-value">¥{{ totalBudget.toFixed(2) }}</span>
          </div>
          <div class="budget-item purchased">
            <span class="budget-label">已购</span>
            <span class="budget-value">¥{{ purchasedBudget.toFixed(2) }}</span>
          </div>
          <div class="budget-item remaining">
            <span class="budget-label">剩余</span>
            <span class="budget-value">¥{{ (totalBudget - purchasedBudget).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-section">
        <div class="progress-info">
          <span>完成进度：{{ completedCount }}/{{ totalCount }} ({{ progressPercent }}%)</span>
          <span class="item-count">{{ purchasedCount }} 个分类已全部完成</span>
        </div>
        <el-progress :percentage="progressPercent" :color="progressColor" :stroke-width="12" />
      </div>
    </div>

    <!-- 装配顺序快捷入口 -->
    <div class="assembly-guide card mb-3">
      <div class="section-title">
        <span class="icon">📋</span>
        <h3>装配顺序指南</h3>
      </div>
      <div class="assembly-steps">
        <el-tag
          v-for="(step, index) in assemblySteps"
          :key="step.id"
          :type="getStepType(step.id)"
          class="assembly-step"
          effect="plain"
        >
          <span class="step-num">{{ index + 1 }}</span>
          {{ step.name }}
        </el-tag>
      </div>
    </div>

    <!-- Tab切换：分类视图 / 清单视图 -->
    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 分类视图 -->
      <el-tab-pane label="📦 分类视图" name="category">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="category in categories" :key="category.id">
            <div :class="['category-card', 'card', { 'category-complete': isCategoryComplete(category) }]">
              <div class="category-header">
                <div class="category-title">
                  <span class="category-icon">{{ category.icon }}</span>
                  <h3>{{ category.title }}</h3>
                </div>
                <el-tag :type="getCategoryStatus(category).type" size="small">
                  {{ getCategoryStatus(category).text }}
                </el-tag>
              </div>

              <!-- 分类预算 -->
              <div class="category-budget" v-if="category.budget > 0">
                <span class="budget-text">预算: ¥{{ getCategoryBudget(category).toFixed(2) }}</span>
                <span class="purchased-text">已购: ¥{{ getCategoryPurchased(category).toFixed(2) }}</span>
              </div>

              <div class="item-list">
                <div
                  v-for="item in category.items"
                  :key="item.id"
                  :class="['item-row', { checked: item.checked, optional: item.optional }]"
                >
                  <el-checkbox
                    v-model="item.checked"
                    @change="saveProgress"
                    :disabled="item.optional && !item.checked"
                  >
                    <div class="item-content">
                      <div class="item-main">
                        <span class="item-name">{{ item.name }}</span>
                        <el-tag v-if="item.optional" type="info" size="small">可选</el-tag>
                      </div>
                      <div class="item-specs" v-if="item.specs">{{ item.specs }}</div>
                      <div class="item-meta">
                        <span class="item-quantity" v-if="item.quantity">
                          <el-icon><Goods /></el-icon> {{ item.quantity }}
                        </span>
                        <span class="item-price" v-if="item.price">
                          <el-icon><Money /></el-icon> ¥{{ item.price }}
                        </span>
                      </div>
                      <div class="item-notes" v-if="item.notes">
                        <span class="note-icon">💡</span> {{ item.notes }}
                      </div>
                      <!-- 采购链接 -->
                      <div class="item-links" v-if="item.links && item.links.length">
                        <a
                          v-for="link in item.links"
                          :key="link.url"
                          :href="link.url"
                          target="_blank"
                          class="purchase-link"
                          @click.stop
                        >
                          {{ link.name }}
                          <el-icon><TopRight /></el-icon>
                        </a>
                      </div>
                      <!-- 避坑指南 -->
                      <div class="item-warnings" v-if="item.warnings && item.warnings.length">
                        <div v-for="warning in item.warnings" :key="warning" class="warning-item">
                          <span class="warning-icon">⚠️</span> {{ warning }}
                        </div>
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </div>

              <div class="category-summary">
                <span class="summary-text">
                  已完成：{{ category.items.filter(i => i.checked).length }}/{{ category.items.length }}
                </span>
                <el-button
                  v-if="isCategoryComplete(category)"
                  type="success"
                  size="small"
                  circle
                >
                  <el-icon><Check /></el-icon>
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 清单视图（按装配顺序） -->
      <el-tab-pane label="📝 装配清单" name="list">
        <div class="list-view card">
          <div
            v-for="(step, sIndex) in assemblySteps"
            :key="step.id"
            class="assembly-section"
          >
            <div class="section-header" @click="toggleStep(step.id)">
              <div class="section-info">
                <span class="section-num">{{ sIndex + 1 }}</span>
                <h3>{{ step.name }}</h3>
                <el-tag :type="getStepType(step.id)" size="small">
                  {{ getStepItemCount(step.id) }} 项
                </el-tag>
              </div>
              <el-icon class="toggle-icon" :class="{ expanded: expandedSteps.includes(step.id) }">
                <ArrowRight />
              </el-icon>
            </div>

            <el-collapse-transition>
              <div v-show="expandedSteps.includes(step.id)" class="section-items">
                <div
                  v-for="item in getStepItems(step.id)"
                  :key="item.id"
                  :class="['list-item', { checked: item.checked, optional: item.optional }]"
                >
                  <el-checkbox v-model="item.checked" @change="saveProgress">
                    <div class="list-item-content">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-quantity" v-if="item.quantity">{{ item.quantity }}</span>
                      <el-tag v-if="item.optional" type="info" size="small">可选</el-tag>
                      <span class="item-price" v-if="item.price">¥{{ item.price }}</span>
                    </div>
                  </el-checkbox>
                  <div class="item-details" v-if="item.specs || item.notes">
                    <span v-if="item.specs" class="detail-specs">{{ item.specs }}</span>
                    <span v-if="item.notes" class="detail-notes">{{ item.notes }}</span>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
        </div>
      </el-tab-pane>

      <!-- 预算详情 -->
      <el-tab-pane label="💰 预算详情" name="budget">
        <div class="budget-view card">
          <div class="budget-header">
            <h3>预算概览</h3>
            <div class="budget-totals">
              <div class="total-item">
                <span class="label">预计总费用</span>
                <span class="value primary">¥{{ totalBudget.toFixed(2) }}</span>
              </div>
              <div class="total-item">
                <span class="label">已完成采购</span>
                <span class="value success">¥{{ purchasedBudget.toFixed(2) }}</span>
              </div>
              <div class="total-item">
                <span class="label">待采购</span>
                <span class="value warning">¥{{ (totalBudget - purchasedBudget).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <el-table :data="budgetTableData" stripe class="budget-table">
            <el-table-column prop="category" label="分类" width="150" />
            <el-table-column prop="itemName" label="物品" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">
                ¥{{ row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="subtotal" label="小计" width="100">
              <template #default="{ row }">
                ¥{{ row.subtotal.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.checked ? 'success' : 'info'" size="small">
                  {{ row.checked ? '已购' : '待购' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作 -->
    <div class="bottom-actions mt-3">
      <el-button @click="exportProgress" type="primary">
        <el-icon><Download /></el-icon>
        导出清单
      </el-button>
      <el-button @click="importProgress" type="info">
        <el-icon><Upload /></el-icon>
        导入清单
      </el-button>
      <el-button @click="resetProgress" type="danger">
        <el-icon><Delete /></el-icon>
        重置进度
      </el-button>
      <el-button @click="markAllComplete" type="success">
        <el-icon><Select /></el-icon>
        全部完成
      </el-button>
      <el-button @click="printChecklist" type="warning">
        <el-icon><Printer /></el-icon>
        打印清单
      </el-button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      type="file"
      ref="fileInput"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Logger from '@/utils/logger.js'

const LOG_LABEL = 'HardwareChecklist'

// 存储键
const STORAGE_KEY = 'hardware-checklist-progress'
const BUDGET_KEY = 'hardware-checklist-budget'

// Tab状态
const activeTab = ref('category')
const expandedSteps = ref([])
const fileInput = ref(null)

// 装配步骤定义
const assemblySteps = [
  { id: 'print', name: '3D打印零件' },
  { id: 'mechanical', name: '机械组装' },
  { id: 'electronics', name: '电子元件焊接' },
  { id: 'servo', name: '舵机安装' },
  { id: 'tendon', name: '肌腱穿引' },
  { id: 'test', name: '测试调试' }
]

// 数据分类
const categories = ref([
  {
    id: 'electronics',
    title: '电子元件',
    icon: '🔌',
    budget: 350,
    items: [
      {
        id: 'esp32',
        name: 'ESP32-S3 开发板',
        specs: 'ESP32-S3-DevKitC-1，16MB Flash，WiFi+BT 5.0',
        quantity: '1个',
        price: 45,
        notes: '主控制器，推荐官方正品',
        warnings: ['避免购买到ESP32-S3而非普通ESP32', '确认USB-C接口'],
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=ESP32-S3-DevKitC-1' }
        ],
        checked: false,
        assemblyStep: 'electronics'
      },
      {
        id: 'servo-0',
        name: 'HLS3606M 舵机 #0',
        specs: '12位精度，360°总线控制，扭力≥3.5kg.cm',
        quantity: '1个',
        price: 85,
        notes: '食指用，ID=0',
        warnings: ['务必购买HLS3606M，非普通舵机', '确认总线控制协议'],
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=HLS3606M' }
        ],
        checked: false,
        assemblyStep: 'servo'
      },
      {
        id: 'servo-1',
        name: 'HLS3606M 舵机 #1',
        specs: '中指用',
        quantity: '1个',
        price: 85,
        notes: 'ID=1',
        checked: false,
        assemblyStep: 'servo'
      },
      {
        id: 'servo-2',
        name: 'HLS3606M 舵机 #2',
        specs: '无名指用',
        quantity: '1个',
        price: 85,
        notes: 'ID=2',
        checked: false,
        assemblyStep: 'servo'
      },
      {
        id: 'servo-3',
        name: 'HLS3606M 舵机 #3',
        specs: '小指用',
        quantity: '1个',
        price: 85,
        notes: 'ID=3',
        checked: false,
        assemblyStep: 'servo'
      },
      {
        id: 'servo-4',
        name: 'HLS3606M 舵机 #4',
        specs: '拇指内收用',
        quantity: '1个',
        price: 85,
        notes: 'ID=4',
        checked: false,
        assemblyStep: 'servo'
      },
      {
        id: 'servo-5',
        name: 'HLS3606M 舵机 #5',
        specs: '拇指弯曲用',
        quantity: '1个',
        price: 85,
        notes: 'ID=5',
        checked: false,
        assemblyStep: 'servo'
      },
      {
        id: 'usb-cable',
        name: 'USB-C 数据线',
        specs: 'USB 3.0 Gen2，100W快充线',
        quantity: '1根',
        price: 20,
        notes: 'ESP32供电和编程',
        warnings: ['确认支持数据传输，非仅充电线'],
        checked: false,
        assemblyStep: 'electronics'
      },
      {
        id: 'power-adapter',
        name: '5V 4A 电源适配器',
        specs: 'DC接口，5.5×2.1mm，20W以上',
        quantity: '1个',
        price: 35,
        notes: '舵机供电，必须稳定输出3A以上',
        warnings: ['电流不足会导致舵机抖动', '不要使用手机充电器替代'],
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=5V+4A+电源适配器+DC' }
        ],
        checked: false,
        assemblyStep: 'electronics'
      },
      {
        id: 'jst-cable',
        name: 'JST-XH 3Pin 连接线',
        specs: '3P杜邦线，15cm长',
        quantity: '10根',
        price: 10,
        notes: '舵机级联接线',
        checked: false,
        assemblyStep: 'electronics'
      }
    ]
  },
  {
    id: '3dprint',
    title: '3D打印零件',
    icon: '🖨️',
    budget: 0,
    items: [
      {
        id: 'palm-left',
        name: '左手手掌',
        specs: 'palm_left.stl，建议光固化打印',
        quantity: '1个',
        price: 0,
        notes: '需自己打印，浅色PLA便于观察内部结构',
        warnings: ['建议0.2mm层高，填充≥30%'],
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'palm-right',
        name: '右手手掌',
        specs: 'palm_right.stl',
        quantity: '1个',
        price: 0,
        notes: '二选一，根据手型选择',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'palm-cover',
        name: '手掌盖板',
        specs: 'palm_cover.stl',
        quantity: '1个',
        price: 0,
        notes: '保护内部结构',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'finger-proximal',
        name: '近端指骨 × 4',
        specs: 'finger_proximal.stl',
        quantity: '4个',
        price: 0,
        notes: '食、中、无名、小指各一',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'finger-intermediate',
        name: '中端指骨 × 4',
        specs: 'finger_intermediate.stl',
        quantity: '4个',
        price: 0,
        notes: '',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'finger-distal',
        name: '远端指骨 × 4',
        specs: 'finger_distal.stl',
        quantity: '4个',
        price: 0,
        notes: '',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'finger-tip',
        name: '指尖 × 4',
        specs: 'fingertip.stl，硅胶套安装位',
        quantity: '4个',
        price: 0,
        notes: '',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'thumb-metacarpal',
        name: '拇指掌骨',
        specs: 'thumb_metacarpal.stl',
        quantity: '1个',
        price: 0,
        notes: '',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'thumb-proximal',
        name: '拇指近端指骨',
        specs: 'thumb_proximal.stl',
        quantity: '1个',
        price: 0,
        notes: '',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'thumb-distal',
        name: '拇指远端指骨',
        specs: 'thumb_distal.stl',
        quantity: '1个',
        price: 0,
        notes: '',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'pulley-3mm',
        name: '3mm 滑轮 × 10',
        specs: 'pulley_3mm.stl',
        quantity: '10个',
        price: 0,
        notes: '用于手指关节',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'pulley-5mm',
        name: '5mm 滑轮 × 10',
        specs: 'pulley_5mm.stl',
        quantity: '10个',
        price: 0,
        notes: '用于拇指和手掌',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'wrist-mount',
        name: '腕部安装座',
        specs: 'wrist_mount.stl',
        quantity: '1个',
        price: 0,
        notes: '',
        checked: false,
        assemblyStep: 'print'
      }
    ]
  },
  {
    id: 'mechanical',
    title: '机械零件',
    icon: '⚙️',
    budget: 80,
    items: [
      {
        id: 'tendon-material',
        name: 'Dyneema 钓鱼线',
        specs: '直径0.5-0.8mm，强度≥50kg',
        quantity: '3米',
        price: 25,
        notes: '肌腱驱动线，Dyneema或Spectra均可',
        warnings: ['避免使用普通缝纫线，强度不足'],
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=Dyneema+钓鱼线+50kg' }
        ],
        checked: false,
        assemblyStep: 'tendon'
      },
      {
        id: 'screw-m2x6',
        name: 'M2×6 螺丝',
        specs: '不锈钢，沉头',
        quantity: '10个',
        price: 5,
        notes: '',
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=M2x6+不锈钢+螺丝' }
        ],
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'screw-m2x8',
        name: 'M2×8 螺丝',
        specs: '不锈钢，沉头',
        quantity: '10个',
        price: 5,
        notes: '',
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'nut-m2',
        name: 'M2 螺母',
        specs: '不锈钢，自锁型',
        quantity: '20个',
        price: 8,
        notes: '',
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'screw-m25x8',
        name: 'M2.5×8 螺丝',
        specs: '不锈钢，沉头',
        quantity: '8个',
        price: 5,
        notes: '',
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'screw-m25x10',
        name: 'M2.5×10 螺丝',
        specs: '不锈钢，沉头',
        quantity: '4个',
        price: 5,
        notes: '',
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'nut-m25',
        name: 'M2.5 螺母',
        specs: '不锈钢',
        quantity: '12个',
        price: 6,
        notes: '',
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'silicone-tip',
        name: '硅胶指尖套',
        specs: '直径6mm，高度8mm',
        quantity: '5个',
        price: 15,
        notes: '增加摩擦力，可选',
        optional: true,
        checked: false,
        assemblyStep: 'mechanical'
      }
    ]
  },
  {
    id: 'tools',
    title: '工具',
    icon: '🛠️',
    budget: 500,
    items: [
      {
        id: '3d-printer',
        name: '3D打印机（FDM）',
        specs: '构建尺寸≥150×150×150mm，精度≤0.2mm',
        quantity: '1台',
        price: 0,
        notes: '自备或第三方打印服务',
        warnings: ['如无打印机建议使用打印服务'],
        links: [
          { name: '柏燕3D打印', url: 'https://www.3dayindy.com/' }
        ],
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'pla-filament',
        name: 'PLA 打印材料',
        specs: '1.75mm，浅色，1kg',
        quantity: '1卷',
        price: 50,
        notes: '建议浅色便于观察内部结构',
        checked: false,
        assemblyStep: 'print'
      },
      {
        id: 'screwdriver-set',
        name: '精密螺丝刀套装',
        specs: 'PH0、PH1、PZ0、十字、一字',
        quantity: '1套',
        price: 40,
        notes: '必选，含多种规格',
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=精密螺丝刀套装+PH0' }
        ],
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'tweezers',
        name: '精密镊子',
        specs: '不锈钢，直头，12cm',
        quantity: '1把',
        price: 15,
        notes: '穿引肌腱用，必备',
        checked: false,
        assemblyStep: 'tendon'
      },
      {
        id: 'cutters',
        name: '斜口钳',
        specs: '精密型，12cm',
        quantity: '1把',
        price: 25,
        notes: '修剪肌腱线头',
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'pliers-set',
        name: '尖嘴钳套装',
        specs: '150mm，不锈钢',
        quantity: '1套',
        price: 30,
        notes: '',
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'soldering-iron',
        name: '电烙铁套装',
        specs: '温控型，60W，配备焊锡丝',
        quantity: '1套',
        price: 80,
        notes: '焊接排针和接线',
        optional: true,
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=电烙铁+温控+60W' }
        ],
        checked: false,
        assemblyStep: 'electronics'
      },
      {
        id: 'helping-hand',
        name: '焊接支架',
        specs: '带放大镜',
        quantity: '1个',
        price: 35,
        notes: '固定PCB和线材',
        optional: true,
        checked: false,
        assemblyStep: 'electronics'
      },
      {
        id: 'hot-glue',
        name: '热熔胶枪',
        specs: '30W',
        quantity: '1把',
        price: 25,
        notes: '固定线束和部件',
        optional: true,
        checked: false,
        assemblyStep: 'mechanical'
      }
    ]
  },
  {
    id: 'optional',
    title: '可选配件',
    icon: '📦',
    budget: 0,
    items: [
      {
        id: 'logic-analyzer',
        name: '逻辑分析仪',
        specs: '8通道，24MHz采样率',
        quantity: '1个',
        price: 120,
        notes: '调试串口协议和舵机通信',
        optional: true,
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=逻辑分析仪+8通道' }
        ],
        checked: false,
        assemblyStep: 'test'
      },
      {
        id: 'multimeter',
        name: '数字万用表',
        specs: '自动量程，带背光',
        quantity: '1个',
        price: 80,
        notes: '检测电压、电阻、通断',
        optional: true,
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=数字万用表+自动量程' }
        ],
        checked: false,
        assemblyStep: 'test'
      },
      {
        id: 'caliper',
        name: '数字游标卡尺',
        specs: '0-150mm，0.01mm精度',
        quantity: '1把',
        price: 50,
        notes: '测量零件尺寸',
        optional: true,
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=数字游标卡尺+0.01mm' }
        ],
        checked: false,
        assemblyStep: 'mechanical'
      },
      {
        id: 'microscope',
        name: 'USB放大镜',
        specs: '200倍放大',
        quantity: '1个',
        price: 60,
        notes: '检查微小零件和焊点',
        optional: true,
        links: [
          { name: '淘宝', url: 'https://s.taobao.com/search?q=USB放大镜+200倍' }
        ],
        checked: false,
        assemblyStep: 'test'
      }
    ]
  }
])

// 计算属性
const totalCount = computed(() => {
  return categories.value.reduce((sum, cat) => sum + cat.items.length, 0)
})

const completedCount = computed(() => {
  return categories.value.reduce(
    (sum, cat) => sum + cat.items.filter(i => i.checked).length,
    0
  )
})

const purchasedCount = computed(() => {
  return categories.value.filter(cat =>
    cat.items.every(item => item.checked)
  ).length
})

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const progressColor = computed(() => {
  const pct = progressPercent.value
  if (pct < 30) return '#f56c6c'
  if (pct < 70) return '#e6a23c'
  return '#67c23a'
})

// 预算计算
const totalBudget = computed(() => {
  return categories.value.reduce((sum, cat) => {
    return sum + cat.items.reduce((itemSum, item) => {
      if (item.optional && !item.checked) return itemSum
      return itemSum + (item.price || 0)
    }, 0)
  }, 0)
})

const purchasedBudget = computed(() => {
  return categories.value.reduce((sum, cat) => {
    return sum + cat.items.reduce((itemSum, item) => {
      if (!item.checked) return itemSum
      return itemSum + (item.price || 0)
    }, 0)
  }, 0)
})

const budgetTableData = computed(() => {
  const data = []
  categories.value.forEach(cat => {
    cat.items.forEach(item => {
      if (item.price > 0) {
        data.push({
          category: cat.title,
          itemName: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price,
          checked: item.checked,
          optional: item.optional
        })
      }
    })
  })
  return data.sort((a, b) => b.subtotal - a.subtotal)
})

// 方法
const getCategoryStatus = (category) => {
  const completed = category.items.filter(i => i.checked).length
  const total = category.items.length
  const percent = (completed / total) * 100

  if (percent === 100) return { type: 'success', text: '✅ 完成' }
  if (percent >= 50) return { type: 'warning', text: '🔄 进行中' }
  return { type: 'info', text: '⏳ 待开始' }
}

const isCategoryComplete = (category) => {
  return category.items.every(i => i.checked)
}

const getCategoryBudget = (category) => {
  return category.items.reduce((sum, item) => {
    if (item.optional && !item.checked) return sum
    return sum + (item.price || 0)
  }, 0)
}

const getCategoryPurchased = (category) => {
  return category.items.reduce((sum, item) => {
    if (!item.checked) return sum
    return sum + (item.price || 0)
  }, 0)
}

const getStepType = (stepId) => {
  const stepItems = getStepItems(stepId)
  const completed = stepItems.filter(i => i.checked).length
  const total = stepItems.length
  if (completed === total) return 'success'
  if (completed > 0) return 'warning'
  return 'info'
}

const getStepItemCount = (stepId) => {
  return getStepItems(stepId).length
}

const getStepItems = (stepId) => {
  const items = []
  categories.value.forEach(cat => {
    cat.items.forEach(item => {
      if (item.assemblyStep === stepId) {
        items.push(item)
      }
    })
  })
  return items
}

const toggleStep = (stepId) => {
  const index = expandedSteps.value.indexOf(stepId)
  if (index === -1) {
    expandedSteps.value.push(stepId)
  } else {
    expandedSteps.value.splice(index, 1)
  }
}

const saveProgress = () => {
  const data = {
    categories: categories.value.map(cat => ({
      id: cat.id,
      items: cat.items.map(item => ({ id: item.id, checked: item.checked }))
    })),
    expandedSteps: expandedSteps.value,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const loadProgress = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      data.categories?.forEach(catData => {
        const category = categories.value.find(c => c.id === catData.id)
        if (category) {
          catData.items.forEach(itemData => {
            const item = category.items.find(i => i.id === itemData.id)
            if (item) {
              item.checked = itemData.checked
            }
          })
        }
      })
      if (data.expandedSteps) {
        expandedSteps.value = data.expandedSteps
      }
    } catch (e) {
      Logger.error(LOG_LABEL, '加载进度失败:', e)
    }
  }
}

const exportProgress = () => {
  let text = 'Aero Hand 硬件清单\n'
  text += '='.repeat(50) + '\n'
  text += `导出时间: ${new Date().toLocaleString()}\n`
  text += `完成进度: ${completedCount.value}/${totalCount.value} (${progressPercent.value}%)\n`
  text += `预算总计: ¥${totalBudget.value.toFixed(2)}\n`
  text += `已购金额: ¥${purchasedBudget.value.toFixed(2)}\n\n`

  categories.value.forEach(cat => {
    text += `\n【${cat.icon} ${cat.title}】\n`
    text += '-'.repeat(40) + '\n'
    cat.items.forEach(item => {
      const status = item.checked ? '✅' : '⬜'
      text += `  ${status} ${item.name}`
      if (item.quantity) text += ` × ${item.quantity}`
      if (item.specs) text += ` (${item.specs})`
      text += '\n'
      if (item.notes) text += `      备注: ${item.notes}\n`
      if (item.warnings && item.warnings.length) {
        item.warnings.forEach(w => text += `      ⚠️ ${w}\n`)
      }
    })
  })

  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aero-hand-checklist-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('清单已导出')
}

const importProgress = () => {
  fileInput.value?.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.categories) {
        data.categories.forEach(catData => {
          const category = categories.value.find(c => c.id === catData.id)
          if (category) {
            catData.items.forEach(itemData => {
              const item = category.items.find(i => i.id === itemData.id)
              if (item) {
                item.checked = itemData.checked
              }
            })
          }
        })
        saveProgress()
        ElMessage.success('清单已导入')
      }
    } catch (err) {
      Logger.error(LOG_LABEL, '导入失败:', err)
      ElMessage.error('导入失败，文件格式错误')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const resetProgress = () => {
  if (confirm('确定要重置所有进度吗？此操作不可恢复。')) {
    categories.value.forEach(cat => {
      cat.items.forEach(item => {
        item.checked = false
      })
    })
    expandedSteps.value = []
    saveProgress()
    ElMessage.success('已重置所有进度')
  }
}

const markAllComplete = () => {
  if (confirm('确定要将所有项目标记为完成吗？')) {
    categories.value.forEach(cat => {
      cat.items.forEach(item => {
        item.checked = true
      })
    })
    saveProgress()
    ElMessage.success('已全部标记完成')
  }
}

const printChecklist = () => {
  window.print()
}

// 生命周期
onMounted(() => {
  loadProgress()
  // 默认展开第一个步骤
  if (expandedSteps.value.length === 0 && assemblySteps.length > 0) {
    expandedSteps.value = [assemblySteps[0].id]
  }
})
</script>

<style scoped>
.hardware-checklist {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.header-text h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.header-text p {
  margin: 0;
  opacity: 0.9;
}

.budget-summary {
  display: flex;
  gap: 24px;
  background: rgba(255, 255, 255, 0.15);
  padding: 16px 24px;
  border-radius: 12px;
}

.budget-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.budget-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.budget-value {
  font-size: 20px;
  font-weight: 600;
}

.progress-section {
  margin-top: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.item-count {
  font-size: 13px;
  opacity: 0.8;
}

/* 装配指南 */
.assembly-guide {
  padding: 16px 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title .icon {
  font-size: 20px;
}

.section-title h3 {
  margin: 0;
  font-size: 16px;
}

.assembly-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assembly-step {
  cursor: pointer;
  transition: all 0.2s;
}

.assembly-step:hover {
  transform: translateY(-2px);
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  margin-right: 6px;
  font-size: 11px;
}

/* 主Tab */
.main-tabs {
  margin-bottom: 20px;
}

/* 分类卡片 */
.category-card {
  height: 100%;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.category-card.category-complete {
  border: 2px solid #67c23a;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 24px;
}

.category-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.category-budget {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.budget-text {
  font-weight: 500;
}

.purchased-text {
  color: #67c23a;
}

.item-list {
  max-height: 450px;
  overflow-y: auto;
}

.item-row {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 6px;
  transition: all 0.3s;
}

.item-row:hover {
  background: #f5f7fa;
}

.item-row.checked {
  background: #f0f9ff;
}

.item-row.checked .item-name {
  text-decoration: line-through;
  color: #999;
}

.item-row.optional {
  background: #fafafa;
  border-left: 3px solid #909399;
}

.item-content {
  flex: 1;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-name {
  font-weight: 500;
}

.item-specs {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #409eff;
  margin: 4px 0;
}

.item-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-notes {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.note-icon {
  margin-right: 4px;
}

.item-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.purchase-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #409eff;
  text-decoration: none;
  padding: 2px 8px;
  background: #ecf5ff;
  border-radius: 4px;
  transition: all 0.2s;
}

.purchase-link:hover {
  background: #409eff;
  color: white;
}

.item-warnings {
  margin-top: 6px;
}

.warning-item {
  font-size: 12px;
  color: #e6a23c;
  margin: 2px 0;
}

.warning-icon {
  margin-right: 4px;
}

.category-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  font-size: 13px;
  color: #666;
}

/* 清单视图 */
.list-view {
  padding: 0;
}

.assembly-section {
  border-bottom: 1px solid #e4e7ed;
}

.assembly-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.section-header:hover {
  background: #f5f7fa;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-weight: 600;
}

.section-info h3 {
  margin: 0;
  font-size: 16px;
}

.toggle-icon {
  transition: transform 0.3s;
}

.toggle-icon.expanded {
  transform: rotate(90deg);
}

.section-items {
  padding: 0 20px 16px 20px;
}

.list-item {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #fafafa;
  transition: all 0.2s;
}

.list-item:hover {
  background: #f0f0f0;
}

.list-item.checked {
  background: #f0f9ff;
}

.list-item.optional {
  border-left: 3px solid #909399;
}

.list-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-item-content .item-name {
  flex: 1;
  font-weight: 500;
}

.list-item-content .item-quantity {
  font-size: 13px;
  color: #666;
}

.list-item-content .item-price {
  font-size: 13px;
  color: #67c23a;
  font-weight: 500;
}

.item-details {
  margin-top: 8px;
  padding-left: 28px;
  font-size: 12px;
  color: #666;
}

.detail-specs {
  margin-right: 12px;
}

.detail-notes {
  color: #909399;
}

/* 预算视图 */
.budget-view {
  padding: 20px;
}

.budget-header {
  margin-bottom: 24px;
}

.budget-header h3 {
  margin: 0 0 16px 0;
}

.budget-totals {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.total-item {
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  background: #f5f7fa;
  border-radius: 8px;
  min-width: 150px;
}

.total-item .label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.total-item .value {
  font-size: 24px;
  font-weight: 600;
}

.total-item .value.primary {
  color: #409eff;
}

.total-item .value.success {
  color: #67c23a;
}

.total-item .value.warning {
  color: #e6a23c;
}

.budget-table {
  margin-top: 20px;
}

/* 底部操作 */
.bottom-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px;
  flex-wrap: wrap;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .budget-summary {
    width: 100%;
    justify-content: space-around;
  }

  .category-budget {
    flex-direction: column;
    gap: 4px;
  }
}

/* 打印样式 */
@media print {
  .bottom-actions,
  .main-tabs,
  .page-header .header-content {
    display: none;
  }

  .hardware-checklist {
    max-width: 100%;
  }
}
</style>
