# Vercel 快速部署指南

## 一分钟快速部署

### 前置条件
- 已有 Vercel 账号（使用 GitHub 登录）
- 代码已推送到 GitHub 仓库

### 部署步骤

#### 1. 访问 Vercel
打开 [https://vercel.com/new](https://vercel.com/new)

#### 2. 导入项目
- 选择 `iatf-cara-pro-1.0` 仓库
- Root Directory 设置为 `backend`
- 点击 "Continue"

#### 3. 配置环境变量
添加以下环境变量：
```
JWT_SECRET = your_random_secret_key_here
SUPER_ADMIN_PHONE = 13510420462
```

#### 4. 部署
点击 "Deploy" 按钮，等待 1-2 分钟

#### 5. 获取 API 地址
部署成功后，复制 Vercel 提供的 URL，例如：
```
https://iatf-cara-backend.vercel.app
```

#### 6. 更新前端配置
在项目根目录的 `.env.local` 文件中：
```
VITE_API_BASE_URL=https://iatf-cara-backend.vercel.app/api
```

#### 7. 测试
访问 https://jasonbai123.github.io/iatf-cara-pro-1.0/ 测试登录功能

## 生成 JWT_SECRET

在 PowerShell 中运行：
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## API 端点测试

### 发送验证码
```powershell
Invoke-WebRequest -Uri "https://iatf-cara-backend.vercel.app/api/auth/send-code" -Method POST -ContentType "application/json" -Body '{"phone":"13510420462"}'
```

### 手机登录
```powershell
Invoke-WebRequest -Uri "https://iatf-cara-backend.vercel.app/api/auth/login" -Method POST -ContentType "application/json" -Body '{"phone":"13510420462","code":"123456"}'
```

## 注意事项

⚠️ **数据持久化**：当前实现使用 JSON 文件存储，Vercel Serverless Functions 重启后数据会丢失。如需持久化存储，建议使用 Vercel Postgres 或 MongoDB Atlas。

✅ **免费额度**：Vercel 免费套餐每月 100GB 带宽，足够小型项目使用。

🔄 **自动部署**：推送到 GitHub master 分支会自动触发部署。

## 需要帮助？

查看详细文档：[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
