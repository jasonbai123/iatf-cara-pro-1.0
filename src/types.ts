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
  // Audit Side Data (Read Only typically)
  ncNumber: string; // 1, 2, 3...
  identifier: string; // RC01, YS001...
  classification: 'Major' | 'Minor';
  standard: string; // IATF 16949:2016
  standardClause: string;
  requirement: string; 
  statement: string; 
  evidence: string; 
  rationale?: string; // Classification rationale
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
  s3_rootCause: string; // Analysis (5 Whys)
  s3_analysis_files?: string[];
  s4_processImpact: string; // Impact on other processes
  
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
}