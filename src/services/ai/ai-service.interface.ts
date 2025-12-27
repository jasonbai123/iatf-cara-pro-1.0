/**
 * AI服务统一接口
 * 所有AI供应商都需要实现这个接口
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  model?: string;
}

export interface AIProviderInfo {
  name: string;
  displayName: string;
  description: string;
  baseUrl?: string;
  requiresApiKey: boolean;
  defaultModel?: string;
  availableModels: string[];
}

export interface IAIService {
  /**
   * 生成文本补全
   * @param messages 消息数组
   * @param options 可选参数
   * @returns 生成的文本内容
   */
  generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<string>;

  /**
   * 验证API密钥是否有效
   * @param apiKey API密钥
   * @returns 是否有效
   */
  validateApiKey(apiKey: string): Promise<boolean>;

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[];

  /**
   * 获取供应商信息
   */
  getProviderInfo(): AIProviderInfo;

  /**
   * 设置API密钥
   */
  setApiKey(apiKey: string): void;

  /**
   * 获取当前API密钥（如果已设置）
   */
  getApiKey(): string | null;
}

export type AIProviderType =
  | 'claude'
  | 'deepseek'
  | 'gemini'
  | 'glm'
  | 'volcengine'
  | 'siliconflow';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  model?: string;
  enabled: boolean;
}
