/**
 * 流程图 Composable
 * 处理 ECharts 流程图的渲染和交互
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

/**
 * 线性流程图 Composable
 * @param {Object} flowDefinition - 流程定义
 * @returns {Object} 流程图方法和状态
 */
export function useLinearFlow(flowDefinition) {
  const chartRef = ref(null)
  const chartInstance = ref(null)
  const selectedNode = ref(null)
  const highlightedPath = ref([])

  /**
   * 生成节点配置
   */
  const nodes = computed(() => {
    return flowDefinition.nodes.map(node => ({
      id: node.id,
      name: node.label,
      value: node.description || '',
      category: node.type,
      data: node.data || {}
    }))
  })

  /**
   * 生成边配置
   */
  const edges = computed(() => {
    return flowDefinition.edges.map((edge, index) => ({
      source: edge.from,
      target: edge.to,
      name: edge.label || '',
      lineStyle: {
        curveness: 0.2
      }
    }))
  })

  /**
   * 获取 ECharts 配置
   */
  function getOption() {
    const direction = flowDefinition.direction || 'TB'

    return {
      title: {
        text: flowDefinition.name,
        left: 'center',
        top: 10
      },
      tooltip: {
        formatter: (params) => {
          if (params.dataType === 'node') {
            let tooltip = `<strong>${params.name}</strong><br/>`
            tooltip += params.value || ''
            if (params.data.data) {
              Object.entries(params.data.data).forEach(([key, value]) => {
                tooltip += `<br/>${key}: ${value}`
              })
            }
            return tooltip
          } else if (params.dataType === 'edge') {
            return params.name
          }
          return ''
        }
      },
      series: [{
        type: 'graph',
        layout: direction === 'TB' || direction === 'BT' ? 'none' : 'none',
        symbolSize: 60,
        roam: true,
        label: {
          show: true,
          position: 'bottom',
          formatter: '{b}'
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 12
        },
        data: nodes.value.map((node, index) => {
          const y = 100 - index * 12
          return {
            id: node.id,
            name: node.name,
            value: node.value,
            x: 50,
            y: y,
            category: node.category,
            data: node.data,
            itemStyle: {
              color: getNodeColor(node.category)
            }
          }
        }),
        links: edges.value,
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          }
        }
      }]
    }
  }

  /**
   * 获取节点颜色
   */
  function getNodeColor(type) {
    const colors = {
      input: '#3498db',
      output: '#2ecc71',
      process: '#95a5a6',
      decision: '#e74c3c',
      data: '#f39c12'
    }
    return colors[type] || '#95a5a6'
  }

  /**
   * 初始化图表
   */
  function initChart() {
    if (!chartRef.value) return

    chartInstance.value = echarts.init(chartRef.value)
    chartInstance.value.setOption(getOption())

    // 绑定事件
    chartInstance.value.on('click', (params) => {
      if (params.dataType === 'node') {
        selectedNode.value = params.data
      }
    })
  }

  /**
   * 更新图表
   */
  function updateChart() {
    if (chartInstance.value) {
      chartInstance.value.setOption(getOption())
    }
  }

  /**
   * 高亮路径
   */
  function highlightPath(nodeIds) {
    highlightedPath.value = nodeIds
    // TODO: 实现路径高亮逻辑
  }

  /**
   * 清除高亮
   */
  function clearHighlight() {
    highlightedPath.value = []
  }

  /**
   * 调整大小
   */
  function resize() {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  }

  // 生命周期
  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
    window.removeEventListener('resize', resize)
  })

  return {
    chartRef,
    chartInstance,
    selectedNode,
    highlightedPath,
    nodes,
    edges,
    initChart,
    updateChart,
    highlightPath,
    clearHighlight,
    resize
  }
}

/**
 * 并行泳道图 Composable
 * @param {Object} flowDefinition - 流程定义
 */
export function useParallelFlow(flowDefinition) {
  const chartRef = ref(null)
  const chartInstance = ref(null)

  /**
   * 获取泳道 Y 坐标
   */
  function getLaneY(laneId) {
    const index = flowDefinition.lanes.findIndex(l => l.id === laneId)
    const laneHeight = 80 / flowDefinition.lanes.length
    return 90 - index * laneHeight - laneHeight / 2
  }

  /**
   * 获取 ECharts 配置
   */
  function getOption() {
    // 按 lane 分组的节点
    const nodesByLane = {}
    flowDefinition.lanes.forEach(lane => {
      nodesByLane[lane.id] = flowDefinition.nodes
        .filter(n => n.lane === lane.id)
        .sort((a, b) => a.order - b.order)
    })

    const maxOrder = Math.max(...flowDefinition.nodes.map(n => n.order))

    return {
      title: {
        text: flowDefinition.name,
        left: 'center'
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%'
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: maxOrder + 1 }, (_, i) => `步骤 ${i}`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'category',
        data: flowDefinition.lanes.map(l => l.name),
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: flowDefinition.lanes.map((lane, laneIndex) => {
        const laneNodes = nodesByLane[lane.id]
        return {
          type: 'scatter',
          name: lane.name,
          yAxisIndex: 0,
          xAxisIndex: 0,
          data: laneNodes.map(node => [node.order, laneIndex]),
          symbolSize: 80,
          label: {
            show: true,
            formatter: ({ data }) => {
              const node = laneNodes.find(n => n.order === data[0])
              return node ? node.label : ''
            },
            fontSize: 10
          },
          itemStyle: {
            color: lane.color
          },
          emphasis: {
            itemStyle: {
              borderColor: '#000',
              borderWidth: 2
            }
          }
        }
      })
    }
  }

  function initChart() {
    if (!chartRef.value) return

    chartInstance.value = echarts.init(chartRef.value)
    chartInstance.value.setOption(getOption())
  }

  function resize() {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
    window.removeEventListener('resize', resize)
  })

  return {
    chartRef,
    initChart,
    resize
  }
}

/**
 * 树形图 Composable
 * @param {Object} flowDefinition - 流程定义
 */
export function useTreeFlow(flowDefinition) {
  const chartRef = ref(null)
  const chartInstance = ref(null)

  /**
   * 构建树形结构
   */
  function buildTree() {
    const nodeMap = new Map()
    flowDefinition.nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] })
    })

    const roots = []
    nodeMap.forEach(node => {
      if (node.parent && nodeMap.has(node.parent)) {
        nodeMap.get(node.parent).children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots.length > 0 ? roots[0] : null
  }

  function getOption() {
    const treeData = buildTree()

    return {
      title: {
        text: flowDefinition.name,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [{
        type: 'tree',
        data: treeData ? [treeData] : [],
        top: '10%',
        left: '10%',
        bottom: '10%',
        right: '20%',
        symbolSize: 12,
        symbol: 'emptyCircle',
        expandAndCollapse: true,
        initialTreeDepth: 2,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 12
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        itemStyle: {
          color: '#3498db'
        }
      }]
    }
  }

  function initChart() {
    if (!chartRef.value) return

    chartInstance.value = echarts.init(chartRef.value)
    chartInstance.value.setOption(getOption())
  }

  function resize() {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
    window.removeEventListener('resize', resize)
  })

  return {
    chartRef,
    initChart,
    resize
  }
}
