/**
 * CARA AI服务
 * 整合AI管理器，提供专业的IATF 16949审核支持
 */

import { aiManager } from './ai/ai-manager';
import type { NCItem, SectionType } from '@shared/types';
import type { AIMessage } from './ai/ai-service.interface';
import { logger } from '../shared/utils/logger';

const SYSTEM_INSTRUCTION = `
你是一位资深的 IATF 16949 主任审核员和质量管理体系专家。
你的任务是协助汽车行业供应商回复 CARA (Common Audit Report Application) 不符合项报告，或协助审核员评审回复。

**必须严格遵守以下规则：**
1.  **双语输出**：每一段回复必须包含中文，紧接着是英文翻译。
    格式要求：
    [中文内容]
    [English Content]
2.  **专业语调**：使用正式、专业的质量保证术语（如：根本原因、系统性、遏制措施、防错/Poka-yoke、FMEA、控制计划等）。
3.  **逻辑准确**：根本原因分析必须遵循 5-Why 方法论，纠正措施必须符合 PDCA 循环。
4.  **CARA 格式**：输出内容必须适合填入 IATF NC CARA 报告的特定字段。
`;

/**
 * 生成NC分析
 */
export async function generateNCAnalysis(
  nc: NCItem,
  section: SectionType
): Promise<string> {
  try {
    // 构建上下文
    const context = buildNCContext(nc);

    // 构建提示词
    const prompt = buildPrompt(nc, section, context);

    // 构建消息
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt }
    ];

    // 调用AI生成
    const result = await aiManager.generateCompletion(messages, {
      temperature: 0.3,
      maxTokens: 4096
    });

    return result;
  } catch (error) {
    logger.error('CARA AI生成失败:', error);
    throw error;
  }
}

/**
 * 构建NC上下文
 */
function buildNCContext(nc: NCItem): string {
  return `
不符合项背景信息 (Non-Conformity Context):
- 标准条款 (Standard Clause): ${nc.standardClause}
- 标准要求 (Requirement): ${nc.requirement}
- 不符合项描述 (NC Statement): ${nc.statement}
- 客观证据 (Objective Evidence): ${nc.evidence}
- 过程 (Process): ${nc.process}
- 分类 (Classification): ${nc.classification === 'Major' ? '严重' : '一般'}
  `.trim();
}

/**
 * 构建提示词
 */
function buildPrompt(nc: NCItem, section: SectionType, context: string): string {
  let prompt = '';

  switch (section) {
    case 'S1_CONTAINMENT':
      prompt = `
${context}

任务：起草 "S1 遏制措施" (Containment Actions / Correction)。
要求：
1. 针对具体缺陷采取的立即修复措施。
2. 对可疑库存（在制品 WIP、成品、在途品）的隔离和排查行动。
3. 包含责任人和日期的占位符。

输出格式：一段中文，换行后一段英文。
      `;
      break;

    case 'S3_ROOT_CAUSE':
      prompt = `
${context}

任务：起草 "S3 根本原因分析" (Root Cause Analysis)。
要求：
1. 使用总结性的 5-Why 分析法。
2. 分析"发生原因" (Occurrence/Process cause) - 为什么过程会产生不良。
3. 分析"流出原因" (Escape/Detection cause) - 为什么缺陷未被探测到。
4. 分析"体系原因" (Systemic Root Cause) - 管理体系为何失效。

输出格式：一段中文，换行后一段英文。
      `;
      break;

    case 'S5_CORRECTIVE_ACTION':
      prompt = `
${context}
根本原因 (参考): ${nc.s3_rootCause || "基于此问题的典型根本原因"}

任务：起草 "S5 系统性纠正措施" (Systemic Corrective Actions)。
要求：
1. 基于根本原因制定防止再发生的措施。
2. 必须提及文件更新（如 PFMEA, 控制计划 CP, 作业指导书 SOS/JES）。
3. 如适用，提及技术修复或防错 (Error Proofing)。
4. 提及培训需求。

输出格式：一段中文，换行后一段英文。
      `;
      break;

    case 'S7_VERIFICATION':
      prompt = `
${context}
纠正措施 (参考): ${nc.s5_systemicAction || "基于典型的纠正措施"}

任务：起草 "S7 有效性验证" (Verification of Effectiveness)。
要求：
1. 描述组织如何验证措施是有效的。
2. 提及措施实施后对近期数据/记录的查验。
3. 提及进行了分层审核 (LPA) 或特定过程审核。

输出格式：一段中文，换行后一段英文。
      `;
      break;

    case 'AUDITOR_REVIEW':
      prompt = `
${context}

组织提交的回复 (Organization Response):
S1 (Containment): ${nc.s1_containment || "未提供"}
S3 (Root Cause): ${nc.s3_rootCause || "未提供"}
S5 (Systemic Action): ${nc.s5_systemicAction || "未提供"}
S7 (Verification): ${nc.s7_verification || "未提供"}

任务：作为 IATF 主任审核员，评审上述组织的回复。
要求：
1. 评估逻辑链条是否完整：S1 是否解决了紧急风险？S3 是否通过 5-Why 找到了根本原因（而非症状）？S5 是否直接针对根本原因防止再发生？S7 是否有效验证了 S5？
2. 如果回复质量高且逻辑严密，起草一段"同意接受"的评审意见。
3. 如果存在缺失（如：根本原因不深、措施未涉及文件更新、未考虑横向展开），起草一段"拒绝"的评审意见，并清晰列出需要修改的地方。
4. 内容必须符合资深审核员的专业水准。

输出格式：一段中文，换行后一段英文。
      `;
      break;

    default:
      prompt = context;
  }

  return prompt.trim();
}

/**
 * 验证AI配置
 */
export async function validateAIConfig(): Promise<boolean> {
  const currentProvider = aiManager.getCurrentProvider();
  return aiManager.isProviderConfigured(currentProvider);
}

/**
 * 获取可用的AI供应商列表
 */
export function getAvailableAIProviders() {
  return aiManager.getAllProviders();
}
