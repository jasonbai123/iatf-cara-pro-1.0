/**
 * AI服务管理器
 * 统一管理所有AI供应商
 */

import type {
  IAIService,
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AICompletionOptions
} from './ai-service.interface';
import { ClaudeProvider } from './providers/claude.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { GLMProvider } from './providers/glm.provider';
import { VolcEngineProvider } from './providers/volcengine.provider';
import { SiliconFlowProvider } from './providers/siliconflow.provider';

export class AIManager {
  private providers: Map<AIProviderType, IAIService>;
  private currentProvider: AIProviderType;
  private providerConfigs: Map<AIProviderType, AIProviderConfig>;

  constructor() {
    // 初始化所有供应商
    this.providers = new Map<AIProviderType, IAIService>([
      ['claude', new ClaudeProvider()],
      ['deepseek', new DeepSeekProvider()],
      ['gemini', new GeminiProvider()],
      ['glm', new GLMProvider()],
      ['volcengine', new VolcEngineProvider()],
      ['siliconflow', new SiliconFlowProvider()]
    ]);

    // 默认使用Gemini
    this.currentProvider = 'gemini';

    // 初始化配置
    this.providerConfigs = new Map();
    this.providers.forEach((_, type) => {
      this.providerConfigs.set(type, {
        type,
        enabled: false
      });
    });
  }

  /**
   * 设置当前使用的AI供应商
   */
  setCurrentProvider(provider: AIProviderType): void {
    if (!this.providers.has(provider)) {
      throw new Error(`未知的AI供应商: ${provider}`);
    }
    this.currentProvider = provider;
  }

  /**
   * 获取当前AI供应商
   */
  getCurrentProvider(): AIProviderType {
    return this.currentProvider;
  }

  /**
   * 获取所有供应商信息
   */
  getAllProviders() {
    return Array.from(this.providers.entries()).map(([type, service]) => ({
      type,
      ...service.getProviderInfo(),
      config: this.providerConfigs.get(type)
    }));
  }

  /**
   * 为供应商设置API密钥
   */
  async setProviderApiKey(
    provider: AIProviderType,
    apiKey: string
  ): Promise<boolean> {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`未知的AI供应商: ${provider}`);
    }

    // 验证API密钥
    const isValid = await service.validateApiKey(apiKey);
    if (!isValid) {
      throw new Error(`无效的API密钥`);
    }

    // 设置密钥
    service.setApiKey(apiKey);

    // 更新配置
    const config = this.providerConfigs.get(provider);
    if (config) {
      config.apiKey = apiKey;
      config.enabled = true;
      this.providerConfigs.set(provider, config);
    }

    return true;
  }

  /**
   * 生成AI补全
   */
  async generateCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions & { provider?: AIProviderType }
  ): Promise<string> {
    const provider = options?.provider || this.currentProvider;
    const service = this.providers.get(provider);

    if (!service) {
      throw new Error(`未知的AI供应商: ${provider}`);
    }

    const config = this.providerConfigs.get(provider);
    if (!config?.enabled) {
      throw new Error(`AI供应商 ${provider} 未配置或未启用`);
    }

    return service.generateCompletion(messages, options);
  }

  /**
   * 导出配置（用于保存到本地存储）
   */
  exportConfigs(): Record<string, AIProviderConfig> {
    const configs: Record<string, AIProviderConfig> = {};
    this.providerConfigs.forEach((config, type) => {
      // 不导出API密钥，只导出其他配置
      configs[type] = {
        type: config.type,
        enabled: config.enabled,
        model: config.model
      };
    });
    return configs;
  }

  /**
   * 导入配置
   */
  importConfigs(configs: Record<string, AIProviderConfig>): void {
    Object.entries(configs).forEach(([type, config]) => {
      this.providerConfigs.set(type as AIProviderType, config);
    });
  }

  /**
   * 获取供应商配置
   */
  getProviderConfig(provider: AIProviderType): AIProviderConfig | undefined {
    return this.providerConfigs.get(provider);
  }

  /**
   * 检查供应商是否已配置
   */
  isProviderConfigured(provider: AIProviderType): boolean {
    const config = this.providerConfigs.get(provider);
    return config?.enabled || false;
  }
}

// 导出单例
export const aiManager = new AIManager();
