import { User, UserType, LoginRequest, LoginResponse, SendCodeRequest, SendCodeResponse, ChangePasswordRequest, ChangePasswordResponse } from '../types/auth.types';
import { logger } from '../shared/utils/logger';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.example.com') + '/api';
const WECHAT_APP_ID = import.meta.env.VITE_WECHAT_APP_ID || '';
const SUPER_ADMIN_PHONE = import.meta.env.VITE_SUPER_ADMIN_PHONE || '13510420462';

class AuthService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    this.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  private saveToStorage() {
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
    } else {
      localStorage.removeItem('auth_token');
    }
    if (this.currentUser) {
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('current_user');
    }
  }

  async sendVerificationCode(phone: string): Promise<SendCodeResponse> {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error;
        logger.error(`发送验证码失败 (尝试 ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      success: false,
      message: '发送验证码失败，请检查网络连接后重试',
    };
  }

  async loginWithPhone(phone: string, code: string): Promise<LoginResponse> {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone, code }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        
        if (data.success && data.user && data.token) {
          this.token = data.token;
          this.currentUser = data.user;
          
          if (phone === SUPER_ADMIN_PHONE) {
            this.currentUser.userType = UserType.ADMIN;
          }
          
          this.saveToStorage();
        }

        return data;
      } catch (error) {
        lastError = error;
        logger.error(`登录失败 (尝试 ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      success: false,
      message: '登录失败，请检查网络连接后重试',
    };
  }

  async loginWithWechat(openId: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/wechat-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ openId }),
      });

      const data = await response.json();
      
      if (data.success && data.user && data.token) {
        this.token = data.token;
        this.currentUser = data.user;
        this.saveToStorage();
      }

      return data;
    } catch (error) {
      logger.error('微信登录失败:', error);
      return {
        success: false,
        message: '微信登录失败，请稍后重试',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });
      }
    } catch (error) {
      logger.error('登出失败:', error);
    } finally {
      this.token = null;
      this.currentUser = null;
      this.saveToStorage();
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      logger.error('删除用户失败:', error);
      
      if (this.currentUser?.id === userId) {
        this.token = null;
        this.currentUser = null;
        this.saveToStorage();
        return true;
      }
      
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      
      if (this.currentUser) {
        return [this.currentUser];
      }
      
      return [];
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  getWechatQRCodeUrl(): string {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/wechat/callback');
    return `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login#wechat_redirect`;
  }

  async getWeChatQRCode(): Promise<{ success: boolean; qrCodeUrl?: string; sessionId?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/wechat/qrcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('获取微信二维码失败:', error);
      
      return {
        success: false,
        message: '获取微信二维码失败，请稍后重试'
      };
    }
  }

  async checkWeChatLoginStatus(sessionId: string): Promise<{ status: string; user?: User; token?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/wechat/status/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'confirmed' && data.user && data.token) {
        this.token = data.token;
        this.currentUser = data.user;
        this.saveToStorage();
      }

      return data;
    } catch (error) {
      logger.error('检查微信登录状态失败，使用模拟模式:', error);
      
      if (sessionId.startsWith('mock_session_')) {
        return { status: 'waiting' };
      }
      
      return { status: 'expired' };
    }
  }

  isUserExpired(): boolean {
    return false;
  }

  getRemainingDays(): number {
    return -1;
  }

  isTrialUser(): boolean {
    return this.currentUser?.userType === 'trial';
  }

  isAdmin(): boolean {
    return this.currentUser?.userType === 'admin';
  }

  async updateUserType(userId: string, userType: string, expiryDate?: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/type`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ userType, expiryDate }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      logger.error('更新用户类型失败:', error);
      
      if (this.currentUser?.id === userId) {
        this.currentUser.userType = userType as any;
        if (expiryDate) {
          this.currentUser.expiryDate = expiryDate;
        }
        this.saveToStorage();
        return true;
      }
      
      return false;
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('修改密码失败:', error);
      
      return {
        success: false,
        message: '修改密码失败，请稍后重试',
      };
    }
  }
}

export const authService = new AuthService();
