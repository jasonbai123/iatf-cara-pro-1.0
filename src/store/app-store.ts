/**
 * Zustand 状态管理 Store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  NCItem,
  AuditBasicData,
  AppSettings,
  ViewState,
  NetworkStatus,
  AIProviderConfig
} from '@shared/types';
import { NCStatus } from '@shared/types';
import { logger } from '../shared/utils/logger';

interface AppState {
  // ===== 视图状态 =====
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;

  // ===== 数据状态 =====
  basicData: AuditBasicData | null;
  setBasicData: (data: AuditBasicData) => void;

  ncItems: NCItem[];
  setNCItems: (ncs: NCItem[]) => void;
  addNCItem: (nc: NCItem) => void;
  updateNCItem: (id: string, updates: Partial<NCItem>) => void;
  deleteNCItem: (id: string) => void;
  getNCItemById: (id: string) => NCItem | undefined;

  // ===== 设置状态 =====
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // ===== AI状态 =====
  aiProviders: Record<string, AIProviderConfig>;
  updateAIProvider: (provider: string, config: Partial<AIProviderConfig>) => void;
  setCurrentAIProvider: (provider: string) => void;

  // ===== UI状态 =====
  expandedNCId: string | null;
  setExpandedNCId: (id: string | null) => void;

  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  // ===== 网络状态 =====
  networkStatus: NetworkStatus;
  setNetworkStatus: (status: NetworkStatus) => void;

  // ===== 文件上传状态 =====
  uploadTarget: { id: string; field: keyof NCItem } | null;
  setUploadTarget: (target: { id: string; field: keyof NCItem } | null) => void;

  // ===== 数据持久化 =====
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  exportData: () => string;
  importData: (json: string) => boolean;
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
  backupDays: 0,
  currentAIProvider: 'gemini',
  autoSave: true,
  autoSaveInterval: 5
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // ===== 初始状态 =====
        currentView: 'START',
        basicData: null,
        ncItems: [],
        settings: DEFAULT_SETTINGS,
        aiProviders: {
          claude: { type: 'claude', enabled: false, displayName: 'Claude' },
          deepseek: { type: 'deepseek', enabled: false, displayName: 'DeepSeek' },
          gemini: { type: 'gemini', enabled: false, displayName: 'Google Gemini' },
          glm: { type: 'glm', enabled: false, displayName: '智谱 GLM' },
          volcengine: { type: 'volcengine', enabled: false, displayName: '火山引擎' },
          siliconflow: { type: 'siliconflow', enabled: false, displayName: '硅基流动' }
        },
        expandedNCId: null,
        isGenerating: false,
        networkStatus: 'online',
        uploadTarget: null,

        // ===== 视图操作 =====
        setCurrentView: (view) => set({ currentView: view }),

        // ===== 数据操作 =====
        setBasicData: (data) => set({ basicData: data }),

        setNCItems: (ncs) => set({ ncItems: ncs }),

        addNCItem: (nc) => set((state) => ({
          ncItems: [...state.ncItems, nc]
        })),

        updateNCItem: (id, updates) => set((state) => ({
          ncItems: state.ncItems.map(nc =>
            nc.id === id ? { ...nc, ...updates, updatedAt: new Date() } : nc
          )
        })),

        deleteNCItem: (id) => set((state) => ({
          ncItems: state.ncItems.filter(nc => nc.id !== id)
        })),

        getNCItemById: (id) => {
          return get().ncItems.find(nc => nc.id === id);
        },

        // ===== 设置操作 =====
        updateSettings: (updates) => set((state) => ({
          settings: { ...state.settings, ...updates }
        })),

        resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

        // ===== AI操作 =====
        updateAIProvider: (provider, config) => set((state) => ({
          aiProviders: {
            ...state.aiProviders,
            [provider]: { ...state.aiProviders[provider], ...config }
          }
        })),

        setCurrentAIProvider: (provider) => set((state) => ({
          settings: { ...state.settings, currentAIProvider: provider }
        })),

        // ===== UI操作 =====
        setExpandedNCId: (id) => set({ expandedNCId: id }),

        setIsGenerating: (generating) => set({ isGenerating: generating }),

        setNetworkStatus: (status) => set({ networkStatus: status }),

        setUploadTarget: (target) => set({ uploadTarget: target }),

        // ===== 持久化操作 =====
        saveToStorage: async () => {
          try {
            const { basicData, ncItems, settings } = get();
            // 这里会触发persist中间件的自动保存
            localStorage.setItem('iatf-cara-backup', JSON.stringify({
              basicData,
              ncItems,
              settings,
              savedAt: new Date().toISOString()
            }));
          } catch (error) {
            logger.error('保存到本地存储失败:', error);
          }
        },

        loadFromStorage: async () => {
          try {
            const backup = localStorage.getItem('iatf-cara-backup');
            if (backup) {
              const data = JSON.parse(backup);
              if (data.basicData) set({ basicData: data.basicData });
              if (data.ncItems) set({ ncItems: data.ncItems });
              if (data.settings) set({ settings: data.settings });
            }
          } catch (error) {
            logger.error('从本地存储加载失败:', error);
          }
        },

        exportData: () => {
          const { basicData, ncItems, settings } = get();
          return JSON.stringify({
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            basicData,
            ncItems,
            settings
          }, null, 2);
        },

        importData: (json) => {
          try {
            const data = JSON.parse(json);
            if (data.basicData) set({ basicData: data.basicData });
            if (data.ncItems) set({ ncItems: data.ncItems });
            if (data.settings) set({ settings: data.settings });
            return true;
          } catch (error) {
            logger.error('导入数据失败:', error);
            return false;
          }
        }
      }),
      {
        name: 'iatf-cara-storage',
        // 只持久化部分数据，避免存储过大
        partialize: (state) => ({
          settings: state.settings,
          aiProviders: state.aiProviders,
          basicData: state.basicData
          // ncItems不在localStorage中持久化，而是使用IndexedDB
        })
      }
    ),
    { name: 'IATF-CARA-Store' }
  )
);
