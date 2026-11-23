---
name: theme-header-and-layout
description: >-
  Use this skill when editing CSS theme tokens in src/styles/global.css,
  modifying ThemeToggle View Transitions, updating HeroBanner or Footer
  dual-mode images, adjusting Header transparent/frosted-glass scroll behavior,
  or changing BaseLayout/BlogPost/page responsive layouts.
---

# Theme, Header & Responsive Layout Skill

本指南说明如何在不破坏零白屏切换、View Transitions 特效与 Hero 透明导航契约的前提下修改样式与布局组件。

## 0. 衔接全局 `modern-web-guidance`（按需查阅）

修改 HTML/CSS、主题切换、下拉交互、无障碍或客户端脚本前，先通过全局 `modern-web-guidance` 检索并核对现代 Web 最佳实践：

```bash
pnpx modern-web-guidance@latest search "<2-5 word query>" --skill-version 2026_11_10-47b4c80e
pnpx modern-web-guidance@latest retrieve "<id>"
```

- 主题与配色：`dark-mode`、`dark-mode-toggle`、`color`
- 导航栏、下拉菜单与无障碍：`navbar`、`menu`、`accessibility`
- 动效与滚动显隐：`motion`、`same-document-transitions`、`scroll-position-aware-elements`

## 1. 双主题 CSS Token 与四块同步规范

1. [src/styles/global.css](../../src/styles/global.css) 采用 `@layer reset, tokens, base;` 级联层架构，在 `@layer tokens` 内维护黑曜岩与电光靛蓝双主题变量，共包含 4 块必须保持键名一致的选择器：
   - `:root`（浅色默认）
   - `html[data-theme="light"]`
   - `html[data-theme="dark"]`
   - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
2. 当前核心 Token 集合：`--bg`、`--text`、`--text-muted`、`--card-bg`、`--card-border`、`--card-border-hover`、`--primary`、`--primary-hover`、`--tag-bg`、`--tag-text`、`--shadow`、`--shadow-hover`、`--header-bg`、`--header-border`、`--scrollbar-thumb`、`--scrollbar-track`，以及 GitHub 按钮专用的 `--github-*` Token（加共享圆角/容器/毛玻璃/动效 Token `--radius-*`、`--container-*`、`--glass-blur`、`--dur-*`、`--ease-out`）。
3. 全局基础链接/标题在 `@layer base` 中使用 `:where(...)` 保持零权重，混色统一使用 `color-mix(in oklab, ...)` 并补齐 `@media (forced-colors: active)` 高对比度兜底；GitHub 风格按钮统一引用 `--github-*` Token。

## 2. 三态主题切换与 View Transitions 特效

1. **状态契约**：`localStorage.getItem("theme") || "system"` 对应 `system`（移除 `data-theme`）、`light`（`data-theme="light"`）、`dark`（`data-theme="dark"`）。
2. **零白屏内联脚本**：[BaseHead.astro](../../src/components/BaseHead.astro) 设置 `html[data-theme]`，[ThemeToggle.astro](../../src/components/ThemeToggle.astro) 同步 `.theme-dropdown-container[data-current]`；两者均须保持 `<script is:inline>`。
3. **圆形扩散/收缩与跨页 MPA 视图过渡**：
   - `ThemeToggle.astro` 在明暗实际变化且满足 `"startViewTransition" in document` 且非 `prefers-reduced-motion: reduce` 时，以触发按钮中心 `(x, y)` 为圆心做 480 ms `clipPath` 动画，分别挂载 `theme-transition-expand`（`::view-transition-new(root)` 在上）或 `theme-transition-shrink`（`::view-transition-old(root)` 在上）。
   - `src/styles/global.css` 在 `@media (prefers-reduced-motion: no-preference)` 内开启跨页 `@view-transition { navigation: auto; }`，并严格将 `animation: none` 限定在 `html.theme-transition-expand` / `shrink` 上，以免屏蔽跨页淡入淡出。
4. **原生 Popover 主题菜单**：
   - `#theme-dropdown-menu` 使用 `popover="auto"` + `popovertarget="theme-dropdown-menu"`，CSS 通过 `@supports selector(:popover-open)` 与 `@supports (position-area: block-end)` 启用顶层定位、`@starting-style` 与独立的 `transition-behavior: allow-discrete`（禁止把 `display: flex` 泄漏到 `:not(:popover-open)`）；未支持 Popover 时降级为 `.theme-dropdown-container.open` 绝对定位。

## 3. Hero Banner / Footer 双图与透明导航栏状态机

1. **双图纯 CSS 切换**：[HeroBanner.astro](../../src/components/HeroBanner.astro) 与 [Footer.astro](../../src/components/Footer.astro) 同时输出 `-light.jpg` 与 `-dark.jpg`，通过 `html[data-theme="dark"]` 及 `@media (prefers-color-scheme: dark)` 下的 `html:not([data-theme])` 控制 `display: block / none`。
2. **透明与毛玻璃导航切换（[Header.astro](../../src/components/Header.astro)）**：
   - 仅当页面传递 `transparentHeader={true}` 且 DOM 存在 `.hero-banner` 时进入 Hero 模式：在 `scrollY <= heroBanner.offsetHeight - headerHeight` 内保持纯透明（`backdrop-filter: none`）且绝不隐藏；越界后添加 `.header-scrolled` 开启毛玻璃，并随 `delta > 4` 隐藏、`delta < -6` 显现。
   - 隐藏导航栏时须保持调用 `closeThemeDropdown()` 收起并 `hidePopover()` 关闭主题菜单；所有交互脚本须同时注册初始调用与 `astro:after-swap` 事件，并用 `AbortController` 防止监听重复绑定。

## 4. 页面容器宽度、流体排版与卡片网格

- [BaseLayout.astro](../../src/layouts/BaseLayout.astro) 采用 `min-block-size: 100dvh` 使 `<main>` 占满 `100%` 宽度；各页面使用设计 Token 限定阅读宽度：`--container-wide`（`880px`，首页/页脚）、`--container-list`（`860px`，`/blog` 与 `/projects`）、`--container-prose`（`780px`，文章详情）、`--container-about`（`720px`，`/about`）。
- 标题与正文使用 `clamp()` 流体字号（保持 `max <= 2.5 * min`）与 `text-wrap: balance` / `pretty`；按钮保持 `min-block-size` 而非固定 `height`，纯视觉裁切使用 `overflow: clip`。
- 卡片列表采用 `repeat(auto-fill, minmax(min(100%, 22rem), 1fr))`，[BlogCard.astro](../../src/components/BlogCard.astro) 与 [ProjectCard.astro](../../src/components/ProjectCard.astro) 采用 `<article>` + stretched-link（`a.card-link::after`）+ 单层 `grid-template-rows: subgrid`（带前置行轨兜底、`row-gap: 0.5rem`，禁止在同一元素叠加 `container-type` 以免 `contain: layout` 使 `subgrid` 失效）及渐进增强 `corner-shape: squircle`；[BlogPost.astro](../../src/layouts/BlogPost.astro) 内置纯 CSS `animation-timeline: scroll(root block)` 阅读进度条，[Footer.astro](../../src/components/Footer.astro) 启用 `content-visibility: auto`。
- 既有视口断点分布在 `860px`（Hero 高度）、`768px`（Header/Footer 移动端排版）、`720px`（容器边距/代码块）、`640px`（BackToTop）与 `480px`（超小屏 Hero）。
- 验证命令与人工检查：
  ```bash
  rg -n '^\s*(:root|html\[data-theme=|@media \(prefers-color-scheme: dark\))' src/styles/global.css
  pnpm build
  ```
  并用 `pnpm dev` / `pnpm preview` 检查 `system` / `light` / `dark` 三态与桌面/移动端滚动切换。
