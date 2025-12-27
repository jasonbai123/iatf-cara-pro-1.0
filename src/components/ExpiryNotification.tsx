import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ExpiryNotificationProps {
  onUpgrade?: () => void;
}

const ExpiryNotification: React.FC<ExpiryNotificationProps> = ({ onUpgrade }) => {
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(true);
  const [expiryDate, setExpiryDate] = useState<string>('');

  useEffect(() => {
    const checkExpiry = () => {
      const days = authService.getRemainingDays();
      const expired = authService.isUserExpired();
      const trial = authService.isTrialUser();
      const user = authService.getCurrentUser();

      setRemainingDays(days);
      setIsExpired(expired);
      setIsTrial(trial);
      
      if (user?.expiryDate) {
        setExpiryDate(new Date(user.expiryDate).toLocaleDateString('zh-CN'));
      }

      if (expired) {
        setShowNotification(true);
      } else if (trial && days <= 7) {
        setShowNotification(true);
      }
    };

    checkExpiry();

    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    if (!isExpired) {
      setShowNotification(false);
    }
  };

  if (!showNotification) {
    return null;
  }

  const getSeverityColor = () => {
    if (isExpired) return 'bg-red-50 border-red-500 text-red-800';
    if (remainingDays <= 3) return 'bg-orange-50 border-orange-500 text-orange-800';
    if (remainingDays <= 7) return 'bg-yellow-50 border-yellow-500 text-yellow-800';
    return 'bg-blue-50 border-blue-500 text-blue-800';
  };

  const getIconColor = () => {
    if (isExpired) return 'text-red-600';
    if (remainingDays <= 3) return 'text-orange-600';
    if (remainingDays <= 7) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getMessage = () => {
    if (isExpired) {
      return '您的试用期限已到期，请升级到正式版本以继续使用所有功能';
    }
    if (remainingDays <= 3) {
      return `您的试用期限仅剩 ${remainingDays} 天，请及时升级到正式版本`;
    }
    if (remainingDays <= 7) {
      return `您的试用期限还剩 ${remainingDays} 天，建议升级到正式版本`;
    }
    return `您的试用期限还剩 ${remainingDays} 天`;
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-4`}>
      <div className={`max-w-2xl mx-auto border-2 rounded-xl shadow-2xl overflow-hidden ${getSeverityColor()}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {isExpired ? (
                <ExclamationTriangleIcon className={`w-8 h-8 flex-shrink-0 ${getIconColor()}`} />
              ) : (
                <ClockIcon className={`w-8 h-8 flex-shrink-0 ${getIconColor()}`} />
              )}
              <div>
                <h3 className={`text-lg font-bold ${isExpired ? 'text-red-800' : 'text-gray-800'}`}>
                  {isExpired ? '试用期限已到期' : '试用期限提醒'}
                </h3>
                <p className={`text-sm ${getIconColor()}`}>
                  {isTrial ? '试用用户' : '正式用户'} · 到期日期: {expiryDate}
                </p>
              </div>
            </div>
            
            {!isExpired && (
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>

          <div className="mb-4">
            <p className="text-gray-700">{getMessage()}</p>
          </div>

          {isTrial && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">正式用户特权：</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>无限制使用所有功能</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>优先技术支持</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>免费版本更新</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>数据安全保障</span>
                </li>
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onUpgrade}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isExpired
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ArrowPathIcon className="w-5 h-5" />
              升级到正式版本
            </button>

            {!isExpired && (
              <button
                onClick={handleDismiss}
                className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                稍后提醒
              </button>
            )}
          </div>

          {isExpired && (
            <p className="mt-3 text-xs text-red-600 text-center">
              试用期限已到期，部分功能可能受限，请升级以继续使用
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiryNotification;