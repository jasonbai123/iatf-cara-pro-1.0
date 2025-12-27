/**
 * 统一 AI 服务
 * 支持动态切换不同的 AI 服务商
 */

import type { NCItem } from '../types';
import { SectionType } from '../types';
import { logger } from '../shared/utils/logger';

// 从 localStorage 获取 API Key
function getApiKey(provider: string): string | null {
  try {
    const savedKeys = JSON.parse(localStorage.getItem('ai_api_keys') || '{}');
    return savedKeys[provider]?.apiKey || null;
  } catch {
    return null;
  }
}

// 获取当前选择的服务商
function getCurrentProvider(): string {
  try {
    const settings = JSON.parse(localStorage.getItem('ai_settings') || '{}');
    return settings.currentProvider || 'gemini';
  } catch {
    return 'gemini';
  }
}

/**
 * 生成 AI 分析
 * 根据当前选择的服务商调用相应的 API
 */
export async function generateAIAnalysis(
  nc: NCItem,
  section: SectionType,
  providerOverride?: string,
  closingMeetingDate?: string
): Promise<string> {
  const provider = providerOverride || getCurrentProvider();
  const apiKey = getApiKey(provider);

  logger.log('===== AI 调用信息 =====');
  logger.log('使用服务商:', provider);
  logger.log('API Key 存在:', !!apiKey);
  logger.log('API Key 长度:', apiKey?.length || 0);
  logger.log('末次会议日期:', closingMeetingDate || '未提供');

  if (!apiKey) {
    const providerNames: Record<string, string> = {
      gemini: 'Google Gemini',
      glm: '智谱 GLM',
      claude: 'Claude',
      deepseek: 'DeepSeek',
      volcengine: '火山引擎',
      siliconflow: '硅基流动'
    };

    // 显示所有已配置的服务商
    try {
      const savedKeys = JSON.parse(localStorage.getItem('ai_api_keys') || '{}');
      logger.log('已配置的服务商:', Object.keys(savedKeys));
    } catch (e) {
      logger.error('读取配置失败:', e);
    }

    return `AI 服务未配置。请前往「AI 配置」页面设置 ${providerNames[provider] || provider} 的 API Key。\n\n当前默认: ${providerNames[provider] || provider}\n已配置: ${Object.keys(JSON.parse(localStorage.getItem('ai_api_keys') || '{}')).join(', ') || '无'}`;
  }

  // 根据服务商调用不同的 API
  try {
    switch (provider) {
      case 'gemini':
        return await callGeminiAPI(nc, section, apiKey, closingMeetingDate);
      case 'glm':
        return await callGLMAPI(nc, section, apiKey, closingMeetingDate);
      case 'claude':
        return await callClaudeAPI(nc, section, apiKey, closingMeetingDate);
      case 'deepseek':
        return await callDeepSeekAPI(nc, section, apiKey, closingMeetingDate);
      case 'volcengine':
        return await callVolcengineAPI(nc, section, apiKey, closingMeetingDate);
      case 'siliconflow':
        return await callSiliconFlowAPI(nc, section, apiKey, closingMeetingDate);
      default:
        return '不支持的 AI 服务商';
    }
  } catch (error) {
    logger.error(`AI API Error (${provider}):`, error);
    return `AI 服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`;
  }
}

// ========== 请求队列管理 ==========
const requestQueue = new Map<string, Promise<any>>();
const requestDelays = new Map<string, number>();

async function queueRequest(provider: string, key: string, requestFn: () => Promise<any>): Promise<any> {
  // 如果同一供应商有正在进行的请求，等待它完成
  if (requestQueue.has(provider)) {
    await requestQueue.get(provider);
  }

  // 添加延迟避免速率限制
  const lastRequestTime = requestDelays.get(provider) || 0;
  const now = Date.now();
  // 优化后减少延迟：硅基流动500ms，其他300ms
  const minDelay = provider === 'siliconflow' ? 500 : 300;

  if (now - lastRequestTime < minDelay) {
    await new Promise(resolve => setTimeout(resolve, minDelay - (now - lastRequestTime)));
  }

  const request = requestFn();
  requestQueue.set(provider, request);
  requestDelays.set(provider, Date.now());

  try {
    const result = await request;
    return result;
  } finally {
    requestQueue.delete(provider);
  }
}

// ========== Gemini API ==========
async function callGeminiAPI(nc: NCItem, section: SectionType, apiKey: string, closingMeetingDate?: string): Promise<string> {
  return queueRequest('gemini', 'generate', async () => {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = buildPrompt(nc, section, closingMeetingDate);

      let retries = 3;
      for (let i = 0; i < retries; i++) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
              systemInstruction: getSystemInstruction(),
              temperature: 0.3,
            },
          });

          return response.text || 'AI 生成失败，请重试。';
        } catch (error: any) {
          // 429 错误：速率限制，等待后重试
          if (error?.status === 429 || error?.message?.includes('429')) {
            const waitTime = Math.pow(2, i) * 1000;
            logger.log(`Gemini API 速率限制，等待 ${waitTime}ms 后重试 (${i + 1}/${retries})`);
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          throw new Error(`Gemini API 调用失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      throw new Error('Gemini API 请求失败，请稍后重试');
    } catch (error) {
      logger.error('Gemini API 导入或调用失败:', error);
      throw new Error(`Gemini API 服务错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

// ========== GLM API ==========
async function callGLMAPI(nc: NCItem, section: SectionType, apiKey: string, closingMeetingDate?: string): Promise<string> {
  return queueRequest('glm', 'generate', async () => {
    const prompt = buildPrompt(nc, section, closingMeetingDate);

    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: getSystemInstruction() },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GLM API 错误: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'GLM 生成失败，请重试。';
    } catch (error) {
      throw error;
    }
  });
}

// ========== Claude API ==========
async function callClaudeAPI(nc: NCItem, section: SectionType, apiKey: string, closingMeetingDate?: string): Promise<string> {
  return queueRequest('claude', 'generate', async () => {
    const prompt = buildPrompt(nc, section, closingMeetingDate);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          system: getSystemInstruction(),
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 4096,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API 错误: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.content?.[0]?.text || 'Claude 生成失败，请重试。';
    } catch (error) {
      throw error;
    }
  });
}

// ========== DeepSeek API ==========
async function callDeepSeekAPI(nc: NCItem, section: SectionType, apiKey: string, closingMeetingDate?: string): Promise<string> {
  return queueRequest('deepseek', 'generate', async () => {
    const prompt = buildPrompt(nc, section, closingMeetingDate);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: getSystemInstruction() },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API 错误: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'DeepSeek 生成失败，请重试。';
    } catch (error) {
      throw error;
    }
  });
}

// ========== 火山引擎 API ==========
async function callVolcengineAPI(nc: NCItem, section: SectionType, apiKey: string, closingMeetingDate?: string): Promise<string> {
  return queueRequest('volcengine', 'generate', async () => {
    const prompt = buildPrompt(nc, section, closingMeetingDate);

    try {
      // 火山引擎的端点可能是用户自定义的，这里使用常见的北京区域端点
      // API Key 格式: ak-xxxxx;sk-xxxxx 或者 Bearer token
      let authorization = apiKey;
      if (!apiKey.startsWith('Bearer ') && !apiKey.includes('ak-')) {
        authorization = `Bearer ${apiKey}`;
      }

      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'doubao-pro-32k',
          messages: [
            { role: 'system', content: getSystemInstruction() },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error(`火山引擎 API 端点未找到 (404)。请检查：
1. API Key 格式是否正确（应为 ak-xxxxx;sk-xxxxx 或 Bearer token）
2. 模型名称是否正确（当前使用: doubao-pro-32k）
3. 区域端点是否正确（当前使用: cn-beijing）
4. 是否已在火山引擎控制台创建了推理端点

错误详情: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`火山引擎 API 错误: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '火山引擎生成失败，请重试。';
    } catch (error) {
      throw error;
    }
  });
}

// ========== 硅基流动 API ==========
async function callSiliconFlowAPI(nc: NCItem, section: SectionType, apiKey: string, closingMeetingDate?: string): Promise<string> {
  return queueRequest('siliconflow', 'generate', async () => {
    const prompt = buildPrompt(nc, section, closingMeetingDate);

    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // 使用更快的模型优化速度
          model: 'Qwen/Qwen2.5-7B-Instruct',
          messages: [
            { role: 'system', content: getSystemInstruction() },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2048, // 减少token数量提升速度
          top_p: 0.9,
          stream: false // 禁用流式传输以获得更稳定的响应
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`硅基流动 API 错误: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '硅基流动生成失败，请重试。';
    } catch (error) {
      throw error;
    }
  });
}

// ========== 辅助函数 ==========

function getSystemInstruction(): string {
  return `
你是一位资深的 IATF 16949 主任审核员和质量管理体系专家。
你的任务是协助汽车行业供应商回复 CARA (Common Audit Report Application) 不符合项报告，或协助审核员评审回复。

**重要：理解并保留已有内容**
- 字段中可能已经有部分内容，你的首要任务是**理解和保留这些已有内容**
- 在已有内容基础上**补充、完善、扩展**，而不是完全重新生成
- 如果内容已经完整且符合要求，只需稍作润色使其更专业

**IATF CARA 完整时间节点要求（必须严格遵守）**
审核未次会议日期结束后第1天开始所有时间限制：
- Day0: 不符合项发现（审核未次会议）
- Day0-2: S1遏制措施（2天内完成）
- Day2-5: S2实施证据（S1完成后3天内完成）
- Day5-8: S3根本原因分析（S2完成后3天内完成）
- Day8-9: 影响说明+S4根本原因结果（S3完成后1天内完成）
- Day9-11: S5系统性纠正措施（S4完成后2天内完成）
- Day11-26: S6实施证据（S5完成后15天内完成）
- Day26-31: S7有效性验证（S6完成后3-5天内完成）

**必须严格遵守以下规则：**
1.  **双语输出**：每一段回复必须包含中文，紧接着是英文翻译。
2.  **专业语调**：使用正式、专业的质量保证术语（如：根本原因、系统性、遏制措施、防错/Poka-yoke、FMEA、控制计划、PDCA等）。
3.  **逻辑准确**：根本原因分析必须遵循 5-Why 方法论，纠正措施必须符合 PDCA 循环。
4.  **CARA 格式**：输出内容必须适合填入 IATF NC CARA 报告的特定字段。
5.  **可操作性**：所有措施必须具体、可执行、可验证，避免空泛的描述。
6.  **时间节点**：所有AI生成内容必须严格遵守IATF的时间要求，并生成明确的时间节点和责任人。
`;
}

function buildPrompt(nc: NCItem, section: SectionType, closingMeetingDate?: string): string {
  // 计算时间节点的辅助函数
  const calculateDate = (startDate: string, daysToAdd: number): string => {
    if (!startDate) return '[未提供日期，请使用占位符]';
    try {
      const date = new Date(startDate);
      date.setDate(date.getDate() + daysToAdd);
      return date.toISOString().split('T')[0];
    } catch {
      return '[日期计算错误]';
    }
  };

  const context = `
不符合项背景信息:
- 标准条款: ${nc.standardClause}
- 标准要求: ${nc.requirement}
- 不符合项描述: ${nc.statement}
- 客观证据: ${nc.evidence}
- 过程: ${nc.process}
${closingMeetingDate ? `- 末次会议日期: ${closingMeetingDate}\n` : ''}
`;

  // 获取已有内容的辅助函数
  const getExistingContent = (content: string, label: string) => {
    if (content && content.trim()) {
      return `\n【已有的 ${label} - 请保留并在此基础上完善】\n${content}\n`;
    }
    return `\n【${label} - 需要生成】`;
  };

  switch (section) {
    case SectionType.S1_CONTAINMENT: {
      const s1Deadline = closingMeetingDate ? calculateDate(closingMeetingDate, 2) : '[请填写末次会议日期后2天]';
      return `${context}

任务：完善 "S1 遏制措施"

⏰ **时间要求：末次会议后2天内完成（截止日期：${s1Deadline}）**

${getExistingContent(nc.s1_containment, 'S1 遏制措施内容')}
${nc.s1_responsible ? `\n责任人: ${nc.s1_responsible}\n` : ''}
${nc.s1_date ? `\n日期: ${nc.s1_date}\n` : ''}

要求：
1. 如果已有内容，请理解并保留核心要点，补充细节使其更完整
2. 如果没有内容，请生成完整的遏制措施，包括：
   - 针对具体缺陷采取的立即修复措施
   - 对可疑库存（在制品 WIP、成品、在途品）的隔离和排查行动
   - 明确的完成时间节点（必须在${s1Deadline}前完成）
   - 负责人和实施人员
3. 确保内容专业、具体、可操作，时间节点明确
4. **必须明确完成时限和责任人**

输出格式：一段中文，换行后一段英文。`;
    }

    case SectionType.S2_EVIDENCE: {
      const s1Deadline = closingMeetingDate ? calculateDate(closingMeetingDate, 2) : '[未提供]';
      const s2Deadline = closingMeetingDate ? calculateDate(closingMeetingDate, 5) : '[未提供]';

      return `${context}

S1 遏制措施参考:
${nc.s1_containment || "未提供"}
${nc.s1_responsible ? `责任人: ${nc.s1_responsible}\n` : ''}
${nc.s1_date ? `日期: ${nc.s1_date}\n` : ''}

⏰ **时间要求：S1完成后3天内完成实施并提供证据（截止日期：${s2Deadline}）**

任务：生成 "S2 实施证据文件名列表"

${getExistingContent(nc.s2_evidence || '', '已有文件名')}

要求：
1. 字段要求：输入附件用于显示实施的证据的**文件名**（不是内容描述）
2. 仔细理解S1遏制措施的具体内容，基于S1的措施生成对应的**证据文件名列表**
3. 时间节点：S1完成后3天内必须完成实施并提供证据文件（截止日期：${s2Deadline}）
4. 如果已有文件名，请理解并保留，补充缺失的文件名
5. 如果没有内容，请生成完整的文件名列表，格式要求：
   - 每行一个文件名
   - 包含文件扩展名（如：.pdf, .jpg, .xlsx, .doc）
   - 文件名应清晰描述内容（中文）
   - 文件名中应体现日期（建议格式：${s2Deadline.replace(/-/g, '')}，如：返工记录表${s2Deadline.replace(/-/g, '')}.pdf）
   - 基于S1措施生成对应证据文件名：
     * 返工/修复记录：返工记录表.pdf、产品返工照片.jpg
     * 检查记录：WIP检查记录.xlsx、成品检验报告.pdf
     * 隔离记录：不合格品隔离标识.jpg、隔离产品清单.xlsx
     * 培训记录：操作员培训签到表.pdf、培训照片.jpg
     * 客户通知：客户通知书.pdf、邮件记录.pdf
6. 文件名格式示例：
   返工记录表${s2Deadline.replace(/-/g, '')}.pdf
   WIP检查记录${s2Deadline.replace(/-/g, '')}.xlsx
   不合格品隔离清单${s2Deadline.replace(/-/g, '')}.pdf

输出格式：文件名列表（无需英文翻译），每行一个文件名。`;
    }

    case SectionType.S3_ROOT_CAUSE: {
      const s3Deadline = closingMeetingDate ? calculateDate(closingMeetingDate, 8) : '[未提供]';

      return `${context}

任务：完善 "S3 根本原因分析"

⏰ **时间要求：末次会议后8天内完成根本原因分析（截止日期：${s3Deadline}）**

${getExistingContent(nc.s3_rootCause, 'S3 根本原因分析')}

${nc.rootCauseAffectsOthers !== undefined ? `其他问题是否受影响: ${nc.rootCauseAffectsOthers ? '是' : '否'}\n` : ''}

要求：
1. 时间节点：必须在${s3Deadline}前完成根本原因分析
2. 如果已有内容，请理解并保留已有的 5-Why 分析逻辑，补充深度和完整性
3. 如果没有内容，请使用 5-Why 方法生成完整的根本原因分析：
   - 发生原因：为什么过程会产生不良（process cause）
   - 流出原因：为什么缺陷未被探测到
   - 体系原因：管理体系为何失效
4. 分析必须逻辑严密，直达根本原因而非表面症状
5. 明确完成时限和责任人

输出格式：一段中文，换行后一段英文。`;
    }

    case SectionType.ROOT_CAUSE_IMPACT: {
      const impactDeadline = closingMeetingDate ? calculateDate(closingMeetingDate, 9) : '[未提供]';
      const lateralDeadline = closingMeetingDate ? calculateDate(closingMeetingDate, 16) : '[未提供]';

      return `${context}

S3 根本原因参考:
${nc.s3_rootCause || "未提供"}

是否影响其他: ${nc.rootCauseAffectsOthers !== undefined ? (nc.rootCauseAffectsOthers ? '是' : '否') : '未选择'}

⏰ **时间要求：末次会议后9天内完成影响分析（截止日期：${impactDeadline}）**

任务：完善 "根本原因如何影响其他过程"

${getExistingContent(nc.s4_processImpact || '', '根本原因影响说明')}

要求：
1. 时间节点：必须在${impactDeadline}前完成影响分析
2. 仔细理解S3根本原因分析的结论，基于根本原因分析影响范围
3. 如果选择"是"，需要详细说明：
   - 识别可能受影响的其他类似流程或产品（具体列出）
   - 分析根本原因在其他过程中的具体表现和影响机制
   - 评估潜在的风险等级和影响程度
   - 提出需要同步检查、评估和改进的过程清单
   - 明确横向展开的时间节点（须在${lateralDeadline}前完成，即末次会议后16天内）
4. 如果选择"否"，需要说明为什么此根本原因是孤立的、不影响其他过程
5. 说明必须具体、系统化，体现横向展开思维和系统性思考
6. **必须明确完成时限和责任人**

输出格式：一段中文，换行后一段英文。`;
    }

    case SectionType.S4_RESULT: {
      const s4Deadline = closingMeetingDate ? calculateDate(closingMeetingDate, 9) : '[未提供]';

      return `${context}

S3 根本原因参考:
${nc.s3_rootCause || "未提供"}

是否影响其他: ${nc.rootCauseAffectsOthers ? '是' : '否'}
${nc.s4_processImpact ? `影响说明:\n${nc.s4_processImpact}\n` : ''}

⏰ **时间要求：末次会议后9天内完成根本原因结果验证（截止日期：${s4Deadline}）**

任务：完善 "S4 根本原因结果"

${getExistingContent(nc.s4_rootCauseResult || '', 'S4 根本原因结果')}

要求：
1. 时间节点：必须在${s4Deadline}前完成根本原因验证
2. 仔细理解S3根本原因分析，验证根本原因的准确性
3. 如果已有内容，请理解并保留核心结论，补充验证结果
4. 如果没有内容，请生成完整的根本原因验证结果，包括：
   - 根本原因验证方法（如：试验、数据分析、流程追踪、5-Why验证）
   - 验证过程和关键发现（具体数据、观察结果）
   - 确认根本原因的最终结论
   - 明确验证完成的时间节点
   ${nc.rootCauseAffectsOthers ? `- 其他受影响过程的检查结果（基于影响说明：${nc.s4_processImpact?.substring(0, 50)}...）\n` : '- 本过程的根本原因验证已完成，不影响其他过程\n'}
5. 结果必须基于事实、有数据支持，逻辑严密

输出格式：一段中文，换行后一段英文。`;
    }

    case SectionType.S5_CORRECTIVE_ACTION: {
      const s5Deadline = closingMeetingDate ? calculateDate(closingMeetingDate, 11) : '[未提供]';

      return `${context}
根本原因参考: ${nc.s3_rootCause || "未提供"}

⏰ **时间要求：末次会议后11天内完成系统性纠正措施分析（截止日期：${s5Deadline}）**

任务：完善 "S5 系统性纠正措施"

${getExistingContent(nc.s5_systemicAction, 'S5 系统性纠正措施')}
${nc.s5_responsible ? `\n责任人: ${nc.s5_responsible}\n` : ''}
${nc.s5_date ? `\n目标完成日期: ${nc.s5_date}\n` : ''}

要求：
1. 时间节点：必须在${s5Deadline}前完成纠正措施制定
2. 如果已有内容，请理解并保留核心措施，补充实施细节和验证方法
3. 如果没有内容，请基于根本原因生成完整的系统性纠正措施：
   - 针对根本原因制定防止再发生的措施
   - 必须提及文件更新（PFMEA、控制计划 CP、作业指导书 SOS/JES）
   - 如适用，提及技术修复或防错
   - 提及培训需求和实施计划
   - 明确措施实施的责任人和完成时限
4. 措施必须具体、可验证、有时间节点

输出格式：一段中文，换行后一段英文。`;
    }

    case SectionType.S6_EVIDENCE: {
      const s6Deadline = closingMeetingDate ? calculateDate(closingMeetingDate, 26) : '[未提供]';

      return `${context}

S5 系统性纠正措施参考:
${nc.s5_systemicAction || "未提供"}
${nc.s5_responsible ? `责任人: ${nc.s5_responsible}\n` : ''}
${nc.s5_date ? `目标完成日期: ${nc.s5_date}\n` : ''}

⏰ **时间要求：末次会议后26天内完成系统性纠正措施实施并附上改善文件（截止日期：${s6Deadline}）**

任务：完善 "S6 实施证据（包括时间安排和负责人）"

${getExistingContent(nc.s6_implementation_details || '', 'S6 实施证据内容')}

要求：
1. 时间节点：必须在${s6Deadline}前完成所有系统性纠正措施的实施并提供证据
2. 仔细理解S5系统性纠正措施的每一项内容，基于措施生成对应的实施证据
3. 如果已有内容，请理解并保留核心信息，补充具体的实施细节和时间安排
4. 如果没有内容，请生成完整的实施证据，包括：
   - 针对S5中每项纠正措施的具体实施步骤和时间节点（分阶段安排）
   - 实施负责人和参与部门/人员
   - 实施记录清单：
     * 培训记录（培训对象、内容、签到表、培训日期）
     * 文件更新记录（PFMEA、控制计划、作业指导书等修订记录和版本号）
     * 设备/工装改造记录（如适用）
     * 过程变更验证记录
   - 实施完成状态确认和验证数据
   - 改善后的文件和资料清单（附上文件名称和版本号）
   - 相关支持文件清单（照片、文档、记录表、审批记录）
   ${nc.s5_responsible ? `- ${nc.s5_responsible} 负责的整体实施计划\n` : ''}
   ${nc.s5_date ? `- 实施截止日期：${s6Deadline}\n` : ''}
5. 证据必须完整、可追溯、有时间节点，与S5措施一一对应
6. **必须明确完成时限和责任人**

输出格式：一段中文，换行后一段英文。`;
    }

    case SectionType.S7_VERIFICATION: {
      const s7StartDeadline = closingMeetingDate ? calculateDate(closingMeetingDate, 29) : '[未提供]';
      const s7EndDeadline = closingMeetingDate ? calculateDate(closingMeetingDate, 31) : '[未提供]';

      return `${context}
纠正措施参考: ${nc.s5_systemicAction || "未提供"}

⏰ **时间要求：末次会议后29-31天内完成有效性验证并附上验证文件（截止日期：${s7StartDeadline} 至 ${s7EndDeadline}）**

任务：完善 "S7 有效性验证"

${getExistingContent(nc.s7_verification, 'S7 有效性验证')}

要求：
1. 时间节点：必须在${s7StartDeadline}至${s7EndDeadline}之间完成有效性验证并提供验证文件
2. 如果已有内容，请理解并保留验证方法，补充具体的验证数据和结论
3. 如果没有内容，请生成完整的有效性验证方案：
   - 描述如何验证措施有效性（数据查验、现场审核、统计分析等）
   - 提及措施实施后的数据/记录查验方法（至少30天的数据）
   - 包含分层审核 (LPA) 或特定过程审核
   - 设定验证时间节点（${s7StartDeadline}开始，${s7EndDeadline}前完成）
   - 明确验证负责人和参与人员
   - 提供验证文件清单（验证报告、数据表、审核记录等）
4. 验证方法必须客观、可量化，有明确的有效性结论

输出格式：一段中文，换行后一段英文。`;
    }

    case SectionType.AUDITOR_REVIEW: {
      return `${context}

组织回复参考:
S1 遏制措施: ${nc.s1_containment ? '已提供' : '未提供'}
${nc.s1_containment ? `\n内容: ${nc.s1_containment.substring(0, 100)}...\n` : ''}

S3 根本原因: ${nc.s3_rootCause ? '已提供' : '未提供'}
${nc.s3_rootCause ? `\n内容: ${nc.s3_rootCause.substring(0, 100)}...\n` : ''}

S5 纠正措施: ${nc.s5_systemicAction ? '已提供' : '未提供'}
${nc.s5_systemicAction ? `\n内容: ${nc.s5_systemicAction.substring(0, 100)}...\n` : ''}

S7 有效性验证: ${nc.s7_verification ? '已提供' : '未提供'}
${nc.s7_verification ? `\n内容: ${nc.s7_verification.substring(0, 100)}...\n` : ''}

任务：作为 IATF 主任审核员评审组织回复

要求：
1. 评估逻辑链条完整性：
   - S1 是否解决了紧急风险？
   - S3 是否通过 5-Why 找到了根本原因（而非症状）？
   - S5 是否直接针对根本原因防止再发生？
   - S7 是否有效验证了 S5？
2. 根据质量给出评审意见：
   - 如果回复质量高且逻辑严密，起草"同意接受"的评审意见
   - 如果存在缺失（根本原因不深、措施未涉及文件更新、未考虑横向展开），起草"拒绝"的评审意见，清晰列出需要修改的地方
3. 评审意见必须专业、符合 IATF 标准

输出格式：一段中文，换行后一段英文。`;
    }

    default:
      return context;
  }
}
