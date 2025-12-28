# Cloudflare Workers 部署指南

## 前置要求

1. Cloudflare 账号（免费）
2. Node.js 环境
3. Git 账号

## 部署步骤

### 第一步：安装 Wrangler CLI

Wrangler 是 Cloudflare Workers 的命令行工具。

```bash
npm install -g wrangler
```

### 第二步：登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，让您授权 Wrangler 访问您的 Cloudflare 账号。

### 第三步：创建 KV 命名空间

Cloudflare Workers 使用 KV 存储来持久化数据。

1. 创建生产环境 KV 命名空间：

```bash
wrangler kv:namespace create "DATA"
```

2. 创建预览环境 KV 命名空间：

```bash
wrangler kv:namespace create "DATA" --preview
```

**重要**：记下这两个命令输出的 `id` 值，后面需要用到。

### 第四步：配置 wrangler.toml

编辑 `backend/wrangler.toml` 文件，将 KV 命名空间 ID 填入：

```toml
name = "iatf-cara-backend"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.development]
vars = { ENVIRONMENT = "development" }

[[kv_namespaces]]
binding = "DATA"
id = "生产环境_KV_ID"           # 替换为第一步获取的 ID
preview_id = "预览环境_KV_ID"   # 替换为第二步获取的 ID

[vars]
JWT_SECRET = "your_jwt_secret_key_here"
SUPER_ADMIN_PHONE = "13510420462"
```

### 第五步：生成 JWT_SECRET

使用 PowerShell 生成安全的随机字符串：

```powershell
-join (1..32 | ForEach-Object { [char](48 + Get-Random -Maximum 78) })
```

将生成的字符串替换到 `wrangler.toml` 中的 `JWT_SECRET`。

### 第六步：本地测试

在部署前，可以先在本地测试：

```bash
cd backend
wrangler dev
```

访问 `http://localhost:8787` 测试 API。

### 第七步：部署到 Cloudflare

```bash
cd backend
wrangler deploy
```

部署成功后，您会看到类似这样的输出：

```
✨ Success! Uploaded your Worker to Cloudflare
```

### 第八步：获取部署 URL

部署成功后，Wrangler 会显示您的 Worker URL，格式如下：

```
https://iatf-cara-backend.your-subdomain.workers.dev
```

## API 端点

部署后，您的 API 端点如下：

- 发送验证码：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/send-code`
- 手机登录：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/login`
- 微信登录：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/wechat-login`
- 生成二维码：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/wechat/qrcode`
- 查询状态：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/wechat/status/{sessionId}`
- 获取用户列表：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/users`
- 删除用户：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/users/{userId}`
- 更新用户类型：`https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/users/{userId}/type`

## 更新前端配置

将前端 `.env.local` 文件中的 `VITE_API_BASE_URL` 更新为您的 Cloudflare Workers URL：

```env
VITE_API_BASE_URL=https://iatf-cara-backend.your-subdomain.workers.dev
```

## 测试部署

使用 PowerShell 测试 API：

```powershell
# 测试发送验证码
Invoke-WebRequest -Uri "https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/send-code" -Method POST -ContentType "application/json" -Body '{"phone":"13510420462"}'
```

## 常见问题

### 1. KV 命名空间未找到

确保您已经在 Cloudflare Dashboard 中创建了 KV 命名空间，并且 `wrangler.toml` 中的 ID 正确。

### 2. 部署失败

检查 `wrangler.toml` 文件格式是否正确，特别是 KV 命名空间配置。

### 3. API 返回 404

确保 `main = "src/index.js"` 路径正确，并且文件存在。

### 4. CORS 错误

Workers 代码已经配置了 CORS，如果仍有问题，检查前端请求的 URL 是否正确。

## 免费额度

Cloudflare Workers 免费额度：

- 每天 100,000 次请求
- 每月 10ms CPU 时间
- KV 存储：每天 100,000 次读取，1,000 次写入

对于个人项目和小型应用，这个额度完全够用。

## 监控和日志

在 Cloudflare Dashboard 中，您可以查看：

- 请求日志
- 错误日志
- 性能指标
- KV 存储使用情况

访问：https://dash.cloudflare.com

## 更新部署

修改代码后，重新部署：

```bash
wrangler deploy
```

## 删除部署

如果需要删除部署：

```bash
wrangler delete iatf-cara-backend
```

## 技术支持

- Cloudflare Workers 文档：https://developers.cloudflare.com/workers/
- Wrangler CLI 文档：https://developers.cloudflare.com/workers/wrangler/
- KV 存储文档：https://developers.cloudflare.com/workers/runtime-apis/kv/
