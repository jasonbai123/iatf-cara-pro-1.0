# GitHub Desktop 部署指南

本指南将帮助您使用 GitHub Desktop 将 IATF CARA Assistant Pro 应用发布到 GitHub Pages。

## 前提条件

1. **安装必要软件**
   - [GitHub Desktop](https://desktop.github.com/)
   - [Node.js](https://nodejs.org/) (>= 18.0.0)
   - [Git](https://git-scm.com/) (GitHub Desktop 会自动安装)

2. **GitHub 账号**
   - 注册 [GitHub](https://github.com/) 账号
   - 确保账号可以创建公开仓库

## 部署步骤

### 第一步：初始化 Git 仓库

项目已经初始化了 Git 仓库，您可以直接使用。

### 第二步：在 GitHub 上创建仓库

1. 登录 [GitHub](https://github.com/)
2. 点击右上角的 `+` 号，选择 `New repository`
3. 填写仓库信息：
   - **Repository name**: `iatf-cara-assistant-pro`
   - **Description**: `IATF 16949 审核不符合项管理工具`
   - **Public/Private**: 选择 `Public`（GitHub Pages 需要）
   - **不要勾选** "Add a README file"
   - **不要勾选** "Add .gitignore"
   - **不要勾选** "Choose a license"
4. 点击 `Create repository`

### 第三步：使用 GitHub Desktop 连接仓库

1. 打开 **GitHub Desktop**
2. 点击 `File` -> `Add Local Repository`
3. 选择项目文件夹：`C:\Users\abc05\Downloads\iatf-cara-assistant-pro`
4. 点击 `Add Repository`

### 第四步：配置远程仓库

1. 在 GitHub Desktop 中，点击 `Repository` -> `Repository Settings`
2. 在 `General` 标签页，找到 `Remote` 部分
3. 点击 `Edit`，输入刚才创建的 GitHub 仓库地址：
   ```
   https://github.com/你的用户名/iatf-cara-assistant-pro.git
   ```
4. 点击 `Save`

### 第五步：首次提交代码

1. 在 GitHub Desktop 左侧，您会看到未提交的更改
2. 在左下角的 `Summary` 输入框中输入提交信息：
   ```
   Initial commit: IATF CARA Assistant Pro v1.0.0
   ```
3. 点击 `Commit to main`
4. 点击 `Publish repository` 按钮
5. 确认仓库名称和描述，点击 `Publish repository`

### 第六步：启用 GitHub Pages

1. 在 GitHub 网站上打开您的仓库
2. 点击 `Settings` 标签
3. 在左侧菜单中找到 `Pages`
4. 在 `Build and deployment` 部分：
   - **Source**: 选择 `GitHub Actions`
   - （因为我们已经配置了 GitHub Actions 工作流）
5. 点击 `Save`

### 第七步：触发自动部署

1. 在 GitHub Desktop 中，点击 `Fetch origin` 获取最新更改
2. 如果有新的提交，点击 `Pull origin`
3. 推送代码：点击 `Push origin`
4. GitHub Actions 会自动构建并部署到 GitHub Pages

### 第八步：访问部署的应用

1. 在 GitHub 仓库页面，点击 `Actions` 标签
2. 等待 `Deploy to GitHub Pages` 工作流完成（约 2-3 分钟）
3. 工作流完成后，点击仓库的 `Settings` -> `Pages`
4. 在顶部会显示您的应用地址：
   ```
   https://你的用户名.github.io/iatf-cara-assistant-pro/
   ```

## 本地测试构建

在推送之前，您可以在本地测试构建：

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

预览地址：`http://localhost:4173`

## 更新应用

当您修改代码后，更新应用的步骤：

1. 在 GitHub Desktop 中查看更改
2. 输入提交信息（例如：`feat: 添加新功能`）
3. 点击 `Commit to main`
4. 点击 `Push origin`
5. GitHub Actions 会自动重新构建和部署

## 常见问题

### Q1: 部署失败怎么办？

A: 检查以下几点：
1. 确保仓库是 Public 的
2. 检查 GitHub Actions 工作流日志
3. 确保 `package.json` 中的 `build` 脚本正确
4. 检查是否有语法错误

### Q2: 如何查看部署日志？

A:
1. 在 GitHub 仓库页面，点击 `Actions` 标签
2. 点击最新的工作流运行记录
3. 点击 `build` 或 `deploy` 任务查看详细日志

### Q3: 如何自定义域名？

A:
1. 在仓库 `Settings` -> `Pages`
2. 在 `Custom domain` 中输入您的域名
3. 在域名 DNS 设置中添加 CNAME 记录

### Q4: 部署后页面空白怎么办？

A:
1. 检查 `vite.config.ts` 中的 `base` 配置
2. 如果使用自定义域名，确保 `base` 设置正确
3. 检查浏览器控制台是否有错误

### Q5: 如何回滚到之前的版本？

A:
1. 在 GitHub Desktop 中，点击 `Branch` -> `Create new branch`
2. 选择要回滚的提交
3. 切换到新分支后，推送到 GitHub
4. 或者在 GitHub 网站上直接回滚 commit

## GitHub Actions 工作流说明

项目已经配置了自动部署工作流 (`.github/workflows/deploy.yml`)：

- **触发条件**: 推送到 `main` 或 `master` 分支
- **构建环境**: Ubuntu 最新版本
- **Node.js 版本**: 20
- **部署目标**: GitHub Pages
- **自动优化**: 自动压缩和优化资源

## 性能优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小
   - 使用 CDN 加速

2. **代码分割**
   - Vite 已经自动进行代码分割
   - 可以进一步优化路由级别的懒加载

3. **缓存策略**
   - PWA Service Worker 已经配置缓存
   - 可以调整缓存过期时间

## 安全建议

1. **API 密钥保护**
   - 不要将真实的 API 密钥提交到 Git
   - 使用环境变量或本地存储
   - 定期更换 API 密钥

2. **依赖更新**
   - 定期运行 `npm audit` 检查安全漏洞
   - 及时更新依赖包

3. **HTTPS**
   - GitHub Pages 自动提供 HTTPS
   - 确保所有 API 调用都使用 HTTPS

## 监控和分析

1. **GitHub Analytics**
   - GitHub Pages 提供基本的访问统计
   - 在仓库 `Settings` -> `Pages` -> `Analytics` 查看

2. **错误监控**
   - 可以集成 Sentry 等错误监控工具
   - 记录前端错误和性能问题

## 下一步

部署完成后，您可以：

1. **分享应用**：将 GitHub Pages 链接分享给用户
2. **收集反馈**：通过 GitHub Issues 收集用户反馈
3. **持续改进**：根据用户反馈不断优化功能
4. **添加文档**：完善用户手册和开发文档

## 技术支持

如果遇到问题：

1. 查看 [GitHub Pages 文档](https://docs.github.com/en/pages)
2. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
3. 在项目 Issues 中提问
4. 联系项目维护者

---

**祝您部署顺利！** 🚀