# LiquidGlass 组件使用说明

## 功能简介

- 本组件参考开源项目 [liquid-glass-effect-macos](https://github.com/lucasromerodb/liquid-glass-effect-macos) 实现。
- 提供「液态玻璃」视觉效果的轻量组件，主要使用 `backdrop-filter` 与多层叠加（effect/tint/shine）。
- 当前项目使用的是 Astro 组件：`LiquidGlassLess.astro`（轻量版），可通过 `heavy` 切换更强的模糊/色调；通过 `enableGlassEffect` 快速降级为扁平化样式。
- 可用于卡片、侧栏、按钮、段落容器等场景，支持入场动画（`fadeUp`/`fadeLeft`/`fadeRight`/`fadeDown`）。
- 兼容深色模式；无数据库或后端依赖，纯前端样式组件。

## 涉及代码

- 组件文件：
  - `src/components/common/LiquidGlassLess.astro`
  - （可选）纯容器版本：`src/components/common/LiquidGlassNone.astro`
- 样式文件：
  - `src/styles/glass-new.scss`（液态玻璃核心样式，包含 `liquidGlass-effect(-h)`、`liquidGlass-tint(-h)`、`liquidGlass-shine` 等）
  - `src/styles/glass.scss`（标准毛玻璃基类 `glass` 与常用变体 `dock`/`button`）
  - 通过 `src/styles/main.scss` 中的 `@include meta.load-css("glass")` 与 `@include meta.load-css("glass-new")` 统一加载
- 常见引用位置（示例）：
  - `src/components/about/EntryLayout.astro`
  - `src/components/terms/EntryLayout.astro`
  - `src/components/blog/EntryLayout.astro`
  - `src/pages/index.astro`、`src/pages/page/[slug].astro` 等
- 组件主要 Props（以 `LiquidGlassLess.astro` 为准）：
  - `containerType`: `'div' | 'section' | 'nav' | 'header' | 'footer'`（默认 `div`）
  - `containerClass`: 外层容器类名（默认空）
  - `wrapperClass`: 包装器类名（默认 `dock`）
  - `textClass`: 内容区类名（默认空）
  - `animation`: `'fadeLeft' | 'fadeRight' | 'fadeUp' | 'fadeDown' | 'none'`（默认 `fadeUp`）
  - `heavy`: `boolean`，启用更强效果（应用 `-h` 变体）
  - `enableGlassEffect`: `boolean`，关闭后使用扁平化样式（`bg + border + shadow`）
  - `effectClass`/`tintClass`/`shineClass`: 为叠加层追加类名（如 `rounded-[25px]`、`ring-2 ring-white/20`）

## 使用方法

- 基本引入与用法（`.astro` 文件）：
  ```astro
  ---
  import LiquidGlassLess from "@components/common/LiquidGlassLess.astro";
  ---

  <LiquidGlassLess
    containerType="div"
    containerClass="my-6"
    wrapperClass="dock p-6"
    textClass=""
    animation="fadeUp"
    heavy
  >
    <h3 class="mb-2">毛玻璃标题</h3>
    <p class="text-txt-light dark:text-darkmode-txt-light">内容区域</p>
  </LiquidGlassLess>
  ```

- 关闭玻璃效果（扁平化降级）：
  ```astro
  <LiquidGlassLess
    wrapperClass="dock !p-6"
    containerClass="py-5"
    enableGlassEffect={false}
  >
    <p>在不支持 `backdrop-filter` 或需要更高性能时使用</p>
  </LiquidGlassLess>
  ```
  注：已增加全局控制配置项：在 `src/lib/config.ts` 中设置 `ENABLE_GLASS_EFFECT`，控制所有组件的玻璃效果的默认状态。如果某个组件单独设置了`enableGlassEffect`， 则会覆盖默认状态。


- 自定义叠加层与圆角：
  ```astro
  <LiquidGlassLess
    wrapperClass="dock"
    effectClass="rounded-[25px]"
    tintClass="rounded-[25px]"
    shineClass="rounded-[25px]"
  >
    <div class="p-6">统一圆角以避免溢出裁剪</div>
  </LiquidGlassLess>
  ```

- 动画控制：
  ```astro
  <LiquidGlassLess animation="fadeLeft">
    <div class="p-4">入场动画使用 `intersect:` 前缀自动触发</div>
  </LiquidGlassLess>
  ```

- 使用建议：
  - 列表或批量卡片场景优先使用 `LiquidGlassLess`，必要时打开 `heavy` 增强质感。
  - 需要稳定性能或在老旧浏览器中建议 `enableGlassEffect={false}`。
  - 叠加层圆角应与内容区一致，避免视觉裁切；可通过 `rounded-*` 类统一设置。
