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

1. [src/styles/global.css](../../src/styles/global.css) 维护黑曜岩与电光靛蓝双主题变量，共包含 4 块必须保持键名一致的选择器：
   - `:root`（浅色默认）
   - `html[data-theme="light"]`
   - `html[data-theme="dark"]`
   - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
2. 当前核心 Token 集合：`--bg`、`--text`、`--text-muted`、`--card-bg`、`--card-border`、`--card-border-hover`、`--primary`、`--primary-hover`、`--tag-bg`、`--tag-text`、`--shadow`、`--shadow-hover`、`--header-bg`、`--header-border`，以及 GitHub 按钮专用的 `--github-bg`、`--github-text`、`--github-border`、`--github-hover-bg`、`--github-hover-border`、`--github-hover-text`。
3. 全局 `a { color: var(--primary) }` 优先级较低但会影响未显式覆写颜色的链接组件；GitHub 风格按钮统一引用 `--github-*` Token。

## 2. 三态主题切换与 View Transitions 特效

1. **状态契约**：`localStorage.getItem("theme") || "system"` 对应 `system`（移除 `data-theme`）、`light`（`data-theme="light"`）、`dark`（`data-theme="dark"`）。
2. **零白屏内联脚本**：[BaseHead.astro](../../src/components/BaseHead.astro) 设置 `html[data-theme]`，[ThemeToggle.astro](../../src/components/ThemeToggle.astro) 同步 `.theme-dropdown-container[data-current]`；两者均须保持 `<script is:inline>`。
3. **圆形扩散/收缩动画**：
   - `ThemeToggle.astro` 在明暗实际变化且满足 `"startViewTransition" in document` 且非 `prefers-reduced-motion: reduce` 时，以触发按钮中心 `(x, y)` 为圆心做 480 ms `clipPath` 动画，分别挂载 `theme-transition-expand`（`::view-transition-new(root)` 在上）或 `theme-transition-shrink`（`::view-transition-old(root)` 在上）。

## 3. Hero Banner / Footer 双图与透明导航栏状态机

1. **双图纯 CSS 切换**：[HeroBanner.astro](../../src/components/HeroBanner.astro) 与 [Footer.astro](../../src/components/Footer.astro) 同时输出 `-light.jpg` 与 `-dark.jpg`，通过 `html[data-theme="dark"]` 及 `@media (prefers-color-scheme: dark)` 下的 `html:not([data-theme])` 控制 `display: block / none`。
2. **透明与毛玻璃导航切换（[Header.astro](../../src/components/Header.astro)）**：
   - 仅当页面传递 `transparentHeader={true}` 且 DOM 存在 `.hero-banner` 时进入 Hero 模式：在 `scrollY <= heroBanner.offsetHeight - headerHeight` 内保持纯透明（`backdrop-filter: none`）且绝不隐藏；越界后添加 `.header-scrolled` 开启毛玻璃，并随 `delta > 4` 隐藏、`delta < -6` 显现。
   - 隐藏导航栏时须保持调用 `closeThemeDropdown()` 收起菜单；所有交互脚本须同时注册初始调用与 `astro:after-swap` 事件。

## 4. 页面容器宽度与响应式断点

- [BaseLayout.astro](../../src/layouts/BaseLayout.astro) 使 `<main>` 占满 `100%` 宽度以便承载全宽 Banner/Footer；各页面通过内部容器限定阅读宽度：首页/页脚 `880px`、`/blog` 与 `/projects` `860px`、文章详情 `780px`、`/about` `720px`。
- 既有响应式断点分布在 `860px`（Hero 高度）、`768px`（Header/Footer 移动端排版）、`720px`（卡片单列与文章字号）、`640px`（BackToTop）与 `480px`（超小屏 Hero）。
- 验证命令与人工检查：
  ```bash
  rg -n '^(:root|html\[data-theme=|@media \(prefers-color-scheme: dark\))' src/styles/global.css
  pnpm build
  ```
  并用 `pnpm dev` / `pnpm preview` 检查 `system` / `light` / `dark` 三态与桌面/移动端滚动切换。
