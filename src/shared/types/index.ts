/**
 * 共享类型定义
 */

// 从原文件导出
export enum NCStatus {
  OPEN = 'Open',
  COMPLETED = 'Completed',
  SUBMITTED = 'Submitted'
}

export enum SectionType {
  S1_CONTAINMENT = 'S1_CONTAINMENT',
  S2_EVIDENCE = 'S2_EVIDENCE',
  S3_ROOT_CAUSE = 'S3_ROOT_CAUSE',
  ROOT_CAUSE_IMPACT = 'ROOT_CAUSE_IMPACT',
  S4_RESULT = 'S4_RESULT',
  S5_CORRECTIVE_ACTION = 'S5_CORRECTIVE_ACTION',
  S6_EVIDENCE = 'S6_EVIDENCE',
  S7_VERIFICATION = 'S7_VERIFICATION',
  AUDITOR_REVIEW = 'AUDITOR_REVIEW'
}

export interface AuditBasicData {
  reportNumber: string;
  auditType: string;
  orgName: string;
  startDate: string;
  endDate: string;
  closingMeetingDate: string; // 末次会议日期
  cbId: string;
  totalNCs: number;
}

export interface NCItem {
  id: string;
  reportId?: string; // 关联的报告ID

  // Audit Side Data (Read Only typically)
  ncNumber: string;
  identifier: string;
  classification: 'Major' | 'Minor';
  standard: string;
  standardClause: string;
  requirement: string;
  statement: string;
  evidence: string;
  rationale?: string;
  deadline: string;
  process: string;
  auditorDecision: string;
  auditorName?: string;
  auditorId?: string;

  // Organization Side Data (To be filled)
  // S1
  s1_containment: string;
  s1_responsible: string;
  s1_date: string;

  // S2
  s2_evidence?: string;
  s2_evidence_files?: string[];

  // S3
  rootCauseAffectsOthers?: boolean;
  rootCauseAffectsOthersExplanation?: string;
  s3_rootCause: string;
  s3_analysis_files?: string[];
  s4_processImpact: string;

  // S4 (Result)
  s4_rootCauseResult?: string;
  s4_rootCause_files?: string[];

  // S5
  s5_systemicAction: string;
  s5_responsible: string;
  s5_date: string;
  s5_action_files?: string[];

  // S6
  s6_implementation_details?: string;
  s6_evidence_files: string[];

  // S7
  s7_verification: string;
  s7_verification_files?: string[];

  // Submission
  orgRep: string;
  repDate: string;

  // Auditor Review
  reviewDate?: string;
  auditorComments?: string;

  status: NCStatus;

  // 元数据
  createdAt?: Date;
  updatedAt?: Date;
}

// 应用设置类型
export interface AppSettings {
  language: 'Chinese' | 'English';
  printJaZh: boolean;
  printKo: boolean;
  printImages: boolean;
  encryption: boolean;
  defaultPassword?: string;
  blueHeader: boolean;
  adjustTextLength: boolean;
  openFirstPdf: boolean;
  hideFilter: boolean;
  hideOldVersions: boolean;
  smartShiftInput: boolean;
  apiExchange: boolean;
  backupDays: number;

  // AI设置
  currentAIProvider: string;
  autoSave: boolean;
  autoSaveInterval: number; // 分钟
}

export type ViewState =
  | 'START'
  | 'NC_LIST'
  | 'SETTINGS_GENERAL'
  | 'SETTINGS_DATABASE'
  | 'SETTINGS_AI'
  | 'ALL_REPORTS';

// AI相关类型
export interface AIProviderConfig {
  type: string;
  apiKey?: string;
  model?: string;
  enabled: boolean;
  displayName?: string;
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// 文件上传类型
export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  data?: string; // Base64编码
}

// 导入/导出类型
export interface ExportData {
  version: string;
  exportDate: Date;
  basicData?: AuditBasicData;
  ncs: NCItem[];
  settings?: AppSettings;
}

// 网络状态
export type NetworkStatus = 'online' | 'offline' | 'unknown';
