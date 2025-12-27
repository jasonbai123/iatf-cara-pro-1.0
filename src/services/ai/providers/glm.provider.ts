/**
 * GLM (智谱 AI) Provider
 * 支持 GLM-4.7 等模型
 */

import type {
  IAIService,
  AIProviderInfo,
  AIMessage,
  AICompletionOptions
} from '../ai-service.interface';
import { logger } from '../../../shared/utils/logger';

const GLM_API_BASE = 'https://open.bigmodel.cn/api/paas/v4';

export class GLMProvider implements IAIService {
  private apiKey: string | null = null;
  private client: any = null;

  private readonly AVAILABLE_MODELS = [
    'glm-4-flash',
    'glm-4-plus',
    'glm-4-0520',
    'glm-4-air',
    'glm-4-long',
    'glm-3-turbo'
  ];

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // GLM API Key 格式: id.secret
      if (!apiKey || !apiKey.includes('.')) {
        return false;
      }

      const response = await fetch(`${GLM_API_BASE}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('GLM API Key validation failed:', error);
      return false;
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    // 智谱 AI 使用 JWT 格式的 API Key
    this.client = {
      apiKey: apiKey,
      baseURL: GLM_API_BASE
    };
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  getAvailableModels(): string[] {
    return [...this.AVAILABLE_MODELS];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: 'glm',
      displayName: '智谱 GLM',
      description: '智谱 AI 提供的大语言模型，支持 GLM-4.7 等先进模型，具有强大的中文理解和生成能力。',
      baseUrl: 'https://open.bigmodel.cn/',
      requiresApiKey: true,
      defaultModel: 'glm-4-flash',
      availableModels: this.AVAILABLE_MODELS
    };
  }

  async generateCompletion(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GLM API Key 未配置');
    }

    const {
      model = 'glm-4-flash',
      temperature = 0.7,
      maxTokens = 4096,
      topP = 0.9
    } = options;

    try {
      // 转换消息格式为 GLM API 格式
      const glmMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${GLM_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: glmMessages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GLM API 错误: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // 返回生成的文本
      return data.choices?.[0]?.message?.content || 'GLM 生成失败，请重试。';

    } catch (error) {
      logger.error('GLM API 调用失败:', error);
      throw error;
    }
  }
}
