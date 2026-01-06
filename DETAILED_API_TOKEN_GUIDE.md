# 详细的 Cloudflare API Token 创建步骤

## 导航步骤

从您当前的页面开始：

1. **点击左侧导航栏的 "Manage account"**（在页面底部附近）
2. **在展开的菜单中点击 "My profile"**
3. **在顶部导航栏中点击 "API Tokens"**

## API Token 创建步骤

1. **点击 "Create Token" 按钮**（蓝色按钮，通常在页面右侧）

2. **选择模板**：
   - 如果看到 "Edit Cloudflare Workers" 模板，点击它
   - 如果没有看到该模板，点击 "Create Custom Token"

3. **如果使用自定义 Token**，设置以下权限：
   - **Account** 部分：
     - 选择 "Workers Scripts" - 设置为 "Edit"
     - 选择 "Workers KV Storage" - 设置为 "Edit"
     - 选择 "Account Settings" - 设置为 "Read"
   - **User** 部分：
     - 选择 "User Details" - 设置为 "Read"

4. **点击 "Continue to summary"**

5. **点击 "Create Token"**

6. **重要**：复制生成的 Token（只显示一次，请妥善保存）

## 登录 Wrangler CLI

获得 Token 后，在 PowerShell 中设置环境变量：

```powershell
$env:CLOUDFLARE_API_TOKEN = "your_api_token_here"
```

然后验证登录：

```powershell
wrangler whoami
```

## 遇到问题？

如果您在导航过程中仍然遇到问题：

1. 直接访问 API Tokens 页面：https://dash.cloudflare.com/profile/api-tokens
2. 或者访问 Cloudflare Dashboard 首页：https://dash.cloudflare.com/ 然后重新导航

请在创建好 API Token 后告诉我，我将继续后续的部署步骤。