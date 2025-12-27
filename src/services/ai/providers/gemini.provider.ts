import { GoogleGenAI } from '@google/genai';
import type {
  IAIService,
  AIMessage,
  AICompletionOptions,
  AIProviderInfo
} from '../ai-service.interface';
import { logger } from '../../../shared/utils/logger';

/**
 * Google Gemini AI服务实现
 */
export class GeminiProvider implements IAIService {
  private client: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    // 初始化时不设置API密钥
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({ apiKey });
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API密钥未设置');
    }

    try {
      // 提取系统指令和用户消息
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => m.content)
        .join('\n');

      const response = await this.client.models.generateContent({
        model: options?.model || 'gemini-2.0-flash-exp',
        contents: userMessages,
        config: {
          systemInstruction: systemMessage?.content || '',
          temperature: options?.temperature || 0.3,
        },
      });

      return response.text || '';
    } catch (error) {
      logger.error('Gemini API Error:', error);
      throw new Error(`Gemini API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new GoogleGenAI({ apiKey });
      await testClient.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: 'Hi'
      });
      return true;
    } catch (error) {
      logger.error('Gemini API Key Validation Error:', error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: 'gemini',
      displayName: 'Google Gemini',
      description: 'Google Gemini AI - 多模态AI助手',
      requiresApiKey: true,
      defaultModel: 'gemini-2.0-flash-exp',
      availableModels: this.getAvailableModels()
    };
  }
}
