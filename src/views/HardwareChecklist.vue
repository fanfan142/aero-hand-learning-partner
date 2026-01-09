<template>
  <div class="hardware-checklist">
    <!-- 顶部说明 -->
    <div class="page-header card mb-3">
      <h2>🔧 硬件准备清单（零件级）</h2>
      <p>详细的零件采购和准备清单，支持勾选追踪进度</p>

      <!-- 进度条 -->
      <div class="progress-section">
        <div class="progress-info">
          <span>完成进度：{{ completedCount }}/{{ totalCount }} ({{ progressPercent }}%)</span>
        </div>
        <el-progress :percentage="progressPercent" :color="progressColor" />
      </div>
    </div>

    <!-- 分类清单 -->
    <el-row :gutter="20">
      <el-col :span="8" v-for="category in categories" :key="category.id">
        <div class="category-card card">
          <div class="category-header">
            <h3>{{ category.icon }} {{ category.title }}</h3>
            <el-tag :type="getCategoryStatus(category).type">
              {{ getCategoryStatus(category).text }}
            </el-tag>
          </div>

          <div class="item-list">
            <div
              v-for="item in category.items"
              :key="item.id"
              :class="['item-row', { checked: item.checked }]"
            >
              <el-checkbox
                v-model="item.checked"
                @change="saveProgress"
              >
                <div class="item-content">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-specs" v-if="item.specs">{{ item.specs }}</div>
                  <div class="item-quantity" v-if="item.quantity">
                    数量：{{ item.quantity }}
                  </div>
                  <div class="item-notes" v-if="item.notes">
                    💡 {{ item.notes }}
                  </div>
                </div>
              </el-checkbox>
            </div>
          </div>

          <div class="category-summary">
            <span>
              已完成：{{ category.items.filter(i => i.checked).length }}/{{ category.items.length }}
            </span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 底部操作 -->
    <div class="bottom-actions mt-3">
      <el-button @click="exportProgress">
        <el-icon><Download /></el-icon>
        导出清单
      </el-button>
      <el-button @click="resetProgress" type="danger">
        <el-icon><Delete /></el-icon>
        重置进度
      </el-button>
      <el-button @click="markAllComplete" type="success">
        <el-icon><Select /></el-icon>
        全部标记完成
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 数据
const STORAGE_KEY = 'hardware-checklist-progress'

const categories = ref([
  {
    id: 'electronics',
    title: '电子元件',
    icon: '🔌',
    items: [
      {
        id: 'esp32',
        name: 'ESP32-S3 开发板',
        specs: 'ESP32-S3-DevKitC-1',
        quantity: '1个',
        notes: '主控制器，约$10',
        checked: false
      },
      {
        id: 'servo-0',
        name: 'HLS3606M 舵机 #0',
        specs: '12位精度，总线控制，食指用',
        quantity: '1个',
        notes: 'ID=0',
        checked: false
      },
      {
        id: 'servo-1',
        name: 'HLS3606M 舵机 #1',
        specs: '中指用',
        quantity: '1个',
        notes: 'ID=1',
        checked: false
      },
      {
        id: 'servo-2',
        name: 'HLS3606M 舵机 #2',
        specs: '无名指用',
        quantity: '1个',
        notes: 'ID=2',
        checked: false
      },
      {
        id: 'servo-3',
        name: 'HLS3606M 舵机 #3',
        specs: '小指用',
        quantity: '1个',
        notes: 'ID=3',
        checked: false
      },
      {
        id: 'servo-4',
        name: 'HLS3606M 舵机 #4',
        specs: '拇指内收用',
        quantity: '1个',
        notes: 'ID=4',
        checked: false
      },
      {
        id: 'servo-5',
        name: 'HLS3606M 舵机 #5',
        specs: '拇指弯曲用',
        quantity: '1个',
        notes: 'ID=5',
        checked: false
      },
      {
        id: 'usb-cable',
        name: 'USB-C 数据线',
        specs: '',
        quantity: '1根',
        notes: 'ESP32供电和编程',
        checked: false
      },
      {
        id: 'power-adapter',
        name: '5V 3A 电源适配器',
        specs: '',
        quantity: '1个',
        notes: '舵机供电（重要！）',
        checked: false
      }
    ]
  },
  {
    id: '3d-print',
    title: '3D打印零件',
    icon: '🖨️',
    items: [
      {
        id: 'palm-left',
        name: '左手掌 (palm_left.stl)',
        specs: '',
        quantity: '1个',
        notes: '或右手掌，二选一',
        checked: false
      },
      {
        id: 'palm-cover',
        name: '手掌盖板 (palm_cover.stl)',
        specs: '',
        quantity: '1个',
        notes: '',
        checked: false
      },
      {
        id: 'finger-proximal',
        name: '近端指骨 × 4',
        specs: 'finger_proximal.stl',
        quantity: '4个',
        notes: '食中无小指各一',
        checked: false
      },
      {
        id: 'finger-intermediate',
        name: '中端指骨 × 4',
        specs: 'finger_intermediate.stl',
        quantity: '4个',
        notes: '',
        checked: false
      },
      {
        id: 'finger-distal',
        name: '远端指骨 × 4',
        specs: 'finger_distal.stl',
        quantity: '4个',
        notes: '',
        checked: false
      },
      {
        id: 'fingertip',
        name: '指尖 × 4',
        specs: 'fingertip.stl',
        quantity: '4个',
        notes: '',
        checked: false
      },
      {
        id: 'thumb-parts',
        name: '拇指组件（4个零件）',
        specs: '掌骨+近端+远端+指尖',
        quantity: '1套',
        notes: '',
        checked: false
      },
      {
        id: 'pulleys',
        name: '滑轮',
        specs: '3mm和5mm',
        quantity: '约20个',
        notes: 'pulley_3mm.stl, pulley_5mm.stl',
        checked: false
      },
      {
        id: 'wrist-mount',
        name: '腕部安装座',
        specs: 'wrist_mount.stl',
        quantity: '1个',
        notes: '',
        checked: false
      }
    ]
  },
  {
    id: 'mechanical',
    title: '机械零件',
    icon: '⚙️',
    items: [
      {
        id: 'tendon-material',
        name: '肌腱材料',
        specs: 'Dyneema或Spectra钓鱼线',
        quantity: '2米',
        notes: '直径0.5-0.8mm，强度≥50kg',
        checked: false
      },
      {
        id: 'screw-m2',
        name: 'M2螺丝',
        specs: '',
        quantity: '20个',
        notes: '',
        checked: false
      },
      {
        id: 'nut-m2',
        name: 'M2螺母',
        specs: '',
        quantity: '20个',
        notes: '',
        checked: false
      },
      {
        id: 'screw-m25',
        name: 'M2.5螺丝',
        specs: '',
        quantity: '10个',
        notes: '',
        checked: false
      },
      {
        id: 'nut-m25',
        name: 'M2.5螺母',
        specs: '',
        quantity: '10个',
        notes: '',
        checked: false
      }
    ]
  },
  {
    id: 'tools',
    title: '工具',
    icon: '🛠️',
    items: [
      {
        id: '3d-printer',
        name: '3D打印机（FDM）',
        specs: 'Ender 3 / Prusa i3 等',
        quantity: '1台',
        notes: '构建尺寸≥150×150×150mm',
        checked: false
      },
      {
        id: 'pla-filament',
        name: 'PLA打印材料',
        specs: '1.75mm',
        quantity: '1卷',
        notes: '建议浅色，便于观察',
        checked: false
      },
      {
        id: 'screwdriver-ph0',
        name: '小螺丝刀 PH0',
        specs: '',
        quantity: '1把',
        notes: '',
        checked: false
      },
      {
        id: 'screwdriver-ph1',
        name: '小螺丝刀 PH1',
        specs: '',
        quantity: '1把',
        notes: '',
        checked: false
      },
      {
        id: 'tweezers',
        name: '镊子',
        specs: '',
        quantity: '1把',
        notes: '穿引肌腱用',
        checked: false
      },
      {
        id: 'cutters',
        name: '剪钳',
        specs: '',
        quantity: '1把',
        notes: '',
        checked: false
      },
      {
        id: 'needlenose-plier',
        name: '尖嘴钳',
        specs: '',
        quantity: '1把',
        notes: '',
        checked: false
      }
    ]
  },
  {
    id: 'optional',
    title: '可选配件',
    icon: '📦',
    items: [
      {
        id: 'logic-analyzer',
        name: '逻辑分析仪',
        specs: '',
        quantity: '1个',
        notes: '调试用',
        checked: false
      },
      {
        id: 'multimeter',
        name: '万用表',
        specs: '',
        quantity: '1个',
        notes: '',
        checked: false
      },
      {
        id: 'helping-hand',
        name: '帮助架',
        specs: '',
        quantity: '1个',
        notes: '固定手掌',
        checked: false
      }
    ]
  },
  {
    id: 'testing',
    title: '测试设备',
    icon: '🔬',
    items: [
      {
        id: 'caliper',
        name: '数字游标卡尺',
        specs: '',
        quantity: '1把',
        notes: '可选，用于测量',
        checked: false
      },
      {
        id: 'magnifier',
        name: '放大镜/显微镜',
        specs: '',
        quantity: '1个',
        notes: '检查肌腱穿引',
        checked: false
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

// 方法
const getCategoryStatus = (category) => {
  const completed = category.items.filter(i => i.checked).length
  const total = category.items.length
  const percent = (completed / total) * 100

  if (percent === 100) return { type: 'success', text: '✅ 完成' }
  if (percent >= 50) return { type: 'warning', text: '🔄 进行中' }
  return { type: 'info', text: '⏳ 待开始' }
}

const saveProgress = () => {
  const data = categories.value.map(cat => ({
    id: cat.id,
    items: cat.items.map(item => ({ id: item.id, checked: item.checked }))
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const loadProgress = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      data.forEach(catData => {
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
    } catch (e) {
      console.error('加载进度失败:', e)
    }
  }
}

const exportProgress = () => {
  let text = 'Aero Hand 硬件清单\n'
  text += '=' .repeat(50) + '\n\n'
  text += `完成进度: ${completedCount.value}/${totalCount.value} (${progressPercent.value}%)\n\n`

  categories.value.forEach(cat => {
    text += `\n【${cat.icon} ${cat.title}】\n`
    cat.items.forEach(item => {
      const status = item.checked ? '✅' : '⬜'
      text += `  ${status} ${item.name}`
      if (item.quantity) text += ` × ${item.quantity}`
      if (item.specs) text += ` (${item.specs})`
      text += '\n'
      if (item.notes) text += `      ${item.notes}\n`
    })
  })

  // 创建下载
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hardware-checklist-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('清单已导出')
}

const resetProgress = () => {
  if (confirm('确定要重置所有进度吗？')) {
    categories.value.forEach(cat => {
      cat.items.forEach(item => {
        item.checked = false
      })
    })
    saveProgress()
    ElMessage.success('已重置')
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

// 生命周期
onMounted(() => {
  loadProgress()
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

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.page-header p {
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.progress-section {
  margin-top: 20px;
}

.progress-info {
  margin-bottom: 8px;
  font-weight: 500;
}

.category-card {
  margin-bottom: 20px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;
}

.category-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.item-list {
  max-height: 500px;
  overflow-y: auto;
}

.item-row {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.item-row:hover {
  background: #f5f7fa;
}

.item-row.checked {
  background: #f0f9ff;
  opacity: 0.7;
}

.item-row.checked .item-name {
  text-decoration: line-through;
  color: #999;
}

.item-content {
  flex: 1;
}

.item-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.item-specs,
.item-quantity {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
}

.item-notes {
  font-size: 12px;
  color: #409eff;
  margin-top: 4px;
}

.category-summary {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  font-size: 13px;
  color: #666;
  text-align: right;
}

.bottom-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px;
}
</style>
