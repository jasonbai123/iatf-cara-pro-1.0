import type {
  IAIService,
  AIMessage,
  AICompletionOptions,
  AIProviderInfo
} from '../ai-service.interface';
import { logger } from '../../../shared/utils/logger';

/**
 * 火山引擎 AI服务实现
 */
export class VolcEngineProvider implements IAIService {
  private apiKey: string | null = null;
  private accessKey: string | null = null;

  constructor() {
    // 初始化时不设置API密钥
  }

  setApiKey(apiKey: string): void {
    // 火山引擎需要 AccessKey 和 SecretKey
    // 这里简化处理，假设apiKey格式为 "accessKey:secretKey"
    const parts = apiKey.split(':');
    if (parts.length === 2) {
      this.accessKey = parts[0];
      this.apiKey = parts[1];
    } else {
      this.apiKey = apiKey;
    }
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('火山引擎 API密钥未设置');
    }

    try {
      // 注意：这里需要实现火山引擎的签名算法
      // 由于火山引擎API比较复杂，这里提供基本框架
      const endpoint = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: options?.model || 'ep-20241205142832-qm8hl', // 示例端点ID
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          temperature: options?.temperature || 0.3,
          max_tokens: options?.maxTokens || 4096
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('VolcEngine API Error:', error);
      throw new Error(`火山引擎 API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // 发送测试请求
      await this.generateCompletion([
        { role: 'user', content: 'Hi' }
      ], { maxTokens: 10 });
      return true;
    } catch (error) {
      logger.error('VolcEngine API Key Validation Error:', error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    // 火山引擎使用端点ID，这里提供示例
    return [
      'ep-20241205142832-qm8hl', // 示例端点ID
      'doubao-pro-32k', // 豆包模型
      'doubao-pro-128k'
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: 'volcengine',
      displayName: '火山引擎',
      description: '火山引擎 AI - 字节跳动旗下AI服务',
      requiresApiKey: true,
      defaultModel: 'doubao-pro-32k',
      availableModels: this.getAvailableModels()
    };
  }
}
