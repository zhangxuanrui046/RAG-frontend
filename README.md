# gpt4o-RAG 智能助手 — 前端

基于 **Vue 3 + Vite** 构建的智能故障日志诊断与分析系统前端。配合 Django 后端，集成 RAG（检索增强生成）、LLM 大模型调用、CoT（思维链）推理、联网搜索等技术，实现对故障日志的智能分析、诊断和解决方案推荐。

## 项目背景

本项目为**数据库应用实践**课程设计，采用前后端分离架构。前端负责用户交互界面、本地会话状态管理、流式输出展示，后端负责业务逻辑、RAG 检索、LLM 推理。

## 功能特性

- **智能对话交互**：自然语言输入，流式逐字输出，Markdown 格式渲染（表格、代码高亮、标题层级等）
- **多轮对话管理**：会话创建/切换/删除，对话历史本地持久化，上下文感知的连续对话
- **联网搜索**：前端触发搜索请求，后端调用联网搜索获取实时信息
- **聊天记录导出/导入**：支持 JSON 格式导出与导入，方便保存和恢复对话
- **用户认证**：基于 API Key 的 Bearer Token 认证，路由守卫保护聊天页

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建工具 | Vite 7 |
| 状态管理 | Pinia（localStorage 持久化） |
| 路由 | Vue Router 4（含路由守卫） |
| HTTP 客户端 | Axios（拦截器自动注入 Token） |
| Markdown 解析 | Marked.js（GFM、代码高亮、表格） |
| 图标 | vue-tabler-icons |

## 项目结构

```
vue_frontend/
├── index.html                     # 入口 HTML
├── vite.config.js                 # Vite 配置
├── package.json                   # 依赖声明
├── public/
│   └── vite.svg                   # 网站图标
└── src/
    ├── main.js                    # 应用入口（Pinia、Router 注册，样式注入）
    ├── App.vue                    # 根组件
    ├── api.js                     # API 层（Axios 封装，拦截器）
    ├── router.js                  # 路由配置（登录 / 聊天 / 守卫）
    ├── store.js                   # Pinia 状态管理（会话、消息、持久化）
    ├── style.css                  # 全局样式
    ├── assets/
    │   ├── styles.css             # 基础样式
    │   ├── bot.jpg                # AI 头像
    │   ├── user.jpg               # 用户头像
    │   └── vue.svg                # Vue 图标
    ├── views/
    │   ├── Login.vue              # 登录页（用户名/密码认证）
    │   └── Chat.vue               # 聊天页（消息列表、输入框、会话管理）
    └── components/
        ├── ChatInput.vue          # 消息输入组件（发送/搜索/清空/新建）
        ├── ChatMessage.vue        # 消息气泡组件
        ├── MarkdownRenderer.vue   # Markdown 渲染组件（代码高亮、表格等）
        ├── SessionList.vue        # 会话列表组件
        └── HelloWorld.vue         # 示例组件
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

开发服务器默认运行在 `http://localhost:5173`，API 请求通过 Vite 代理转发至后端。

### 后端对接

前端通过 `/api` 前缀调用后端接口，需要在 `vite.config.js` 中配置代理：

```js
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/login` | 用户登录，获取 API Key |
| POST | `/api/chat` | 发送聊天消息 |
| POST | `/api/search` | 联网搜索 |
| GET | `/api/history` | 获取会话历史记录 |
| DELETE | `/api/history` | 清空会话历史记录 |

所有接口（除登录外）需在请求头携带 `Authorization: Bearer <api_key>`。

## 核心设计

### 状态管理（Pinia Store）

- `apiKey`：用户认证令牌，持久化到 localStorage
- `sessions`：会话列表，支持增删
- `messages`：所有会话的消息字典，键为会话 ID，值为消息数组
- `currentSession`：当前活跃会话

消息存储使用 **watch + localStorage** 自动持久化，页面刷新不丢失数据。

### 前端流式输出

采用定时器模拟逐字输出：将完整回复按字符逐帧渲染，速度可调（默认 15ms/字符），配合自动滚动，实现流畅的流式视觉效果。

### 路由守卫

```js
router.beforeEach((to, from, next) => {
  if (requiresAuth && !store.apiKey) {
    next('/login')  // 未登录重定向
  } else {
    next()
  }
})
```

### 请求拦截器

Axios 拦截器自动从 localStorage 读取 API Key 并注入请求头；401 响应自动清除 Token 并跳转登录页。

## 相关仓库

- 后端仓库：RAG 检索增强生成 + Django API 服务
- 本项目为课程设计的前端部分，与后端配合完成完整的智能诊断系统
