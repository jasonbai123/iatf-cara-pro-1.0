import OpenAI from 'openai';
import type {
  IAIService,
  AIMessage,
  AICompletionOptions,
  AIProviderInfo
} from '../ai-service.interface';
import { logger } from '../../../shared/utils/logger';

/**
 * 硅基流动 AI服务实现
 * 兼容OpenAI API格式
 */
export class SiliconFlowProvider implements IAIService {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    // 初始化时不设置API密钥
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.siliconflow.cn/v1',
      dangerouslyAllowBrowser: true
    });
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<string> {
    if (!this.client) {
      throw new Error('硅基流动 API密钥未设置');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'Qwen/Qwen2.5-72B-Instruct',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature || 0.3,
        max_tokens: options?.maxTokens || 4096,
        top_p: options?.topP
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('SiliconFlow API Error:', error);
      throw new Error(`硅基流动 API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new OpenAI({
        apiKey,
        baseURL: 'https://api.siliconflow.cn/v1',
        dangerouslyAllowBrowser: true
      });

      await testClient.chat.completions.create({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      });

      return true;
    } catch (error) {
      logger.error('SiliconFlow API Key Validation Error:', error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'Qwen/Qwen2.5-72B-Instruct',
      'deepseek-ai/DeepSeek-V2.5',
      'meta-llama/Llama-3.1-70B-Instruct',
      '01-ai/Yi-1.5-34B-Chat'
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: 'siliconflow',
      displayName: '硅基流动',
      description: '硅基流动 AI - 提供多种开源模型API服务',
      requiresApiKey: true,
      defaultModel: 'Qwen/Qwen2.5-72B-Instruct',
      availableModels: this.getAvailableModels()
    };
  }
}
