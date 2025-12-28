# Cloudflare Workers 快速部署指南

## 快速开始

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 KV 命名空间

```bash
# 生产环境
wrangler kv:namespace create "DATA"

# 预览环境
wrangler kv:namespace create "DATA" --preview
```

**记下两个命令输出的 `id` 值！**

### 4. 配置 wrangler.toml

编辑 `backend/wrangler.toml`，填入 KV ID 和 JWT_SECRET：

```toml
[[kv_namespaces]]
binding = "DATA"
id = "生产环境_KV_ID"           # 从步骤 3 获取
preview_id = "预览环境_KV_ID"   # 从步骤 3 获取

[vars]
JWT_SECRET = "your_jwt_secret_key_here"    # 使用下面的命令生成
SUPER_ADMIN_PHONE = "13510420462"
```

### 5. 生成 JWT_SECRET

```powershell
-join (1..32 | ForEach-Object { [char](48 + Get-Random -Maximum 78) })
```

### 6. 部署

```bash
cd backend
wrangler deploy
```

### 7. 获取部署 URL

部署成功后会显示：
```
https://iatf-cara-backend.your-subdomain.workers.dev
```

### 8. 更新前端配置

编辑 `.env.local`：

```env
VITE_API_BASE_URL=https://iatf-cara-backend.your-subdomain.workers.dev
```

### 9. 测试

```powershell
Invoke-WebRequest -Uri "https://iatf-cara-backend.your-subdomain.workers.dev/api/auth/send-code" -Method POST -ContentType "application/json" -Body '{"phone":"13510420462"}'
```

## 完整示例

假设：
- 生产 KV ID: `abc123def456`
- 预览 KV ID: `xyz789uvw012`
- JWT_SECRET: `MySecretKey12345678901234567890`

配置文件 `backend/wrangler.toml`：

```toml
name = "iatf-cara-backend"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "DATA"
id = "abc123def456"
preview_id = "xyz789uvw012"

[vars]
JWT_SECRET = "MySecretKey12345678901234567890"
SUPER_ADMIN_PHONE = "13510420462"
```

部署命令：

```bash
cd backend
wrangler deploy
```

部署成功后，前端配置 `.env.local`：

```env
VITE_API_BASE_URL=https://iatf-cara-backend.your-subdomain.workers.dev
```

## 常见问题

**Q: 部署失败怎么办？**
A: 检查 `wrangler.toml` 格式，确保 KV ID 正确。

**Q: 如何查看日志？**
A: 访问 https://dash.cloudflare.com -> Workers -> 选择 Worker -> Logs

**Q: 如何更新部署？**
A: 修改代码后，运行 `wrangler deploy`

**Q: 免费额度是多少？**
A: 每天 100,000 次请求，完全免费！

## 下一步

- 访问 https://dash.cloudflare.com 查看部署状态
- 测试所有 API 端点
- 部署前端到 GitHub Pages

详细文档请参考 `CLOUDFLARE_DEPLOYMENT.md`
