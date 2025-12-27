# IATF CARA Assistant Pro - 部署和安装指南

## 📦 目录

- [快速部署](#快速部署)
- [开发环境搭建](#开发环境搭建)
- [生产环境部署](#生产环境部署)
- [PWA离线安装](#pwa离线安装)
- [AI供应商配置](#ai供应商配置)
- [故障排除](#故障排除)

---

## 快速部署

### 前置要求

确保您已安装以下软件：

- **Node.js** >= 18.0.0 ([下载](https://nodejs.org/))
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0
- **Git** (可选)

### 1. 安装依赖

```bash
# 进入项目目录
cd iatf-cara-assistant-pro

# 安装项目依赖
npm install

# 或使用 yarn
yarn install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 3. 配置AI服务

1. 打开浏览器访问 http://localhost:3000
2. 进入 "设置" -> "AI配置"
3. 选择AI供应商并输入API密钥
4. 点击"验证并保存"

### 4. 开始使用

- 导入或创建新的NC报告
- 使用AI生成各阶段内容
- 导出完成的报告

---

## 开发环境搭建

### 安装开发工具

推荐的开发工具：

- **VS Code** ([下载](https://code.visualstudio.com/))
- **Chrome DevTools** (浏览器内置)
- **React Developer Tools** ([插件](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi))

### VS Code推荐插件

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 环境变量配置

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`（可选，应用启动后可在UI中配置）：

```env
# AI API Keys - 可选，也可以在应用UI中配置
VITE_CLAUDE_API_KEY=your-claude-api-key
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_VOLCENGINE_API_KEY=your-volcengine-api-key
VITE_SILICONFLOW_API_KEY=your-siliconflow-api-key

# 应用配置
VITE_APP_NAME=IATF CARA Assistant Pro
VITE_APP_VERSION=1.0.0
```

### 开发命令

```bash
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查（需要配置ESLint）
npm run lint
```

---

## 生产环境部署

### 方案1：静态托管（推荐）

适用于：GitHub Pages、Netlify、Vercel、Cloudflare Pages等

#### 构建应用

```bash
npm run build
```

构建产物在 `dist/` 目录

#### 部署到Netlify

1. 登录 [Netlify](https://www.netlify.com/)
2. 拖拽 `dist` 文件夹到Netlify
3. 或连接Git仓库自动部署

#### 部署到Vercel

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
cd dist
vercel
```

#### 部署到GitHub Pages

```bash
# 安装gh-pages
npm i -D gh-pages

# 在package.json中添加脚本
# "deploy": "gh-pages -d dist"

# 构建并部署
npm run build
npm run deploy
```

### 方案2：Docker部署

创建 `Dockerfile`：

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

构建和运行：

```bash
# 构建镜像
docker build -t iatf-cara-assistant .

# 运行容器
docker run -d -p 8080:80 --name iatf-cara iatf-cara-assistant
```

访问 http://localhost:8080

### 方案3：传统服务器部署

将 `dist/` 目录的内容上传到任何Web服务器（Nginx、Apache、Caddy等）

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/iatf-cara;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## PWA离线安装

### 安装为桌面应用

#### Chrome/Edge

1. 使用Chrome或Edge打开应用
2. 点击地址栏右侧的 **安装图标** ⊕ 或 **加号** +
3. 或者点击地址栏右侧的菜单 → "安装IATF CARA Assistant Pro"
4. 点击"安装"
5. 应用将添加到桌面和开始菜单

#### Firefox

1. 打开应用
2. 点击地址栏右侧的图标 → "安装"
3. 确认安装

### 卸载PWA应用

#### Windows

1. 打开 "设置" → "应用"
2. 找到 "IATF CARA Assistant Pro"
3. 点击"卸载"

#### macOS

1. 打开 "应用程序" 文件夹
2. 将应用拖到废纸篓

### 更新PWA应用

PWA应用会自动更新：
- 当应用检测到新版本时，会自动下载
- 下次打开应用时自动安装更新
- 用户也可以手动刷新页面更新

---

## AI供应商配置

### 1. Claude (Anthropic)

#### 获取API密钥

1. 访问 https://console.anthropic.com/
2. 注册或登录账号
3. 进入 "API Keys" 页面
4. 点击 "Create Key"
5. 复制API密钥

#### 配置到应用

1. 打开应用
2. 进入 "设置" → "AI配置"
3. 选择 "Claude"
4. 粘贴API密钥
5. 点击"验证并保存"

#### 费用参考

- `claude-3-5-sonnet`: $3/百万输入tokens, $15/百万输出tokens
- `claude-3-5-haiku`: $0.25/百万输入tokens, $1.25/百万输出tokens

### 2. DeepSeek

#### 获取API密钥

1. 访问 https://platform.deepseek.com/
2. 注册或登录账号
3. 进入 "API Keys" 页面
4. 创建新密钥
5. 复制密钥

#### 配置到应用

同上，选择"DeepSeek"

#### 费用参考

- `deepseek-chat`: ¥1/百万tokens
- `deepseek-coder`: ¥1/百万tokens

### 3. Google Gemini

#### 获取API密钥

1. 访问 https://aistudio.google.com/app/apikey
2. 登录Google账号
3. 点击 "Create API Key"
4. 复制密钥

#### 配置到应用

同上，选择"Google Gemini"

#### 费用参考

- 有免费额度
- `gemini-1.5-flash`: $0.075/百万tokens
- `gemini-1.5-pro`: $1.25/百万tokens

### 4. 火山引擎

#### 获取API密钥

1. 访问 https://console.volcengine.com/ark
2. 注册企业账号并实名认证
3. 创建推理接口端点
4. 获取API Key

#### 配置到应用

同上，选择"火山引擎"

### 5. 硅基流动

#### 获取API密钥

1. 访问 https://cloud.siliconflow.cn/
2. 注册或登录
3. 进入 "API密钥" 页面
4. 创建新密钥
5. 复制密钥

#### 配置到应用

同上，选择"硅基流动"

#### 费用参考

- `Qwen2.5-72B`: ¥0.56/百万tokens
- `DeepSeek-V2.5`: ¥0.14/百万tokens

---

## 故障排除

### 常见问题

#### Q1: 安装依赖失败

**问题：** `npm install` 报错

**解决方案：**

```bash
# 清除缓存
npm cache clean --force

# 删除node_modules和lock文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

#### Q2: 构建失败

**问题：** `npm run build` 报错

**解决方案：**

```bash
# 检查Node版本
node -v  # 应该 >= 18.0.0

# 更新依赖
npm update

# 如果还有问题，尝试清理并重新安装
rm -rf node_modules
npm install
```

#### Q3: Service Worker注册失败

**问题：** PWA功能不工作

**解决方案：**

1. 确保在HTTPS或localhost环境下运行
2. 清除浏览器缓存
3. 在DevTools → Application → Service Workers 中检查状态
4. 取消注册Service Worker并刷新页面

#### Q4: AI调用失败

**问题：** 点击"AI生成"没反应或报错

**解决方案：**

1. 检查网络连接
2. 验证API密钥是否正确
3. 检查API密钥是否有余额
4. 查看浏览器控制台的错误信息
5. 尝试切换其他AI供应商

#### Q5: 数据丢失

**问题：** 刷新页面后数据丢失

**解决方案：**

1. 检查浏览器是否允许使用IndexedDB
2. 在DevTools → Application → IndexedDB 中查看数据
3. 清除浏览器缓存可能导致数据丢失，定期导出备份
4. 检查是否在隐私/无痕模式下（可能限制存储）

#### Q6: 离线功能不工作

**问题：** 断网后无法访问应用

**解决方案：**

1. 首次访问需要在联网状态下
2. 等待Service Worker完全缓存资源
3. 在DevTools → Application → Service Workers 中确认"Update on reload"未勾选
4. 重新安装PWA应用

### 调试技巧

#### 开启详细日志

在浏览器控制台运行：

```javascript
localStorage.setItem('debug', 'true')
```

#### 查看IndexedDB数据

1. 打开DevTools (F12)
2. 切换到 "Application" 标签
3. 左侧找到 "IndexedDB" → "IATFCARADatabase"
4. 查看各个表中的数据

#### 清除所有数据

```javascript
// 警告：这将删除所有数据！
indexedDB.deleteDatabase('IATFCARADatabase');
localStorage.clear();
location.reload();
```

#### 导出数据备份

应用内提供导出功能：
1. 进入任意NC列表页面
2. 点击"导出报告"按钮
3. 选择导出格式（JSON）
4. 保存到本地

---

## 性能优化建议

### 1. 构建优化

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ai-vendor': ['@anthropic-ai/sdk', 'openai', '@google/genai']
        }
      }
    },
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true
      }
    }
  }
});
```

### 2. 运行时优化

- 使用懒加载路由
- 图片使用WebP格式
- 启用CDN加速
- 开启gzip/brotli压缩

### 3. 数据库优化

- 定期清理旧数据
- 使用索引提高查询速度
- 批量操作代替单个操作

---

## 安全建议

### 1. 生产环境配置

```nginx
# nginx.conf
server {
    # 强制HTTPS
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # 隐藏版本信息
    server_tokens off;
}
```

### 2. API密钥管理

- ✅ 不要在代码中硬编码API密钥
- ✅ 使用环境变量或用户配置
- ✅ 定期轮换密钥
- ✅ 设置API使用限额
- ✅ 监控异常使用

### 3. 数据保护

- 启用应用内数据加密
- 定期提醒用户备份数据
- 提供数据导出功能
- 遵守GDPR等隐私法规

---

## 更新和维护

### 版本更新流程

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md`
3. 运行测试
4. 构建新版本
5. 部署到服务器
6. 通知用户更新

### 数据迁移

当数据库结构变更时：

```typescript
// 在 indexedDB.ts 中添加新版本
this.version(2).stores({
  reports: '++id, reportNumber, orgName, createdAt, newField',
  // ...
}).upgrade(tx => {
  // 数据迁移逻辑
  return tx.table('reports').toCollection().modify(report => {
    report.newField = 'default value';
  });
});
```

---

## 支持和帮助

### 获取帮助

- 📧 邮箱：support@example.com
- 📖 文档：[README.md](./README.md)
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-repo/issues)

### 社区

- 💬 论坛：[Discussions](https://github.com/your-repo/discussions)
- 📱 微信群：扫描二维码加入

---

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

<div align="center">

**祝您使用愉快！** 🎉

如有任何问题，请随时联系我们。

</div>
