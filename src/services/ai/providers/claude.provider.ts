import Anthropic from '@anthropic-ai/sdk';
import type {
  IAIService,
  AIMessage,
  AICompletionOptions,
  AIProviderInfo
} from '../ai-service.interface';
import { logger } from '../../../shared/utils/logger';

/**
 * Claude中国版 AI服务实现
 */
export class ClaudeProvider implements IAIService {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;

  constructor() {
    // 初始化时不设置API密钥，等待用户配置
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new Anthropic({
      apiKey,
      baseURL: 'https://api.anthropic.com', // 或中国版API地址
      dangerouslyAllowBrowser: true // 仅用于演示，生产环境应使用代理
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
      throw new Error('Claude API密钥未设置');
    }

    try {
      // 转换消息格式
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.3,
        system: systemMessage?.content || '',
        messages: userMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
      });

      // 提取文本内容
      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => (block.type === 'text' ? block.text : ''))
        .join('\n');

      return textContent;
    } catch (error) {
      logger.error('Claude API Error:', error);
      throw new Error(`Claude API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true
      });

      await testClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      });

      return true;
    } catch (error) {
      logger.error('Claude API Key Validation Error:', error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: 'claude',
      displayName: 'Claude',
      description: 'Anthropic Claude AI - 强大的语言理解和生成能力',
      requiresApiKey: true,
      defaultModel: 'claude-3-5-sonnet-20241022',
      availableModels: this.getAvailableModels()
    };
  }
}
