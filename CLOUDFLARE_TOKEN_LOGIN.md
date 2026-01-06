# Cloudflare API Token 登录指南

由于 OAuth 回调可能存在网络问题，我们使用 API Token 方式登录。

## 步骤 1: 创建 Cloudflare API Token

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token" 按钮
3. 选择 "Edit Cloudflare Workers" 模板（或者点击 "Use template"）
4. 确认权限包括：
   - Account - Workers Scripts - Edit
   - Account - Workers KV Storage - Edit
   - Account - Account Settings - Read
   - User - User Details - Read
5. 点击 "Continue to summary"
6. 点击 "Create Token"
7. **重要**: 复制生成的 Token（只显示一次，请妥善保存）

## 步骤 2: 使用 Token 登录

在命令行中运行：

```bash
wrangler login --token
```

然后粘贴您刚才复制的 Token。

## 步骤 3: 验证登录

登录成功后，运行以下命令验证：

```bash
wrangler whoami
```

应该显示您的 Cloudflare 账户信息。

## 注意事项

- API Token 具有与账户密码相同的安全性，请妥善保管
- 不要将 Token 提交到 Git 仓库
- 如果 Token 泄露，请立即在 Cloudflare Dashboard 中撤销并重新创建
