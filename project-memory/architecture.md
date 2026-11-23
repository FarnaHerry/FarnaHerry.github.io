# FarnaHerry.github.io 架构记忆

## 1. 模块与目录分层

- **配置与常量层**：
  - `astro.config.mjs`：设置 `site: "https://farnaherry.github.io"`，接入 `@astrojs/sitemap` 与 `astro-robots-txt`。
  - `tsconfig.json`：继承 `astro/tsconfigs/strict`；`pnpm-workspace.yaml` 显式允许 `esbuild` 与 `sharp` 构建脚本。
  - `src/consts.ts`：集中维护 `SITE_TITLE`、`SITE_DESCRIPTION`、`SITE_URL`、`SITE_AUTHOR`、`DEFAULT_OG_IMAGE`（`/og-image.jpg`）与 `DEFAULT_KEYWORDS`。
- **内容与数据层（`src/content.config.ts`）**：
  - `blog`（`src/content/blog/**/*.{md,mdx}`）：`title`、`description`、`author`（`reference('authors')`）、`pubDate`（`z.coerce.date()`）、`relatedPosts`（`reference('blog')[]`，默认 `[]`）。
  - `authors`（`src/data/authors/**/*.json`）：`name`、`portfolio`（URL）。
  - `projects`（`src/data/projects/**/*.json`）：`name`、`description`、`repoUrl`、`demoUrl?`、`techStack`、`stars`、`featured`、`order`、`badge?`。
- **布局与样式层**：
  - `src/styles/global.css`：采用 `@layer reset, tokens, base;` 级联层架构，定义黑曜岩与电光靛蓝双主题变量、共享设计 Token（`--radius-*`、`--container-*`、`--glass-blur`、`--dur-*`、`--ease-out`）、MPA `@view-transition { navigation: auto; }` 与限定在 `html.theme-transition-*` 的主题过渡规则、`scrollbar-gutter: stable`、`color-mix(in oklab, ...)` 选区与流体 `clamp()` + `text-wrap: balance` 排版基线。
  - `src/layouts/BaseLayout.astro`：全站统一 HTML 外壳（`BaseHead` + `skip-link` + `Header` + `min-block-size: 100dvh` 下的全宽 `<main id="main-content">` + `Footer` + `BackToTop`）。
  - `src/layouts/BlogPost.astro`：复用 `BaseLayout.astro`（`type="article"`），内置纯 CSS 滚动驱动阅读进度条（`animation-timeline: scroll(root block)`），提供 `var(--container-prose)`（`780px`）`.article-container`、流体排版（`text-wrap: pretty` + `overflow-wrap: break-word`）、摘要框、`.prose` Markdown 样式及文章页脚导航。
- **组件与页面层**：
  - 路由：`/`（`index.astro`，`transparentHeader={true}` + `HeroBanner` + 个人简介 + 全部开源项目与全部博客文章双板块）、`/projects`（`projects/index.astro`）、`/blog`（`blog/index.astro`）、`/blog/[...slug]`（`blog/[...slug].astro` 动态 `getStaticPaths` + `render(post)`）、`/about`（`about.astro`）、`/404`（`404.astro`，`noindex={true}`）及 `/rss.xml`（`rss.xml.js`）。
  - 自适应网格与卡片：`ProjectCard.astro`（语义 `<article>` + stretched-link）与 `BlogCard.astro` 均启用 `grid-template-rows: subgrid`（含前置显式行轨兜底）与 `container: card / inline-size` 容器查询；网格列轨使用 `repeat(auto-fill, minmax(min(100%, 22rem), 1fr))`。
  - 页面容器宽度约定（Token 化）：首页 `.home-container` 与 `Footer` `.footer-content` 为 `--container-wide`（`880px`），`/blog` 与 `/projects` 列表容器为 `--container-list`（`860px`），`BlogPost` `.article-container` 为 `--container-prose`（`780px`），`/about` `.about-container` 为 `--container-about`（`720px`）。

## 2. 主题、双图与导航栏交互管线

- **零白屏三态主题链**：
  - `BaseHead.astro` 声明 `<meta name="color-scheme" content="light dark" />` 并通过末尾内联 `<script is:inline>`（带 `try ... catch`）同步读取 `localStorage.getItem("theme") || "system"`，联动设置 `html[data-theme]` 与 `<meta name="color-scheme">`；`ThemeToggle.astro` 内联脚本同步更新 `.theme-dropdown-container[data-current]`，并在运行时通过 `storage` 事件实现跨标签页主题同步（`system` 态执行 `removeItem`）。
  - `src/styles/global.css` 在 `:root` 声明 `color-scheme: light dark` 及 `&:has(> head > meta[name="color-scheme"][content="..."])` 级联映射，在保留四套 Baseline Widely available 变量兜底块的同时提供 `@supports (color: light-dark(white, black))` 颜色 Token 渐进增强。
  - 点击切换选项时，若视觉明暗发生变化且支持 `document.startViewTransition` 且未开启 `prefers-reduced-motion: reduce`，以切换按钮中心为圆心执行 480 ms `clipPath` 圆形扩散（浅→深，`.theme-transition-expand`）或圆形收缩（深→浅，`.theme-transition-shrink`）；否则直接应用。
  - 主题下拉菜单使用原生 `popover="auto"`（配合 Anchor Positioning + `@starting-style` + `transition-behavior: allow-discrete`），不支持环境自动降级为绝对定位/坐标定位；`Header.astro` 隐藏顶栏时同步调用 `hidePopover()`。
- **双图切换与加载链**：
  - `HeroBanner.astro`（`1920×640`，`loading="eager"`）与 `Footer.astro`（`1920×480`，`loading="lazy"`）同时渲染 `-light.jpg` 与 `-dark.jpg` 两张图片，完全由 CSS（`html[data-theme="dark"]` 与 `@media (prefers-color-scheme: dark)` 下的 `html:not([data-theme])`）切换 `display`。
  - `BaseHead.astro` 对 `/hero-banner-light.jpg` 声明 `rel="preload" fetchpriority="high"` 保障 LCP，对 `/hero-banner-dark.jpg` 与 `/footer-banner-dark.jpg` 声明 `rel="prefetch"`。
- **导航栏状态机（`Header.astro`）**：
  - 通过 `requestAnimationFrame` + `{ passive: true }` 监听 `scroll` 与 `resize`，并在 `astro:after-swap` 重新绑定。
  - 当 `transparentHeader={true}` 且页面存在 `.hero-banner` 时，在 `currentScrollY <= heroBanner.offsetHeight - headerHeight` 区间恒为纯透明且不隐藏；离开 Banner 边界后添加 `.header-scrolled` 转为毛玻璃，向下滑动（`delta > 4` 或刚越界且 `delta > 0`）添加 `.header-hidden` 并关闭主题下拉，向上滑动（`delta < -6`）恢复显现。
  - 普通页面（无 Hero Banner）在 `currentScrollY <= 60` 保持可见，超出后以 `delta > 6` / `delta < -6` 控制显隐。

## 3. SEO、结构化数据与部署管线

- `BaseHead.astro` 统一生成规范链接 Canonical URL（基于 `Astro.url.pathname`，去除 query）、`robots` 指令、RSS `<link>`、Open Graph（默认 `1200×630` `/og-image.jpg`）与 Twitter `summary_large_image`。
- JSON-LD 遵循 Schema.org `@graph` 规范：全站基础节点为 `Person`（`#person`）与 `WebSite`（`#website`），按页面类型追加 `ProfilePage`（首页）、`BlogPosting`（文章页）或 `WebPage`（其余页），并支持通过 `customGraphNodes` 注入额外节点（首页注入开源项目 `SoftwareSourceCode` 列表）。
- `.github/workflows/astro.yml` 在推送 `main` 或手动触发时运行：固定 Node `22` 与 pnpm `11`，检测锁文件并执行 `pnpm install --frozen-lockfile` 与 `pnpm astro build --site ... --base ...`，随后上传 `dist/` 部署至 GitHub Pages。
