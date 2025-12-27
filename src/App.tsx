import React, { useState, useRef, useEffect } from 'react';
import { NCItem, NCStatus, SectionType, AuditBasicData } from './types';
import { generateAIAnalysis } from './services/unifiedAI.service';
import { authService } from './services/auth.service';
import { logger } from './shared/utils/logger';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import AdminDashboard from './components/AdminDashboard';
import ChangePassword from './components/ChangePassword';
import UpdateNotification from './components/UpdateNotification';
import ExpiryNotification from './components/ExpiryNotification';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  ListBulletIcon,
  QueueListIcon,
  CircleStackIcon,
  TrashIcon,
  ArrowUpIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  LockClosedIcon
} from '@heroicons/react/24/solid';

// --- Mock Data ---
const MOCK_BASIC_DATA: AuditBasicData = {
  reportNumber: '',
  auditType: '第二阶段',
  orgName: 'xxxxxx',
  startDate: '29.Oct.2024',
  endDate: '31.Oct.2024',
  closingMeetingDate: '31.Oct.2024',
  cbId: '',
  totalNCs: 4
};

const DEFAULT_NCS: NCItem[] = [
  {
    id: '1',
    ncNumber: '1',
    identifier: 'RC01',
    classification: 'Minor',
    standard: 'IATF 16949:2016',
    standardClause: '8.7.1.4',
    requirement: '组织应利用风险分析（如FMEA）来评估返工过程中的风险，以便在决定返工产品之前进行评估。如顾客有所要求，组织应在开始产品返工之前获得顾客批准。',
    statement: '返工产品的控制过程不太有效\nThe control process for reworked products is less effective',
    evidence: '查测试一线，10月29日发现一件产品D169“后录影像装反”，不良产品流水号：1140，返工后没有相应的返工记录。\nCheck the test line, on October 29, found a product D169 "post-recording image installation reverse", the bad product serial number: 1140, there is no corresponding rework record after rework.',
    rationale: '这是一个孤立事件，不是系统性缺失，因为查其他的生产控制要求，如：焊接温度，焊接时间，焊接使用治具等都明确了要求。\nThis is an isolated incident, not a systematic failure...',
    deadline: '30.Dec.2024',
    process: 'COP3 Production plan and production',
    auditorDecision: '',
    auditorName: '***',
    auditorId: '5-ADP-11-09-0623',
    s1_containment: '1、纠正：立即对产品 D028 行程记录仪的组装工序 #7 焊接 6PIN 母座于电源板的作业指导书和控制计划进行修订，确认规定符合要求焊接使用的锡丝牌号规格为φ0.88MM FLXU:2.2%。\nCorrective: Immediately revise the work instructions...',
    s1_responsible: '***',
    s1_date: '2024年11月1日',
    s2_evidence: '已上传修改后的作业指导书及培训记录。\nUploaded revised work instructions and training records.',
    s2_evidence_files: ['SOP-Assembly-Rev02.pdf (245 KB)', 'Training-SignSheet-20241101.jpg (1.2 MB)'],
    rootCauseAffectsOthers: false,
    s3_rootCause: '',
    s3_analysis_files: [],
    s4_processImpact: '因为《SOP作业指导书管理办法》和/或《CP控制计划管理程序》中都没有明确规定编制《作业指导书》和/或《控制计划》应将焊接使用的锡丝、清洁用的清洁剂等典型辅料的规格型号注明其中。',
    s4_rootCauseResult: '',
    s4_rootCause_files: [],
    s5_systemicAction: '1、修订《SOP作业指导书管理办法》A0版本，明确规定“编制《作业指导书》和/或《控制计划》应将焊接使用的锡丝、清洁用的清洁剂等典型辅料的规格型号注明其中”之要求。\nRevise the "SOP Work Instruction Management Measures"...',
    s5_responsible: '***',
    s5_date: '2024年11月7日',
    s5_action_files: [],
    s6_implementation_details: '',
    s6_evidence_files: [],
    s7_verification: '1、纠正/纠正措施验证\n管理者代表组织对以上采取纠正措施的有效性进行验证和评价，并填制《纠正措施有效性验证表》。',
    s7_verification_files: ['附件7：纠正措施有效性验证表.pdf (138.06 KB)', '附件8：COP3内审检查表.pdf (138.44 KB)'],
    orgRep: '***',
    repDate: '20.Nov.2024',
    reviewDate: '',
    auditorComments: '',
    status: NCStatus.OPEN
  },
  {
    id: '2',
    ncNumber: '2',
    identifier: 'RC02',
    classification: 'Minor',
    standard: 'ISO 9001:2015 和 IATF 16949',
    standardClause: '8.5.1',
    requirement: '组织应在受控条件下进行生产和服务提供。',
    statement: '装配线B的控制计划未得到有效执行。',
    evidence: '观察操作员在工位OP30进行作业时，未按照控制计划(CP-AS-002 Rev.3)要求的频次（每2小时）进行首件/巡检点检。',
    rationale: '',
    deadline: '30.Dec.2024',
    process: 'COP3 Production plan and production',
    auditorDecision: '',
    s1_containment: '',
    s1_responsible: '',
    s1_date: '',
    s2_evidence: '',
    s2_evidence_files: [],
    s3_rootCause: '',
    s3_analysis_files: [],
    s4_processImpact: '',
    s4_rootCauseResult: '',
    s4_rootCause_files: [],
    s5_systemicAction: '',
    s5_responsible: '',
    s5_date: '',
    s5_action_files: [],
    s6_implementation_details: '',
    s6_evidence_files: [],
    s7_verification: '',
    s7_verification_files: [],
    orgRep: '',
    repDate: '',
    reviewDate: '',
    auditorComments: '',
    status: NCStatus.OPEN
  },
  {
    id: '3',
    ncNumber: '3',
    identifier: 'YS001',
    classification: 'Minor',
    standard: 'IATF 16949:2016',
    standardClause: '8.4.2.4',
    requirement: '',
    statement: '',
    evidence: '',
    deadline: '30.Dec.2024',
    process: 'SP5 Supplier Management(供应商管理)',
    auditorDecision: '',
    s1_containment: '',
    s1_responsible: '',
    s1_date: '',
    s3_rootCause: '',
    s3_analysis_files: [],
    s4_processImpact: '',
    s4_rootCauseResult: '',
    s4_rootCause_files: [],
    s5_systemicAction: '',
    s5_responsible: '',
    s5_date: '',
    s5_action_files: [],
    s6_implementation_details: '',
    s6_evidence_files: [],
    s7_verification: '',
    s7_verification_files: [],
    orgRep: '',
    repDate: '',
    reviewDate: '',
    auditorComments: '',
    status: NCStatus.OPEN
  },
  {
    id: '4',
    ncNumber: '4',
    identifier: 'YS002',
    classification: 'Minor',
    standard: 'IATF 16949:2016',
    standardClause: '8.5.2.1',
    requirement: '',
    statement: '',
    evidence: '',
    deadline: '30.Dec.2024',
    process: 'SP6 Warehouse management仓库管理',
    auditorDecision: '',
    s1_containment: '',
    s1_responsible: '',
    s1_date: '',
    s3_rootCause: '',
    s3_analysis_files: [],
    s4_processImpact: '',
    s4_rootCauseResult: '',
    s4_rootCause_files: [],
    s5_systemicAction: '',
    s5_responsible: '',
    s5_date: '',
    s5_action_files: [],
    s6_implementation_details: '',
    s6_evidence_files: [],
    s7_verification: '',
    s7_verification_files: [],
    orgRep: '',
    repDate: '',
    reviewDate: '',
    auditorComments: '',
    status: NCStatus.OPEN
  }
];

type ViewState = 'START' | 'NC_LIST' | 'SETTINGS_GENERAL' | 'SETTINGS_DATABASE' | 'SETTINGS_AI' | 'ALL_REPORTS';

interface AppSettings {
  language: string;
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
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'Chinese',
  printJaZh: false,
  printKo: false,
  printImages: false,
  encryption: false,
  defaultPassword: '',
  blueHeader: false,
  adjustTextLength: true,
  openFirstPdf: false,
  hideFilter: true,
  hideOldVersions: false,
  smartShiftInput: true,
  apiExchange: false,
  backupDays: 0
};

// --- Helper Components ---

interface SectionHeaderProps {
  title: string;
  aiAction?: () => void;
  isGenerating?: boolean;
  helpText?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, aiAction, isGenerating, helpText }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-1 mt-4">
        <QuestionMarkCircleIcon 
          className={`w-5 h-5 text-gray-700 bg-white rounded-full cursor-pointer transition-colors hover:text-blue-600 ${showHelp ? 'text-blue-600' : ''}`}
          onClick={() => helpText && setShowHelp(!showHelp)}
        />
        <span className="font-bold text-gray-800 border-b-2 border-dotted border-blue-800 leading-tight cursor-help" title={title}>
          {title}
        </span>
        {aiAction && (
          <button 
            onClick={aiAction}
            disabled={isGenerating}
            className="ml-auto flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-2 py-0.5 rounded shadow hover:from-blue-700 hover:to-blue-600 disabled:opacity-50"
          >
            {isGenerating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
            AI 生成
          </button>
        )}
      </div>
      {showHelp && helpText && (
        <div className="bg-[#eef7ff] border-l-4 border-[#00a65a] p-3 mb-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap animate-fadeIn shadow-sm">
          {helpText}
        </div>
      )}
    </div>
  );
};

const FieldHeaderWithHelp = ({ title, helpText }: { title: string, helpText: string }) => {
  const [show, setShow] = useState(false);
  return (
     <div className="mb-2">
        <div className="flex items-center gap-2 border-b border-dotted border-gray-400 pb-1">
             <QuestionMarkCircleIcon 
                className={`w-5 h-5 text-gray-700 cursor-pointer transition-colors hover:text-blue-600 ${show ? 'text-blue-600' : ''}`} 
                onClick={() => setShow(!show)}
             />
             <span className="font-bold text-gray-700 text-xs">{title}</span>
        </div>
        {show && (
            <div className="bg-[#eef7ff] border-l-4 border-[#00a65a] p-2 mt-1 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap animate-fadeIn">
               {helpText}
            </div>
        )}
     </div>
  );
};

const Label = ({ required, text }: { required?: boolean, text: string }) => (
  <label className="block text-xs font-bold text-gray-700 mb-1">
    {required && <span className="text-red-600 mr-1">*</span>}
    <span className="underline decoration-dotted decoration-gray-400">{text}</span>
  </label>
);

const Input = ({ value, onChange, readOnly = false, className = "", type = "text", placeholder = "" }: {
  value: string | number,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  readOnly?: boolean,
  className?: string,
  type?: string,
  placeholder?: string
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    readOnly={readOnly}
    placeholder={placeholder}
    className={`w-full border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none ${readOnly ? 'bg-gray-100' : 'bg-white'} ${className}`}
  />
);

interface TextAreaProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  className?: string;
}

const TextArea = ({ value, onChange, placeholder, rows = 4, readOnly = false, className = "" }: TextAreaProps) => (
  <textarea 
    value={value}
    onChange={onChange}
    readOnly={readOnly}
    rows={rows}
    placeholder={placeholder}
    className={`w-full border border-gray-300 p-2 text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none resize-y ${readOnly ? 'bg-gray-100' : 'bg-white'} ${className}`}
  />
);

const BigIconBtn = ({ icon, label, onClick, badge }: { icon: React.ReactNode, label: string, onClick?: () => void, badge?: number }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-3 cursor-pointer group w-48">
     <div className="w-16 h-16 text-gray-700 group-hover:text-black transition-colors relative">
        {icon}
        {badge !== undefined && (
           <span className="absolute -top-2 -right-2 bg-[#00a65a] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
             {badge}
           </span>
        )}
     </div>
     <span className="text-sm text-gray-600 font-medium group-hover:text-black text-center">{label}</span>
  </div>
);

const SettingsSection = ({ title, version }: { title: string, version?: string }) => (
  <div className="flex justify-between items-end border-b border-gray-400 mb-4 pb-1">
     <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
       <QuestionMarkCircleIcon className="w-6 h-6 text-gray-800" />
       <span className="underline decoration-dotted decoration-gray-400">{title}</span>
     </h3>
     {version && <span className="text-xs text-gray-500 mb-1">软件版本: {version}</span>}
  </div>
);

const YesNoToggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center gap-4">
    <div 
      className="flex items-center gap-1 cursor-pointer"
      onClick={() => onChange(true)}
    >
      <div className={`w-4 h-4 border border-gray-500 ${value ? 'bg-[#333]' : 'bg-white'}`}></div>
      <span className="text-sm text-gray-700">是</span>
    </div>
    <div 
      className="flex items-center gap-1 cursor-pointer"
      onClick={() => onChange(false)}
    >
      <div className={`w-4 h-4 border border-gray-500 ${!value ? 'bg-[#333]' : 'bg-white'}`}></div>
      <span className="text-sm text-gray-700">否</span>
    </div>
  </div>
);

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, children }) => (
  <div className="flex items-start py-2">
    <div className="w-1/2 flex gap-2 pr-4">
       <QuestionMarkCircleIcon className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
       <span className="text-sm font-bold text-gray-700 underline decoration-dotted decoration-gray-400 leading-tight">
         {label}
       </span>
    </div>
    <div className="w-1/2 flex justify-start">
      {children}
    </div>
  </div>
);

const ActionBtn = ({ icon, onClick, active = false }: { icon: React.ReactNode, onClick?: () => void, active?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center rounded-sm transition-colors ${active ? 'bg-blue-800 text-white' : 'bg-[#333] hover:bg-black text-white'}`}
  >
    {icon}
  </button>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('START');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [basicData, setBasicData] = useState<AuditBasicData>(MOCK_BASIC_DATA);
  const [ncs, setNcs] = useState<NCItem[]>(DEFAULT_NCS);
  const [expandedNcId, setExpandedNcId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<{id: string, field: keyof NCItem} | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserManagement, setShowUserManagement] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);

  const [selectedProvider, setSelectedProvider] = useState<string>('glm');
  const [defaultProvider, setDefaultProvider] = useState<string>('glm');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [configuredProviders, setConfiguredProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
      setCurrentUser(authService.getCurrentUser());
    }
  }, []);

  useEffect(() => {
    const savedKeys = JSON.parse(localStorage.getItem('ai_api_keys') || '{}');
    const configured: Record<string, boolean> = {};
    Object.keys(savedKeys).forEach(key => {
      configured[key] = true;
    });
    setConfiguredProviders(configured);

    const aiSettings = JSON.parse(localStorage.getItem('ai_settings') || '{}');
    if (aiSettings.currentProvider) {
      setDefaultProvider(aiSettings.currentProvider);
      setSelectedProvider(aiSettings.currentProvider);
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const handleUpdateNC = (id: string, field: keyof NCItem, value: any) => {
    setNcs(prev => prev.map(nc => nc.id === id ? { ...nc, [field]: value } : nc));
  };

  const handleSettingChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAIAnalysis = async (nc: NCItem, section: SectionType, field: keyof NCItem) => {
    if (authService.isTrialUser()) {
      const remainingDays = authService.getRemainingDays();
      if (remainingDays <= 0) {
        alert('您的试用期限已到期，请升级到正式版本以继续使用AI分析功能');
        return;
      }
      alert(`您是试用用户，还剩 ${remainingDays} 天试用期。升级到正式版本可无限制使用AI分析功能`);
    }

    setIsGenerating(true);
    try {
      const result = await generateAIAnalysis(nc, section, undefined, basicData.closingMeetingDate);
      handleUpdateNC(nc.id, field, result);
    } catch (e) {
      alert("AI 服务错误: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsGenerating(false);
    }
  };

  const exportJSON = () => {
    if (authService.isTrialUser()) {
      const remainingDays = authService.getRemainingDays();
      if (remainingDays <= 0) {
        alert('您的试用期限已到期，请升级到正式版本以继续使用导出功能');
        return;
      }
      alert(`您是试用用户，还剩 ${remainingDays} 天试用期。升级到正式版本可无限制使用导出功能`);
    }

    const data = { basicData, ncs, settings };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CARA_Report_${basicData.reportNumber || basicData.orgName || 'Export'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (authService.isTrialUser()) {
      const remainingDays = authService.getRemainingDays();
      if (remainingDays <= 0) {
        alert('您的试用期限已到期，请升级到正式版本以继续使用导入功能');
        return;
      }
      alert(`您是试用用户，还剩 ${remainingDays} 天试用期。升级到正式版本可无限制使用导入功能`);
    }

    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = ''; // Reset
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const imported = JSON.parse(text);
        if (imported.ncs && Array.isArray(imported.ncs)) {
          setNcs(imported.ncs);
          setExpandedNcId(null);
          alert(`成功导入 ${imported.ncs.length} 条不符合项。`);
          setCurrentView('NC_LIST'); 
        } else if (Array.isArray(imported)) {
           setNcs(imported);
           setExpandedNcId(null);
           alert(`成功导入 ${imported.length} 条不符合项。`);
           setCurrentView('NC_LIST');
        } else {
          alert("无法识别的文件格式。");
        }
      } catch (err) {
        alert("无效的 JSON 文件");
      }
    };
    reader.readAsText(file);
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUploadTarget) return;
    
    // Mock upload: just add filename to the list
    const fileName = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    const { id, field } = currentUploadTarget;

    setNcs(prev => prev.map(nc => {
        if (nc.id === id) {
            const currentFiles = (nc[field] as string[]) || [];
            return { ...nc, [field]: [...currentFiles, fileName] };
        }
        return nc;
    }));
    
    event.target.value = ''; // Reset
    setCurrentUploadTarget(null);
  };

  const handleDeleteFile = (ncId: string, field: keyof NCItem, fileIndex: number) => {
    setNcs(prev => prev.map(nc => {
        if (nc.id === ncId) {
            const currentFiles = (nc[field] as string[]) || [];
            const newFiles = [...currentFiles];
            newFiles.splice(fileIndex, 1);
            return { ...nc, [field]: newFiles };
        }
        return nc;
    }));
  };

  const triggerFileUpload = (ncId: string, field: keyof NCItem) => {
    setCurrentUploadTarget({ id: ncId, field });
    attachmentInputRef.current?.click();
  };

  // AI 配置处理函数
  const handleValidateAndSave = async () => {
    if (!apiKeyInput.trim()) {
      alert('请输入 API Key');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // 保存到 localStorage
      const savedKeys = JSON.parse(localStorage.getItem('ai_api_keys') || '{}');
      savedKeys[selectedProvider] = {
        apiKey: apiKeyInput,
        enabled: true,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('ai_api_keys', JSON.stringify(savedKeys));

      // 更新配置状态
      setConfiguredProviders(prev => ({
        ...prev,
        [selectedProvider]: true
      }));

      logger.log('已保存 API Key for provider:', selectedProvider);
      logger.log('当前配置的服务商:', Object.keys(savedKeys));

      setSaveMessage('✅ API Key 已保存！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      logger.error('保存失败:', error);
      setSaveMessage('❌ 保存失败，请重试');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setApiKeyInput('');
    setSaveMessage('');
  };

  const handleSetDefaultProvider = (provider: string) => {
    setDefaultProvider(provider);
    // 保存到 localStorage
    const aiSettings = JSON.parse(localStorage.getItem('ai_settings') || '{}');
    aiSettings.currentProvider = provider;
    localStorage.setItem('ai_settings', JSON.stringify(aiSettings));
  };

  const toggleExpand = (id: string) => {
    setExpandedNcId(expandedNcId === id ? null : id);
  };

  return (
    <div className="flex h-screen w-full bg-gray-200 font-sans text-sm">
      <UpdateNotification />
      <ExpiryNotification />
      
      {/* 1. Sidebar (Dark) */}
      <aside className="w-64 bg-[#232d3b] text-white flex flex-col shrink-0">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 bg-[#1b2430]">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center font-bold text-white text-xs shadow-lg mr-3 border-2 border-white">
             IATF
           </div>
           <div className="font-bold text-gray-200">概览</div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div 
            onClick={() => setCurrentView('START')}
            className={`px-4 py-2 cursor-pointer font-bold transition-colors ${currentView === 'START' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            开始
          </div>
          
          <div className="mt-4 px-4 py-1 text-gray-400 text-xs font-bold uppercase">设置</div>
          <div 
            onClick={() => setCurrentView('SETTINGS_GENERAL')}
            className={`px-4 py-2 cursor-pointer transition-colors ${currentView === 'SETTINGS_GENERAL' ? 'bg-[#444] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            一般
          </div>
          <div
            onClick={() => setCurrentView('SETTINGS_DATABASE')}
            className={`px-4 py-2 cursor-pointer transition-colors ${currentView === 'SETTINGS_DATABASE' ? 'bg-[#444] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            数据库和备份设置
          </div>
          <div
            onClick={() => setCurrentView('SETTINGS_AI')}
            className={`px-4 py-2 cursor-pointer transition-colors ${currentView === 'SETTINGS_AI' ? 'bg-[#444] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            AI 配置
          </div>

          <div className="mt-4 px-4 py-1 text-gray-400 text-xs font-bold uppercase">不符合项管理</div>
          <div 
            onClick={() => setCurrentView('NC_LIST')}
            className={`px-4 py-2 cursor-pointer flex justify-between items-center transition-all ${
              currentView === 'NC_LIST' 
                ? 'bg-[#00a65a] text-white border-l-4 border-[#00a65a]' 
                : 'text-gray-400 hover:text-white border-l-4 border-transparent'
            }`}
          >
            <span>不符合项和措施</span>
            <span className={`text-xs font-bold px-1.5 rounded-sm ${currentView === 'NC_LIST' ? 'bg-white text-[#00a65a]' : 'bg-[#00a65a] text-white'}`}>
              {ncs.length}
            </span>
          </div>
          <div 
            onClick={() => setCurrentView('ALL_REPORTS')}
            className={`px-4 py-2 cursor-pointer transition-colors ${currentView === 'ALL_REPORTS' ? 'bg-[#00a65a] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            所有不符合管理报告
          </div>

          <div className="mt-4 px-4 py-1 text-gray-400 text-xs font-bold uppercase">用户管理</div>
          <div 
            onClick={() => setShowUserManagement(true)}
            className={`px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors ${showUserManagement ? 'bg-[#444] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>用户管理</span>
          </div>
          <div 
            onClick={() => setShowChangePassword(true)}
            className={`px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors ${showChangePassword ? 'bg-[#444] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <LockClosedIcon className="w-4 h-4" />
            <span>修改密码</span>
          </div>
          {authService.isAdmin() && (
            <div 
              onClick={() => setShowAdminDashboard(true)}
              className={`px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors ${showAdminDashboard ? 'bg-[#444] text-white' : 'text-red-400 hover:text-red-300'}`}
            >
              <UserIcon className="w-4 h-4" />
              <span>系统管理员</span>
            </div>
          )}
          <div 
            onClick={handleLogout}
            className="px-4 py-2 cursor-pointer flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>退出登录</span>
          </div>

          <div className="mt-4 px-4 py-1 text-gray-400 text-xs font-bold uppercase">信息</div>
          <div className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer">工作指示</div>
          <div className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer">帮助维基</div>
          <div className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer">视频教程</div>
          <div className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer">支持</div>
          <div className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer">版本说明</div>
          <div className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer">数据隐私</div>
        </nav>
      </aside>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#232d3b] text-white flex items-center justify-center px-6 shadow-md z-10 relative shrink-0">
          <h1 className="text-xl font-medium tracking-wide uppercase">
            IATF NC CARA (COMMON AUDIT REPORT APPLICATION)
            <div className="text-sm text-gray-400 text-center font-normal normal-case">不符合项管理</div>
          </h1>
        </header>

        {/* --- VIEW: START PAGE --- */}
        {currentView === 'START' && (
          <main className="flex-1 overflow-y-auto p-8 font-sans">
            <div className="max-w-6xl mx-auto">
               <div className="flex justify-between items-end border-b border-gray-300 pb-3 mb-6">
                 <h2 className="text-2xl font-bold text-gray-700">欢迎来到IATF NC CARA - 组织Nc管理应用程序</h2>
                 <span className="text-sm font-bold text-gray-800">软件版本: 1.5.3</span>
               </div>

               {/* Instructions */}
               <div className="mb-10">
                  <div className="flex items-center gap-1 mb-2">
                    <ChevronDownIcon className="w-5 h-5 text-gray-800" />
                    <h3 className="text-xl text-gray-600 font-normal">说明</h3>
                  </div>
                  <div className="bg-gray-100/50 p-4 text-sm text-gray-700 space-y-3">
                     <p className="font-bold">
                       Cara Reporting Tool - Nc Management 使用浏览器的数据库和缓存 (浏览器历史记录)。无论使用的版本如何，您的所有数据都只能在此浏览器中使用上面的 url 在本地可用。在创建最新备份之前不要清除浏览器历史记录。您可以立即使用该工具。出于数据安全原因，您应该进行定期备份。该工具具有自动备份功能，可在 <span className="underline decoration-dotted cursor-pointer hover:text-blue-600">{"\"Settings→Backup & Database\""}</span> 中编辑设置。没有数据发送到服务器。只要您不清除浏览器历史记录，即使没有 Internet 连接，该工具也可以正常工作。
                     </p>
                     <ol className="list-decimal pl-5 space-y-1">
                        <li>请导入发送给您的 NC 管理报告。导入后，您将在 All NC Management Reports 中找到它。</li>
                        <li>您可以查看审核员发送给您的所有数据，并访问 NC Actions 部分以输入您的纠正措施和分析数据。您可以随时将 pdf（最大 5 MB）和 jpg 图像（自动压缩后最大 5 MB）附加到 Nc 管理报告中作为证明。</li>
                        <li>完成输入后，您可以使用“导出以供审核”按钮提取您的条目并将其发送回审核员</li>
                     </ol>
                  </div>
               </div>

               {/* NC Management Section */}
               <div className="mb-12">
                  <h3 className="text-xl text-gray-600 font-normal mb-2">不符合项管理</h3>
                  <div className="border-b-2 border-gray-400 mb-8 pb-1 text-right">
                     <span className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                        {basicData.orgName}.{basicData.orgName.split(' ')[0]} {basicData.startDate}-{basicData.endDate}
                     </span>
                  </div>
                  
                  <div className="flex justify-around items-start">
                     <BigIconBtn 
                       icon={<ListBulletIcon className="w-full h-full" />} 
                       label={`报告列表 (${ncs.length})`} 
                     />
                     <BigIconBtn 
                       icon={<QueueListIcon className="w-full h-full" />} 
                       label="不符合项管理" 
                       onClick={() => setCurrentView('NC_LIST')}
                     />
                     <BigIconBtn 
                       icon={<PrinterIcon className="w-full h-full" />} 
                       label="打印" 
                     />
                     <BigIconBtn 
                       icon={<ArrowDownTrayIcon className="w-full h-full" />} 
                       label="将报告另存为json文件" 
                       onClick={exportJSON}
                     />
                  </div>
               </div>

               {/* Data Management Section */}
               <div className="mb-20">
                  <h3 className="text-xl text-gray-600 font-normal mb-6">数据管理</h3>
                  <div className="flex justify-start gap-24 pl-12">
                     <BigIconBtn 
                       icon={<ArrowUpTrayIcon className="w-full h-full" />} 
                       label="报告/备份导入" 
                       onClick={() => fileInputRef.current?.click()}
                     />
                     <BigIconBtn 
                       icon={<CircleStackIcon className="w-full h-full" />} 
                       label="保存所有报告 上一次:" 
                     />
                  </div>
               </div>

               {/* Footer */}
               <div className="border-t border-gray-300 pt-4 text-xs text-gray-500">
                  © 2019-2025 by IATF. All rights reserved. Any use of scripts and libraries which are not part of an open source license for other purposes is prohibited.
               </div>
            </div>
            {/* Hidden Input for Import */}
            <input type="file" ref={fileInputRef} onChange={importJSON} className="hidden" accept=".json" />
          </main>
        )}

        {/* --- VIEW: SETTINGS GENERAL --- */}
        {currentView === 'SETTINGS_GENERAL' && (
           <main className="flex-1 overflow-y-auto p-6 font-sans bg-gray-200">
             <div className="max-w-6xl mx-auto">
               <h2 className="text-2xl font-bold text-gray-700 mb-4 underline decoration-dotted decoration-gray-400">设置</h2>
               
               {/* Language & Print Settings */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm mb-4">
                 <SettingsSection title="语言&打印设置" version="1.5.3" />
                 
                 <SettingRow label="语言">
                   <select 
                     className="w-1/2 border border-gray-300 p-1 text-sm bg-gray-50"
                     value={settings.language}
                     onChange={(e) => handleSettingChange('language', e.target.value)}
                   >
                     <option value="Chinese">Chinese</option>
                     <option value="English">English</option>
                   </select>
                 </SettingRow>
                 
                 <SettingRow label="*在打印中激活日文和中文字体">
                    <YesNoToggle value={settings.printJaZh} onChange={(v) => handleSettingChange('printJaZh', v)} />
                 </SettingRow>

                 <SettingRow label="*在打印中激活韩语字体">
                    <YesNoToggle value={settings.printKo} onChange={(v) => handleSettingChange('printKo', v)} />
                 </SettingRow>

                 <SettingRow label="*您想在报告中的审核结果后打印所有添加的图像吗?">
                    <YesNoToggle value={settings.printImages} onChange={(v) => handleSettingChange('printImages', v)} />
                 </SettingRow>
               </div>

               {/* Encryption Settings */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm mb-4">
                 <SettingsSection title="加密设置" />
                 
                 <SettingRow label="为所有json和xml格式的CARA文件启用加密">
                    <YesNoToggle value={settings.encryption} onChange={(v) => handleSettingChange('encryption', v)} />
                 </SettingRow>

                 <SettingRow label="为所有文件定义默认密码">
                   <input 
                     type="password" 
                     className="w-2/3 border border-gray-300 p-2 text-sm bg-gray-100" 
                     value={settings.defaultPassword}
                     onChange={(e) => handleSettingChange('defaultPassword', e.target.value)}
                     disabled={!settings.encryption}
                   />
                 </SettingRow>
               </div>

               {/* Application Settings */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm mb-4">
                 <SettingsSection title="应用程序设置" />
                 
                 <SettingRow label="更改标题和菜单颜色为蓝色">
                    <YesNoToggle value={settings.blueHeader} onChange={(v) => handleSettingChange('blueHeader', v)} />
                 </SettingRow>

                 <SettingRow label="将问题中的字段结果调整为文本长度">
                    <YesNoToggle value={settings.adjustTextLength} onChange={(v) => handleSettingChange('adjustTextLength', v)} />
                 </SettingRow>

                 <SettingRow label="始终打开第一个附件pdf">
                    <YesNoToggle value={settings.openFirstPdf} onChange={(v) => handleSettingChange('openFirstPdf', v)} />
                 </SettingRow>

                 <SettingRow label="在所有多元素部分默认隐藏过滤功能">
                    <YesNoToggle value={settings.hideFilter} onChange={(v) => handleSettingChange('hideFilter', v)} />
                 </SettingRow>

                 <SettingRow label="在第二次客户数据导入时隐藏以前的版本数据">
                    <YesNoToggle value={settings.hideOldVersions} onChange={(v) => handleSettingChange('hideOldVersions', v)} />
                 </SettingRow>

                 <SettingRow label="班次时间智能输入处于在用状态，用于支持更快地设置班次名称和时间">
                    <YesNoToggle value={settings.smartShiftInput} onChange={(v) => handleSettingChange('smartShiftInput', v)} />
                 </SettingRow>
               </div>

               {/* API Settings */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm mb-8">
                 <SettingRow label="CB REST-API数据交换... 用于 BSI">
                   <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                       <QuestionMarkCircleIcon className="w-4 h-4 text-gray-700" />
                       <span className="text-sm font-bold text-gray-700 underline decoration-dotted decoration-gray-400">是主动的吗?</span>
                     </div>
                     <YesNoToggle value={settings.apiExchange} onChange={(v) => handleSettingChange('apiExchange', v)} />
                   </div>
                 </SettingRow>
               </div>

             </div>
           </main>
        )}

        {/* --- VIEW: SETTINGS AI --- */}
        {currentView === 'SETTINGS_AI' && (
           <main className="flex-1 overflow-y-auto p-6 font-sans bg-gray-200">
             <div className="max-w-6xl mx-auto">
               <h2 className="text-2xl font-bold text-gray-700 mb-4 underline decoration-dotted decoration-gray-400">AI 配置</h2>

               {/* AI Provider Selection */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm mb-4">
                 <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-dotted border-gray-300 pb-2">选择 AI 服务商</h3>

                 <div className="space-y-3">
                   {/* Claude */}
                   <div className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">Claude (Anthropic)</div>
                       <div className="text-xs text-gray-500">claude-3-5-sonnet, claude-3-5-haiku</div>
                     </div>
                     <select className="border border-gray-300 p-2 text-sm rounded">
                       <option value="">未配置</option>
                       <option value="sonnet">Claude 3.5 Sonnet</option>
                       <option value="haiku">Claude 3.5 Haiku</option>
                     </select>
                   </div>

                   {/* DeepSeek */}
                   <div className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">DeepSeek</div>
                       <div className="text-xs text-gray-500">deepseek-chat, deepseek-coder</div>
                     </div>
                     <select className="border border-gray-300 p-2 text-sm rounded">
                       <option value="">未配置</option>
                       <option value="chat">DeepSeek Chat</option>
                       <option value="coder">DeepSeek Coder</option>
                     </select>
                   </div>

                   {/* Gemini */}
                   <div className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">Google Gemini</div>
                       <div className="text-xs text-gray-500">gemini-2.0-flash, gemini-1.5-pro</div>
                     </div>
                     <select className="border border-gray-300 p-2 text-sm rounded">
                       <option value="">未配置</option>
                       <option value="flash">Gemini 2.0 Flash</option>
                       <option value="pro">Gemini 1.5 Pro</option>
                     </select>
                   </div>

                   {/* GLM (智谱 AI) */}
                   <div className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">智谱 GLM (GLM-4.7)</div>
                       <div className="text-xs text-gray-500">glm-4-flash, glm-4-plus, glm-4-0520</div>
                     </div>
                     <select className="border border-gray-300 p-2 text-sm rounded">
                       <option value="">未配置</option>
                       <option value="glm-4-flash">GLM-4 Flash</option>
                       <option value="glm-4-plus">GLM-4 Plus</option>
                       <option value="glm-4-0520">GLM-4 0520</option>
                     </select>
                   </div>

                   {/* 火山引擎 */}
                   <div className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">火山引擎</div>
                       <div className="text-xs text-gray-500">doubao-pro-32k, doubao-lite</div>
                     </div>
                     <select className="border border-gray-300 p-2 text-sm rounded">
                       <option value="">未配置</option>
                       <option value="pro">豆包 Pro 32K</option>
                       <option value="lite">豆包 Lite</option>
                     </select>
                   </div>

                   {/* 硅基流动 */}
                   <div className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">硅基流动</div>
                       <div className="text-xs text-gray-500">Qwen2.5-72B, DeepSeek-V2.5</div>
                     </div>
                     <select className="border border-gray-300 p-2 text-sm rounded">
                       <option value="">未配置</option>
                       <option value="qwen">Qwen2.5 72B</option>
                       <option value="deepseek">DeepSeek V2.5</option>
                     </select>
                   </div>
                 </div>
               </div>

               {/* Default Provider Selection */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm mb-4">
                 <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-dotted border-gray-300 pb-2">默认 AI 服务商</h3>

                 <div className="space-y-2">
                   <div className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleSetDefaultProvider('glm')}>
                     <input
                       type="radio"
                       name="defaultProvider"
                       checked={defaultProvider === 'glm'}
                       onChange={() => handleSetDefaultProvider('glm')}
                       className="w-4 h-4"
                     />
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">智谱 GLM (GLM-4.7)</div>
                       <div className="text-xs text-gray-500">推荐 - 性价比高，中文理解能力强</div>
                     </div>
                     {defaultProvider === 'glm' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">当前默认</span>}
                   </div>

                   <div className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleSetDefaultProvider('gemini')}>
                     <input
                       type="radio"
                       name="defaultProvider"
                       checked={defaultProvider === 'gemini'}
                       onChange={() => handleSetDefaultProvider('gemini')}
                       className="w-4 h-4"
                     />
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">Google Gemini</div>
                       <div className="text-xs text-gray-500">快速响应，免费额度</div>
                     </div>
                     {defaultProvider === 'gemini' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">当前默认</span>}
                   </div>

                   <div className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleSetDefaultProvider('claude')}>
                     <input
                       type="radio"
                       name="defaultProvider"
                       checked={defaultProvider === 'claude'}
                       onChange={() => handleSetDefaultProvider('claude')}
                       className="w-4 h-4"
                     />
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">Claude (Anthropic)</div>
                       <div className="text-xs text-gray-500">高质量输出，专业分析</div>
                     </div>
                     {defaultProvider === 'claude' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">当前默认</span>}
                   </div>

                   <div className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleSetDefaultProvider('deepseek')}>
                     <input
                       type="radio"
                       name="defaultProvider"
                       checked={defaultProvider === 'deepseek'}
                       onChange={() => handleSetDefaultProvider('deepseek')}
                       className="w-4 h-4"
                     />
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">DeepSeek</div>
                       <div className="text-xs text-gray-500">代码生成能力强</div>
                     </div>
                     {defaultProvider === 'deepseek' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">当前默认</span>}
                   </div>

                   <div className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleSetDefaultProvider('volcengine')}>
                     <input
                       type="radio"
                       name="defaultProvider"
                       checked={defaultProvider === 'volcengine'}
                       onChange={() => handleSetDefaultProvider('volcengine')}
                       className="w-4 h-4"
                     />
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">火山引擎</div>
                       <div className="text-xs text-gray-500">字节跳动出品</div>
                     </div>
                     {defaultProvider === 'volcengine' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">当前默认</span>}
                   </div>

                   <div className="flex items-center gap-2 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleSetDefaultProvider('siliconflow')}>
                     <input
                       type="radio"
                       name="defaultProvider"
                       checked={defaultProvider === 'siliconflow'}
                       onChange={() => handleSetDefaultProvider('siliconflow')}
                       className="w-4 h-4"
                     />
                     <div className="flex-1">
                       <div className="font-bold text-gray-800">硅基流动</div>
                       <div className="text-xs text-gray-500">多模型支持</div>
                     </div>
                     {defaultProvider === 'siliconflow' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">当前默认</span>}
                   </div>
                 </div>
               </div>

               {/* API Key Configuration */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm mb-4">
                 <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-dotted border-gray-300 pb-2">API Key 配置</h3>

                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">选择服务商</label>
                     <select
                       className="w-full border border-gray-300 p-2 text-sm rounded bg-gray-50"
                       value={selectedProvider}
                       onChange={(e) => setSelectedProvider(e.target.value)}
                     >
                       <option value="glm">智谱 GLM</option>
                       <option value="claude">Claude</option>
                       <option value="deepseek">DeepSeek</option>
                       <option value="gemini">Google Gemini</option>
                       <option value="volcengine">火山引擎</option>
                       <option value="siliconflow">硅基流动</option>
                     </select>
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">API Key</label>
                     <input
                       type="password"
                       placeholder="请输入 API Key"
                       className="w-full border border-gray-300 p-2 text-sm rounded bg-gray-50"
                       value={apiKeyInput}
                       onChange={(e) => setApiKeyInput(e.target.value)}
                     />
                   </div>

                   {saveMessage && (
                     <div className={`p-3 rounded text-sm ${saveMessage.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                       {saveMessage}
                     </div>
                   )}

                   <div className="flex gap-2">
                     <button
                       onClick={handleValidateAndSave}
                       disabled={isSaving || !apiKeyInput.trim()}
                       className={`px-4 py-2 rounded text-sm font-bold ${
                         isSaving || !apiKeyInput.trim()
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                           : 'bg-[#00a65a] hover:bg-[#008f4d] text-white'
                       }`}
                     >
                       {isSaving ? '验证中...' : '验证并保存'}
                     </button>
                     <button
                       onClick={handleClear}
                       className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm font-bold"
                     >
                       清除
                     </button>
                   </div>

                   <div className="bg-blue-50 border border-blue-200 rounded p-3">
                     <div className="flex items-start gap-2">
                       <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                       <div className="text-sm text-gray-700">
                         <p className="font-bold mb-1">获取智谱 GLM API Key：</p>
                         <ol className="list-decimal pl-5 space-y-1">
                           <li>访问 <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://open.bigmodel.cn/</a></li>
                           <li>注册并登录账号</li>
                           <li>进入"API Keys"页面创建新的 API Key</li>
                           <li>复制 API Key 并粘贴到上方输入框</li>
                         </ol>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Current Provider Status */}
               <div className="bg-white p-4 border border-gray-300 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-dotted border-gray-300 pb-2">当前状态</h3>

                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                     <span className="text-gray-700">默认服务商:</span>
                     <span className="font-bold text-gray-900">
                       {defaultProvider === 'glm' ? '智谱 GLM' :
                        defaultProvider === 'claude' ? 'Claude' :
                        defaultProvider === 'deepseek' ? 'DeepSeek' :
                        defaultProvider === 'gemini' ? 'Google Gemini' :
                        defaultProvider === 'volcengine' ? '火山引擎' :
                        defaultProvider === 'siliconflow' ? '硅基流动' : defaultProvider}
                     </span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                     <span className="text-gray-700">配置状态:</span>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                       configuredProviders[defaultProvider]
                         ? 'bg-green-100 text-green-800'
                         : 'bg-yellow-100 text-yellow-800'
                     }`}>
                       {configuredProviders[defaultProvider] ? '已配置' : '未配置'}
                     </span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                     <span className="text-gray-700">模型:</span>
                     <span className="font-bold text-gray-900">
                       {defaultProvider === 'glm' ? 'glm-4-flash' :
                        defaultProvider === 'claude' ? 'claude-3-5-sonnet' :
                        defaultProvider === 'deepseek' ? 'deepseek-chat' :
                        defaultProvider === 'gemini' ? 'gemini-2.0-flash' :
                        defaultProvider === 'volcengine' ? 'doubao-pro-32k' :
                        defaultProvider === 'siliconflow' ? 'Qwen2.5-72B' : 'N/A'}
                     </span>
                   </div>
                 </div>
               </div>

             </div>
           </main>
        )}

        {/* --- VIEW: ALL REPORTS --- */}
        {currentView === 'ALL_REPORTS' && (
            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center bg-gray-200 pb-2">
                    <h2 className="text-2xl font-bold text-gray-700">所有报告</h2>
                    <button className="bg-[#333] hover:bg-black text-white p-2 rounded shadow">
                        <ArrowUpTrayIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter */}
                <div className="bg-white p-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-dotted border-gray-300 pb-2 mb-4">
                        <h3 className="text-lg font-bold text-gray-700 underline decoration-dotted decoration-gray-400">过滤</h3>
                        <button className="bg-[#333] hover:bg-black text-white p-2 rounded shadow">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">报告名称/编号</label>
                            <input type="text" className="w-full border border-gray-300 p-1 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">组织名称</label>
                            <input type="text" className="w-full border border-gray-300 p-1 text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">认证机构证书编号</label>
                            <input type="text" className="w-full border border-gray-300 p-1 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">审核开始日期 (也包括没有开始日期的审核)</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="开始" className="w-1/2 border border-gray-300 p-1 text-sm" />
                                <input type="text" placeholder="结束" className="w-1/2 border border-gray-300 p-1 text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Card */}
                <div className="bg-white shadow-sm">
                    {/* Card Header */}
                    <div className="flex justify-between items-start p-2 bg-white">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {basicData.reportNumber && <div className="font-bold text-gray-800 text-sm">报告名称/编号 : {basicData.reportNumber}</div>}
                            {basicData.cbId && <div className="font-bold text-gray-800 text-sm">认证机构标识号 : {basicData.cbId}</div>}
                        </div>
                        <button className="bg-[#333] hover:bg-black text-white p-2 rounded shadow ml-2">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-2 border-t border-gray-100 flex flex-wrap">
                        <div className="w-1/2 pr-4 space-y-1 text-xs text-gray-600">
                            {basicData.reportNumber && <div>报告名称/编号: {basicData.reportNumber}</div>}
                            {basicData.cbId && <div>认证机构标识号: {basicData.cbId}</div>}
                            <div>组织名称: {basicData.orgName}</div>
                            <div className="mt-4 text-gray-400">唯一报告编号: 72fe7d7b-8e94-42cb-89bc-5b1d21d6da0e</div>
                        </div>
                        <div className="w-1/4 px-4 space-y-1 text-xs text-gray-600 border-l border-gray-100">
                            <div>审核日期: {basicData.startDate} - {basicData.endDate}</div>
                            <div>审核类型: <span className="underline decoration-dotted">{basicData.auditType}</span></div>
                        </div>
                        <div className="w-1/4 pl-4 flex flex-col items-end gap-2">
                            <div className="flex gap-1">
                                <button className="bg-[#333] hover:bg-black text-white p-2 rounded shadow">
                                    <ListBulletIcon className="w-4 h-4" />
                                </button>
                                <button className="bg-[#333] hover:bg-black text-white p-2 rounded shadow">
                                    <PrinterIcon className="w-4 h-4" />
                                </button>
                                <button className="bg-[#333] hover:bg-black text-white px-3 py-1 rounded shadow text-xs font-bold flex items-center gap-1">
                                    <ArrowDownTrayIcon className="w-3 h-3" /> (JSON)
                                </button>
                            </div>
                            <button className="bg-[#333] hover:bg-black text-white px-3 py-1 rounded shadow text-xs font-bold flex items-center gap-1">
                                    <ArrowDownTrayIcon className="w-3 h-3" /> (Xml)
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        )}

        {/* --- VIEW: NC LIST --- */}
        {currentView === 'NC_LIST' && (
          <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-200">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-700">不符合项和措施</h2>
               <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={importJSON} className="hidden" accept=".json" />
                  <button 
                    onClick={exportJSON}
                    className="bg-[#333] hover:bg-black text-white px-3 py-1.5 rounded shadow text-xs font-bold flex items-center gap-1"
                  >
                     <ArrowDownTrayIcon className="w-4 h-4" /> 导出报告
                  </button>
                  <button className="bg-[#333] hover:bg-black text-white px-3 py-1.5 rounded shadow text-xs font-bold flex items-center gap-1">
                     <CircleStackIcon className="w-4 h-4" /> 保存所有报告
                  </button>
                  <button className="bg-[#333] hover:bg-black text-white p-1.5 rounded shadow">
                     <InformationCircleIcon className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Audit Basic Data Panel */}
            <div className="bg-white p-4 rounded shadow-sm border border-gray-300">
               <div className="border-b border-dotted border-gray-400 mb-4 pb-1 flex justify-between items-center">
                 <h3 className="font-bold text-gray-800 text-base underline decoration-dotted decoration-gray-400">审核基本数据</h3>
                 <button
                   onClick={() => {
                     setBasicData({
                       reportNumber: '',
                       auditType: '',
                       orgName: '',
                       startDate: '',
                       endDate: '',
                       closingMeetingDate: '',
                       cbId: '',
                       totalNCs: ncs.length
                     });
                   }}
                   className="text-xs text-blue-600 hover:text-blue-800 underline"
                 >
                   清空数据
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label required text="审核类型" /></div>
                   <div className="col-span-8">
                     <Input
                       value={basicData.auditType}
                       onChange={(e) => setBasicData(prev => ({ ...prev, auditType: e.target.value }))}
                       placeholder="例如：监督审核"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label required text="组织名称" /></div>
                   <div className="col-span-8">
                     <Input
                       value={basicData.orgName}
                       onChange={(e) => setBasicData(prev => ({ ...prev, orgName: e.target.value }))}
                       placeholder="例如：某某汽车零部件有限公司"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label text="报告名称/编号" /></div>
                   <div className="col-span-8">
                     <Input
                       value={basicData.reportNumber}
                       onChange={(e) => setBasicData(prev => ({ ...prev, reportNumber: e.target.value }))}
                       placeholder="例如：IATF-2024-001"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label text="认证机构标识号" /></div>
                   <div className="col-span-8">
                     <Input
                       value={basicData.cbId}
                       onChange={(e) => setBasicData(prev => ({ ...prev, cbId: e.target.value }))}
                       placeholder="例如：5-ADP-11-09-0623"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label required text="审核开始日期" /></div>
                   <div className="col-span-8">
                     <Input
                       type="date"
                       value={basicData.startDate}
                       onChange={(e) => setBasicData(prev => ({ ...prev, startDate: e.target.value }))}
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label required text="审核结束日期" /></div>
                   <div className="col-span-8">
                     <Input
                       type="date"
                       value={basicData.endDate}
                       onChange={(e) => setBasicData(prev => ({ ...prev, endDate: e.target.value }))}
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label required text="末次会议日期" /></div>
                   <div className="col-span-8">
                     <Input
                       type="date"
                       value={basicData.closingMeetingDate}
                       onChange={(e) => setBasicData(prev => ({ ...prev, closingMeetingDate: e.target.value }))}
                       placeholder="例如：2024-10-31"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label text="获得并保持IATF认可的规则" /></div>
                   <div className="col-span-8">
                     <select
                       className="w-full border border-gray-300 p-1 text-sm"
                       value="第5版, 2016年11月1日"
                       disabled
                     >
                        <option>第5版, 2016年11月1日</option>
                     </select>
                   </div>
                 </div>
                  <div className="grid grid-cols-12 items-center">
                   <div className="col-span-4"><Label required text="不符合项总数" /></div>
                   <div className="col-span-8"><Input value={ncs.length} readOnly className="bg-gray-100" /></div>
                 </div>
               </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-300 flex justify-between items-center gap-2 mt-4">
               <div className="flex items-center gap-2">
                 <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                 <QuestionMarkCircleIcon className="w-5 h-5 text-gray-600" />
                 <span className="font-bold text-gray-700 underline decoration-dotted">过滤</span>
               </div>
               <button className="bg-[#333] hover:bg-black text-white p-1.5 rounded-sm">
                 <TrashIcon className="w-4 h-4" />
               </button>
            </div>

            {/* NC List Section */}
            <div className="flex items-center gap-2 mt-2 mb-1">
               <QuestionMarkCircleIcon className="w-5 h-5 text-gray-600" />
               <h3 className="font-bold text-gray-700 underline decoration-dotted text-lg">不符合项和措施</h3>
            </div>

            <div className="space-y-4 pb-20">
               {ncs.map(nc => {
                 const isExpanded = expandedNcId === nc.id;
                 return (
                   <div key={nc.id} className="bg-[#daeefc] border border-blue-200">
                     {/* Summary Row - New Compact Grid Layout */}
                     <div className="p-2 grid grid-cols-12 gap-2 text-xs">
                        
                        <div className="col-span-1">
                          <Label text="NC编号" />
                          <Input value={nc.ncNumber} readOnly className="bg-gray-100" />
                        </div>
                        <div className="col-span-2">
                          <Label text="不符合项识别号" />
                          <Input value={nc.identifier} readOnly className="bg-gray-100" />
                        </div>
                        <div className="col-span-2">
                           <Label text="标准" />
                           <Input value={nc.standard} readOnly className="bg-gray-100" />
                        </div>
                        <div className="col-span-2">
                           <Label text="标准条款" />
                           <Input value={nc.standardClause} readOnly className="bg-gray-100" />
                        </div>
                        
                        {/* Action Buttons Group */}
                        <div className="col-span-5 flex items-end justify-end gap-1 pb-1">
                           <ActionBtn icon={<ArrowUpIcon className="w-4 h-4"/>} />
                           <ActionBtn icon={<ArrowDownTrayIcon className="w-4 h-4 rotate-180"/>} />
                           <ActionBtn icon={<PencilIcon className="w-4 h-4"/>} onClick={() => toggleExpand(nc.id)} active={isExpanded} />
                           <ActionBtn icon={<DocumentArrowDownIcon className="w-4 h-4"/>} />
                           <ActionBtn icon={<InformationCircleIcon className="w-5 h-5"/>} />
                           <div className="w-8 h-8 bg-[#00a65a] text-white flex items-center justify-center rounded-sm font-bold">
                                0
                           </div>
                        </div>

                        <div className="col-span-3">
                          <Label text="分类" />
                          <Input value={nc.classification === 'Major' ? '严重的' : '一般的'} readOnly className="bg-gray-100" />
                        </div>
                        <div className="col-span-2"></div> {/* Spacer */}
                        <div className="col-span-2">
                           <Label text="截止日期上限60人日" />
                           <Input value={nc.deadline} readOnly className="bg-gray-100" />
                        </div>
                        <div className="col-span-3">
                             <Label text="过程中观察到的不符合项" />
                             <Input value={nc.process} readOnly className="bg-gray-100" />
                        </div>
                        <div className="col-span-2">
                             <Label text="评审员决定" />
                             <Input value={nc.auditorDecision} readOnly className="bg-gray-100" />
                        </div>
                     </div>

                     {/* Expanded Detail View - DETAILED FORM */}
                     {isExpanded && (
                       <div className="bg-white border-t border-gray-300 p-4">
                          
                          {/* Section Header: Filled by CB Auditor */}
                          <div className="text-center mb-4">
                             <h3 className="text-blue-900 text-lg border-b-2 border-dotted border-blue-900 inline-block font-medium">由认证机构审核员填写</h3>
                             <h4 className="text-left font-bold text-gray-700 text-sm mt-4 border-b border-dotted border-gray-400 pb-1 mb-2">NC标题</h4>
                          </div>

                          {/* Auditor Fields - Editable */}
                          <div className="space-y-4 text-sm mb-8">
                             <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="NC编号" /></div>
                                <div className="col-span-4"><Input value={nc.ncNumber} onChange={(e) => handleUpdateNC(nc.id, 'ncNumber', e.target.value)} /></div>
                                <div className="col-span-2 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="不符合项识别号" /></div>
                                <div className="col-span-4"><Input value={nc.identifier} onChange={(e) => handleUpdateNC(nc.id, 'identifier', e.target.value)} /></div>
                             </div>

                             <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="分类" /></div>
                                <div className="col-span-4 flex gap-4">
                                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name={`classification-${nc.id}`} checked={nc.classification === 'Major'} onChange={() => handleUpdateNC(nc.id, 'classification', 'Major')} className="mr-1"/> 严重的</label>
                                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name={`classification-${nc.id}`} checked={nc.classification === 'Minor'} onChange={() => handleUpdateNC(nc.id, 'classification', 'Minor')} className="mr-1"/> 一般的</label>
                                </div>
                             </div>

                             <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="截止日期上限60人日" /></div>
                                <div className="col-span-4"><Input value={nc.deadline} onChange={(e) => handleUpdateNC(nc.id, 'deadline', e.target.value)} /></div>
                             </div>
                             
                             <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="过程中观察到的不符合项" /></div>
                                <div className="col-span-10"><Input value={nc.process} onChange={(e) => handleUpdateNC(nc.id, 'process', e.target.value)} /></div>
                             </div>

                             <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="标准条款" /></div>
                                <div className="col-span-4"><Input value={nc.standardClause} onChange={(e) => handleUpdateNC(nc.id, 'standardClause', e.target.value)} /></div>
                                <div className="col-span-6"><Input value="生产和服务提供的控制" onChange={(e) => handleUpdateNC(nc.id, 'processDescription', e.target.value)} /></div>
                             </div>

                             <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="标准" /></div>
                                <div className="col-span-4 flex gap-4 text-xs">
                                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={nc.standard.includes('ISO 9001:2015')} onChange={(e) => {
                                    const newStandard = e.target.checked ? 'ISO 9001:2015 和 IATF 16949' : 'IATF 16949:2016';
                                    handleUpdateNC(nc.id, 'standard', newStandard);
                                  }} className="mr-1"/> ISO 9001:2015</label>
                                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={nc.standard.includes('IATF 16949:2016')} onChange={(e) => {
                                    const newStandard = e.target.checked ? 'ISO 9001:2015 和 IATF 16949' : 'ISO 9001:2015';
                                    handleUpdateNC(nc.id, 'standard', newStandard);
                                  }} className="mr-1"/> IATF 16949:2016</label>
                                </div>
                             </div>

                             <div>
                                <div className="flex items-center gap-1 mb-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="需求" /></div>
                                <TextArea value={nc.requirement} onChange={(e) => handleUpdateNC(nc.id, 'requirement', e.target.value)} className="min-h-[60px]" />
                             </div>

                             <div>
                                <div className="flex items-center gap-1 mb-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="不符合声明" /></div>
                                <TextArea value={nc.statement} onChange={(e) => handleUpdateNC(nc.id, 'statement', e.target.value)} className="min-h-[60px]" />
                             </div>

                             <div>
                                <div className="flex items-center gap-1 mb-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="客观证据" /></div>
                                <TextArea value={nc.evidence} onChange={(e) => handleUpdateNC(nc.id, 'evidence', e.target.value)} className="min-h-[80px]" />
                             </div>

                             <div>
                                <div className="flex items-center gap-1 mb-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="分类理由" /></div>
                                <TextArea value={nc.rationale || ''} onChange={(e) => handleUpdateNC(nc.id, 'rationale', e.target.value)} className="min-h-[60px]" />
                             </div>

                             <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                   <div className="col-span-4 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="审核员名字" /></div>
                                   <div className="col-span-8"><Input value={nc.auditorName} onChange={(e) => handleUpdateNC(nc.id, 'auditorName', e.target.value)} /></div>
                                </div>
                                <div className="grid grid-cols-12 gap-2 items-center">
                                   <div className="col-span-4 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="审核员编号" /></div>
                                   <div className="col-span-8"><Input value={nc.auditorId || ''} onChange={(e) => handleUpdateNC(nc.id, 'auditorId', e.target.value)} /></div>
                                </div>
                                <div className="grid grid-cols-12 gap-2 items-center">
                                   <div className="col-span-4 flex items-center gap-1"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-700"/><Label text="审核未次会议日期" /></div>
                                   <div className="col-span-8"><Input value={basicData.endDate} onChange={(e) => setBasicData({...basicData, endDate: e.target.value})} /></div>
                                </div>
                             </div>
                          </div>

                          {/* Organization Header */}
                          <div className="text-center mb-4 mt-8">
                             <h3 className="text-blue-900 text-lg border-b-2 border-dotted border-blue-900 inline-block font-medium">由组织填写</h3>
                          </div>
                          
                          {/* S1 */}
                          <div className="bg-white border border-blue-200 p-2 mb-4 shadow-sm">
                             <div className="bg-[#232d3b] text-white px-2 py-1 text-xs font-bold inline-block mb-2 mr-2">RC01</div>
                             <SectionHeader 
                               title="S1 *遏制措施，包括时间安排和负责人" 
                               aiAction={() => handleAIAnalysis(nc, SectionType.S1_CONTAINMENT, 's1_containment')}
                               isGenerating={isGenerating}
                               helpText={`请详细描述拟采取的各项控制措施。这应包括为纠正当前问题而将要采取的具体步骤。

接下来，请为实施这些遏制措施制定一份清晰且切合实际的时间表。其中应包含关键里程碑和截止日期，以确保行动能够及时展开。

确认将由何人负责监督包含措施的执行工作。此人须负责确保各项措施按照既定时间表得以实施，并作为在执行过程中可能产生的任何疑问或问题的联络人。

对控制措施、时间表及责任人所作的书面描述必须足够详尽。其表述方式应能让一位未曾事先了解情况的合格第三方在合理时间内充分理解相关内容。此举旨在确保过程的透明度和问责性。

请注意，所有这些栏目均为必填项，且必须完整填写，以确保包含措施的切实执行。若未能提供完整且详尽的信息，则可能导致执行过程出现延误或复杂情况。`}
                             />
                             <TextArea 
                               value={nc.s1_containment} 
                               onChange={(e) => handleUpdateNC(nc.id, 's1_containment', e.target.value)} 
                               rows={6} 
                               className="border-gray-300 mb-2"
                             />
                             <div className="grid grid-cols-2 gap-4">
                               <div className="grid grid-cols-12 items-center gap-2">
                                  <div className="col-span-3 text-right"><Label text="负责人:" /></div>
                                  <div className="col-span-9"><Input value={nc.s1_responsible} onChange={(e) => handleUpdateNC(nc.id, 's1_responsible', e.target.value)} /></div>
                               </div>
                               <div className="grid grid-cols-12 items-center gap-2">
                                  <div className="col-span-3 text-right"><Label text="完成时间:" /></div>
                                  <div className="col-span-9"><Input value={nc.s1_date} onChange={(e) => handleUpdateNC(nc.id, 's1_date', e.target.value)} /></div>
                               </div>
                             </div>
                          </div>
                          
                          {/* S2 Section */}
                          <div className="bg-white border border-blue-200 p-2 mb-4 shadow-sm">
                              <SectionHeader
                                  title="S2 *实施的证据"
                                  helpText="输入附件用于显示实施的证据的文件名。该证据不需要嵌入在这个文件中。证据应作为单独的附件发送 /必填项；"
                                  aiAction={() => handleAIAnalysis(nc, SectionType.S2_EVIDENCE, 's2_evidence')}
                                  isGenerating={isGenerating}
                              />
                              <TextArea 
                                  value={nc.s2_evidence || ''} 
                                  onChange={(e) => handleUpdateNC(nc.id, 's2_evidence', e.target.value)} 
                                  rows={2} 
                                  className="border-gray-300 mb-2"
                                  placeholder="例如：返工记录.pdf, 培训签到表.jpg"
                              />
                              
                              <div className="mt-2">
                                  <FieldHeaderWithHelp 
                                    title="实施证据文件"
                                    helpText="您可以附加pdf格式的文档或jpeg格式的图片，以供策划和证据使用；(你也可以直接投放文件)"
                                  />
                                  
                                  <div className="flex flex-wrap gap-2 items-start">
                                      {/* Mock file list display */}
                                      {nc.s2_evidence_files?.map((file, idx) => (
                                          <div key={idx} className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded w-24 h-24 text-center overflow-hidden">
                                              <DocumentTextIcon className="w-8 h-8 text-gray-400 mb-1" />
                                              <span className="text-[10px] text-gray-600 break-all leading-tight line-clamp-2">{file}</span>
                                          </div>
                                      ))}
                                      
                                      {/* Upload Button */}
                                      <button 
                                          className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 rounded bg-gray-50 transition-colors"
                                          onClick={() => triggerFileUpload(nc.id, 's2_evidence_files')}
                                      >
                                          <PlusIcon className="w-8 h-8" />
                                      </button>
                                  </div>
                              </div>
                          </div>

                          {/* S3 & S4 */}
                          <div className="bg-white border border-blue-200 p-2 mb-4 shadow-sm">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                   <FieldHeaderWithHelp 
                                      title="*根本原因是否会影响其他类似的流程或产品?"
                                      helpText="如果选择是，则在系统性纠正措施部分输入与“类似过程或产品”相关的措施；"
                                   />
                                </div>
                                <YesNoToggle value={nc.rootCauseAffectsOthers || false} onChange={(v) => handleUpdateNC(nc.id, 'rootCauseAffectsOthers', v)} />
                             </div>
                             
                             {/* Conditional explanation if Yes (Simulated) */}
                             <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                   <FieldHeaderWithHelp
                                      title="*请说明根本原因如何影响其他过程?"
                                      helpText="请定义根本原因如何影响（是）或不影响（否）其他过程的原因。"
                                   />
                                   <button
                                     onClick={() => handleAIAnalysis(nc, SectionType.ROOT_CAUSE_IMPACT, 's4_processImpact')}
                                     disabled={isGenerating}
                                     className="ml-auto px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                                   >
                                     {isGenerating ? (
                                       <>
                                         <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                         </svg>
                                         生成中...
                                       </>
                                     ) : '✨ AI 生成'}
                                   </button>
                                </div>
                                <TextArea
                                  value={nc.s4_processImpact}
                                  onChange={(e) => handleUpdateNC(nc.id, 's4_processImpact', e.target.value)}
                                  rows={4}
                                  className="border-gray-300 bg-gray-50"
                                />
                             </div>

                             <div className="mb-4">
                               <FieldHeaderWithHelp 
                                  title="根本原因分析文件"
                                  helpText="您可以附加pdf格式的文档或jpeg格式的图片，以供策划和证据使用；(你也可以直接投放文件)，点击“+”，就实现上传文件。"
                               />
                               <div className="flex flex-wrap gap-2 items-start mt-2">
                                  {nc.s3_analysis_files?.map((file, idx) => (
                                      <div key={idx} className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded w-24 h-24 text-center overflow-hidden">
                                          <DocumentTextIcon className="w-8 h-8 text-gray-400 mb-1" />
                                          <span className="text-[10px] text-gray-600 break-all leading-tight line-clamp-2">{file}</span>
                                      </div>
                                  ))}
                                  <button 
                                      className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 rounded bg-gray-50 transition-colors"
                                      onClick={() => triggerFileUpload(nc.id, 's3_analysis_files')}
                                  >
                                      <PlusIcon className="w-8 h-8" />
                                  </button>
                               </div>
                             </div>

                             <div className="mb-4">
                                <SectionHeader 
                                  title="S3 *根本原因分析" 
                                  aiAction={() => handleAIAnalysis(nc, SectionType.S3_ROOT_CAUSE, 's3_rootCause')}
                                  isGenerating={isGenerating}
                                  helpText={`请提供已进行的根本原因分析的全面描述。这应当包括在分析过程中采取的详细步骤。例如，你可以描述问题识别阶段、数据收集和分析阶段、可能的成因识别、根本原因的识别以及根本原因的验证。
其次，清楚地说明通过分析确定的主要原因。尽可能具体，详细说明这些原因是如何以及为何导致了当前的问题。
对根本原因分析及所识别原因的书面描述必须足够详细。应当以便于理解的方式撰写，任何阅读它的人，即使事先不了解情况，也能完全理解所遵循的过程和所达成的结论。
虽然不是必填项，但你可以选择附加支持分析的文件或截图。这些可以包括数据表、图表、示意图或其他有助于说明书面描述中观点的可视化辅助工具。
请注意，提供此详细描述是强制性要求。这对于确保全面了解问题和制定有效的纠正措施至关重要。如果此部分的任何内容未填写完整，可能会阻碍问题解决过程。`}
                                />
                                <TextArea 
                                  value={nc.s3_rootCause} 
                                  onChange={(e) => handleUpdateNC(nc.id, 's3_rootCause', e.target.value)} 
                                  placeholder="Use 5-Why analysis here..."
                                  rows={4} 
                                  className="border-gray-300"
                                />
                             </div>

                             {/* S4 Result Section */}
                             <div className="mb-4">
                                <SectionHeader
                                  title="S4 *根本原因结果"
                                  helpText={`请提供主要原因或经调查或分析识别的原因的详细描述。这不仅应当包括导致问题的直接因素，还应当包括发现的任何潜在或促成因素。
主要原因的书面陈述必须足够详细。它应当提供足够的信息，以便任何人在阅读时都能了解原因的性质、如何识别这些原因以及为什么它们被认为是问题的主要原因。
虽然不是必填项，但我们鼓励你附上任何有助于说明或为已识别原因提供证据的文件或截图。这些可以包括数据表、图表、示意图或其他有助于解释或为原因提供背景的可视化辅助工具。
请注意，提供主要原因的详细描述是强制性要求。这对确保全面了解问题和制定有效的纠正措施至关重要。如果此部分的任何内容未填写完整，可能会阻碍问题解决过程。`}
                                  aiAction={() => handleAIAnalysis(nc, SectionType.S4_RESULT, 's4_rootCauseResult')}
                                  isGenerating={isGenerating}
                                />
                                <TextArea 
                                  value={nc.s4_rootCauseResult || ''} 
                                  onChange={(e) => handleUpdateNC(nc.id, 's4_rootCauseResult', e.target.value)} 
                                  rows={4} 
                                  className="border-gray-300"
                                />
                                <div className="mt-2">
                                  <FieldHeaderWithHelp 
                                    title="根本原因结果文件"
                                    helpText="您可以附加pdf格式的文档或jpeg格式的图片，以供策划和证据使用；(你也可以直接投放文件)，点击“+”，就实现上传文件。"
                                  />
                                  <div className="flex flex-wrap gap-2 items-start mt-2">
                                     {nc.s4_rootCause_files?.map((file, idx) => (
                                         <div key={idx} className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded w-24 h-24 text-center overflow-hidden">
                                             <DocumentTextIcon className="w-8 h-8 text-gray-400 mb-1" />
                                             <span className="text-[10px] text-gray-600 break-all leading-tight line-clamp-2">{file}</span>
                                         </div>
                                     ))}
                                     <button 
                                         className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 rounded bg-gray-50 transition-colors"
                                         onClick={() => triggerFileUpload(nc.id, 's4_rootCause_files')}
                                     >
                                         <PlusIcon className="w-8 h-8" />
                                     </button>
                                  </div>
                                </div>
                             </div>
                          </div>

                          {/* S5 */}
                          <div className="bg-white border border-blue-200 p-2 mb-4 shadow-sm">
                             <SectionHeader 
                               title="S5 *系统性纠正措施，包括时间安排和负责人" 
                               aiAction={() => handleAIAnalysis(nc, SectionType.S5_CORRECTIVE_ACTION, 's5_systemicAction')}
                               isGenerating={isGenerating}
                               helpText={`请提供已决定的系统性纠正措施的全面描述。这应当包括将采取的具体措施，不仅要解决当前问题，还要解决已识别的任何潜在的系统性问题。
其次，为实施这些系统性纠正措施制定一个清晰且切实可行的时间表。其中应当包括关键里程碑和截止日期，以确保措施能够及时执行。
确定负责监督纠正系统性纠正措施的人员。该人员将负责确保措施按照概述的时间表执行，并作为实施过程中可能出现的任何疑问或问题的联系人。
对系统纠正措施、时间表和负责人的书面说明必须足够详细。应当以便于理解的方式撰写，任何阅读它的人，即使事先不了解情况，也可以完全理解所要遵循的过程和预期的结果。
虽然不是必填项，但你可以选择附加支持你描述的文件或截图。这些可以包括数据表、图表、示意图或其他有助于说明书面描述中观点的可视化辅助工具。
请注意，提供此详细描述是强制性要求。这对确保全面了解问题和制定有效的纠正措施至关重要。如果此部分的任何内容未填写完整，可能会阻碍问题解决过程。`}
                             />
                             <TextArea 
                               value={nc.s5_systemicAction} 
                               onChange={(e) => handleUpdateNC(nc.id, 's5_systemicAction', e.target.value)} 
                               rows={6} 
                               className="border-gray-300 mb-2"
                             />
                             <div className="grid grid-cols-2 gap-4">
                               <div className="grid grid-cols-12 items-center gap-2">
                                  <div className="col-span-3 text-right"><Label text="负责人:" /></div>
                                  <div className="col-span-9"><Input value={nc.s5_responsible} onChange={(e) => handleUpdateNC(nc.id, 's5_responsible', e.target.value)} /></div>
                               </div>
                               <div className="grid grid-cols-12 items-center gap-2">
                                  <div className="col-span-3 text-right"><Label text="完成时间:" /></div>
                                  <div className="col-span-9"><Input value={nc.s5_date} onChange={(e) => handleUpdateNC(nc.id, 's5_date', e.target.value)} /></div>
                               </div>
                             </div>
                             
                             <div className="mt-4">
                                <FieldHeaderWithHelp 
                                  title="系统性纠正措施文件"
                                  helpText="您可以附加pdf格式的文档或jpeg格式的图片，以供策划和证据使用；(你也可以直接投放文件)，点击“+”，就实现上传文件。"
                                />
                                <div className="flex flex-wrap gap-2 items-start mt-2">
                                   {nc.s5_action_files?.map((file, idx) => (
                                       <div key={idx} className="relative group flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded w-24 h-24 text-center overflow-hidden">
                                           <button 
                                              onClick={() => handleDeleteFile(nc.id, 's5_action_files', idx)}
                                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                              title="删除"
                                           >
                                              <TrashIcon className="w-3 h-3" />
                                           </button>
                                           <DocumentTextIcon className="w-8 h-8 text-gray-400 mb-1" />
                                           <span className="text-[10px] text-gray-600 break-all leading-tight line-clamp-2">{file}</span>
                                       </div>
                                   ))}
                                   <button 
                                       className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 rounded bg-gray-50 transition-colors"
                                       onClick={() => triggerFileUpload(nc.id, 's5_action_files')}
                                   >
                                       <PlusIcon className="w-8 h-8" />
                                   </button>
                                </div>
                             </div>
                          </div>

                          {/* S6 */}
                          <div className="bg-white border border-blue-200 p-2 mb-4 shadow-sm">
                             <SectionHeader
                               title="S6 *实施的证据，包括时间安排和负责人"
                               helpText={`请全面描述你在收集和验证与当前问题相关的证据时所遵循的程序。其中应当包括你采取的具体步骤、使用的方法以及用于确定证据有效性和相关性的标准。
证据程序的书面说明必须足够详细。应当以便于理解的方式撰写，任何阅读它的人，即使事先不了解情况，也可以完全理解所遵循的过程及其背后的理由。
虽然不是必填项，但你可以选择附加支持你描述的文件或截图。这些可以包括数据表、图表、示意图或其他有助于说明书面描述中观点的可视化辅助工具。
请注意，提供此详细描述是强制性要求。这对确保全面了解问题和制定有效的纠正措施至关重要。如果此部分的任何内容未填写完整，可能会阻碍问题解决过程。`}
                               aiAction={() => handleAIAnalysis(nc, SectionType.S6_EVIDENCE, 's6_implementation_details')}
                               isGenerating={isGenerating}
                             />
                             <TextArea 
                               value={nc.s6_implementation_details || ''} 
                               onChange={(e) => handleUpdateNC(nc.id, 's6_implementation_details', e.target.value)} 
                               rows={4} 
                               className="border-gray-300"
                             />
                             
                             <div className="mt-4">
                               <FieldHeaderWithHelp 
                                  title="实施证据文件"
                                  helpText="您可以附加pdf格式的文档或jpeg格式的图片，以供策划和证据使用；(你也可以直接投放文件)，点击“+”，就实现上传文件。也有后续删除/更换文件的功能"
                               />
                               <div className="flex flex-wrap gap-2 items-start mt-2">
                                  {nc.s6_evidence_files?.map((file, idx) => (
                                      <div key={idx} className="relative group flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded w-24 h-24 text-center overflow-hidden">
                                          <button 
                                              onClick={() => handleDeleteFile(nc.id, 's6_evidence_files', idx)}
                                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                              title="删除"
                                          >
                                              <TrashIcon className="w-3 h-3" />
                                          </button>
                                          <DocumentTextIcon className="w-8 h-8 text-gray-400 mb-1" />
                                          <span className="text-[10px] text-gray-600 break-all leading-tight line-clamp-2">{file}</span>
                                      </div>
                                  ))}
                                  <button 
                                      className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 rounded bg-gray-50 transition-colors"
                                      onClick={() => triggerFileUpload(nc.id, 's6_evidence_files')}
                                  >
                                      <PlusIcon className="w-8 h-8" />
                                  </button>
                               </div>
                             </div>
                          </div>

                          {/* S7 */}
                          <div className="bg-white border border-blue-200 p-2 mb-4 shadow-sm">
                             <SectionHeader 
                               title="S7 *采取措施验证纠正措施的有效实施" 
                               aiAction={() => handleAIAnalysis(nc, SectionType.S7_VERIFICATION, 's7_verification')}
                               isGenerating={isGenerating}
                               helpText="输入采取的措施以验证纠正措施的有效实施 / 必填项。"
                             />
                             <TextArea 
                               value={nc.s7_verification} 
                               onChange={(e) => handleUpdateNC(nc.id, 's7_verification', e.target.value)} 
                               rows={4} 
                               className="border-gray-300"
                             />
                             
                             <div className="mt-4">
                               <FieldHeaderWithHelp 
                                  title="纠正措施的有效实施的验证文件" 
                                  helpText="您可以附加pdf格式的文档或jpeg格式的图片，以供策划和证据使用；(你也可以直接投放文件)，点击“+”，就实现上传文件。也有后续删除/更换文件的功能"
                               />
                               <div className="flex flex-wrap gap-2 items-start mt-2">
                                  {nc.s7_verification_files?.map((file, idx) => (
                                      <div key={idx} className="relative group flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded w-24 h-24 text-center overflow-hidden">
                                          <button 
                                              onClick={() => handleDeleteFile(nc.id, 's7_verification_files', idx)}
                                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                              title="删除"
                                          >
                                              <TrashIcon className="w-3 h-3" />
                                          </button>
                                          <DocumentTextIcon className="w-8 h-8 text-gray-400 mb-1" />
                                          <span className="text-[10px] text-gray-600 break-all leading-tight line-clamp-2">{file}</span>
                                      </div>
                                  ))}
                                  <button 
                                      className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 rounded bg-gray-50 transition-colors"
                                      onClick={() => triggerFileUpload(nc.id, 's7_verification_files')}
                                  >
                                      <PlusIcon className="w-8 h-8" />
                                  </button>
                               </div>
                             </div>
                          </div>

                          {/* Submission */}
                          <div className="bg-white p-4 border border-gray-200 mt-4 mb-4">
                            <SectionHeader 
                              title="提交" 
                              helpText={`请提供对该不符合项提交的回复的具体日期。这对于保存记录和跟踪事件的时间线非常重要。
此外，请输入贵组织负责处理此不符合项的代表姓名。该人员将是与此问题相关的任何进一步讨论或措施的主要联系人。
请注意，这些字段为必填项。日期和代表姓名是确保责任明确和促进沟通的关键信息。
输入代表姓名后，不符合项（NC）将进入流程的下一状态。此时，与贵组织相关的部分将变成只读状态，意味着你将无法再进行编辑。
但是，如果您发现自己遗漏了某些内容，需要继续编辑，也有一个解决方法。你可以从 “代表 ”字段中删除自己的姓名，这样就可以将不符合项恢复到编辑状态。完成必要的更改后，你可以重新输入你的姓名，再次推进 NC。
请记住，在提交前务必彻底检查所有信息，以确保准确性和完整性。如果你有任何问题或需要进一步帮助，请随时寻求帮助。`}
                            />
                            <div className="grid grid-cols-2 gap-8 mt-2">
                               <div className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-3 text-right"><Label text="*组织代表" /></div>
                                  <div className="col-span-9"><Input value={nc.orgRep} /></div>
                               </div>
                               <div className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-3 text-right"><Label text="*日期" /></div>
                                  <div className="col-span-9"><Input value={nc.repDate} /></div>
                               </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2 ml-20">
                              通过输入您的姓名，代表您签署完成NC响应。如果您仍想更改，请删除您的姓名。
                            </div>
                          </div>

                          {/* Certification Body Filled Section */}
                          <div className="text-center mb-4 mt-8">
                             <h3 className="text-blue-900 text-lg border-b-2 border-dotted border-blue-900 inline-block font-medium">由认证机构填写</h3>
                          </div>
                          <div className="bg-white p-4 border border-blue-200 mb-4 shadow-sm">
                             <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <FieldHeaderWithHelp 
                                      title="*评审日期" 
                                      helpText="输入评审表格的日期 / 必填项。"
                                    />
                                </div>
                                <div className="grid grid-cols-12 items-center">
                                    <div className="col-span-12"><Input value={nc.reviewDate || ''} onChange={(e) => handleUpdateNC(nc.id, 'reviewDate', e.target.value)} /></div>
                                </div>
                             </div>

                             <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <FieldHeaderWithHelp 
                                      title="*评审员决定" 
                                      helpText="从选项中选择评审员的决定。评审员决定：只记录最终接受的客户响应。/ 必填项。"
                                    />
                                </div>
                                <div className="grid grid-cols-12 items-center">
                                    <div className="col-span-12">
                                        <select 
                                          className="w-full border border-gray-300 p-2 text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                          value={nc.auditorDecision}
                                          onChange={(e) => handleUpdateNC(nc.id, 'auditorDecision', e.target.value)}
                                        >
                                            <option value="">请选择...</option>
                                            <option value="Accepted">Accepted (接受)</option>
                                            <option value="Rejected">Rejected (拒绝)</option>
                                        </select>
                                    </div>
                                </div>
                             </div>

                             <div className="mb-4">
                                <SectionHeader 
                                  title="评审员意见" 
                                  helpText="输入评审评论 / 必填项。"
                                  aiAction={() => handleAIAnalysis(nc, SectionType.AUDITOR_REVIEW, 'auditorComments')}
                                  isGenerating={isGenerating}
                                />
                                <TextArea 
                                  value={nc.auditorComments || ''} 
                                  onChange={(e) => handleUpdateNC(nc.id, 'auditorComments', e.target.value)} 
                                  rows={4} 
                                  className="border-gray-300"
                                />
                             </div>

                             <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <FieldHeaderWithHelp 
                                      title="评审员姓名" 
                                      helpText="输入评审员姓名 /必填项。"
                                    />
                                </div>
                                <div className="grid grid-cols-12 items-center">
                                    <div className="col-span-12"><Input value={nc.auditorName || ''} onChange={(e) => handleUpdateNC(nc.id, 'auditorName', e.target.value)} /></div>
                                </div>
                             </div>
                          </div>
                       </div>
                     )}
                   </div>
                 );
               })}
            </div>
            
            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-64 right-0 bg-[#232d3b] p-2 flex justify-end gap-2 shadow-lg z-20">
               <button className="bg-[#333] hover:bg-black text-white px-3 py-2 text-sm font-bold flex items-center gap-2">
                 <PrinterIcon className="w-4 h-4" /> 仅打印英文NC报告
               </button>
               <button className="bg-[#333] hover:bg-black text-white px-3 py-2 text-sm font-bold flex items-center gap-2">
                 <PrinterIcon className="w-4 h-4" /> 打印NC报告
               </button>
               <button className="bg-[#333] hover:bg-black text-white px-3 py-2 text-sm font-bold flex items-center gap-2">
                 <ArrowDownTrayIcon className="w-4 h-4" /> 审核员NC导出
               </button>
               <button className="bg-[#333] hover:bg-black text-white px-3 py-2 text-sm font-bold flex items-center gap-2">
                 <ArrowDownTrayIcon className="w-4 h-4" /> 导出报告 (XML)
               </button>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-[#1b2430] text-gray-400 text-xs py-1 px-4 flex justify-between items-center z-30">
              <div>
                <span className="text-gray-500">编写作者：</span>
                <span className="text-gray-300 font-medium">Jason Bai</span>
                <span className="mx-2 text-gray-600">|</span>
                <span className="text-gray-500">QQ联系方式：</span>
                <span className="text-gray-300 font-medium">990579063</span>
              </div>
              <div>
                <span className="text-gray-500">原版本归：</span>
                <span className="text-gray-300 font-medium">IATF所有</span>
              </div>
            </div>
          </main>
        )}
      </div>
      
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
      
      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}
      
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
      
      <input type="file" ref={attachmentInputRef} className="hidden" onChange={handleAttachmentUpload} />
    </div>
  );
};

export default App;