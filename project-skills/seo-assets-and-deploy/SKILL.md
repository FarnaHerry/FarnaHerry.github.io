---
name: seo-assets-and-deploy
description: >-
  Use this skill when modifying SEO metadata, Open Graph/Twitter cards,
  Schema.org @graph JSON-LD in src/components/BaseHead.astro, replacing images
  or icons in public/, adjusting astro.config.mjs sitemap/robots integrations,
  or editing .github/workflows/astro.yml.
---

# SEO, Static Assets & GitHub Pages Deploy Skill

本指南覆盖站内 SEO/JSON-LD 元数据、CWV 静态图片契约、站点地图/RSS 生成以及 GitHub Pages CI 发布流水线维护。

## 0. 衔接全局 `modern-web-guidance`（按需查阅）

修改图片加载、预加载/预拉取、CWV（LCP/CLS/INP）或 `<head>` 语义与媒体属性前，先通过全局 `modern-web-guidance` 检索并核对对应指南：

```bash
pnpx modern-web-guidance@latest search "<2-5 word query>" --skill-version 2026_11_10-47b4c80e
pnpx modern-web-guidance@latest retrieve "<id>"
```

- 图片与预加载优先级：`optimize-image-priority`、`optimize-preload-priority`、`performance`
- 语义元数据与无障碍：`accessibility`、`html`

## 1. `BaseHead.astro` 元数据与 Schema.org `@graph` 规范

1. **Props 与页面接入**：所有页面通过 [BaseLayout.astro](../../src/layouts/BaseLayout.astro) 向 [BaseHead.astro](../../src/components/BaseHead.astro) 传递 `title`、`description`、`image`、`author`、`type`（`"website" | "article"`）、`article`、`noindex` 与 `customGraphNodes`（`keywords` Prop 仅保留签名兼容，不再渲染 `<meta name="keywords">`）。
2. **错误页指令**：类似 `src/pages/404.astro` 的非索引页必须传 `noindex={true}`，使 `robots` meta 输出 `noindex, nofollow`。
3. **JSON-LD `@graph` 节点结构**：
   - 全站基础节点固定使用 `${siteBaseUrl}#person`（`Person`）与 `${siteBaseUrl}#website`（`WebSite`）。
   - 主实体按条件追加：`BlogPosting`（`type === "article" && article?.pubDate`）、`ProfilePage`（首页）或 `WebPage`（其余页）。
   - 首页通过 `customGraphNodes` 注入各开源项目的 `SoftwareSourceCode` 节点，扩展示例可参考 `src/pages/index.astro`。

## 2. `public/` 静态图片与 CWV 资产契约

替换或新增 `public/` 图片时必须保持以下尺寸、文件名与引用耦合关系：

| 文件路径 | 规格要求 | 引用与性能耦合点 |
| --- | --- | --- |
| `public/hero-banner-light.jpg` | `1920×640` JPEG | `HeroBanner.astro` 浅色大图 + `BaseHead.astro` `rel="preload" fetchpriority="high"` |
| `public/hero-banner-dark.jpg` | `1920×640` JPEG | `HeroBanner.astro` 深色大图 + `BaseHead.astro` `rel="prefetch"` |
| `public/footer-banner-light.jpg` | `1920×480` JPEG | `Footer.astro` 浅色大图 |
| `public/footer-banner-dark.jpg` | `1920×480` JPEG | `Footer.astro` 深色大图 + `BaseHead.astro` `rel="prefetch"` |
| `public/og-image.jpg` | `1200×630` JPEG | `src/consts.ts` `DEFAULT_OG_IMAGE` + `BaseHead.astro` OG/Twitter 元数据 |
| `public/apple-touch-icon.png` | `180×180` PNG | `BaseHead.astro` Apple Touch Icon |
| `public/favicon.svg` / `favicon.ico` | SVG / `32×32` | `BaseHead.astro` 站点图标 |

修改图片物理宽高时须同步更新对应组件 `<img>` 上的 `width`/`height` 与 `BaseHead.astro` 的 `og:image:width`/`height` 以避免 CLS。

## 3. Sitemap、Robots、RSS 与 GitHub Pages CI 部署

1. **集成配置（[astro.config.mjs](../../astro.config.mjs)）**：`site` 固定为 `"https://farnaherry.github.io"`，集成 `sitemap()` 与 `robotsTxt()` 自动生成 `sitemap-index.xml`、`sitemap-0.xml` 与 `robots.txt`。
2. **依赖与 CI（[.github/workflows/astro.yml](../../.github/workflows/astro.yml)）**：
   - `pnpm-workspace.yaml` 显式配置 `allowBuilds` 放行 `esbuild` 与 `sharp`。
   - CI 固定使用 Node `22` 与 pnpm `11` 执行 `pnpm install --frozen-lockfile` 与 `pnpm astro build --site ... --base ...`，并将 `dist/` 上传部署至 GitHub Pages。
   - 严禁提交 `yarn.lock` 或 `package-lock.json`，避免 CI 包管理器探测分支命中错误工具。

## 4. 构建与静态产物校验

```bash
pnpm build
ls -l dist/index.html dist/sitemap-index.xml dist/sitemap-0.xml dist/robots.txt dist/rss.xml
rg -n "application/ld\+json|og:image|canonical" dist/index.html
```
确认上述关键静态产物全部存在，且 `dist/index.html` 中 Canonical URL、OG 卡片与 `@graph` JSON-LD 完整输出。
