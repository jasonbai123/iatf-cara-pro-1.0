import OpenAI from 'openai';
import type {
  IAIService,
  AIMessage,
  AICompletionOptions,
  AIProviderInfo
} from '../ai-service.interface';
import { logger } from '../../../shared/utils/logger';

/**
 * DeepSeek AI服务实现
 * DeepSeek API兼容OpenAI格式
 */
export class DeepSeekProvider implements IAIService {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    // 初始化时不设置API密钥
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
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
      throw new Error('DeepSeek API密钥未设置');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'deepseek-chat',
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
      logger.error('DeepSeek API Error:', error);
      throw new Error(`DeepSeek API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com',
        dangerouslyAllowBrowser: true
      });

      await testClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      });

      return true;
    } catch (error) {
      logger.error('DeepSeek API Key Validation Error:', error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'deepseek-chat',
      'deepseek-coder'
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: 'deepseek',
      displayName: 'DeepSeek',
      description: 'DeepSeek AI - 专注于代码和逻辑推理',
      requiresApiKey: true,
      defaultModel: 'deepseek-chat',
      availableModels: this.getAvailableModels()
    };
  }
}
