import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { LoginRequest, LoginResponse } from '../types/auth.types';
import { logger } from '../shared/utils/logger';
import { QrCodeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'wechat'>('phone');

  const handleLoginSuccess = (response: LoginResponse) => {
    if (response.success && response.user) {
      onLoginSuccess(response.user);
    } else {
      alert(response.message || '登录失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">IATF CARA</h1>
          <p className="text-gray-600">请选择登录方式</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              loginMethod === 'phone'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <DevicePhoneMobileIcon className="w-5 h-5" />
            手机登录
          </button>
          <button
            onClick={() => setLoginMethod('wechat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              loginMethod === 'wechat'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <QrCodeIcon className="w-5 h-5" />
            微信登录
          </button>
        </div>

        {loginMethod === 'phone' ? (
          <PhoneLogin onLoginSuccess={handleLoginSuccess} />
        ) : (
          <WeChatLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

const PhoneLogin: React.FC<{ onLoginSuccess: (response: LoginResponse) => void }> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [displayCode, setDisplayCode] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateNetworkInfo();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);
    updateNetworkInfo();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateNetworkInfo = () => {
    const connection = (navigator as any).connection;
    if (connection) {
      setNetworkType(connection.effectiveType || 'unknown');
    }
  };

  const handleSendCode = async () => {
    if (!isOnline) {
      alert('网络连接已断开，请检查网络连接后重试');
      return;
    }

    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号码');
      return;
    }

    try {
      setLoading(true);
      console.log('开始发送验证码...');
      const response = await authService.sendVerificationCode(phone);
      console.log('验证码响应:', response);
      
      if (response.success) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        if (response.code) {
          console.log('设置验证码显示:', response.code);
          setDisplayCode(response.code);
          
          // 使用多种方式显示验证码
          setTimeout(() => {
            alert(`验证码已生成：${response.code}\n\n请使用此验证码登录`);
          }, 100);
        } else {
          console.error('验证码响应中没有code字段');
          alert('验证码生成失败：未收到验证码');
        }
      } else {
        console.error('验证码发送失败:', response.message);
        alert(response.message || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码异常:', error);
      alert('发送验证码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!isOnline) {
      alert('网络连接已断开，请检查网络连接后重试');
      return;
    }

    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号码');
      return;
    }
    if (!code || code.length !== 6) {
      alert('请输入6位验证码');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.loginWithPhone(phone, code);
      onLoginSuccess(response);
    } catch (error) {
      alert('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isOnline && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">⚠️ 网络连接已断开</p>
          <p className="text-xs text-red-600 mt-1">请检查网络连接后重试</p>
        </div>
      )}
      
      {isOnline && networkType && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            网络类型: {networkType === '4g' ? '4G/移动网络' : networkType === 'wifi' ? 'WiFi' : networkType}
          </p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="请输入手机号码"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          maxLength={11}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">验证码</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="请输入验证码"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            maxLength={6}
          />
          <button
            onClick={handleSendCode}
            disabled={countdown > 0 || loading}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              countdown > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
            }`}
          >
            {countdown > 0 ? `${countdown}秒` : '获取验证码'}
          </button>
        </div>
        {displayCode && (
          <div className="mt-4 p-4 bg-green-100 border-2 border-green-500 rounded-lg animate-pulse">
            <div className="text-center">
              <p className="text-base font-bold text-green-800 mb-2">📱 验证码已生成</p>
              <div className="text-4xl font-black text-green-700 tracking-widest bg-white py-3 px-6 rounded-lg shadow-inner">
                {displayCode}
              </div>
              <p className="text-sm text-green-600 mt-2">请使用上方验证码登录</p>
              <p className="text-xs text-green-500 mt-1">（测试模式，验证码有效期5分钟）</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {loading ? '登录中...' : '登录'}
      </button>
    </div>
  );
};

const WeChatLogin: React.FC<{ onLoginSuccess: (response: LoginResponse) => void }> = ({ onLoginSuccess }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [status, setStatus] = useState<'loading' | 'waiting' | 'scanned' | 'confirmed' | 'expired'>('loading');

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    try {
      setStatus('loading');
      const response = await authService.getWeChatQRCode();
      
      if (response.success && response.qrCodeUrl) {
        setQrCodeUrl(response.qrCodeUrl);
        setStatus('waiting');
        
        pollLoginStatus(response.sessionId);
      } else {
        setStatus('expired');
      }
    } catch (error) {
      setStatus('expired');
    }
  };

  const pollLoginStatus = async (sessionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await authService.checkWeChatLoginStatus(sessionId);
        
        if (response.status === 'scanned') {
          setStatus('scanned');
        } else if (response.status === 'confirmed') {
          setStatus('confirmed');
          clearInterval(pollInterval);
          if (response.user) {
            onLoginSuccess({
              success: true,
              user: response.user,
              token: response.token,
            });
          }
        } else if (response.status === 'expired') {
          setStatus('expired');
          clearInterval(pollInterval);
        }
      } catch (error) {
        clearInterval(pollInterval);
        setStatus('expired');
      }
    }, 2000);
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return '正在生成二维码...';
      case 'waiting':
        return '请使用微信扫描二维码登录';
      case 'scanned':
        return '已扫描，请在手机上确认登录';
      case 'confirmed':
        return '登录成功';
      case 'expired':
        return '二维码已过期';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-gray-600';
      case 'waiting':
        return 'text-blue-600';
      case 'scanned':
        return 'text-green-600';
      case 'confirmed':
        return 'text-green-600';
      case 'expired':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-4 relative z-0">
      <div className="flex justify-center">
        <div className="relative z-0">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="微信登录二维码"
              className="w-64 h-64 border-2 border-gray-200 rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>加载中...</p>
              </div>
            </div>
          )}
          
          {status === 'scanned' && (
            <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">已扫描</p>
              </div>
            </div>
          )}
          
          {status === 'expired' && (
            <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2">已过期</p>
                <button
                  onClick={loadQRCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
                >
                  刷新二维码
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className={`text-center text-sm font-medium ${getStatusColor()}`}>
        {getStatusMessage()}
      </p>

      <div className="text-center text-xs text-gray-500">
        <p>打开微信，扫描二维码登录</p>
      </div>
    </div>
  );
};

export default Login;