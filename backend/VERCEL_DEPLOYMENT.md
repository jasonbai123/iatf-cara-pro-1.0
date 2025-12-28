# Vercel 部署指南

本文档详细说明如何将 IATF CARA Assistant Pro 后端 API 部署到 Vercel 平台。

## 为什么选择 Vercel？

- ✅ **免费额度充足**：每月 100GB 带宽，足够小型项目使用
- ✅ **自动部署**：与 GitHub 集成，代码推送自动触发部署
- ✅ **全球 CDN**：自动分发到全球边缘节点
- ✅ **零配置**：自动检测 Node.js 项目并优化部署
- ✅ **HTTPS 支持**：自动配置 SSL 证书

## 部署步骤

### 1. 注册 Vercel 账号

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 "Sign Up" 注册账号
3. 使用 GitHub、GitLab 或 Bitbucket 账号登录（推荐使用 GitHub）
4. 完成邮箱验证

### 2. 导入项目

1. 登录 Vercel 后，点击 "Add New Project"
2. 在 "Import Git Repository" 中找到 `iatf-cara-pro-1.0` 仓库
3. 点击 "Import" 按钮

### 3. 配置项目

#### 3.1 项目设置

在项目配置页面：

- **Framework Preset**: 选择 "Other" 或 "Node.js"
- **Root Directory**: 设置为 `backend`
- **Build Command**: 留空（不需要构建步骤）
- **Output Directory**: 留空

#### 3.2 环境变量配置

在 "Environment Variables" 部分添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `JWT_SECRET` | 生成一个强随机字符串 | 用于 JWT 令牌签名 |
| `SUPER_ADMIN_PHONE` | `13510420462` | 超级管理员手机号 |

**生成 JWT_SECRET 的方法：**

在 PowerShell 中运行：
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

或使用在线工具：https://www.random.org/strings/

### 4. 部署项目

1. 点击 "Deploy" 按钮
2. 等待部署完成（通常需要 1-2 分钟）
3. 部署成功后，Vercel 会提供一个 URL，例如：
   ```
   https://iatf-cara-backend.vercel.app
   ```

### 5. 验证部署

#### 5.1 检查 API 端点

使用以下命令测试 API 是否正常工作：

**发送验证码：**
```powershell
Invoke-WebRequest -Uri "https://iatf-cara-backend.vercel.app/api/auth/send-code" -Method POST -ContentType "application/json" -Body '{"phone":"13510420462"}'
```

**手机登录：**
```powershell
Invoke-WebRequest -Uri "https://iatf-cara-backend.vercel.app/api/auth/login" -Method POST -ContentType "application/json" -Body '{"phone":"13510420462","code":"123456"}'
```

#### 5.2 查看日志

1. 在 Vercel 项目页面，点击 "Deployments"
2. 选择最新的部署记录
3. 点击 "View Logs" 查看运行日志

## 前端配置更新

部署成功后，需要更新前端的 API 地址：

1. 打开项目根目录的 `.env.local` 文件
2. 将 `VITE_API_BASE_URL` 更新为 Vercel 部署的 URL：
   ```
   VITE_API_BASE_URL=https://iatf-cara-backend.vercel.app/api
   ```

3. 重新部署前端到 GitHub Pages

## 常见问题

### Q1: 部署失败，提示 "Module not found"

**解决方案：**
确保 `backend/package.json` 中的所有依赖都已正确安装。Vercel 会自动运行 `npm install`。

### Q2: API 返回 500 错误

**解决方案：**
1. 检查 Vercel 部署日志
2. 确认环境变量 `JWT_SECRET` 已正确配置
3. 检查 `database.js` 文件路径是否正确

### Q3: CORS 错误

**解决方案：**
确保 `api/index.js` 中已正确配置 CORS：
```javascript
app.use(cors());
```

### Q4: 数据持久化问题

**说明：**
Vercel Serverless Functions 是无状态的，数据无法持久化到本地文件系统。如果需要持久化存储，建议：
- 使用 Vercel Postgres（免费额度）
- 使用 MongoDB Atlas（免费层级）
- 使用 Supabase（免费层级）

当前实现使用 JSON 文件存储，数据会在函数重启后丢失。这是演示用的临时方案。

### Q5: 如何自定义域名

**步骤：**
1. 在 Vercel 项目页面，点击 "Settings" > "Domains"
2. 添加自定义域名
3. 按照提示配置 DNS 记录
4. Vercel 会自动配置 SSL 证书

## 监控和维护

### 查看使用情况

1. 进入 Vercel 项目页面
2. 点击 "Usage" 标签
3. 查看带宽、函数调用次数等使用情况

### 自动部署

Vercel 会自动监听 GitHub 仓库的变更：
- 推送到 `master` 分支 → 自动部署到生产环境
- 推送到其他分支 → 自动创建预览部署

### 回滚部署

如果新部署出现问题：
1. 进入 "Deployments" 页面
2. 找到之前稳定的部署版本
3. 点击右侧的 "..." 菜单
4. 选择 "Promote to Production"

## 成本估算

Vercel 免费套餐包括：
- ✅ 100GB 带宽/月
- ✅ 无限次部署
- ✅ 100GB-Hours/月 Serverless Functions
- ✅ 自动 HTTPS
- ✅ 全球 CDN

对于小型项目，免费套餐完全够用。

## 下一步

1. ✅ 部署后端 API 到 Vercel
2. ✅ 更新前端 API 地址配置
3. ✅ 测试完整的登录流程
4. ✅ 考虑添加持久化数据库（如 Vercel Postgres）

## 技术支持

- Vercel 文档：https://vercel.com/docs
- Vercel 社区：https://vercel.com/community
- GitHub Issues：https://github.com/jasonbai123/iatf-cara-pro-1.0/issues
