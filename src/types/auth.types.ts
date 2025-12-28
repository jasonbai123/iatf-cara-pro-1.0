export enum UserType {
  TRIAL = 'trial',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  wechatOpenId?: string;
  userType: UserType;
  expiryDate?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginRequest {
  phone: string;
  code: string;
  wechatOpenId?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  downloadUrl?: string;
  releaseNotes?: string;
  forceUpdate?: boolean;
}

export interface SendCodeRequest {
  phone: string;
}

export interface SendCodeResponse {
  success: boolean;
  message?: string;
  expireTime?: number;
  code?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}
