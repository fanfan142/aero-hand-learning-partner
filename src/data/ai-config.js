/**
 * AI助手配置 - OpenAI兼容API
 */

export const aiConfig = {
  // OpenAI兼容API配置
  providers: {
    openai: {
      name: 'OpenAI API',
      description: 'OpenAI官方API',
      requiresApiKey: true,
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo']
    },
    deepseek: {
      name: 'DeepSeek（深度求索）',
      description: '国产AI，性价比高',
      requiresApiKey: true,
      baseUrl: 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-coder']
    },
    moonshot: {
      name: 'Moonshot（月之暗面）',
      description: 'Kimi背后的AI',
      requiresApiKey: true,
      baseUrl: 'https://api.moonshot.cn/v1',
      models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
    },
    baichuan: {
      name: 'Baichuan（百川）',
      description: '百川智能API',
      requiresApiKey: true,
      baseUrl: 'https://api.baichuan-ai.com/v1',
      models: ['Baichuan4']
    },
    custom: {
      name: '自定义API',
      description: '任何OpenAI兼容的API服务',
      requiresApiKey: true,
      baseUrl: '',
      models: [],
      customUrl: true
    }
  },

  // 默认模型配置
  defaultModels: {
    'https://api.openai.com/v1': 'gpt-4o-mini',
    'https://api.deepseek.com/v1': 'deepseek-chat',
    'https://api.moonshot.cn/v1': 'moonshot-v1-8k',
    'https://api.baichuan-ai.com/v1': 'Baichuan4'
  }
}

// 构建系统提示词（包含学习进度和页面上下文）
export function buildSystemPrompt(context) {
  const { progress, currentPage, currentStage } = context || {}

  return `你是一个专业的Aero Hand学习助手，帮助用户理解和复现Aero Hand Open项目。

## 项目背景
Aero Hand Open 是一个开源的肌腱驱动灵巧机械手项目，包含：
- 硬件：3D打印件、HLS3606M舵机、ESP32-S3、肌腱系统
- 固件：Arduino框架，串口通信协议
- SDK：Python控制接口，GUI工具
- 仿真：MuJoCo物理仿真，MJX加速
- RL：PPO强化学习算法
- Sim2Real：从仿真到实物的转移

## 你的角色
1. 回答关于Aero Hand的技术问题
2. 解释代码和配置
3. 提供操作指导
4. 帮助排查问题
5. 提供代码示例

## 回答风格
- 专业但不晦涩
- 详细但简洁
- 提供具体示例
- 解释原理和原因
- 用中文回答

## 特殊指令
- 如果用户询问代码，提供可运行的完整示例
- 如果用户遇到问题，提供排查步骤
- 如果不确定，坦诚说明并提供查找方向
- 优先使用项目中的实际代码作为示例

${
  progress !== undefined
    ? `
## 用户学习进度
用户当前已完成 ${progress}% 的学习内容。
${
  currentStage
    ? `当前正在学习：${currentStage}`
    : '请根据用户的学习进度调整回答的深度和详细程度。'
}
`
    : ''
}

${
  currentPage
    ? `
## 当前页面
用户当前在：${currentPage}
请结合用户当前浏览的页面内容来回答问题。
`
    : ''
}
`
}

// OpenAI兼容API调用函数
export async function callOpenAICompatibleAPI(config, question, systemPrompt) {
  const { apiKey, baseUrl, model } = config

  if (!apiKey) {
    throw new Error('请先配置API密钥')
  }

  if (!baseUrl) {
    throw new Error('请先配置API地址')
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
