# IATF CARA Assistant Pro

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen)

**专业的 IATF 16949 审核不符合项管理工具**

[中文](#) | [English](#)

</div>

---

## 📋 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [AI配置指南](#ai配置指南)
- [离线使用](#离线使用)
- [安全说明](#安全说明)
- [常见问题](#常见问题)

---

## 项目简介

IATF CARA Assistant Pro 是一个专业化的汽车行业质量管理工具，用于帮助组织管理 IATF 16949 审核不符合项（NC），并利用人工智能技术协助生成符合标准的回复内容。

### ✨ 主要特性

- 🤖 **多AI供应商支持** - Claude、DeepSeek、火山引擎、硅基流动、Google Gemini
- 💾 **数据本地存储** - 使用IndexedDB，数据完全在本地，无需服务器
- 📱 **PWA离线应用** - 支持离线使用，可安装为桌面应用
- 🔒 **数据加密保护** - API密钥和敏感数据加密存储
- 🌐 **双语生成** - 自动生成中英双语内容
- 📊 **专业报告** - 符合CARA标准格式的报告生成
- 💾 **自动备份** - 支持数据导入/导出

---

## 核心功能

### 1. 不符合项管理

- ✅ 创建和管理多个不符合项（NC）
- ✅ S1-S7各阶段内容填写
- ✅ 文件附件上传（PDF、图片）
- ✅ 进度跟踪和状态管理
- ✅ 审核员评审功能

### 2. AI智能辅助

- ✅ S1遏制措施自动生成
- ✅ S3根本原因分析（5-Why方法）
- ✅ S5系统性纠正措施建议
- ✅ S7有效性验证方案
- ✅ 审核员评审意见生成

### 3. 数据管理

- ✅ 本地数据持久化（IndexedDB）
- ✅ JSON格式导入/导出
- ✅ 自动保存功能
- ✅ 数据加密保护

### 4. 离线支持

- ✅ PWA应用，可离线使用
- ✅ 数据本地存储
- ✅ 网络状态检测
- ✅ 离线数据编辑

---

## 技术架构

### 前端技术栈

```
React 19.2.3          # UI框架
TypeScript 5.8        # 类型安全
Vite 6.2              # 构建工具
Tailwind CSS          # 样式框架
Zustand               # 状态管理
Dexie                 # IndexedDB封装
```

### AI集成

```
Anthropic Claude      # claude-3-5-sonnet
DeepSeek              # deepseek-chat
Google Gemini         # gemini-2.0-flash
火山引擎              # doubao-pro
硅基流动              # Qwen2.5-72B
```

### 数据存储

```
IndexedDB             # 本地数据库
LocalStorage          # 设置缓存
Encryption (AES)      # 数据加密
```

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 安装依赖
npm install

# 或使用yarn
yarn install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 生产构建

```bash
npm run build
```

构建产物位于 `dist/` 目录

### 预览构建

```bash
npm run preview
```

---

## AI配置指南

### 第一步：获取API密钥

应用支持以下AI供应商，您需要先获取相应的API密钥：

| 供应商 | 获取地址 | 说明 |
|--------|---------|------|
| **Claude** | https://console.anthropic.com/ | 需要国际账号 |
| **DeepSeek** | https://platform.deepseek.com/ | 支持国内支付 |
| **Gemini** | https://aistudio.google.com/app/apikey | 免费额度 |
| **火山引擎** | https://console.volcengine.com/ark | 需要企业认证 |
| **硅基流动** | https://cloud.siliconflow.cn/ | 性价比高 |

### 第二步：配置API密钥

1. 打开应用
2. 进入 "设置" -> "AI配置"
3. 选择要配置的AI供应商
4. 输入API密钥
5. 点击 "验证并保存"

**安全提示：**
- ✅ API密钥将加密存储在本地浏览器中
- ✅ 密钥不会上传到任何服务器
- ✅ 数据完全在您的本地浏览器中处理

### 第三步：选择默认模型

每个供应商提供多个模型可选：

#### Claude (推荐)
- `claude-3-5-sonnet-20241022` - 最强大，适合复杂分析
- `claude-3-5-haiku-20241022` - 快速响应，成本低

#### DeepSeek
- `deepseek-chat` - 通用对话
- `deepseek-coder` - 代码生成

#### Gemini
- `gemini-2.0-flash-exp` - 快速响应
- `gemini-1.5-pro` - 高质量输出

#### 硅基流动
- `Qwen/Qwen2.5-72B-Instruct` - 强大的中文理解
- `deepseek-ai/DeepSeek-V2.5` - DeepSeek模型

### 第四步：开始使用

配置完成后，您可以在任何NC管理界面点击"AI生成"按钮，AI将自动为您生成内容。

---

## 离线使用

### 安装为PWA应用

1. 使用Chrome或Edge浏览器打开应用
2. 点击地址栏右侧的安装图标
3. 选择"安装应用"
4. 应用将添加到桌面和开始菜单

### 离线功能说明

| 功能 | 在线 | 离线 |
|------|-----|-----|
| 编辑NC数据 | ✅ | ✅ |
| 查看历史记录 | ✅ | ✅ |
| 数据导入/导出 | ✅ | ✅ |
| AI生成内容 | ✅ | ❌ |
| 文件上传 | ✅ | ❌ |

### 数据同步

应用使用IndexedDB在本地存储所有数据，即使离线也能正常编辑。重新联网后，AI功能将自动恢复。

---

## 安全说明

### 数据安全

1. **本地存储** - 所有数据存储在您的浏览器中，不会上传到服务器
2. **加密保护** - API密钥使用AES加密存储
3. **输入验证** - 所有用户输入都经过验证和清理
4. **XSS防护** - 使用DOMPurify防止XSS攻击

### API密钥保护

```typescript
// API密钥加密存储示例
const encryptionService = new EncryptionService();
const encryptedKey = encryptionService.encrypt(yourApiKey);
// 存储到IndexedDB
await db.apiKeys.put({
  provider: 'claude',
  encryptedKey: encryptedKey,
  enabled: true
});
```

### 注意事项

⚠️ **重要提醒：**
- 不要在公共设备上保存API密钥
- 定期更换API密钥
- 设置合理的API使用限额
- 关注API使用量和费用

---

## 常见问题

### Q1: AI生成的内容不准确怎么办？

A: 您可以：
1. 尝试切换不同的AI模型
2. 调整temperature参数（0.1-0.7）
3. 手动编辑AI生成的内容
4. 尝试重新生成

### Q2: 如何备份数据？

A: 应用提供多种备份方式：
1. 自动备份到IndexedDB（默认）
2. 手动导出JSON文件
3. 复制整个浏览器配置文件

### Q3: 能在多个设备间同步数据吗？

A: 当前版本数据仅存储在本地，不支持云端同步。您可以：
1. 导出JSON文件
2. 在其他设备导入
3. 未来版本将支持云端同步

### Q4: API密钥会被盗用吗？

A: 安全措施：
- ✅ 密钥加密存储在本地
- ✅ 不会上传到服务器
- ✅ 使用HTTPS直接调用AI API
- ⚠️ 但要保护好自己的浏览器，不要让他人使用您的设备

### Q5: 离线时能使用AI功能吗？

A: 不能。AI功能需要联网调用API，但：
- ✅ 离线可以编辑和查看数据
- ✅ 离线可以导入导出
- ✅ 联网后AI功能自动恢复

### Q6: 如何查看API使用量？

A: 需要到各AI供应商的控制台查看：
- Claude: https://console.anthropic.com/
- DeepSeek: https://platform.deepseek.com/
- Gemini: https://aistudio.google.com/

---

## 项目结构

```
iatf-cara-assistant-pro/
├── src/
│   ├── app/                    # 应用组件
│   ├── features/               # 功能模块
│   │   ├── nc-management/      # NC管理
│   │   ├── settings/           # 设置
│   │   └── reports/            # 报告
│   ├── shared/                 # 共享模块
│   │   ├── components/         # 通用组件
│   │   ├── hooks/              # 自定义Hooks
│   │   ├── utils/              # 工具函数
│   │   └── types/              # 类型定义
│   ├── services/               # 服务层
│   │   ├── ai/                 # AI服务
│   │   │   ├── providers/      # AI供应商
│   │   │   └── ai-manager.ts   # AI管理器
│   │   ├── storage/            # 存储服务
│   │   │   ├── indexedDB.ts    # IndexedDB
│   │   │   └── encryption.ts   # 加密服务
│   │   └── cara.service.ts     # CARA业务服务
│   ├── store/                  # 状态管理
│   │   └── app-store.ts        # Zustand Store
│   ├── config/                 # 配置文件
│   ├── App.tsx                 # 主应用
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
├── public/                     # 静态资源
│   ├── icons/                  # 图标
│   └── sw.js                   # Service Worker
├── .env.example                # 环境变量示例
├── package.json                # 依赖配置
├── vite.config.ts              # Vite配置
├── tailwind.config.js          # Tailwind配置
└── tsconfig.json               # TypeScript配置
```

---

## 贡献指南

欢迎提交Issue和Pull Request！

### 开发规范

1. 使用TypeScript编写代码
2. 遵循ESLint规则
3. 编写单元测试
4. 更新相关文档

---

## 许可证

MIT License

Copyright (c) 2025 IATF CARA Assistant Pro

---

## 致谢

- IATF - 国际汽车工作组
- React 团队
- 各AI供应商的技术支持

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给个星标！**

Made with ❤️ by IATF CARA Team

</div>
