/**
 * Aero Hand Open 项目结构详细说明
 * 包含所有GitHub开源文件的作用和功能
 */

export const projectStructure = {
  name: 'Aero Hand Open',
  description: '开源肌腱驱动灵巧机械手项目',
  repository: 'https://github.com/tether-ia/aero-hand-open',

  // 根目录文件
  rootFiles: [
    {
      name: 'README.md',
      type: 'documentation',
      description: '项目主要说明文档，介绍项目概述、特性、快速开始方法',
      importance: 'high',
      link: 'https://github.com/tether-ia/aero-hand-open/blob/main/README.md'
    },
    {
      name: 'LICENSE.md',
      type: 'legal',
      description: '开源许可证文件，规定软件使用许可（Apache-2.0）和设计文件许可（CC BY-NC-SA 4.0）',
      importance: 'medium'
    },
    {
      name: 'CONTRIBUTING.md',
      type: 'documentation',
      description: '贡献指南，说明如何参与项目开发、提交PR的规范',
      importance: 'medium'
    },
    {
      name: 'CLAUDE.md',
      type: 'documentation',
      description: 'AI上下文文档，为AI助手提供项目架构、模块结构、编码规范等信息',
      importance: 'high'
    },
    {
      name: '.gitignore',
      type: 'config',
      description: 'Git忽略文件配置，指定不需要版本控制的文件和目录',
      importance: 'low'
    },
    {
      name: '.gitmodules',
      type: 'config',
      description: 'Git子模块配置，定义依赖的子仓库（如mujoco_playground）',
      importance: 'medium'
    }
  ],

  // 一级目录结构
  directories: [
    {
      name: 'firmware',
      icon: '🔧',
      description: 'ESP32-S3微控制器固件，使用Arduino框架开发',
      importance: 'critical',
      language: 'C++',
      subdirectories: [
        {
          name: 'main/',
          description: '固件主程序目录',
          files: [
            {
              name: 'firmware_v0.1.0.ino',
              type: 'executable',
              description: 'Arduino主程序入口，包含setup()和loop()函数',
              importance: 'critical',
              actions: ['编译', '上传到ESP32-S3'],
              dependencies: ['ESP32-S3开发板', 'Arduino IDE或PlatformIO']
            },
            {
              name: 'Homing.cpp',
              type: 'source',
              description: '归位程序实现，控制机械手自动归位到初始位置',
              importance: 'high',
              actions: ['被主程序调用']
            },
            {
              name: 'Homing.h',
              type: 'header',
              description: '归位程序头文件，声明归位相关函数和变量',
              importance: 'high',
              actions: ['被Homing.cpp和主程序包含']
            },
            {
              name: 'HandConfig.h',
              type: 'config',
              description: '机械手配置文件，定义舵机ID、引脚映射、运动参数',
              importance: 'critical',
              actions: ['需要根据实际硬件修改'],
              notes: '配置错误会导致舵机无法正常工作'
            },
            {
              name: 'aero_hand_serial.cpp',
              type: 'source',
              description: '串口通信协议实现，处理与上位机的数据交换',
              importance: 'high',
              actions: ['实现命令解析', '返回传感器数据']
            },
            {
              name: 'aero_hand_serial.h',
              type: 'header',
              description: '串口通信协议头文件，定义消息格式和命令码',
              importance: 'high',
              actions: ['定义16字节固定长度帧格式']
            }
          ]
        },
        {
          name: 'bin/',
          description: '编译后的固件二进制文件',
          files: [
            {
              name: 'firmware_v0.1.0_lefthand.bin',
              type: 'binary',
              description: '左手版本固件二进制文件，可直接烧录',
              importance: 'medium',
              actions: ['使用ESPTool烧录']
            },
            {
              name: 'firmware_v0.1.0_righthand.bin',
              type: 'binary',
              description: '右手版本固件二进制文件，可直接烧录',
              importance: 'medium',
              actions: ['使用ESPTool烧录']
            }
          ]
        },
        {
          name: 'assets/',
          description: '固件相关资源文件（文档图片等）',
          importance: 'low'
        }
      ],
      gettingStarted: [
        '1. 安装Arduino IDE或PlatformIO',
        '2. 安装ESP32-S3开发板支持',
        '3. 打开firmware_v0.1.0.ino',
        '4. 修改HandConfig.h配置舵机ID',
        '5. 连接ESP32-S3到电脑',
        '6. 编译并上传固件'
      ]
    },

    {
      name: 'sdk',
      icon: '🐍',
      description: 'Python SDK（软件开发工具包），提供控制机械手的高级接口',
      importance: 'critical',
      language: 'Python',
      subdirectories: [
        {
          name: 'src/aero_open_sdk/',
          description: 'SDK核心代码',
          files: [
            {
              name: '__init__.py',
              type: 'source',
              description: '包初始化文件，导出主要类和函数',
              importance: 'medium',
              actions: ['定义包版本', '导出AeroHand类']
            },
            {
              name: 'aero_hand.py',
              type: 'executable',
              description: '核心AeroHand类，实现串口通信、舵机控制、状态读取',
              importance: 'critical',
              actions: ['实例化控制对象', '发送运动命令', '读取传感器数据'],
              usageExample: 'hand = AeroHand(port="COM3"); hand.move_to([0, 0, 0, 0, 0])'
            },
            {
              name: 'gui.py',
              type: 'executable',
              description: '图形用户界面程序，提供可视化控制面板',
              importance: 'high',
              actions: ['运行GUI程序', '实时控制机械手'],
              dependencies: ['tkinter', 'numpy', 'matplotlib'],
              usageExample: 'python -m aero_open_sdk.gui'
            },
            {
              name: 'gui_chinese.py',
              type: 'executable',
              description: '中文版图形用户界面',
              importance: 'high',
              actions: ['运行中文GUI'],
              usageExample: 'python -m aero_open_sdk.gui_chinese'
            }
          ]
        },
        {
          name: 'examples/',
          description: '示例代码，演示SDK的各种用法',
          files: [
            {
              name: 'run_sequence.py',
              type: 'executable',
              description: '运行预设动作序列的示例',
              importance: 'high',
              actions: ['执行演示动作'],
              usageExample: 'python examples/run_sequence.py'
            },
            {
              name: 'test_servos.py',
              type: 'executable',
              description: '测试各个舵机的示例程序',
              importance: 'high',
              actions: ['逐个测试舵机'],
              notes: '用于硬件调试'
            },
            {
              name: 'teleoperation.py',
              type: 'executable',
              description: '遥操作示例，使用外部设备控制机械手',
              importance: 'medium',
              actions: ['连接遥操作设备', '实时控制']
            }
          ]
        },
        {
          name: 'tests/',
          description: '单元测试和集成测试',
          importance: 'medium'
        },
        {
          name: 'pyproject.toml',
          type: 'config',
          description: 'Python项目配置文件，定义依赖、版本、构建配置',
          importance: 'high',
          actions: ['pip安装时读取']
        },
        {
          name: 'setup.py',
          type: 'executable',
          description: '包安装脚本，支持pip install安装',
          importance: 'high',
          actions: ['pip install -e .']
        },
        {
          name: 'README.md',
          type: 'documentation',
          description: 'SDK使用文档',
          importance: 'high'
        }
      ],
      gettingStarted: [
        '1. 创建Python虚拟环境：python -m venv venv',
        '2. 激活虚拟环境：venv\\Scripts\\activate（Windows）',
        '3. 安装SDK：pip install -e sdk/',
        '4. 运行示例：python examples/run_sequence.py',
        '5. 启动GUI：python -m aero_open_sdk.gui'
      ]
    },

    {
      name: 'ros2',
      icon: '🤖',
      description: 'ROS2（Robot Operating System 2）集成包',
      importance: 'high',
      language: 'C++, Python',
      notes: '作为Git子模块存在，需要单独初始化',
      subdirectories: [
        {
          name: 'aero_hand_ros2/',
          description: 'ROS2功能包主目录',
          files: [
            {
              name: 'package.xml',
              type: 'config',
              description: 'ROS2包配置文件，定义依赖关系',
              importance: 'high'
            },
            {
              name: 'CMakeLists.txt',
              type: 'config',
              description: 'CMake构建配置',
              importance: 'medium'
            }
          ]
        },
        {
          name: 'src/',
          description: 'ROS2节点源代码',
          files: [
            {
              name: 'teleop_node.py',
              type: 'executable',
              description: '遥操作节点，订阅话题并控制机械手',
              importance: 'high',
              actions: ['ros2 run aero_hand_ros2 teleop_node']
            },
            {
              name: 'state_publisher.py',
              type: 'executable',
              description: '状态发布节点，发布机械手状态到话题',
              importance: 'medium',
              actions: ['ros2 run aero_hand_ros2 state_publisher']
            }
          ]
        }
      ],
      gettingStarted: [
        '1. 初始化子模块：git submodule update --init --recursive',
        '2. 安装ROS2 Humble',
        '3. source ROS2环境：source /opt/ros/humble/setup.bash',
        '4. 编译包：colcon build --packages-select aero_hand_ros2',
        '5. source工作空间：source install/setup.bash',
        '6. 运行节点：ros2 run aero_hand_ros2 teleop_node'
      ]
    },

    {
      name: 'hardware',
      icon: '📐',
      description: '硬件设计文件，包含CAD模型、PCB设计、装配文档',
      importance: 'critical',
      language: 'CAD, KiCad',
      notes: '作为Git子模块存在',
      subdirectories: [
        {
          name: 'CAD/',
          description: 'CAD设计文件',
          files: [
            {
              name: 'One_Click_Print_R.3mf',
              type: 'cad',
              description: '3D打印文件，包含所有可打印零件',
              importance: 'critical',
              actions: ['导入3D打印机切片软件', '打印所有零件']
            }
          ]
        },
        {
          name: 'PCB/',
          description: 'PCB电路板设计',
          files: [
            {
              name: '*.kicad_pcb',
              type: 'cad',
              description: 'KiCad PCB设计文件',
              importance: 'high',
              actions: ['使用KiCad打开', '制造PCB或自行焊接']
            },
            {
              name: '*.sch',
              type: 'cad',
              description: '电路原理图',
              importance: 'high',
              actions: ['使用KiCad查看']
            }
          ]
        },
        {
          name: 'BOM.xlsx',
          type: 'document',
          description: '物料清单（Bill of Materials），列出所有电子元件',
          importance: 'critical',
          actions: ['采购元件前查看']
        },
        {
          name: 'assembly_guide.md',
          type: 'documentation',
          description: '装配指南，说明如何组装机械手',
          importance: 'critical',
          actions: ['组装前仔细阅读']
        }
      ],
      gettingStarted: [
        '1. 查看BOM.xlsx采购所有元件',
        '2. 打印CAD/目录下的所有3D零件',
        '3. 制造或购买PCB',
        '4. 按照assembly_guide.md组装',
        '5. 焊接电子元件到PCB',
        '6. 连接所有线缆'
      ]
    },

    {
      name: 'sim_rl',
      icon: '💻',
      description: '仿真和强化学习环境，基于MuJoCo物理引擎',
      importance: 'critical',
      language: 'Python, JAX',
      notes: '最新下载的子模块，包含MJX加速',
      subdirectories: [
        {
          name: 'simulation/',
          description: 'MuJoCo仿真环境',
          files: [
            {
              name: 'assets/',
              type: 'directory',
              description: '仿真模型文件（XML格式）',
              importance: 'critical',
              actions: ['MuJoCo加载'],
              subfiles: [
                {
                  name: 'aero_hand.xml',
                  type: 'config',
                  description: 'Aero Hand MuJoCo模型定义',
                  importance: 'critical',
                  actions: ['定义机械手物理属性', '定义关节和肌腱']
                },
                {
                  name: 'scene_*.xml',
                  type: 'config',
                  description: '各种场景配置（抓取、旋转等）',
                  importance: 'high'
                }
              ]
            },
            {
              name: '*.xml',
              type: 'config',
              description: 'MuJoCo场景和模型配置文件',
              importance: 'critical'
            }
          ]
        },
        {
          name: 'mujoco_playground/',
          description: 'MuJoCo Playground框架（子模块）',
          importance: 'high',
          notes: 'Google DeepMind的MuJoCo学习框架',
          subdirectories: [
            {
              name: '_src/manipulation/aero_hand/',
              description: 'Aero Hand专用任务定义',
              files: [
                {
                  name: 'tasks.py',
                  type: 'source',
                  description: 'RL任务定义（抓取、操作等）',
                  importance: 'critical',
                  actions: ['定义奖励函数', '定义观察空间', '定义动作空间']
                },
                {
                  name: 'networks.py',
                  type: 'source',
                  description: '神经网络架构定义',
                  importance: 'high',
                  actions: ['定义策略网络', '定义值网络']
                },
                {
                  name: 'train.py',
                  type: 'executable',
                  description: '训练脚本，运行PPO强化学习',
                  importance: 'critical',
                  actions: ['启动训练', '保存检查点'],
                  usageExample: 'python -m manipulation.aero_hand.train'
                }
              ]
            },
            {
              name: 'learning/',
              description: '学习算法实现',
              files: [
                {
                  name: 'ppo.py',
                  type: 'source',
                  description: 'PPO（Proximal Policy Optimization）算法实现',
                  importance: 'high',
                  actions: ['被train.py调用']
                }
              ]
            }
          ]
        }
      ],
      gettingStarted: [
        '1. 安装MuJoCo和MJX：pip install mujoco mujoco mjx',
        '2. 安装JAX：pip install "jax[cuda12]"',
        '3. 测试仿真：python -c "import mujoco; mujoco.MjSpec.from_xml_path(\'simulation/assets/aero_hand.xml\').to_mjmodel().compile()"',
        '4. 运行训练：python -m manipulation.aero_hand.train',
        '5. 监控训练：使用TensorBoard查看奖励曲线'
      ]
    },

    {
      name: 'document',
      icon: '📚',
      description: '项目文档和参考资料',
      importance: 'medium',
      language: 'Markdown',
      subdirectories: [
        {
          name: 'servo_library/',
          description: '舵机库文档',
          files: [
            {
              name: 'HLS3606M_datasheet.md',
              type: 'documentation',
              description: 'HLS3606M舵机数据手册解读',
              importance: 'high',
              actions: ['了解舵机规格', '配置通信参数']
            },
            {
              name: 'communication_protocol.md',
              type: 'documentation',
              description: '舵机串口通信协议说明',
              importance: 'high',
              actions: ['理解命令格式', '实现通信']
            }
          ]
        },
        {
          name: 'assembly_guides/',
          description: '装配指南',
          files: [
            {
              name: 'hand_assembly.md',
              type: 'documentation',
              description: '机械手装配详细步骤',
              importance: 'critical',
              actions: ['按步骤组装']
            },
            {
              name: 'electronics_assembly.md',
              type: 'documentation',
              description: '电子部分装配指南',
              importance: 'high',
              actions: ['焊接和连接']
            }
          ]
        },
        {
          name: 'tutorials/',
          description: '教程文档',
          files: [
            {
              name: 'sim2real_teleoperation.md',
              type: 'tutorial',
              description: '遥操作Sim2Real教程',
              importance: 'high',
              actions: ['学习遥操作', '迁移策略到实物']
            },
            {
              name: 'sim2real_cube_rotate.md',
              type: 'tutorial',
              description: '方块旋转Sim2Real教程',
              importance: 'high',
              actions: ['学习完整训练流程', '部署到实物']
            }
          ]
        }
      ]
    },

    {
      name: 'aero-hand-learning-partner',
      icon: '🎓',
      description: '本项目：Aero Hand智能学习伙伴Web应用',
      importance: 'medium',
      language: 'Vue.js, JavaScript',
      subdirectories: [
        {
          name: 'src/',
          description: '源代码目录',
          files: [
            {
              name: 'App.vue',
              type: 'source',
              description: '根组件，定义应用布局和导航',
              importance: 'high'
            },
            {
              name: 'main.js',
              type: 'source',
              description: '应用入口文件',
              importance: 'high'
            },
            {
              name: 'router/',
              type: 'directory',
              description: '路由配置',
              importance: 'medium'
            },
            {
              name: 'stores/',
              type: 'directory',
              description: '状态管理（Pinia）',
              importance: 'medium'
            },
            {
              name: 'views/',
              type: 'directory',
              description: '页面组件',
              importance: 'high'
            },
            {
              name: 'components/',
              type: 'directory',
              description: '可复用组件',
              importance: 'medium'
            },
            {
              name: 'data/',
              type: 'directory',
              description: '数据文件（知识库、配置等）',
              importance: 'high'
            }
          ]
        },
        {
          name: 'package.json',
          type: 'config',
          description: 'NPM项目配置，定义依赖和脚本',
          importance: 'high',
          actions: ['npm install读取']
        },
        {
          name: 'vite.config.js',
          type: 'config',
          description: 'Vite构建工具配置',
          importance: 'medium'
        },
        {
          name: 'index.html',
          type: 'html',
          description: 'HTML入口文件',
          importance: 'medium'
        }
      ],
      gettingStarted: [
        '1. 安装依赖：npm install',
        '2. 开发模式：npm run dev',
        '3. 构建生产版本：npm run build',
        '4. 预览构建：npm run preview'
      ]
    }
  ],

  // 开发工作流
  workflows: [
    {
      name: '硬件开发流程',
      steps: [
        '修改CAD设计 → hardware/CAD/',
        '更新BOM → hardware/BOM.xlsx',
        '3D打印新零件',
        '组装并测试'
      ]
    },
    {
      name: '固件开发流程',
      steps: [
        '修改代码 → firmware/main/',
        '更新配置 → firmware/main/HandConfig.h',
        '编译验证',
        '上传到ESP32-S3',
        '串口调试'
      ]
    },
    {
      name: 'SDK开发流程',
      steps: [
        '修改SDK代码 → sdk/src/aero_open_sdk/',
        '更新示例 → sdk/examples/',
        '本地测试：python examples/test.py',
        '更新文档 → sdk/README.md',
        '发布新版本'
      ]
    },
    {
      name: '仿真训练流程',
      steps: [
        '定义/修改任务 → sim_rl/mujoco_playground/_src/manipulation/aero_hand/tasks.py',
        '配置训练参数',
        '运行训练：python -m manipulation.aero_hand.train',
        '监控训练：tensorboard --logdir logs/',
        '评估策略',
        'Sim2Real部署'
      ]
    }
  ],

  // 重要配置文件
  criticalConfigs: [
    {
      file: 'firmware/main/HandConfig.h',
      description: '机械手硬件配置，必须与实际硬件一致',
      impact: '配置错误会导致舵机无法工作'
    },
    {
      file: 'sim_rl/simulation/assets/aero_hand.xml',
      description: '仿真模型定义，影响物理仿真准确性',
      impact: '参数错误会导致仿真与实物不一致'
    },
    {
      file: 'sdk/pyproject.toml',
      description: 'Python依赖管理',
      impact: '影响SDK安装和使用'
    }
  ],

  // 常见问题排查
  troubleshooting: [
    {
      issue: '固件上传失败',
      solutions: [
        '检查USB驱动（CH340）',
        '确认ESP32-S3进入下载模式',
        '检查串口号',
        '按住BOOT按钮后重试'
      ],
      relatedFiles: ['firmware/main/*.ino', 'firmware/bin/*.bin']
    },
    {
      issue: '舵机不响应',
      solutions: [
        '检查HandConfig.h中的舵机ID',
        '确认电源供应充足（5V 2A以上）',
        '检查串口线连接',
        '使用test_servos.py测试单个舵机'
      ],
      relatedFiles: ['firmware/main/HandConfig.h', 'sdk/examples/test_servos.py']
    },
    {
      issue: '仿真训练不收敛',
      solutions: [
        '检查奖励函数设计',
        '调整学习率',
        '增加域随机化',
        '检查模型参数是否正确'
      ],
      relatedFiles: ['sim_rl/mujoco_playground/_src/manipulation/aero_hand/tasks.py']
    },
    {
      issue: 'Sim2Real性能差',
      solutions: [
        '增加域随机化范围',
        '校准仿真模型参数',
        '检查实物装配质量',
        '调整PID参数'
      ],
      relatedFiles: ['sim_rl/simulation/assets/*.xml', 'firmware/main/HandConfig.h']
    }
  ]
}
