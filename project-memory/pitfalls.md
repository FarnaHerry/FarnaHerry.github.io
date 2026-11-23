# FarnaHerry.github.io 已知坑点与避坑清单

1. **仅修改 `:root` 或 `html[data-theme="dark"]` 会导致跟随系统深色模式配色不一致**
   - **现象**：切换至“跟随系统”且系统为深色时，新增或修改的颜色变量未生效。
   - **原因与解决**：`src/styles/global.css` 存在四块作用域（`:root`、`html[data-theme="light"]`、`html[data-theme="dark"]`、`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`），增改主题 Token 必须四处同步。

2. **全局 `a { color: var(--primary) }` 覆盖深色按钮样式，且 `InternalLink.astro` 未透传属性**
   - **现象**：外链/仓库按钮在部分主题下文字变成靛蓝色或丢失传入 `class`（commit `a7db7c7` 修复了 `ExternalLink.astro` 并引入 `--github-*` Token）。
   - **注意**：`src/components/ExternalLink.astro` 已支持透传 `class` 与 `...props`，但 `src/components/InternalLink.astro` 目前仍仅渲染 `<a href={href}>` 未透传 `class`/`...props`，复用前需先补全或改用原生 `<a>`。

3. **给 `.header-transparent` 叠加 `backdrop-filter` 会遮糊 Hero Banner 壁纸**
   - **现象**：曾尝试在透明导航态叠加暗底与毛玻璃导致 Banner 顶部偏灰糊（commit `b27cb66`，已在 `9db1152` 回退）。
   - **约定**：保持 `.site-header.header-transparent` 为纯透明且 `backdrop-filter: none`，毛玻璃样式只作用于常规页面及 `.site-header.header-transparent.header-scrolled`。

4. **Hero 导航边界需扣除导航自身高度，隐藏时须同步关闭主题下拉**
   - **现象**：在 Banner 上向下滑动若未扣除 `headerHeight`，会在离开壁纸前提前隐藏或闪出；隐藏后若主题菜单仍展开会悬空残留。
   - **实现**：`Header.astro` 按 `heroBanner.offsetHeight - headerHeight` 计算阈值，并在添加 `.header-hidden` 时同步调用 `closeThemeDropdown()`；修改 Banner 类名时须同步更新 `.hero-banner` 选择器。

5. **更换双图路径需同步 `BaseHead.astro` 预加载与遗留资源清理**
   - **现象**：仅修改 `HeroBanner.astro` 或 `Footer.astro` 的默认图片路径，会导致首屏预加载失效或切主题时多加载旧图。
   - **细节**：`BaseHead.astro` 硬编码预加载 `/hero-banner-light.jpg` 并预拉取 `/hero-banner-dark.jpg`、`/footer-banner-dark.jpg`；另 `public/hero-banner.jpg` 与 `public/footer-banner.jpg` 为早期遗留文件，当前默认组件已不再引用。

6. **新增开源项目不能只添加 `src/data/projects/*.json`**
   - **现象**：首页与 `/projects` 的项目卡片、首页 JSON-LD 会自动更新，但页面文案与关键词仍停留在旧项目列表。
   - **联动清单**：除 JSON 文件外，需按需同步 `src/pages/index.astro`（简介文案与目前硬编码为 `"C++23"` 的 `projectSchemaNodes.programmingLanguage`）、`src/pages/about.astro` 开源列表与 `src/consts.ts` 的 `DEFAULT_KEYWORDS`。

7. **`BlogPost.astro` 直接显示 `author.id` 而非 `authors` 集合的 `name`**
   - **现象**：`src/pages/rss.xml.js` 通过 `authorMap` 解析 `author.data.name`，而 `BlogPost.astro` 直接使用 `author?.id || "Farna"`。
   - **规避**：目前仅有 `farna.json`（ID 与展示名一致）；若新增作者且文件名 ID 与显示名不同，需在 `BlogPost.astro` 改为 `getEntry` 解析。

8. **`BaseHead.astro` 接收 `keywords` Prop 但不会渲染 `<meta name="keywords">`**
   - **现象**：`projects/index.astro`、`blog/index.astro`、`about.astro` 均传入了 `keywords` Prop，但输出 HTML 中不存在对应 meta 标签。
   - **原因**：commit `334f39c` 移除了过时的 `<meta name="keywords">`，仅在 `BaseLayout` / `BaseHead` Props 及 `src/consts.ts` 保留兼容定义。

9. **首页展示策略说明（修改首页列表时注意）**
   - `src/pages/index.astro` 目前对 `projects` 与 `posts` 均做全量渲染，未使用 `project.data.featured` 过滤或文章数量截断。

10. **CI 包管理器检测优先匹配 `yarn.lock` 且开启 `--frozen-lockfile`**
    - **现象**：若仓库误出现 `yarn.lock`，`.github/workflows/astro.yml` 会优先选用 `yarn` 导致构建失败；修改 `package.json` 未同步 `pnpm-lock.yaml` 也会在 CI 安装阶段报错。
    - **规避**：仅保留并提交 `pnpm-lock.yaml`。

11. **仓库未配置 `@astrojs/check` 与独立测试/Lint 脚本**
    - **现象**：`node_modules/.bin` 仅含 `astro`，不存在 `eslint`、`vitest` 或 `astro check` 所需依赖。
    - **门禁**：`pnpm build` 是唯一集成了内容集合 Zod 校验、静态路由生成与集成产物的全量验证入口，任何改动后必须执行并抽检 `dist/`。

12. **禁止在同一元素上同时声明 `container-type: inline-size`（或 `container:`）与 `grid-template-rows: subgrid`**
    - **现象**：在卡片元素同时声明 `container: card / inline-size` 与 `grid-template-rows: subgrid` 后，首页“经验记录”博客卡片内的日期、标题、摘要与页脚全部重叠压在同一行内（项目卡片跨行 `subgrid` 对齐也悄然失效）。
    - **原因**：`container-type: inline-size` 隐含 `contain: layout`，按 CSS Grid 规范会强制使该元素的 `subgrid` 计算为 `none`（退化为仅 1 行的独立网格）；内层再套 `subgrid` 时只能继承这 1 条行轨，导致全部子项叠压在一起。
    - **解决**：不要给 `subgrid` 容器本身加 `container-type`（小屏微调改用流体 `clamp()` / `@media`，如确需容器查询则放在单个非 `subgrid` 子单元内）；同时为跨 `gap` 的 `subgrid` 卡片设置明确 `row-gap`（如 `0.5rem`），改动 Grid/Popover/View Transitions 等视觉敏感 CSS 后须在真实浏览器预览验证。
