# FarnaHerry.github.io 仓库工程规范

> **单一事实来源（SSOT）**：所有在本仓库工作的 AI Agent 与开发者均以本文件为最高协作规范；`CLAUDE.md` 通过 `@AGENTS.md` 引用本文件。

## 1. 项目概览

- 本仓库为基于 Astro 6（`astro ^6.4.6`）构建的静态个人博客与开源项目展示站，部署于 GitHub Pages（`https://farnaherry.github.io`）。
- 数据层采用 Astro 6 Content Collections `glob()` 加载器与 Zod Schema（`src/content.config.ts`）；UI 层零前端运行时框架，仅以原生 Scoped CSS 与少量客户端脚本实现三态主题（View Transitions 圆形扩散/回收）、双图 Hero/Footer 与智能吸顶导航。
- 集成 `@astrojs/rss`、`@astrojs/sitemap` 与 `astro-robots-txt`，使用 `pnpm` 管理依赖并通过 `.github/workflows/astro.yml` 自动构建部署。
- 双重许可边界：源码遵循 MIT 协议（`LICENSE`），博客正文与原创媒体保留所有权利（`CONTENT_LICENSE.md`）。

## 2. 仓库结构地图

- `src/content.config.ts` 与 `src/consts.ts`：内容集合 Schema（`blog` / `authors` / `projects`）与全站元信息常量
- `src/content/blog/` 与 `src/data/{authors,projects}/`：Markdown 博客文章、作者与开源项目 JSON 数据
- `src/layouts/`：`BaseLayout.astro`（全站 HTML 外壳）与 `BlogPost.astro`（复用 `BaseLayout` 的文章详情排版）
- `src/components/`：SEO/Head（`BaseHead`）、导航与主题（`Header` / `HeaderLink` / `ThemeToggle`）、视觉与卡片（`HeroBanner` / `Footer` / `BackToTop` / `BlogCard` / `ProjectCard` / `TechBadge` / `ExternalLink` / `InternalLink`）
- `src/pages/`：`/`、`/projects`、`/blog`、`/blog/[...slug]`、`/about`、`/404` 及 `/rss.xml`（`rss.xml.js`）
- `src/styles/global.css`：黑曜岩与电光靛蓝双主题变量、View Transitions 规则与基础排版
- `public/` 与 `src/assets/`：静态大图/OG/图标资源（`public/`）与内联 SVG（`src/assets/`）
- `project-memory/`：项目共享记忆目录（架构概览、设计决策 ADR、已验证坑点）
- `project-skills/`：项目级按需加载 Skill 目录（通过 `.agents/skills.json` 注册）
- `.github/workflows/astro.yml`：GitHub Pages 自动构建与发布工作流

## 3. 工程红线

- **集合 Schema 严守**：新增或修改博客、作者、项目数据必须通过 `src/content.config.ts` 的 Zod 校验；`author` 引用既有 `authors` ID（如 `farna`），`relatedPosts` 引用既有 `blog` ID，`pubDate` 须可被 `z.coerce.date()` 解析。
- **四块主题 Token 同步**：修改或新增 `src/styles/global.css` 的 CSS 变量时，必须同步更新 `:root`、`html[data-theme="light"]`、`html[data-theme="dark"]` 与 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` 四处定义；GitHub 风格按钮统一使用 `--github-*` Token，避免被全局 `a { color: var(--primary) }` 覆盖。
- **零白屏与 CSS 切图**：禁止删除或延迟 `BaseHead.astro` 与 `ThemeToggle.astro` 中的内联 `<script is:inline>` 初始化脚本；`HeroBanner` 与 `Footer` 的深浅色大图必须通过 CSS 选择器切换，禁止改为 JS 替换 `src` 破坏 View Transitions 快照。
- **导航栏双模式契约**：启用 `transparentHeader={true}` 的 Hero 页面在 `.hero-banner` 范围内必须保持纯透明（`backdrop-filter: none`）且不自动隐藏，滚动离开 Banner 后才切换为毛玻璃并启用滚动显隐；普通页面始终保持粘性毛玻璃。
- **SEO / CWV / 规范链接完整性**：所有页面必须经由 `BaseLayout.astro`（或 `BlogPost.astro`）渲染并提供准确 `title` / `description`；错误页（如 `404.astro`）必须传入 `noindex={true}`；Banner 与 OG 图须保持明确尺寸属性防 CLS。
- **客户端脚本幂等与无障碍**：原生脚本须同时在初始加载与 `astro:after-swap` 时初始化、做好空节点保护，并尊重 `prefers-reduced-motion: reduce`。
- **包管理与 CI 锁文件纪律**：仅使用 `pnpm`，严禁提交 `yarn.lock` 或 `package-lock.json`（CI `astro.yml` 优先检测 `yarn.lock`）；改动 `package.json` 必须同步 `pnpm-lock.yaml` 以通过 CI `--frozen-lockfile`。
- **内容版权边界**：未经明确要求，不改写既有原创博客正文，不删改 `LICENSE` 与 `CONTENT_LICENSE.md`。

## 4. 日常验证命令

- 生产构建与集合 Schema / 路由 / 类型总检：`pnpm build`（当前未配置独立 lint / test / `astro check` 脚本，构建即核心门禁）
- 关键构建产物烟测：`ls -l dist/index.html dist/sitemap-index.xml dist/robots.txt dist/rss.xml`
- 主题变量四块选择器核验：`rg -n '^(:root|html\[data-theme=|@media \(prefers-color-scheme: dark\))' src/styles/global.css`
- 本地开发与产物预览：`pnpm dev` / `pnpm preview`

## 5. 共享记忆规范（`project-memory/`）

- 需要背景脉络时，先读取 `project-memory/README.md`，再按索引按需读取具体文件，不盲目全量读入。
- 当架构演进、关键设计定型或解决新坑点后，仅将简洁且经实测验证的结论增量回写至对应记忆文件。
- 不在记忆文件中重复本规范已列的红线或 Skill 中的详尽操作手册。

## 6. Skill 按需加载规范（`project-skills/` 与全局 `modern-web-guidance`）

- **非必要不加载**：日常简单修改（如微调文案、修 typo）无需读取任何 `SKILL.md`；仅当任务明确命中下列触发条件时，按需读取对应 Skill。
- **修改前端 HTML/CSS/客户端 JS 前必查**：改动页面组件、样式、主题、导航交互、无障碍、动效或性能（LCP/CLS/预加载）前，先使用全局 `modern-web-guidance` Skill（优先 `pnpx modern-web-guidance@latest search "<2-5 词英文查询>"` → `pnpx modern-web-guidance@latest retrieve "<id>"`），再按需结合下表项目 Skill。
- **浏览器支持基线**：默认以 **Baseline Widely available** 为安全基线；采用 Newly/Limited available 特性（如 `light-dark()`、`startViewTransition`、`fetchpriority`、`popover`、`container-type: scroll-state`）时须遵循对应指南提供渐进增强或轻量无依赖降级。

| Skill 名称 | 路径 | 何时加载 |
| --- | --- | --- |
| `content-and-collections` | [content-and-collections](project-skills/content-and-collections/SKILL.md) | 新增/修改博客文章、开源项目、作者数据、调整 `src/content.config.ts` Schema 或排查 RSS/路由问题时 |
| `theme-header-and-layout` | [theme-header-and-layout](project-skills/theme-header-and-layout/SKILL.md) | 改动双主题 Token、View Transitions 动画、双图 Hero/Footer、透明/毛玻璃导航栏滚动逻辑或响应式布局时 |
| `seo-assets-and-deploy` | [seo-assets-and-deploy](project-skills/seo-assets-and-deploy/SKILL.md) | 改动 `BaseHead.astro` Meta/OG/Schema `@graph`、`public/` 大图/图标资产、Sitemap/Robots/RSS 或 GitHub Pages CI 工作流时 |
