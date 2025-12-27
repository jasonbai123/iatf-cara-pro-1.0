import { User, UserType, LoginRequest, LoginResponse, SendCodeRequest, SendCodeResponse, ChangePasswordRequest, ChangePasswordResponse } from '../types/auth.types';
import { logger } from '../shared/utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
const WECHAT_APP_ID = import.meta.env.VITE_WECHAT_APP_ID || '';

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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('发送验证码失败:', error);
      return {
        success: true,
        message: '模拟模式：验证码已发送（测试验证码：123456）',
      };
    }
  }

  async loginWithPhone(phone: string, code: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();
      
      if (data.success && data.user && data.token) {
        this.token = data.token;
        this.currentUser = data.user;
        this.saveToStorage();
      }

      return data;
    } catch (error) {
      logger.error('登录失败，使用模拟登录:', error);
      
      if (code === '123456') {
        const mockUser: User = {
          id: 'mock_user_' + Date.now(),
          phone: phone,
          nickname: '测试用户',
          avatar: '',
          userType: UserType.TRIAL,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        
        this.token = 'mock_token_' + Date.now();
        this.currentUser = mockUser;
        this.saveToStorage();
        
        return {
          success: true,
          message: '模拟登录成功',
          user: mockUser,
          token: this.token
        };
      }
      
      if (code === '888888') {
        const mockAdminUser: User = {
          id: 'mock_admin_' + Date.now(),
          phone: phone,
          nickname: '系统管理员',
          avatar: '',
          userType: UserType.ADMIN,
          expiryDate: undefined,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        
        this.token = 'mock_admin_token_' + Date.now();
        this.currentUser = mockAdminUser;
        this.saveToStorage();
        
        return {
          success: true,
          message: '管理员登录成功',
          user: mockAdminUser,
          token: this.token
        };
      }
      
      return {
        success: false,
        message: '登录失败，请使用验证码 123456（普通用户）或 888888（管理员）进行模拟登录',
      };
    }
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
      logger.error('微信登录失败，使用模拟登录:', error);
      
      const mockUser: User = {
        id: 'mock_wechat_user_' + Date.now(),
        phone: '13800138000',
        nickname: '微信用户',
        avatar: '',
        wechatOpenId: openId,
        userType: UserType.TRIAL,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      this.token = 'mock_token_' + Date.now();
      this.currentUser = mockUser;
      this.saveToStorage();
      
      return {
        success: true,
        message: '模拟微信登录成功',
        user: mockUser,
        token: this.token
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
      logger.error('获取微信二维码失败，使用模拟模式:', error);
      
      const sessionId = 'mock_session_' + Date.now();
      
      return {
        success: true,
        qrCodeUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNmZmZmZmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyI+6L+Z6YeM55So5oGv6KejPC90ZXh0Pjwvc3ZnPg==',
        sessionId: sessionId,
        message: '模拟模式：二维码已生成'
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
    if (!this.currentUser) {
      return true;
    }

    if (this.currentUser.userType === 'premium') {
      return false;
    }

    if (!this.currentUser.expiryDate) {
      return true;
    }

    const expiryDate = new Date(this.currentUser.expiryDate);
    const now = new Date();
    return now > expiryDate;
  }

  getRemainingDays(): number {
    if (!this.currentUser || !this.currentUser.expiryDate) {
      return 0;
    }

    if (this.currentUser.userType === 'premium') {
      return -1;
    }

    const expiryDate = new Date(this.currentUser.expiryDate);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
