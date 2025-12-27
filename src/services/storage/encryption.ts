/**
 * 加密服务
 * 用于保护敏感数据（如API密钥）
 */

import CryptoJS from 'crypto-js';
import { logger } from '../../shared/utils/logger';

export class EncryptionService {
  private static readonly DEFAULT_KEY = 'IATF-CARA-DEFAULT-KEY';
  private secretKey: string;

  constructor(customKey?: string) {
    this.secretKey = customKey || EncryptionService.DEFAULT_KEY;
  }

  /**
   * 加密数据
   */
  encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      logger.error('Encryption Error:', error);
      throw new Error('数据加密失败');
    }
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      logger.error('Decryption Error:', error);
      throw new Error('数据解密失败');
    }
  }

  /**
   * 设置加密密钥
   */
  setSecretKey(key: string): void {
    this.secretKey = key;
  }

  /**
   * 生成哈希值
   */
  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * 验证数据完整性
   */
  verifyIntegrity(data: string, hash: string): boolean {
    return this.hash(data) === hash;
  }
}

// 导出单例
export const encryptionService = new EncryptionService();
