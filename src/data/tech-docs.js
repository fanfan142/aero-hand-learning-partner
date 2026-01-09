const buildMarkdown = ({ title, summary, sections, sources }) => {
  const sectionsMarkdown = sections
    .map((section) => {
      const heading = `## ${section.title}`
      const points = section.points?.length
        ? `\n${section.points.map((point) => `- ${point}`).join('\n')}`
        : ''
      const snippet = section.snippet ? `\n\n${section.snippet}` : ''
      return `${heading}${points}${snippet}`
    })
    .join('\n\n')

  const sourcesMarkdown = sources?.length
    ? `\n\n---\n\n**内容来源**\n${sources.map((source) => `- ${source}`).join('\n')}`
    : ''

  return `# ${title}\n\n${summary}\n\n${sectionsMarkdown}${sourcesMarkdown}`
}

const docs = [
  {
    id: 'start-guide',
    title: '启动与项目结构速览',
    summary:
      '快速掌握本项目的启动方式、开发模式与生产构建流程，并了解核心目录结构与AI助手能力边界。',
    tags: ['入门', '启动', '结构', 'AI助手'],
    sections: [
      {
        title: '快速开始路径',
        points: [
          '开发模式：安装依赖后运行 `npm run dev`，适合学习与调试。',
          '生产构建：运行 `npm run build` 输出 dist，可离线使用。',
          '建议优先验证 Node.js 与 npm 版本，避免构建失败。'
        ]
      },
      {
        title: '项目结构要点',
        points: [
          '核心页面位于 `src/views/`，路由配置在 `src/router/index.js`。',
          'AI助手位于 `src/components/ai/AIAssistant.vue`，使用预设问答渲染 Markdown。',
          '知识库数据集中在 `src/data/` 目录中。'
        ]
      }
    ],
    sources: ['START_GUIDE.md']
  },
  {
    id: 'quick-deploy',
    title: '快速部署流程',
    summary: '聚焦最短路径的构建与部署步骤，适合需要快速上线或离线交付的场景。',
    tags: ['部署', '构建', '离线'],
    sections: [
      {
        title: '构建与分发',
        points: [
          '使用 `npm run build` 生成静态资源，默认输出到 dist。',
          '可直接打开 dist/index.html 进行离线浏览。',
          '如需上线，使用任意静态服务器托管 dist。'
        ]
      },
      {
        title: '常见注意事项',
        points: [
          '构建前确保依赖安装完成。',
          '静态资源路径需要保持默认的 Vite 配置。'
        ]
      }
    ],
    sources: ['QUICK_DEPLOY.md']
  },
  {
    id: 'deployment-guide',
    title: '完整部署与运维指南',
    summary: '提供更完整的部署步骤、环境要求与常见问题排查思路。',
    tags: ['部署', '运维', '排障'],
    sections: [
      {
        title: '部署流程概览',
        points: [
          '准备 Node.js 与依赖环境。',
          '构建静态资源并确认本地访问正常。',
          '部署到静态服务器或本地文件系统。'
        ]
      },
      {
        title: '排错关注点',
        points: [
          '检查构建日志中的依赖缺失或脚本错误。',
          '确保静态服务器正确设置缓存与路由。'
        ]
      }
    ],
    sources: ['DEPLOYMENT_GUIDE.md']
  },
  {
    id: 'project-overview',
    title: 'Aero Hand Open 项目概览',
    summary:
      '介绍项目定位、核心能力与技术领域，帮助快速理解 Aero Hand Open 的整体结构与硬件特性。',
    tags: ['概览', '硬件', '架构'],
    sections: [
      {
        title: '核心特性与技术领域',
        points: [
          '7自由度机械手与肌腱驱动架构，适合灵巧操作研究。',
          '全3D打印结构、轻量化设计、开源硬件与固件。',
          '覆盖嵌入式、ROS2、仿真与强化学习等技术领域。'
        ]
      },
      {
        title: '目录结构摘要',
        points: [
          'firmware/、hardware/、sdk/、ros2/、sim_rl/ 是核心子模块。',
          '硬件资料包括 CAD、PCB 与 BOM，固件目录包含 Arduino sketch。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_OPEN_COMPLETE_GUIDE.md']
  },
  {
    id: 'module-a-protocol',
    title: '模块A：通信协议分析',
    summary:
      '深入解析 16 字节二进制协议、串口通信与协议扩展方法，是理解固件与上位机数据流的基础。',
    tags: ['通信协议', '固件', '串口'],
    sections: [
      {
        title: '协议格式与命令码',
        points: [
          '固定 16 字节帧，包含起始符、设备 ID、长度、命令码与校验。',
          '命令码涵盖归位、位置控制、扭矩控制、状态读取等。'
        ],
        snippet: '```text\n帧长度 = 6 + L\n字段：0xFF 0xFF | ID | LEN | CMD | DATA | CHECKSUM\n```'
      },
      {
        title: '数据编码与校验',
        points: [
          '位置数据使用 12 位分辨率，小端序打包。',
          '校验和为 ID 到数据字段的累加和低 8 位。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/通信协议分析指南.md']
  },
  {
    id: 'module-b-kinematics',
    title: '模块B：运动学控制',
    summary:
      '覆盖肌腱驱动原理、关节空间/驱动空间映射以及正逆运动学计算，是精确控制的核心。',
    tags: ['运动学', '肌腱驱动', '控制'],
    sections: [
      {
        title: '驱动原理与耦合机制',
        points: [
          '肌腱传动放大伺服扭矩，支持多关节耦合。',
          '拇指具有外展与屈伸等特殊耦合结构。'
        ]
      },
      {
        title: '正向与逆向运动学',
        points: [
          '关节角度到驱动位移的映射遵循 Δl = r × Δθ。',
          '实现需考虑运动限制与安全边界。'
        ],
        snippet: '```text\nΔl = r × Δθ\nr = 6.5mm\n```'
      }
    ],
    sources: ['模块B_运动学控制/运动学控制指南.md']
  },
  {
    id: 'module-c-integration',
    title: '模块C：系统集成',
    summary:
      '聚焦硬件-固件接口、固件-SDK通信以及 SDK-ROS2 集成流程，是整机集成的关键。',
    tags: ['系统集成', 'ROS2', '硬件接口'],
    sections: [
      {
        title: '硬件与固件接口',
        points: [
          'PCB 电源设计确保 ESP32 与伺服总线稳定供电。',
          '关键引脚分配与总线拓扑决定通信可靠性。'
        ]
      },
      {
        title: '通信与调试流程',
        points: [
          '固件使用 16 字节协议作为应用层协议栈。',
          '系统级调试需关注通信链路与供电稳定性。'
        ]
      }
    ],
    sources: ['模块C_系统集成/系统集成指南.md']
  },
  {
    id: 'module-d-advanced',
    title: '模块D：高级应用',
    summary:
      '涵盖 MediaPipe 遥操作、MuJoCo 仿真、强化学习训练以及仿真到真实迁移要点。',
    tags: ['仿真', '强化学习', '遥操作'],
    sections: [
      {
        title: 'MediaPipe 遥操作',
        points: [
          '通过摄像头识别手部关键点，计算关节角后驱动机械手。',
          '可使用 ROS2 或 SDK 接口发布控制指令。'
        ]
      },
      {
        title: '仿真与策略训练',
        points: [
          'MuJoCo 作为仿真环境，支持强化学习策略迭代。',
          '仿真到真实迁移需关注动力学参数一致性。'
        ]
      }
    ],
    sources: ['模块D_高级应用/高级应用指南.md']
  },
  {
    id: 'complete-implementation',
    title: '完整实现指南',
    summary: '从硬件、固件到 SDK 与仿真，串联 Aero Hand Open 的完整实现流程。',
    tags: ['实现', '全流程', '硬件'],
    sections: [
      {
        title: '硬件与固件基础',
        points: [
          '机械手为 7 自由度肌腱驱动结构，使用 ESP32-S3 控制。',
          '硬件设计包含 CAD、PCB 与 BOM 列表，便于复现。'
        ]
      },
      {
        title: '软件与仿真',
        points: [
          'Python SDK 提供控制接口，ROS2 用于系统集成。',
          'MuJoCo 与强化学习脚本用于仿真训练。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_COMPLETE_IMPLEMENTATION_GUIDE.md']
  },
  {
    id: 'implementation-summary',
    title: '实现总结',
    summary: '浓缩关键实现点与重要组件，快速对齐项目落地细节。',
    tags: ['总结', '实现'],
    sections: [
      {
        title: '关键模块回顾',
        points: [
          '固件通信协议、Python SDK 以及 ROS2 集成是核心链路。',
          '仿真与强化学习模块用于验证与优化控制策略。'
        ]
      },
      {
        title: '落地建议',
        points: [
          '优先确保硬件装配与通信稳定，再推进高级应用。',
          '迭代调参可提升稳定性与运动精度。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_IMPLEMENTATION_SUMMARY.md']
  },
  {
    id: 'rl-sim2real-technical',
    title: 'RL Sim2Real 技术解析',
    summary: '详细讨论强化学习从仿真到真实的迁移挑战与解决策略。',
    tags: ['Sim2Real', '强化学习', '仿真'],
    sections: [
      {
        title: '迁移挑战',
        points: [
          '动力学建模误差、传感噪声与延迟是主要差异来源。',
          '需要域随机化与鲁棒控制策略降低分布偏移。'
        ]
      },
      {
        title: '工程实践要点',
        points: [
          '逐步增加真实环境复杂度，验证策略稳健性。',
          '校准传感器与执行器参数，缩小仿真差距。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_RL_SIM2REAL_TECHNICAL.md']
  },
  {
    id: 'sim2real-practical',
    title: 'Sim2Real 实用指南',
    summary: '提供仿真到真实迁移的操作流程与关键检查点。',
    tags: ['Sim2Real', '实践'],
    sections: [
      {
        title: '迁移流程',
        points: [
          '建立基准仿真模型，完成策略训练与评估。',
          '在真实环境中逐步放开限制并监测异常。'
        ]
      },
      {
        title: '常见问题',
        points: [
          '动力学参数偏差导致动作过冲或不足。',
          '通信延迟可能引发控制不稳定。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_SIM2REAL_PRACTICAL_GUIDE.md']
  },
  {
    id: 'sim2real-parameters',
    title: 'Sim2Real 参数参考',
    summary: '整理仿真与真实世界的关键参数，便于对齐与调参。',
    tags: ['参数', 'Sim2Real'],
    sections: [
      {
        title: '参数维度',
        points: [
          '摩擦、质量、关节阻尼等动力学参数。',
          '控制频率、通信延迟与噪声模型。'
        ]
      },
      {
        title: '调参建议',
        points: [
          '优先对齐质量与摩擦等静态参数。',
          '再调整控制频率与噪声模型。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_SIM2REAL_PARAMETERS_REFERENCE.md']
  },
  {
    id: 'tech-stack-summary',
    title: '技术栈总结',
    summary: '总结 Aero Hand Open 涉及的硬件、固件、软件与仿真技术栈。',
    tags: ['技术栈', '总结'],
    sections: [
      {
        title: '核心技术',
        points: [
          '硬件：肌腱驱动结构、ESP32-S3 控制板。',
          '软件：Python SDK、ROS2、MuJoCo 仿真。'
        ]
      },
      {
        title: '能力覆盖',
        points: [
          '涵盖从机械设计到强化学习训练的完整链路。',
          '支持科研、教育与产品化探索。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_TECHNICAL_STACK_SUMMARY.md']
  },
  {
    id: 'tech-stack-guide',
    title: '技术栈深度指南',
    summary: '从体系化角度分析 Aero Hand Open 的技术栈与模块关系。',
    tags: ['技术栈', '架构'],
    sections: [
      {
        title: '模块关系',
        points: [
          '固件负责执行底层控制与通信协议。',
          'SDK 与 ROS2 提供上层接口与系统集成能力。'
        ]
      },
      {
        title: '能力地图',
        points: [
          '仿真与强化学习模块提供算法验证平台。',
          'MediaPipe 遥操作展示应用扩展性。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_TECHNICAL_STACK_GUIDE.md']
  },
  {
    id: 'mujoco-rl-guide',
    title: 'MuJoCo 与强化学习指南',
    summary: '介绍 MuJoCo 仿真与强化学习训练的关键流程与模块角色。',
    tags: ['MuJoCo', '强化学习'],
    sections: [
      {
        title: '仿真环境',
        points: [
          'MuJoCo 用于高精度动力学仿真。',
          '支持 MJX 加速与大规模并行训练。'
        ]
      },
      {
        title: '训练流程',
        points: [
          '使用 PPO 等算法优化策略。',
          '训练后通过 Sim2Real 迁移到真实硬件。'
        ]
      }
    ],
    sources: ['模块A_通信协议分析/AERO_HAND_MUJOCO_RL_GUIDE.md']
  }
]

export const docsById = Object.fromEntries(docs.map((doc) => [doc.id, { ...doc, content: buildMarkdown(doc) }]))

export const learningPathDocs = [
  {
    id: 'path1',
    icon: '🎯',
    title: '快速上手路径',
    description: '30-40小时快速掌握基础操作',
    duration: '30-40h',
    level: '初级',
    docId: 'start-guide'
  },
  {
    id: 'path2',
    icon: '📚',
    title: '完整掌握路径',
    description: '50-75小时全面学习技术栈',
    duration: '50-75h',
    level: '中级',
    docId: 'project-overview'
  },
  {
    id: 'path3',
    icon: '🔬',
    title: '研究深入路径',
    description: '80-120小时成为领域专家',
    duration: '80-120h',
    level: '高级',
    docId: 'rl-sim2real-technical'
  }
]

export const scheme1Modules = [
  {
    id: '1',
    number: '01',
    name: '硬件架构与机械设计',
    description: '3D打印结构、ESP32-S3、HLS3606M舵机、PCB设计原理',
    duration: '15-20小时',
    tag: '硬件层',
    tagType: 'danger',
    files: ['hardware/', 'document/'],
    docId: 'project-overview'
  },
  {
    id: '2',
    number: '02',
    name: '固件层 - ESP32控制核心',
    description: 'Arduino框架、串口通信、16字节协议、舵机控制',
    duration: '15-20小时',
    tag: '固件层',
    tagType: 'warning',
    files: ['firmware/main/'],
    docId: 'module-a-protocol'
  },
  {
    id: '3',
    number: '03',
    name: 'SDK层 - Python控制接口',
    description: 'AeroHand类、运动学转换、GUI配置工具',
    duration: '15-20小时',
    tag: 'SDK层',
    tagType: 'success',
    files: ['sdk/src/aero_open_sdk/'],
    docId: 'module-b-kinematics'
  },
  {
    id: '4',
    number: '04',
    name: 'ROS2层 - 机器人系统集成',
    description: 'ROS2架构、话题通信、遥操作节点',
    duration: '15-20小时',
    tag: 'ROS2层',
    tagType: 'primary',
    files: ['ros2/'],
    docId: 'module-c-integration'
  },
  {
    id: '5',
    number: '05',
    name: '仿真层 - MuJoCo与强化学习',
    description: 'MuJoCo物理引擎、MJX、PPO算法训练',
    duration: '20-40小时',
    tag: '仿真层',
    tagType: 'info',
    files: ['sim_rl/'],
    docId: 'mujoco-rl-guide'
  },
  {
    id: '6',
    number: '06',
    name: '完整工作流程与调试指南',
    description: '系统集成、调试技巧、常见问题解决',
    duration: '10-15小时',
    tag: '实践层',
    tagType: 'success',
    files: ['learning/复现指南/'],
    docId: 'deployment-guide'
  }
]

export const scheme2Modules = [
  {
    id: 'ma',
    letter: 'A',
    name: '通信协议分析',
    description: '16字节二进制协议、串口通信、调试技巧',
    duration: '8-12小时',
    prerequisites: '基础编程',
    files: 'firmware/main/, sdk/src/aero_open_sdk/aero_hand.py',
    docId: 'module-a-protocol'
  },
  {
    id: 'mb',
    letter: 'B',
    name: '运动学控制',
    description: '肌腱驱动原理、正向/逆向运动学、运动限制',
    duration: '10-15小时',
    prerequisites: '模块A，基础线性代数',
    files: 'sdk/src/aero_open_sdk/joints_to_actuations.py',
    docId: 'module-b-kinematics'
  },
  {
    id: 'mc',
    letter: 'C',
    name: '系统集成',
    description: '硬件-固件接口、固件-SDK通信、SDK-ROS2集成',
    duration: '12-18小时',
    prerequisites: '模块A和B，基础电子知识',
    files: 'ros2/, 系统配置',
    docId: 'module-c-integration'
  },
  {
    id: 'md',
    letter: 'D',
    name: '高级应用',
    description: 'MediaPipe遥操作、MuJoCo仿真、强化学习',
    duration: '20-30小时',
    prerequisites: '模块A、B、C，Python中级',
    files: 'ROS2遥操作, 仿真环境, 训练脚本',
    docId: 'module-d-advanced'
  }
]

export const completeGuides = [
  {
    id: 'cg1',
    icon: '📖',
    title: '完整实现指南',
    description: '63KB · 从零开始的完整实现文档',
    module: '整体',
    date: '2025-12-29',
    docId: 'complete-implementation'
  },
  {
    id: 'cg2',
    icon: '📊',
    title: '实现总结',
    description: '32KB · 项目实现总结文档',
    module: '整体',
    date: '2025-12-29',
    docId: 'implementation-summary'
  },
  {
    id: 'cg3',
    icon: '🤖',
    title: 'RL Sim2Real技术',
    description: '81KB · 强化学习Sim2Real技术详解',
    module: '仿真',
    date: '2025-12-29',
    docId: 'rl-sim2real-technical'
  },
  {
    id: 'cg4',
    icon: '🔄',
    title: 'Sim2Real实用指南',
    description: '31KB · 仿真到实物转移实战',
    module: '高级',
    date: '2025-12-30',
    docId: 'sim2real-practical'
  },
  {
    id: 'cg5',
    icon: '📊',
    title: 'Sim2Real参数参考',
    description: '29KB · 参数配置详细说明',
    module: '高级',
    date: '2025-12-30',
    docId: 'sim2real-parameters'
  },
  {
    id: 'cg6',
    icon: '📚',
    title: '技术栈总结',
    description: '48KB · 完整技术栈总结',
    module: '整体',
    date: '2025-12-30',
    docId: 'tech-stack-summary'
  }
]

export const technicalTopics = [
  {
    id: 'tt1',
    title: '通信协议深度解析',
    description: '16字节协议的详细分析和实现',
    date: '2025-12-17',
    docId: 'module-a-protocol'
  },
  {
    id: 'tt2',
    title: '肌腱驱动运动学',
    description: '理解肌腱驱动的数学模型',
    date: '2025-12-17',
    docId: 'module-b-kinematics'
  },
  {
    id: 'tt3',
    title: 'ROS2集成架构',
    description: 'ROS2节点设计和通信模式',
    date: '2025-12-17',
    docId: 'module-c-integration'
  },
  {
    id: 'tt4',
    title: '强化学习实战',
    description: 'PPO算法在Aero Hand上的应用',
    date: '2025-12-17',
    docId: 'module-d-advanced'
  }
]

export const moduleDocs = [
  {
    id: 'md1',
    icon: '⚙️',
    name: '固件模块',
    description: 'ESP32固件和协议实现',
    fileCount: '15+',
    coverage: '95%',
    docId: 'module-a-protocol'
  },
  {
    id: 'md2',
    icon: '🐍',
    name: 'SDK模块',
    description: 'Python控制接口',
    fileCount: '20+',
    coverage: '90%',
    docId: 'module-b-kinematics'
  },
  {
    id: 'md3',
    icon: '🤖',
    name: 'ROS2模块',
    description: '机器人操作系统集成',
    fileCount: '10+',
    coverage: '85%',
    docId: 'module-c-integration'
  },
  {
    id: 'md4',
    icon: '🔧',
    name: '硬件模块',
    description: '3D设计和PCB',
    fileCount: '30+',
    coverage: '80%',
    docId: 'project-overview'
  },
  {
    id: 'md5',
    icon: '🎮',
    name: '仿真模块',
    description: 'MuJoCo和MJX',
    fileCount: '40+',
    coverage: '75%',
    docId: 'mujoco-rl-guide'
  },
  {
    id: 'md6',
    icon: '📚',
    name: '文档模块',
    description: '舵机库和工具',
    fileCount: '10+',
    coverage: '100%',
    docId: 'start-guide'
  }
]
