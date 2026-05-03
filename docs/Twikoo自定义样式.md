# Twikoo 自定义样式解决方案

## 功能简介
- 动态集成 Twikoo 评论系统，初始化后再加载自定义样式，确保覆盖默认样式。
- 自定义样式采用玻璃态视觉（半透明、模糊、圆角、平滑过渡），同时兼容深色模式。
- 样式文件以独立资源形式加载，便于维护和主题扩展；支持在需要时关闭或替换。

## 涉及代码
### 组件与入口：
  - `src/components/base/Comment.astro`（Twikoo 初始化与样式注入逻辑）
  - 使用位置：`src/components/blog/EntryLayout.astro`、`src/components/common/LinksEntryLayout.astro`、`src/pages/notes/[slug].astro`
### 环境变量：
  - `.env` 中的 `PUBLIC_TWIKOO_ENV_ID`
  - 示例值见 `README.md` 与 `.env.example`
### 样式资源：
  - `public/src/styles/twikoo-custom.scss`（动态注入的样式源，当前路径由 `Comment.astro` 指向 `/src/styles/twikoo-custom.scss`）

## 使用方法
### 配置与启用
  - 在 `.env` 设置 `PUBLIC_TWIKOO_ENV_ID`（你的 Twikoo 服务地址或云函数）：
    - `PUBLIC_TWIKOO_ENV_ID=https://your-twikoo-service-url.example.com/.netlify/functions/twikoo`
  - 页面中引入 `Comment.astro` 后，组件会在 `astro:page-load` 时：
    - 通过 CDN 加载 `twikoo@1.6.44`
    - `twikoo.init({ envId, el: '#tcomment' })`
    - 初始化完成后调用 `loadTwikooCustomStyles()` 动态注入样式链接

### 自定义样式示例（在 `twikoo-custom.scss` 中修改）
  - 输入框组：
    - `.el-input-group__append, .el-input-group__prepend` 使用主题色、圆角与过渡
  - 评论输入框：
    - `.el-textarea__inner` 设定半透明背景、边框、`focus` 高亮与占位色
  - 普通输入框与按钮：
    - `.el-input__inner`、`.el-button--primary`、`.el-button--default` 配置 hover/active 动效
  - 评论项/头像/内容：
    - `.tk-item`、`.tk-avatar`、`.tk-content` 与 `.tk-meta/.tk-reply` 提升玻璃态与可读性

### 常见问题与建议
  - 样式不生效：
    - 确保 Twikoo 完成初始化后再注入样式
    - 确保生产环境使用的是已编译 CSS（浏览器无法解析 SCSS 的 `@apply`）
    - 选择器是否匹配 Twikoo DOM，必要时加上 `.twikoo` 前缀
