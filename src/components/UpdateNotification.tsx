import React, { useState, useEffect } from 'react';
import { updateService, VersionInfo } from '../services/update.service';
import { logger } from '../shared/utils/logger';
import { 
  CloudArrowDownIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const UpdateNotification: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const checkUpdates = async () => {
      const info = await updateService.checkForUpdates();
      if (info && info.updateAvailable) {
        setUpdateInfo(info);
        setShowNotification(true);
      }
    };

    checkUpdates();

    const unsubscribe = updateService.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setShowNotification(true);
    });

    return () => unsubscribe();
  }, []);

  const handleDownload = async () => {
    if (!updateInfo || !updateInfo.downloadUrl) {
      return;
    }

    try {
      setDownloading(true);
      setDownloadProgress(0);

      await updateService.downloadUpdate((progress) => {
        setDownloadProgress(progress);
      });

      setShowNotification(false);
      alert('更新下载完成，请手动安装更新');
    } catch (error) {
      logger.error('下载更新失败:', error);
      alert('下载更新失败，请稍后重试');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDismiss = () => {
    if (updateInfo?.forceUpdate) {
      alert('此更新为强制更新，必须先下载安装');
      return;
    }
    setShowNotification(false);
  };

  if (!showNotification || !updateInfo) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`max-w-2xl mx-auto mt-4 px-4 ${
        updateInfo.forceUpdate ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
      } border-2 rounded-xl shadow-2xl overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {updateInfo.forceUpdate ? (
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 flex-shrink-0" />
              ) : (
                <CloudArrowDownIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
              )}
              <div>
                <h3 className={`text-lg font-bold ${
                  updateInfo.forceUpdate ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {updateInfo.forceUpdate ? '强制更新' : '发现新版本'}
                </h3>
                <p className={`text-sm ${
                  updateInfo.forceUpdate ? 'text-red-600' : 'text-blue-600'
                }`}>
                  当前版本: {updateInfo.currentVersion} → 最新版本: {updateInfo.latestVersion}
                </p>
              </div>
            </div>
            
            {!updateInfo.forceUpdate && (
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>

          {updateInfo.releaseNotes && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">更新内容:</h4>
              <div className="bg-white rounded-lg p-3 text-sm text-gray-600 max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">{updateInfo.releaseNotes}</pre>
              </div>
            </div>
          )}

          {downloading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>下载进度</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                downloading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {downloading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  下载中...
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="w-5 h-5" />
                  立即更新
                </>
              )}
            </button>

            {!updateInfo.forceUpdate && (
              <button
                onClick={handleDismiss}
                disabled={downloading}
                className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all disabled:bg-gray-100 disabled:text-gray-400"
              >
                稍后提醒
              </button>
            )}
          </div>

          {updateInfo.forceUpdate && (
            <p className="mt-3 text-xs text-red-600 text-center">
              此更新为强制更新，必须先下载安装才能继续使用
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;