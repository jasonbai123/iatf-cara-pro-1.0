# Cloudflare Workers 部署操作指南

## 📋 部署前准备

### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare
```bash
wrangler login
```
这会打开浏览器，请登录您的 Cloudflare 账户并授权。

## 🚀 部署步骤

### 步骤 1: 创建 KV 命名空间
```bash
cd backend
wrangler kv:namespace create "DATA"
```

**重要**: 记录命令输出的 `id` 和 `preview_id` 值，例如：
```
{ binding = "DATA", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyy" }
```

### 步骤 2: 更新 wrangler.toml 配置

打开 `backend/wrangler.toml` 文件，替换以下内容：

1. 将 `your_kv_namespace_id` 替换为步骤 1 中获取的 `id`
2. 将 `your_preview_kv_namespace_id` 替换为步骤 1 中获取的 `preview_id`
3. 生成一个安全的 JWT 密钥并替换 `your_jwt_secret_key_here`

**生成 JWT 密钥的方法**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

配置示例：
```toml
[[kv_namespaces]]
binding = "DATA"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyy"

[vars]
JWT_SECRET = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
SUPER_ADMIN_PHONE = "13510420462"
```

### 步骤 3: 部署到 Cloudflare Workers
```bash
npm run cf:deploy
```

部署成功后，您会看到类似以下的输出：
```
✨ Successfully published your Worker to
  https://iatf-cara-backend.your-subdomain.workers.dev
```

**重要**: 记录这个 URL，下一步需要用到。

### 步骤 4: 更新前端配置

打开项目根目录的 `.env.local` 文件，更新 API 基础 URL：

```env
VITE_API_BASE_URL=https://iatf-cara-backend.your-subdomain.workers.dev
```

将 `your-subdomain` 替换为您实际的 Workers 子域名。

### 步骤 5: 测试部署

#### 测试 API 连接
```bash
curl https://iatf-cara-backend.your-subdomain.workers.dev/api/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "IATF CARA Assistant API is running",
  "environment": "production"
}
```

#### 启动前端应用
```bash
npm run dev
```

在浏览器中打开 `http://localhost:5173`，测试完整功能。

## 🔧 本地开发

如需在本地开发 Cloudflare Workers：

```bash
cd backend
npm run cf:dev
```

这会在本地启动开发服务器，通常运行在 `http://localhost:8787`。

## 📊 监控和管理

### 查看 Worker 日志
```bash
wrangler tail
```

### 管理 KV 数据
```bash
# 列出所有 KV 键
wrangler kv:key list --namespace-id=your_kv_namespace_id

# 获取某个键的值
wrangler kv:key get "key_name" --namespace-id=your_kv_namespace_id

# 删除某个键
wrangler kv:key delete "key_name" --namespace-id=your_kv_namespace_id
```

## 📝 API 端点列表

部署成功后，以下 API 端点将可用：

- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/verify-code` - 验证验证码
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/users/me` - 获取当前用户信息
- `GET /api/users` - 获取用户列表（需要管理员权限）
- `GET /api/users/:phone` - 获取用户详情
- `PUT /api/users/:phone` - 更新用户信息
- `DELETE /api/users/:phone` - 删除用户
- `GET /api/health` - 健康检查

## ❓ 常见问题

### 1. 部署失败：KV 命名空间未找到
确保您已正确创建 KV 命名空间并在 wrangler.toml 中配置了正确的 ID。

### 2. JWT 验证失败
检查 wrangler.toml 中的 JWT_SECRET 是否已正确设置，并且前后端使用相同的密钥。

### 3. CORS 错误
确保前端 .env.local 中的 VITE_API_BASE_URL 与实际的 Workers URL 完全一致。

### 4. 数据未保存
KV 存储可能需要几秒钟才能同步。如果数据立即查询不到，请稍等片刻再试。

## 🎉 完成！

恭喜！您的 IATF CARA Assistant 后端已成功部署到 Cloudflare Workers。享受完全免费、全球分布的高性能 API 服务吧！

## 📚 更多资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [KV 存储文档](https://developers.cloudflare.com/kv/)
