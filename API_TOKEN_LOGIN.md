# Cloudflare Workers 部署 - 使用 API Token 登录

## 方法 1: 使用环境变量（推荐）

1. 创建 API Token：
   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - 点击 "Create Token"
   - 选择 "Edit Cloudflare Workers" 模板
   - 点击 "Create Token"
   - 复制生成的 Token

2. 在 PowerShell 中设置环境变量：

```powershell
$env:CLOUDFLARE_API_TOKEN = "your_api_token_here"
```

3. 验证登录：

```powershell
wrangler whoami
```

## 方法 2: 使用配置文件

1. 创建 `~/.wrangler/config/default.toml` 文件（Windows 路径：`C:\Users\你的用户名\.wrangler\config\default.toml`）

2. 添加以下内容：

```toml
api_token = "your_api_token_here"
```

3. 验证登录：

```powershell
wrangler whoami
```

## 方法 3: 使用 .dev.vars 文件（项目级别）

1. 在 `backend` 目录下创建 `.dev.vars` 文件：

```env
CLOUDFLARE_API_TOKEN=your_api_token_here
```

2. 验证登录：

```powershell
cd backend
wrangler whoami
```

## 重要提示

- `.dev.vars` 文件已添加到 `.gitignore`，不会被提交到 Git
- API Token 具有与账户密码相同的安全性，请妥善保管
- 不要将 Token 提交到 Git 仓库或分享给他人

## 创建 API Token 的权限要求

创建 Token 时，请确保包含以下权限：
- Account - Workers Scripts - Edit
- Account - Workers KV Storage - Edit
- Account - Account Settings - Read
- User - User Details - Read
