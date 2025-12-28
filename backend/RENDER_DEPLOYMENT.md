# Render 部署指南

## 前置条件

1. 一个 GitHub 账号
2. 一个 Render 账号（免费注册：https://render.com）
3. 后端代码已推送到 GitHub 仓库

## 部署步骤

### 1. 准备 GitHub 仓库

确保您的后端代码已经推送到 GitHub 仓库。仓库结构应该如下：

```
iatf-cara-assistant-pro/
├── backend/
│   ├── Procfile          # Render 部署配置
│   ├── package.json      # 项目依赖
│   ├── server.js         # 服务器入口文件
│   ├── database.js       # 数据库操作
│   └── data.json         # 数据存储文件
└── .gitignore           # Git 忽略文件
```

### 2. 登录 Render

1. 访问 https://render.com
2. 点击 "Sign Up" 或 "Log In"
3. 使用 GitHub 账号登录

### 3. 创建新的 Web Service

1. 登录后，点击右上角的 "+" 按钮
2. 选择 "New Web Service"
3. 选择 "Build and deploy from a Git repository"
4. 选择您的 GitHub 仓库（如果首次使用，需要授权 Render 访问您的 GitHub）

### 4. 配置 Web Service

#### 基本信息
- **Name**: 输入服务名称，例如 `iatf-cara-backend`
- **Region**: 选择离您最近的区域（推荐 Singapore 或 Frankfurt）
- **Branch**: 选择 `main` 或 `master` 分支

#### 运行时配置
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### 环境变量
在 "Environment" 部分添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PORT` | `3000` | 服务器端口（Render 会自动覆盖） |
| `JWT_SECRET` | `your_secure_jwt_secret_key_here` | JWT 密钥（请使用强密码） |

**重要提示**：
- `JWT_SECRET` 必须是一个强密码，建议使用随机字符串
- 可以使用以下命令生成随机密钥：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5. 高级配置（可选）

#### 持久化存储
Render 免费套餐支持持久化存储，但有以下限制：
- 存储空间：1GB
- 数据会保留在服务器的文件系统中

您的 `data.json` 文件会自动保存在服务器的文件系统中，数据会持久化。

#### 健康检查
在 "Advanced" 部分可以配置健康检查：
- **Health Check Path**: `/` 或 `/health`

### 6. 部署

1. 点击 "Create Web Service" 按钮
2. 等待部署完成（首次部署可能需要 2-5 分钟）
3. 部署成功后，Render 会提供一个 URL，例如：`https://iatf-cara-backend.onrender.com`

### 7. 获取部署 URL

部署成功后，您会看到：
- **Service URL**: 您的后端 API 地址
- **Automatic HTTPS**: Render 会自动配置 SSL 证书

记下这个 URL，格式类似：`https://your-service-name.onrender.com`

## 更新前端配置

部署成功后，需要更新前端配置以使用新的后端 URL：

1. 打开前端项目的 `.env.local` 文件
2. 将 `VITE_API_BASE_URL` 更新为您的 Render URL：

```env
VITE_API_BASE_URL=https://your-service-name.onrender.com
```

3. 重启前端开发服务器：

```bash
npm run dev
```

## 测试部署

### 测试后端 API

使用以下命令测试后端是否正常运行：

```bash
# 测试发送验证码
curl -X POST https://your-service-name.onrender.com/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13510420462"}'

# 测试登录（使用从服务器日志获取的验证码）
curl -X POST https://your-service-name.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13510420462","code":"123456"}'
```

### 测试前端

1. 访问前端应用：http://localhost:5173/iatf-cara-pro-1.0/
2. 使用超级管理员账号登录：
   - 手机号：13510420462
   - 点击"获取验证码"
   - 在 Render 服务器日志中查看验证码
   - 输入验证码完成登录

## 监控和日志

### 查看日志

1. 登录 Render 控制台
2. 选择您的 Web Service
3. 点击 "Logs" 标签
4. 可以实时查看服务器日志

### 查看验证码

在 Render 的日志中，您会看到类似这样的输出：

```
[验证码] 手机号: 13510420462, 验证码: 123456, 过期时间: 2025/12/28 12:00:00
```

## 常见问题

### 1. 部署失败

**问题**: 部署时出现错误

**解决方案**:
- 检查 `package.json` 中的依赖是否正确
- 确保所有依赖都在 `dependencies` 中（不在 `devDependencies` 中）
- 查看 Render 的构建日志，找出具体错误

### 2. 服务无法访问

**问题**: 部署成功但无法访问 API

**解决方案**:
- 检查服务是否正在运行（在 Render 控制台查看服务状态）
- 查看 Render 日志，确认服务器是否正常启动
- 检查端口配置是否正确（应该是 3000）

### 3. 数据丢失

**问题**: 重启服务后数据丢失

**解决方案**:
- Render 免费套餐的持久化存储是可靠的
- 如果数据丢失，检查 `data.json` 文件是否被意外删除
- 考虑定期备份数据

### 4. 服务休眠

**问题**: 免费套餐服务会休眠

**解决方案**:
- Render 免费套餐在 15 分钟无活动后会休眠
- 首次请求后需要 30 秒左右唤醒
- 这是免费套餐的正常行为
- 如果需要 24/7 运行，可以升级到付费套餐

### 5. CORS 错误

**问题**: 前端访问后端时出现 CORS 错误

**解决方案**:
- 后端代码已经配置了 CORS：`app.use(cors())`
- 确保 `cors` 包已正确安装
- 检查前端配置的 API URL 是否正确

## 费用说明

### 免费套餐限制

- **每月运行时间**: 750 小时
- **内存**: 512 MB
- **CPU**: 0.1 CPU
- **存储**: 1 GB
- **休眠时间**: 15 分钟无活动后休眠

### 升级建议

如果需要更好的性能或 24/7 运行，可以考虑升级到付费套餐：
- **Starter**: $7/月（512 MB，24/7 运行）
- **Standard**: $25/月（2 GB，24/7 运行）

## 维护建议

1. **定期备份**: 定期下载 `data.json` 文件进行备份
2. **监控日志**: 定期检查 Render 日志，确保服务正常运行
3. **更新依赖**: 定期更新 `package.json` 中的依赖版本
4. **安全检查**: 定期检查和更新 `JWT_SECRET`

## 下一步

部署完成后，您可以：

1. ✅ 测试手机验证码登录功能
2. ✅ 测试微信登录功能（需要配置微信 AppID）
3. ✅ 测试用户管理功能
4. ✅ 配置自定义域名（可选）
5. ✅ 设置 CI/CD 自动部署（可选）

## 技术支持

如果遇到问题，可以：
- 查看 Render 文档：https://render.com/docs
- 查看 Render 状态页：https://status.render.com
- 检查 GitHub 仓库的 Issues

## 部署检查清单

- [ ] 后端代码已推送到 GitHub
- [ ] Render 账号已创建
- [ ] Web Service 已创建
- [ ] 环境变量已配置
- [ ] 部署成功，服务正在运行
- [ ] 后端 API 测试通过
- [ ] 前端配置已更新
- [ ] 前端与后端集成测试通过
- [ ] 登录功能正常工作

祝您部署顺利！🚀
