import { VersionInfo } from '../types/auth.types';
import { logger } from '../shared/utils/logger';

const VERSION_CHECK_INTERVAL = 24 * 60 * 60 * 1000;
const UPDATE_API_URL = import.meta.env.VITE_UPDATE_API_URL || 'https://api.example.com/version';
const CURRENT_VERSION = '1.5.3';

class UpdateService {
  private lastCheckTime: number = 0;
  private updateInfo: VersionInfo | null = null;
  private listeners: Set<(info: VersionInfo) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const lastCheck = localStorage.getItem('last_version_check');
    if (lastCheck) {
      this.lastCheckTime = parseInt(lastCheck, 10);
    }

    const savedUpdateInfo = localStorage.getItem('update_info');
    if (savedUpdateInfo) {
      this.updateInfo = JSON.parse(savedUpdateInfo);
    }
  }

  private saveToStorage() {
    localStorage.setItem('last_version_check', this.lastCheckTime.toString());
    if (this.updateInfo) {
      localStorage.setItem('update_info', JSON.stringify(this.updateInfo));
    } else {
      localStorage.removeItem('update_info');
    }
  }

  async checkForUpdates(force: boolean = false): Promise<VersionInfo | null> {
    const now = Date.now();
    
    if (!force && now - this.lastCheckTime < VERSION_CHECK_INTERVAL) {
      return this.updateInfo;
    }

    try {
      const response = await fetch(`${UPDATE_API_URL}?version=${CURRENT_VERSION}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('检查更新失败');
      }

      const data = await response.json();
      
      this.updateInfo = {
        currentVersion: CURRENT_VERSION,
        latestVersion: data.latestVersion || CURRENT_VERSION,
        updateAvailable: data.updateAvailable || false,
        downloadUrl: data.downloadUrl,
        releaseNotes: data.releaseNotes,
        forceUpdate: data.forceUpdate || false,
      };

      this.lastCheckTime = now;
      this.saveToStorage();

      if (this.updateInfo.updateAvailable) {
        this.notifyListeners();
      }

      return this.updateInfo;
    } catch (error) {
      logger.error('检查更新失败:', error);
      return this.updateInfo;
    }
  }

  getUpdateInfo(): VersionInfo | null {
    return this.updateInfo;
  }

  getCurrentVersion(): string {
    return CURRENT_VERSION;
  }

  onUpdateAvailable(callback: (info: VersionInfo) => void): () => void {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    if (this.updateInfo) {
      this.listeners.forEach(callback => callback(this.updateInfo!));
    }
  }

  async downloadUpdate(): Promise<void> {
    if (!this.updateInfo?.downloadUrl) {
      throw new Error('没有可用的下载链接');
    }

    try {
      const response = await fetch(this.updateInfo.downloadUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iatf-cara-assistant-${this.updateInfo.latestVersion}.exe`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('下载更新失败:', error);
      throw error;
    }
  }

  dismissUpdate(): void {
    if (this.updateInfo && !this.updateInfo.forceUpdate) {
      this.updateInfo = null;
      this.saveToStorage();
    }
  }

  async checkForUpdatesOnStartup(): Promise<void> {
    await this.checkForUpdates();
  }
}

export const updateService = new UpdateService();
