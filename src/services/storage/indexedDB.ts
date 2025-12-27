/**
 * IndexedDB 数据库服务
 * 用于本地数据持久化
 */

import Dexie, { Table } from 'dexie';
import type { NCItem, AuditBasicData, AppSettings } from '@shared/types';

/**
 * 数据库接口定义
 */
export interface IATFDatabase extends Dexie {
  reports: Table<AuditReport>;
  ncItems: Table<NCItem>;
  settings: Table<AppSetting>;
  apiKeys: Table<APIKeyRecord>;
}

export interface AuditReport {
  id?: number;
  reportNumber: string;
  orgName: string;
  auditType: string;
  startDate: string;
  endDate: string;
  cbId: string;
  totalNCs: number;
  basicData: AuditBasicData;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSetting {
  key: string;
  value: any;
  updatedAt: Date;
}

export interface APIKeyRecord {
  provider: string;
  encryptedKey: string;
  enabled: boolean;
  model?: string;
  updatedAt: Date;
}

/**
 * 数据库类
 */
export class IATFCARADatabase extends Dexie implements IATFDatabase {
  reports!: Table<AuditReport>;
  ncItems!: Table<NCItem>;
  settings!: Table<AppSetting>;
  apiKeys!: Table<APIKeyRecord>;

  constructor() {
    super('IATFCARADatabase');

    // 定义数据库版本和表结构
    this.version(1).stores({
      reports: '++id, reportNumber, orgName, createdAt',
      ncItems: 'id, reportId, status',
      settings: 'key, updatedAt',
      apiKeys: 'provider, enabled'
    });
  }

  /**
   * 清空所有数据（危险操作）
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.reports.clear(),
      this.ncItems.clear(),
      this.settings.clear(),
      this.apiKeys.clear()
    ]);
  }
}

// 导出数据库实例
export const db = new IATFCARADatabase();

/**
 * 数据仓库类 - 提供更高级的数据操作接口
 */
export class Repository {
  private db: IATFCARADatabase;

  constructor(database: IATFCARADatabase) {
    this.db = database;
  }

  // ========== 报告相关操作 ==========

  async saveReport(report: AuditReport): Promise<number> {
    report.updatedAt = new Date();
    if (!report.createdAt) {
      report.createdAt = new Date();
    }
    const id = await this.db.reports.put(report);
    return typeof id === 'number' ? id : parseInt(id as string, 10);
  }

  async getReport(id: number): Promise<AuditReport | undefined> {
    return await this.db.reports.get(id);
  }

  async getReportByNumber(reportNumber: string): Promise<AuditReport | undefined> {
    return await this.db.reports.where('reportNumber').equals(reportNumber).first();
  }

  async getAllReports(): Promise<AuditReport[]> {
    return await this.db.reports.orderBy('createdAt').reverse().toArray();
  }

  async deleteReport(id: number): Promise<void> {
    await this.db.reports.delete(id);
    // 同时删除关联的NC项
    await this.db.ncItems.where('reportId').equals(id.toString()).delete();
  }

  // ========== NC项相关操作 ==========

  async saveNCItem(nc: NCItem): Promise<void> {
    await this.db.ncItems.put(nc);
  }

  async saveNCItems(ncs: NCItem[]): Promise<void> {
    await this.db.ncItems.bulkPut(ncs);
  }

  async getNCItem(id: string): Promise<NCItem | undefined> {
    return await this.db.ncItems.get(id);
  }

  async getNCItemsByReport(reportId: string): Promise<NCItem[]> {
    return await this.db.ncItems.where('reportId').equals(reportId).toArray();
  }

  async getAllNCItems(): Promise<NCItem[]> {
    return await this.db.ncItems.toArray();
  }

  async deleteNCItem(id: string): Promise<void> {
    await this.db.ncItems.delete(id);
  }

  // ========== 设置相关操作 ==========

  async saveSetting(key: string, value: any): Promise<void> {
    await this.db.settings.put({
      key,
      value,
      updatedAt: new Date()
    });
  }

  async getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const setting = await this.db.settings.get(key);
    return setting ? (setting.value as T) : defaultValue;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await this.db.settings.toArray();
    const result: Record<string, any> = {};
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });
    return result;
  }

  async deleteSetting(key: string): Promise<void> {
    await this.db.settings.delete(key);
  }

  // ========== API密钥相关操作 ==========

  async saveApiKey(
    provider: string,
    encryptedKey: string,
    enabled: boolean = true,
    model?: string
  ): Promise<void> {
    await this.db.apiKeys.put({
      provider,
      encryptedKey,
      enabled,
      model,
      updatedAt: new Date()
    });
  }

  async getApiKey(provider: string): Promise<APIKeyRecord | undefined> {
    return await this.db.apiKeys.get(provider);
  }

  async getAllApiKeys(): Promise<APIKeyRecord[]> {
    return await this.db.apiKeys.toArray();
  }

  async deleteApiKey(provider: string): Promise<void> {
    await this.db.apiKeys.delete(provider);
  }

  // ========== 批量操作 ==========

  async importData(data: {
    reports?: AuditReport[];
    ncItems?: NCItem[];
    settings?: Record<string, any>;
  }): Promise<void> {
    await this.db.transaction('rw', [this.db.reports, this.db.ncItems, this.db.settings], async () => {
      if (data.reports) {
        await this.db.reports.bulkPut(data.reports);
      }
      if (data.ncItems) {
        await this.db.ncItems.bulkPut(data.ncItems);
      }
      if (data.settings) {
        const settingsArray = Object.entries(data.settings).map(([key, value]) => ({
          key,
          value,
          updatedAt: new Date()
        }));
        await this.db.settings.bulkPut(settingsArray);
      }
    });
  }

  async exportData(): Promise<{
    reports: AuditReport[];
    ncItems: NCItem[];
    settings: Record<string, any>;
    exportDate: Date;
  }> {
    const [reports, ncItems, settings] = await Promise.all([
      this.db.reports.toArray(),
      this.db.ncItems.toArray(),
      this.getAllSettings()
    ]);

    return {
      reports,
      ncItems,
      settings,
      exportDate: new Date()
    };
  }
}

// 导出仓库实例
export const repository = new Repository(db);
