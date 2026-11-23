# FarnaHerry.github.io 关键设计决策（ADR）

## ADR-001：纯 Astro 6 静态架构 + Content Collections `glob()` 加载器
- **背景**：个人博客与开源展示站以内容展示、首屏加载速度与搜索引擎收录为核心诉求，无需客户端状态管理框架。
- **决策**：采用纯 Astro 6 静态输出与原生 TypeScript/CSS，博客、作者与开源项目全部通过 `src/content.config.ts` 的 `glob()` 加载器与 Zod `reference()` 在构建期校验，零前端运行时框架依赖。

## ADR-002：统一 `BaseLayout` 外壳与全宽 `<main>` 组合模式
- **背景**：早期 `Layout.astro` 与 `BlogPost.astro` 各自维护完整 HTML 外壳（含重复 `<head>` 与基础骨架），导致导航、主题与页脚难以统一。
- **决策**：废弃并移除旧 `Layout.astro`，所有页面与 `BlogPost.astro` 统一组合 `BaseLayout.astro`；`<main>` 保持 `width: 100%; max-width: 100%` 以兼容全宽 `HeroBanner` 与全景 `Footer`，正文宽度由各页面容器自行限定（`720px`–`880px`）。

## ADR-003：黑曜岩/电光靛蓝双主题 + 四块 CSS Token + Telegram 圆形切屏
- **背景**：需要同时支持跟随系统、手动浅色与手动深色三种模式，且避免首屏闪烁及全局 `a` 标签色值污染深色品牌按钮（commit `29525ef`、`a7db7c7`）。
- **决策**：由 `BaseHead.astro` 内联脚本在首帧前同步设置 `html[data-theme]`；`src/styles/global.css` 维护四套 CSS Token（含独立 `--github-*` 品牌按钮 Token）；`ThemeToggle.astro` 借助 View Transitions API 实现以按钮为圆心的 480 ms 圆形展开/收缩动画，并在不支持或开启减少动态效果时自动降级。

## ADR-004：Hero 与页脚双图采用纯 CSS 显隐切换而非 JS 替换 `src`
- **背景**：切换主题若通过 JS 修改 `<img src>`，在 `startViewTransition` 截取新旧视图快照时会出现图片尚未解码完成的闪烁或白屏（commit `56db729`、`334f39c`）。
- **决策**：`HeroBanner.astro` 与 `Footer.astro` 同时输出浅色/深色两张图片并标明固定宽高（防 CLS），通过 CSS 选择器瞬时切换 `display`，并配合 `BaseHead.astro` 的 LCP `preload` 与暗色图 `prefetch` 保证切换丝滑。

## ADR-005：Hero 区域纯透明不隐藏 + 非 Hero/滚动后毛玻璃导航栏
- **背景**：既需要在长页面阅读时通过下滑隐藏减少遮挡，又要在首页 Hero Banner 上完整保留壁纸通透感（commit `938cbfc`、`18eb44b`、`b27cb66`、`9db1152`）。
- **决策**：仅当页面传 `transparentHeader={true}` 且位于 `.hero-banner` 有效高度内时维持纯透明（`backdrop-filter: none`）且禁用隐藏；滚出 Banner 后或在其他普通页面启用半透明毛玻璃与滚动方向显隐控制。

## ADR-006：全站 Schema.org `@graph` JSON-LD 与自动 Sitemap/Robots/RSS
- **背景**：单页零散 Meta 标签难以表达作者、站点、文章与开源仓库之间的实体关联（commit `db9d2d8`、`334f39c`）。
- **决策**：在 `BaseHead.astro` 统一构建 Schema.org `@graph`（`#person`、`#website` 及各页实体），预留 `customGraphNodes` 供首页注入项目 `SoftwareSourceCode`，并搭配 `@astrojs/sitemap`、`astro-robots-txt` 与 `src/pages/rss.xml.js` 形成完整爬虫与订阅链路。

## ADR-007：GitHub Pages 采用 `pnpm` 优先 + 大版本锁定 + 代码/内容双许可
- **背景**：GitHub Actions 需稳定的包管理器缓存与构建工具链，同时开源代码需与原创文章版权隔离（commit `fc1f3a0`、`6fc0b33`）。
- **决策**：CI 工作流固定 Node `22` 与 pnpm `11`（允许小版本自适应）并执行 `--frozen-lockfile`，`pnpm-workspace.yaml` 显式放行 `esbuild` 与 `sharp`；仓库代码使用 MIT（`LICENSE`），博客正文与原创媒体由 `CONTENT_LICENSE.md` 保留所有权利。
