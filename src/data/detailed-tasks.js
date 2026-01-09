/**
 * Aero Hand 详细任务树
 * 多层级细分：阶段 → 子阶段 → 任务 → 操作步骤 → 前置知识
 */

export const detailedTaskTree = {
  // ========== 阶段1：硬件准备 ==========
  hardware: {
    id: 'hardware',
    title: '硬件准备',
    icon: 'Box',
    description: '采购和准备所有硬件零件',
    estimatedTime: '1-2周',
    subStages: [
      {
        id: 'hardware-electronics',
        title: '电子元件采购',
        tasks: [
          {
            id: 'buy-esp32',
            title: '购买ESP32-S3开发板',
            status: 'completed',
            operations: [
              '搜索"ESP32-S3-DevKitC-1"',
              '确认型号：ESP32-S3-WROOM-1 或 ESP32-S3-D0WDQ6',
              '对比价格（约$10-15）',
              '下单购买'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'ESP32基础知识',
                content: 'ESP32是乐鑫科技推出的Wi-Fi+蓝牙芯片，S3版本支持AI加速。选择DevKitC-1是因为引脚数量足够、开发文档丰富。'
              },
              {
                type: 'knowledge',
                title: '串口通信基础',
                content: 'ESP32通过USB-C接口与电脑通信，需要安装CP2102或CH340驱动。'
              }
            ],
            verification: [
              '收到ESP32开发板',
              'USB线可以连接电脑',
              '设备管理器中识别到COM口'
            ],
            troubleshooting: [
              { problem: '电脑识别不到设备', solution: '检查USB线质量，安装CP2102驱动' },
              { problem: '无法烧录程序', solution: '按住BOOT按钮后按RESET按钮' }
            ]
          },
          {
            id: 'buy-servos',
            title: '购买7个HLS3606M舵机',
            status: 'completed',
            operations: [
              '搜索"Feetech HLS3606M"',
              '确认规格：12位精度、总线控制、4096级',
              '购买7个（最好买1-2个备用）',
              '等待收货'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: '舵机控制原理',
                content: 'HLS3606M是串行总线舵机，通过单根信号线控制多个舵机，支持4096级位置精度，使用PWM信号控制。'
              },
              {
                type: 'knowledge',
                title: '总线舵机vs普通PWM舵机',
                content: '总线舵机可以级联连接，减少引脚占用；普通PWM舵机每个需要独立信号线。'
              }
            ],
            verification: [
              '收到7个舵机',
              '外观无损坏',
              '舵机可以手动转动'
            ]
          },
          {
            id: 'buy-power',
            title: '购买电源和连接线',
            status: 'pending',
            operations: [
              '购买5V 3A电源适配器',
              '购买USB-C数据线（高质量）',
              '可选：购买逻辑分析仪用于调试'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: '功率计算',
                content: '每个舵机最大电流约500mA，7个同时需要3.5A，因此5V 3A电源可以满足大部分情况。'
              }
            ]
          }
        ]
      },
      {
        id: 'hardware-3dprint',
        title: '3D打印准备',
        tasks: [
          {
            id: 'prepare-printer',
            title: '准备3D打印机',
            status: 'completed',
            operations: [
              '检查3D打印机状态',
              '清洁打印平台',
              '准备PLA材料（建议浅色）',
              '测试打印小样件'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'FDM 3D打印基础',
                content: 'FDM（熔融沉积建模）是最常见的3D打印技术，PLA是最易用的材料，打印温度190-220°C。'
              }
            ]
          },
          {
            id: 'print-parts',
            title: '打印所有零件',
            status: 'completed',
            operations: [
              '下载STL文件（从GitHub）',
              '切片软件设置：层高0.2mm、填充20%',
              '打印顺序：手掌 → 手指 → 拇指 → 滑轮 → 其他',
              '检查打印质量',
              '去除支撑结构',
              '清理零件毛刺'
            ],
            items: [
              { name: 'palm_left.stl', qty: 1, notes: '左手掌' },
              { name: 'palm_cover.stl', qty: 1, notes: '手掌盖板' },
              { name: 'finger_proximal.stl', qty: 4, notes: '近端指骨×4' },
              { name: 'finger_intermediate.stl', qty: 4, notes: '中端指骨×4' },
              { name: 'finger_distal.stl', qty: 4, notes: '远端指骨×4' },
              { name: 'fingertip.stl', qty: 4, notes: '指尖×4' },
              { name: 'thumb_*.stl', qty: 4, notes: '拇指组件4个零件' },
              { name: 'pulley_3mm.stl', qty: 15, notes: '3mm滑轮' },
              { name: 'pulley_5mm.stl', qty: 5, notes: '5mm滑轮' }
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: '切片软件设置',
                content: '推荐使用Cura或PrusaSlicer，关键设置：支撑角度45°、打印速度50mm/s、冷却风扇100%。'
              }
            ],
            verification: [
              '所有零件打印完成',
              '无严重翘曲',
              '关节活动顺畅'
            ]
          }
        ]
      },
      {
        id: 'hardware-mechanical',
        title: '机械零件采购',
        tasks: [
          {
            id: 'buy-tendon',
            title: '购买肌腱材料',
            status: 'completed',
            operations: [
              '搜索"Dyneema钓鱼线 0.5mm"',
              '或搜索"Spectra缝合线"',
              '购买2米（多买点备用）',
              '测试强度：手动拉扯不应断裂'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: '肌腱材料特性',
                content: 'Dyneema是超高分子量聚乙烯纤维，强度是钢的15倍但重量很轻，几乎不拉伸，非常适合肌腱驱动。'
              }
            ]
          },
          {
            id: 'buy-fasteners',
            title: '购买紧固件',
            status: 'completed',
            operations: [
              '购买M2螺丝×20、螺母×20',
              '购买M2.5螺丝×10、螺母×10',
              '确认螺丝刀尺寸匹配'
            ]
          }
        ]
      },
      {
        id: 'hardware-tools',
        title: '工具准备',
        tasks: [
          {
            id: 'prepare-tools',
            title: '准备组装工具',
            status: 'completed',
            operations: [
              '准备PH0和PH1螺丝刀',
              '准备镊子（穿肌腱用）',
              '准备剪钳和尖嘴钳',
              '可选：准备数字游标卡尺'
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段2：机械组装 ==========
  assembly: {
    id: 'assembly',
    title: '机械组装',
    icon: 'Operation',
    description: '组装灵巧手的机械结构',
    estimatedTime: '1-2周',
    subStages: [
      {
        id: 'assembly-fingers',
        title: '手指组装',
        tasks: [
          {
            id: 'assemble-finger',
            title: '组装单根手指（以食指为例）',
            status: 'completed',
            operations: [
              '步骤1：安装滑轮',
              '  - 在近端指骨安装2个3mm滑轮',
              '  - 用M2螺丝固定',
              '  - 确保滑轮可以自由转动',
              '',
              '步骤2：穿引肌腱',
              '  - 截取约30cm长的肌腱',
              '  - 从掌心底部的锚点开始',
              '  - 依次绕过各个滑轮',
              '  - 到达指尖固定点',
              '  - 用结或胶水固定两端',
              '',
              '步骤3：连接指骨',
              '  - 用关节销钉连接近端-中端',
              '  - 用关节销钉连接中端-远端',
              '  - 用胶水或小螺丝固定指尖',
              '',
              '步骤4：测试运动',
              '  - 手动拉动肌腱',
              '  - 观察手指是否顺畅弯曲',
              '  - 检查是否有卡顿'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: '肌腱穿引技巧',
                content: '保持肌腱平整不扭转，预留适当余量（约10mm）以便后续调整张力。'
              },
              {
                type: 'video',
                title: '肌腱穿引演示',
                content: '参考官方视频：https://docs.tetheria.ai/docs/assembly'
              }
            ],
            verification: [
              '手指可以自由弯曲',
              '弯曲过程无卡顿',
              '肌腱无滑脱'
            ],
            troubleshooting: [
              { problem: '手指卡顿', solution: '检查滑轮是否灵活，检查关节是否过紧' },
              { problem: '肌腱滑脱', solution: '重新固定肌腱末端，使用胶水加固' },
              { problem: '弯曲不充分', solution: '调整肌腱张力，减小预张力' }
            ]
          },
          {
            id: 'assemble-all-fingers',
            title: '组装其余4根手指',
            status: 'completed',
            operations: [
              '重复食指组装步骤',
              '组装中指、无名指、小指',
              '注意：每根手指的肌腱长度略有差异'
            ]
          },
          {
            id: 'assemble-thumb',
            title: '组装拇指',
            status: 'completed',
            operations: [
              '组装拇指的4个零件',
              '穿引拇指的2根肌腱（内收和弯曲）',
              '测试拇指的运动范围'
            ]
          }
        ]
      },
      {
        id: 'assembly-palm',
        title: '手掌组装',
        tasks: [
          {
            id: 'install-electronics',
            title: '安装电子元件到手掌',
            status: 'completed',
            operations: [
              '安装ESP32到掌心',
              '连接7个舵机到总线',
              '在最后一个舵机添加120Ω终端电阻',
              '测试所有舵机ID识别'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'RS485总线基础',
                content: 'HLS3606M使用RS485协议，需要120Ω终端电阻防止信号反射，舵机ID需要手动配置。'
              }
            ]
          },
          {
            id: 'attach-fingers',
            title: '安装手指到手掌',
            status: 'completed',
            operations: [
              '将4根手指安装到手指座',
              '将拇指安装到拇指座',
              '检查所有手指的朝向一致',
              '固定所有连接螺丝'
            ]
          },
          {
            id: 'connect-tendons',
            title: '连接肌腱到舵机',
            status: 'completed',
            operations: [
              '将每根手指的肌腱连接到对应舵机',
              '舵机0 → 食指',
              '舵机1 → 中指',
              '舵机2 → 无名指',
              '舵机3 → 小指',
              '舵机4 → 拇指内收',
              '舵机5 → 拇指弯曲',
              '调整肌腱预张力'
            ],
            verification: [
              '所有手指都能运动',
              '手指在放松时呈自然半弯曲',
              '手指能完全伸直和完全弯曲'
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段3：固件烧录 ==========
  firmware: {
    id: 'firmware',
    title: '固件烧录',
    icon: 'Cpu',
    description: '烧录ESP32固件',
    estimatedTime: '1-2天',
    subStages: [
      {
        id: 'firmware-setup',
        title: '烧录环境准备',
        tasks: [
          {
            id: 'install-arduino',
            title: '安装Arduino IDE',
            status: 'completed',
            operations: [
              '下载Arduino IDE 2.x',
              '安装ESP32开发板支持',
              '安装CP2102/CH340驱动',
              '测试连接ESP32'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'Arduino开发基础',
                content: 'Arduino IDE是为嵌入式开发设计的IDE，支持C++语言，ESP32是其支持的众多开发板之一。'
              }
            ]
          },
          {
            id: 'download-firmware',
            title: '下载固件代码',
            status: 'completed',
            operations: [
              '克隆aero-hand-open仓库',
              '或下载ZIP文件',
              '定位到firmware/main/目录',
              '打开firmware_v0.1.0.ino'
            ]
          }
        ]
      },
      {
        id: 'firmware-flash',
        title: '烧录固件',
        tasks: [
          {
            id: 'flash-esp32',
            title: '烧录固件到ESP32',
            status: 'completed',
            operations: [
              '连接ESP32到电脑',
              '在Arduino IDE中选择开发板：ESP32-S3 Dev Module',
              '选择正确的COM端口',
              '点击上传按钮',
              '等待编译和上传完成'
            ],
            prerequisites: [
              {
                type: 'code',
                title: '固件结构理解',
                content: 'firmware_v0.1.0.ino包含：串口通信协议、舵机控制逻辑、归位程序、EEPROM配置存储。'
              }
            ],
            verification: [
              '上传成功无错误',
              'ESP32的LED闪烁',
              '可以用SDK连接'
            ],
            troubleshooting: [
              { problem: '上传失败', solution: '按住BOOT按钮后点击上传' },
              { problem: '找不到COM口', solution: '安装CP2102驱动' }
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段4：舵机配置 ==========
  servoConfig: {
    id: 'servo-config',
    title: '舵机配置',
    icon: 'Setting',
    description: '配置每个舵机的安全运动范围',
    estimatedTime: '2-3天',
    subStages: [
      {
        id: 'servo-basic',
        title: '舵机基础理解',
        tasks: [
          {
            id: 'understand-servo',
            title: '理解HLS3606M舵机控制原理',
            status: 'completed',
            prerequisites: [
              {
                type: 'knowledge',
                title: 'PWM控制原理',
                content: '舵机通过PWM信号的脉宽控制位置，HLS3606M支持4096级精度（12位），范围0-4095。'
              },
              {
                type: 'knowledge',
                title: '串行总线协议',
                content: 'HLS3606M使用专用串行协议，数据帧格式：[起始][ID][位置低][位置高][校验][结束]。'
              },
              {
                type: 'knowledge',
                title: '端点配置的意义',
                content: 'grasp_count（闭合端点）是手指最大弯曲时的舵机位置，extend_count（张开端点）是手指完全伸直时的位置。配置这两个值可以避免机械碰撞。'
              }
            ],
            resources: [
              { type: 'doc', title: 'HLS3606M数据手册', url: 'https://feetechrc.com/product/HLS3606M/' },
              { type: 'video', title: '舵机控制原理视频', url: 'https://www.youtube.com/watch?v=MrY9FLJQsqk' }
            ]
          }
        ]
      },
      {
        id: 'servo-configure',
        title: '端点配置',
        tasks: [
          {
            id: 'install-sdk',
            title: '安装Python SDK',
            status: 'completed',
            operations: [
              'cd sdk/',
              'pip install -e .',
              '验证安装：python -c "from aero_open_sdk import AeroHand"'
            ]
          },
          {
            id: 'config-endpoints',
            title: '配置所有7个舵机的端点',
            status: 'in_progress',
            operations: [
              '运行GUI：python -m aero_open_sdk.gui_chinese',
              '对于每个舵机（0-6）：',
              '  1. 切换到"单舵机测试"标签',
              '  2. 选择舵机ID',
              '  3. 拖动滑块到手指完全伸直',
              '  4. 点击"设为张开"',
              '  5. 拖动滑块到手指最大弯曲',
              '  6. 点击"设为闭合"',
              '  7. 点击"保存端点"',
              '  8. 验证：发送0%、50%、100%测试',
              '重复所有7个舵机'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'GUI工具使用',
                content: 'gui_chinese.py提供端口检测、单舵机测试、端点配置、固件烧录等功能。'
              }
            ],
            verification: [
              '所有7个舵机端点已配置',
              '每个舵机在0-100%范围内平稳运动',
              '无碰到机械限位的情况'
            ],
            troubleshooting: [
              { problem: '手指不能完全伸直', solution: 'extend_count设置太大，重新配置' },
              { problem: '手指不能完全弯曲', solution: 'grasp_count设置太小，重新配置' },
              { problem: '100%时手指抖动', solution: 'grasp_count接近机械限位，减小该值' }
            ]
          }
        ]
      },
      {
        id: 'servo-test',
        title: '测试SDK控制',
        tasks: [
          {
            id: 'run-sequence',
            title: '运行run_sequence.py',
            status: 'pending',
            operations: [
              'cd sdk/examples/',
              'python run_sequence.py',
              '观察手执行动作序列',
              '验证所有手指响应正常'
            ],
            prerequisites: [
              {
                type: 'code',
                title: 'run_sequence.py代码解析',
                content: '这个脚本演示了如何使用SDK控制手执行预定义的动作序列，包括张开、半握、握紧等动作。'
              },
              {
                type: 'knowledge',
                title: '关节映射',
                content: '位置数组[0,30,45,50,55,50]对应：食指0%、中指30%、无名指45%、小指50%、拇指内收55%、拇指弯曲50%。'
              }
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段5：SDK使用 ==========
  sdk: {
    id: 'sdk',
    title: 'SDK使用',
    icon: 'Files',
    description: '掌握Python SDK的使用方法',
    estimatedTime: '3-5天',
    subStages: [
      {
        id: 'sdk-structure',
        title: '理解代码架构',
        tasks: [
          {
            id: 'understand-architecture',
            title: '理解SDK、固件、硬件关系',
            status: 'pending',
            prerequisites: [
              {
                type: 'knowledge',
                title: '分层架构',
                content: '应用层(Python脚本) → SDK层(高级API) → 固件层(串口协议) → 硬件层(舵机+肌腱)'
              },
              {
                type: 'code',
                title: '串口通信协议',
                content: '固定16字节帧格式：[0x7E][命令码][12字节数据][校验和][0x7E]，命令码包括设置位置(0x01)、读取位置(0x10)等。'
              }
            ],
            resources: [
              { type: 'doc', title: 'SDK API文档', url: 'https://docs.tetheria.ai/docs/sdk' },
              { type: 'code', title: 'SDK源码', path: 'sdk/src/aero_open_sdk/' }
            ]
          }
        ]
      },
      {
        id: 'sdk-ecology',
        title: '官方代码生态',
        tasks: [
          {
            id: 'explore-examples',
            title: '探索官方示例脚本',
            status: 'pending',
            operations: [
              '列出sdk/examples/目录所有文件',
              '阅读每个脚本的功能说明',
              '运行run_sequence.py',
              '运行test_all_servos.py',
              '运行grasp_test.py'
            ],
            resources: [
              { type: 'code', title: 'run_sequence.py', path: 'sdk/examples/run_sequence.py' },
              { type: 'code', title: 'test_all_servos.py', path: 'sdk/examples/test_all_servos.py' }
            ]
          }
        ]
      },
      {
        id: 'sdk-practice',
        title: 'SDK实践',
        tasks: [
          {
            id: 'write-custom-script',
            title: '编写自定义控制脚本',
            status: 'pending',
            operations: [
              '创建新的Python脚本my_script.py',
              '导入AeroHand类',
              '实现一个自定义动作序列',
              '添加平滑过渡函数',
              '测试并调试'
            ],
            prerequisites: [
              {
                type: 'code',
                title: 'Python异步编程基础',
                content: '使用asyncio可以实现非阻塞控制，允许多个动作并发执行。'
              }
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段6：MuJoCo仿真 ==========
  mujoco: {
    id: 'mujoco',
    title: 'MuJoCo仿真',
    icon: 'Monitor',
    description: '学习和使用MuJoCo物理仿真',
    estimatedTime: '1-2周',
    subStages: [
      {
        id: 'mujoco-basic',
        title: 'MuJoCo基础',
        tasks: [
          {
            id: 'understand-xml',
            title: '理解XML模型结构',
            status: 'pending',
            operations: [
              '阅读aero_hand.xml',
              '识别body（刚体）、joint（关节）、tendon（肌腱）、actuator（执行器）',
              '修改一个参数观察效果',
              '重新加载模型验证'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'MuJoCo物理引擎',
                content: 'MuJoCo是快速物理仿真引擎，使用MJCF（MuJoCo XML Format）定义模型，支持刚体动力学、碰撞检测、摩擦模拟。'
              },
              {
                type: 'knowledge',
                title: '肌腱驱动建模',
                content: 'MuJoCo的tendon元素可以模拟肌腱，通过spatial tendon定义空间路径，site定义路径点（滑轮、锚点等）。'
              }
            ],
            resources: [
              { type: 'doc', title: 'MuJoCo官方文档', url: 'https://mujoco.readthedocs.io/' },
              { type: 'code', title: 'Aero Hand XML', path: 'sim_rl/simulation/aero_hand.xml' }
            ]
          },
          {
            id: 'load-model',
            title: '加载并查看模型',
            status: 'pending',
            operations: [
              'import mujoco',
              'model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()',
              'data = mujoco.MjData(model)',
              'with mujoco.viewer.launch_passive(model, data):'
            ]
          }
        ]
      },
      {
        id: 'mujoco-realtime',
        title: '实时控制',
        tasks: [
          {
            id: 'implement-control',
            title: '实现实时控制脚本',
            status: 'pending',
            operations: [
              '创建交互式控制脚本',
              '添加键盘输入处理',
              '实现控制逻辑',
              '测试实时响应'
            ],
            prerequisites: [
              {
                type: 'code',
                title: '实时控制模式',
                content: '使用mujoco.viewer.launch_passive()可以创建交互式窗口，在循环中调用mj_step()和viewer.sync()实现实时更新。'
              }
            ],
            codeExample: `
import mujoco
import mujoco.viewer

model = mujoco.MjSpec.from_file("aero_hand.xml").to_model()
data = mujoco.MjData(model)

with mujoco.viewer.launch_passive(model, data) as viewer:
    while viewer.is_running():
        # 设置控制信号
        data.ctrl[0] = 1.0  # 弯曲食指
        mujoco.mj_step(model, data)
        viewer.sync()
            `
          }
        ]
      },
      {
        id: 'mujoco-visualization',
        title: '可视化调试',
        tasks: [
          {
            id: 'plot-data',
            title: '绘制关节角度和肌腱张力',
            status: 'pending',
            operations: [
              '记录仿真数据',
              '使用matplotlib绘制曲线',
              '分析运动模式',
              '识别异常情况'
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段7：ROS2集成 ==========
  ros2: {
    id: 'ros2',
    title: 'ROS2集成',
    icon: 'Connection',
    description: '学习ROS2中间件的使用',
    estimatedTime: '1-2周',
    subStages: [
      {
        id: 'ros2-setup',
        title: 'ROS2环境搭建',
        tasks: [
          {
            id: 'install-ros2',
            title: '安装ROS2 Humble',
            status: 'pending',
            operations: [
              '添加ROS2 APT源',
              'sudo apt update',
              'sudo apt install ros-humble-desktop',
              'source /opt/ros/humble/setup.bash',
              '添加到~/.bashrc'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'ROS2 vs ROS1',
                content: 'ROS2使用DDS（数据分发服务）替代ROS1的master-slave架构，支持实时性、安全性和嵌入式系统。'
              }
            ]
          },
          {
            id: 'setup-aero-hand',
            title: '搭建Aero Hand ROS2包',
            status: 'pending',
            operations: [
              '创建工作空间mkdir -p ~/aero_ros_ws/src',
              '克隆aero-hand-ros2仓库',
              '安装依赖rosdep install -i',
              '编译colcon build',
              'source install/setup.bash'
            ]
          }
        ]
      },
      {
        id: 'ros2-concepts',
        title: 'ROS2核心概念',
        tasks: [
          {
            id: 'understand-topics',
            title: '理解话题(Topic)通信',
            status: 'pending',
            prerequisites: [
              {
                type: 'knowledge',
                title: '发布-订阅模式',
                content: '发布者(Publisher)向话题发送消息，订阅者(Subscriber)从话题接收消息，实现解耦通信。'
              },
              {
                type: 'knowledge',
                title: '消息类型',
                content: 'ROS2使用强类型消息，如std_msgs/msg/String、sensor_msgs/msg/JointState等。'
              }
            ]
          },
          {
            id: 'run-nodes',
            title: '运行示例节点',
            status: 'pending',
            operations: [
              '终端1：ros2 run aero_hand hand_control_node',
              '终端2：ros2 topic echo /hand/state',
              '终端3：ros2 topic pub /hand/command std_msgs/msg/Float32MultiArray'
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段8：RL训练 ==========
  rl: {
    id: 'rl',
    title: 'RL训练',
    icon: 'TrendCharts',
    description: '强化学习和PPO算法',
    estimatedTime: '2-3周',
    subStages: [
      {
        id: 'rl-basics',
        title: 'RL基础',
        tasks: [
          {
            id: 'understand-ppo',
            title: '理解PPO算法原理',
            status: 'pending',
            prerequisites: [
              {
                type: 'knowledge',
                title: '强化学习核心概念',
                content: 'RL包含：Agent（策略）、Environment（环境）、State（状态）、Action（动作）、Reward（奖励）、Policy（策略）、Value Function（价值函数）。'
              },
              {
                type: 'knowledge',
                title: 'PPO核心创新',
                content: 'PPO使用裁剪目标函数限制策略更新幅度，结合了策略梯度和信任区域方法的优点，稳定且样本效率高。'
              }
            ],
            resources: [
              { type: 'doc', title: 'Spinning Up in RL', url: 'https://spinningup.openai.com/' },
              { type: 'paper', title: 'PPO论文', url: 'https://arxiv.org/abs/1707.06347' }
            ]
          }
        ]
      },
      {
        id: 'rl-training',
        title: 'PPO训练实践',
        tasks: [
          {
            id: 'setup-training',
            title: '配置训练环境',
            status: 'pending',
            operations: [
              'cd sim_rl/mujoco_playground',
              '配置训练超参数',
              '设置wandb用于监控',
              '测试小规模训练验证'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'MJX加速',
                content: 'MJX是MuJoCo的JAX实现，使用JIT编译和向量化，速度提升约100倍，可同时模拟1024个环境。'
              }
            ]
          },
          {
            id: 'run-training',
            title: '运行完整训练',
            status: 'pending',
            operations: [
              'python learning/train_jax_ppo.py --env_name=AeroCubeRotateZAxis',
              '监控wandb查看训练曲线',
              '等待训练完成（可能需要几小时）',
              '分析训练结果'
            ],
            codeExample: `
# 训练命令示例
python learning/train_jax_ppo.py \\
    --env_name=AeroCubeRotateZAxis \\
    --num_train_steps=10_000_000 \\
    --num_envs=1024 \\
    --learning_rate=3e-4 \\
    --entropy_cost=1e-2
            `
          }
        ]
      },
      {
        id: 'rl-advanced',
        title: '高级技巧',
        tasks: [
          {
            id: 'design-reward',
            title: '设计奖励函数',
            status: 'pending',
            prerequisites: [
              {
                type: 'knowledge',
                title: '奖励塑形',
                content: '好的奖励函数应：密集反馈、引导目标、避免局部最优、考虑安全约束。'
              }
            ]
          },
          {
            id: 'domain-randomization',
            title: '域随机化',
            status: 'pending',
            operations: [
              '识别需要随机化的参数',
              '配置随机化范围',
              '渐进式增加随机化强度',
              '验证泛化性能'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: 'Sim2Real Gap',
                content: '仿真与现实的差距来源：物理参数不准、传感器噪声、执行器延迟、机械公差。域随机化通过在训练时随机化这些参数来提高泛化能力。'
              }
            ]
          }
        ]
      }
    ]
  },

  // ========== 阶段9：Sim2Real ==========
  sim2real: {
    id: 'sim2real',
    title: 'Sim2Real',
    icon: 'MagicStick',
    description: '仿真到实物的转移',
    estimatedTime: '2-3周',
    subStages: [
      {
        id: 'sim2real-understand',
        title: '理解Sim2Real流程',
        tasks: [
          {
            id: 'understand-pipeline',
            title: '完整Sim2Real流程',
            status: 'pending',
            prerequisites: [
              {
                type: 'knowledge',
                title: 'Sim2Real关键步骤',
                content: '1. 仿真训练 2. 策略导出 3. 部署到硬件 4. 性能差距分析 5. 迭代优化'
              }
            ],
            flow: [
              { step: 1, name: 'MuJoCo训练', desc: '使用MJX加速训练PPO策略' },
              { step: 2, name: '策略导出', desc: '保存为npy格式' },
              { step: 3, name: 'SDK部署', desc: 'Python脚本加载策略并控制硬件' },
              { step: 4, name: '测试验证', desc: '评估真实性能' },
              { step: 5, name: '调优', desc: '调整参数或重新训练' }
            ]
          }
        ]
      },
      {
        id: 'sim2real-teleop',
        title: '遥操作示例',
        tasks: [
          {
            id: 'implement-teleop',
            title: '实现遥操作Sim2Real',
            status: 'pending',
            operations: [
              '创建遥操作接口',
              '记录人类演示轨迹',
              '训练行为克隆策略',
              '部署到硬件测试'
            ],
            resources: [
              { type: 'doc', title: '遥操作完整教程', url: '/knowledge#sim2real-teleop' },
              { type: 'code', title: '示例代码', path: 'sim_rl/examples/teleop/' }
            ]
          }
        ]
      },
      {
        id: 'sim2real-cube',
        title: '魔方旋转示例',
        tasks: [
          {
            id: 'train-cube-rotate',
            title: '训练魔方旋转策略',
            status: 'pending',
            operations: [
              '配置AeroCubeRotateZAxis环境',
              '运行PPO训练',
              '监控训练进度',
              '评估策略性能'
            ],
            prerequisites: [
              {
                type: 'knowledge',
                title: '任务定义',
                content: '目标：旋转魔方Z轴180度，观测：关节位置+魔方姿态，奖励：角度误差的负值，成功：角度<5度。'
              }
            ]
          },
          {
            id: 'deploy-cube-rotate',
            title: '部署魔方旋转策略',
            status: 'pending',
            operations: [
              '导出训练好的策略',
              '创建部署脚本',
              '测试硬件响应',
              '调整参数优化'
            ],
            troubleshooting: [
              { problem: '策略响应太慢', solution: '降低控制频率或使用更快的硬件' },
              { problem: '动作不够平滑', solution: '添加动作滤波器' },
              { problem: '成功率低', solution: '增加域随机化或真实数据微调' }
            ]
          }
        ]
      },
      {
        id: 'sim2real-optimize',
        title: '优化和迭代',
        tasks: [
          {
            id: 'analyze-gap',
            title: '分析Sim2Real差距',
            status: 'pending',
            operations: [
              '记录仿真和真实数据',
              '对比分析差异',
              '识别主要差距来源',
              '制定优化计划'
            ]
          },
          {
            id: 'system-identification',
            title: '系统辨识',
            status: 'pending',
            operations: [
              '测量真实硬件参数',
              '调整仿真模型参数',
              '验证仿真准确性',
              '重新训练策略'
            ]
          }
        ]
      }
    ]
  }
}
