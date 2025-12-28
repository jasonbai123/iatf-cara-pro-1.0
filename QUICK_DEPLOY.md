# 快速部署指南 - 解决线上登录问题

## 问题说明

当前前端已部署到 GitHub Pages，但后端API还在本地（localhost:3000），导致线上无法登录。

## 解决方案：将后端部署到 Render

### 步骤1：注册并登录 Render

1. 访问 https://render.com
2. 点击 "Sign Up" 或 "Log In"
3. 使用 GitHub 账号登录（推荐）

### 步骤2：创建 Web Service

1. 登录后，点击右上角 "+" 按钮
2. 选择 "New Web Service"
3. 点击 "Connect a GitHub repository"
4. 搜索并选择仓库：`jasonbai123/iatf-cara-pro-1.0`
5. 如果首次使用，需要授权 Render 访问您的 GitHub

### 步骤3：配置 Web Service

#### 基本信息
- **Name**: `iatf-cara-backend`
- **Region**: 选择 `Singapore`（推荐，延迟低）
- **Branch**: `master`

#### 构建和运行配置
- **Runtime**: `Node`
- **Root Directory**: `backend`（重要！）
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### 环境变量（Environment Variables）

在 "Environment" 部分添加以下变量：

| Key | Value | 说明 |
|-----|-------|------|
| `JWT_SECRET` | `your_secure_jwt_secret_key_here` | JWT密钥（必须修改） |

**生成 JWT_SECRET：**
```bash
# 在本地终端运行以下命令生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制生成的密钥，粘贴到 Render 的 JWT_SECRET 字段中。

### 步骤4：部署

1. 检查所有配置是否正确
2. 点击 "Create Web Service" 按钮
3. 等待部署完成（首次部署约 2-5 分钟）

### 步骤5：获取后端 URL

部署成功后，Render 会显示：
- **Service URL**: 例如 `https://iatf-cara-backend.onrender.com`

**复制这个 URL！**

### 步骤6：更新前端配置

1. 在本地打开 `.env.local` 文件
2. 修改 `VITE_API_BASE_URL` 为您的 Render URL：

```env
VITE_API_BASE_URL=https://iatf-cara-backend.onrender.com
```

3. 保存文件

### 步骤7：重新构建并推送前端

```bash
# 在项目根目录执行
npm run build
git add .
git commit -m "更新API配置为Render后端"
git push origin master
```

### 步骤8：等待 GitHub Actions 部署

1. 访问 https://github.com/jasonbai123/iatf-cara-pro-1.0/actions
2. 等待构建和部署完成（约 2-3 分钟）
3. 部署成功后，访问 https://jasonbai123.github.io/iatf-cara-pro-1.0/

### 步骤9：测试登录

1. 打开 https://jasonbai123.github.io/iatf-cara-pro-1.0/
2. 选择"手机登录"
3. 输入超级管理员手机号：`13510420462`
4. 点击"获取验证码"
5. 访问 Render 控制台查看日志，获取验证码
6. 输入验证码完成登录

## 常见问题

### Q1: 部署失败怎么办？

**A**: 检查以下几点：
- 确保 Root Directory 设置为 `backend`
- 检查 package.json 中的依赖是否正确
- 查看 Render 的构建日志，找出具体错误

### Q2: 部署成功但无法访问？

**A**:
- 检查服务是否正在运行（在 Render 控制台查看状态）
- 查看 Render 日志，确认服务器是否正常启动
- 等待几分钟，有时需要时间初始化

### Q3: 验证码发送失败？

**A**:
- 检查 Render 日志，查看验证码是否生成
- 验证码会在日志中显示：`[验证码] 手机号: xxx, 验证码: xxxxx`
- 验证码有效期为 5 分钟

### Q4: 服务休眠问题？

**A**:
- Render 免费套餐在 15 分钟无活动后会休眠
- 首次请求需要 30 秒左右唤醒
- 这是正常行为，不影响使用

### Q5: 如何查看日志？

**A**:
1. 登录 Render 控制台
2. 选择 `iatf-cara-backend` 服务
3. 点击 "Logs" 标签
4. 实时查看服务器日志

## 费用说明

### 免费套餐
- **每月运行时间**: 750 小时
- **内存**: 512 MB
- **CPU**: 0.1 CPU
- **存储**: 1 GB
- **休眠**: 15 分钟无活动后休眠

### 升级建议
如果需要 24/7 运行，可以升级到付费套餐：
- **Starter**: $7/月（512 MB，24/7 运行）

## 部署检查清单

- [ ] Render 账号已创建
- [ ] GitHub 仓库已连接
- [ ] Web Service 已创建
- [ ] Root Directory 设置为 `backend`
- [ ] 环境变量已配置（JWT_SECRET）
- [ ] 部署成功，服务正在运行
- [ ] 后端 URL 已获取
- [ ] 前端 .env.local 已更新
- [ ] 前端已重新构建并推送
- [ ] GitHub Actions 部署成功
- [ ] 线上登录功能测试通过

## 下一步

部署完成后，您可以：

1. ✅ 测试手机验证码登录
2. ✅ 测试微信登录（需要配置微信 AppID）
3. ✅ 测试用户管理功能
4. ✅ 配置自定义域名（可选）
5. ✅ 设置定时任务防止休眠（可选）

## 技术支持

如果遇到问题：
- 查看 Render 文档：https://render.com/docs
- 查看 Render 状态页：https://status.render.com
- 检查 GitHub Issues

---

**预计完成时间**: 15-20 分钟

**重要提示**:
- JWT_SECRET 必须使用强密码
- 不要将 JWT_SECRET 提交到 Git
- 定期备份 Render 上的数据
