---
name: content-and-collections
description: >-
  Use this skill when adding or editing blog posts in src/content/blog/,
  open-source projects in src/data/projects/, author profiles in
  src/data/authors/, modifying Astro 6 Content Collection schemas in
  src/content.config.ts, or updating RSS feed generation in src/pages/rss.xml.js.
---

# Content Collections, Blog & Projects Skill

本指南说明如何在 Astro 6 Content Collections（`glob()` 加载器）体系下新增或维护博客文章、开源项目、作者资料与 RSS 订阅。

## 1. 新增与编辑博客文章（`src/content/blog/`）

1. **文件名与路由 slug**：在 `src/content/blog/` 下创建 `.md` 或 `.mdx` 文件；`src/pages/blog/[...slug].astro` 与 `BlogCard.astro` 直接使用 `post.id`（不含扩展名的文件名，支持中文文件名）生成 `/blog/${post.id}` 路由。
2. **Frontmatter 必填字段**（由 `src/content.config.ts` 的 `blog` Schema 校验）：
   ```yaml
   ---
   title: 文章标题
   author: farna
   description: 文章摘要（同时用于列表卡片、文章页 summary-box 与 SEO description）
   pubDate: 2026-11-23 12:00:00
   relatedPosts: []
   ---
   ```
   - `author` 必须匹配 `src/data/authors/*.json` 文件名 ID；`relatedPosts` 可选，若填写须匹配既有 `blog` 条目 ID。
   - 排序规则：首页与 `/blog` 均按 `pubDate` 倒序排列。
3. **正文排版与版权**：
   - `BlogPost.astro` 的 `.prose` 已内置 `h2` / `h3`（带 `scroll-margin-top: 4.5rem`）、`pre.astro-code`、行内 `code`、`blockquote`、横向滚动 `table` 与响应式 `img` 样式，无需在 Markdown 内写内联样式。
   - 新增文章与配图受 [CONTENT_LICENSE.md](../../CONTENT_LICENSE.md) 版权保护，未经明确要求不修改既有原创文章正文。

## 2. 新增与更新开源项目（多处联动清单）

1. **创建项目 JSON**：在 `src/data/projects/<slug>.json` 中按 `projects` Schema 填写：
   ```json
   {
     "name": "project-name",
     "description": "一句话项目定位与核心特性说明",
     "repoUrl": "https://github.com/FarnaHerry/project-name",
     "demoUrl": "https://example.com",
     "techStack": ["C++23", "HuxerUI"],
     "stars": 0,
     "featured": true,
     "order": 5,
     "badge": "标签文本"
   }
   ```
   - `demoUrl`、`badge` 可省略；`stars` 默认 `0`，`featured` 默认 `true`，列表按 `order` 升序展示。
2. **多处手工文案同步检查**：除卡片列表会自动读取集合外，按需同步以下手工位置：
   - [src/pages/index.astro](../../src/pages/index.astro)：个人简介段落及 `projectSchemaNodes`（注意当前 `programmingLanguage` 统一填 `"C++23"`，非 C++ 项目需调整）。
   - [src/pages/about.astro](../../src/pages/about.astro)：`开源项目` `<ul>` 简介列表。
   - [src/consts.ts](../../src/consts.ts)：`DEFAULT_KEYWORDS` 数组（若需维护关键字列表）。

## 3. 作者数据与 RSS 同步

- 新增作者时在 `src/data/authors/<id>.json` 提供 `{"name": "...", "portfolio": "https://..."}`。
- `src/pages/rss.xml.js` 通过 `authorMap` 解析 `author.data.name`，而 `BlogPost.astro` 当前直接使用 `author?.id || "Farna"`；若作者 ID 与显示名不同，需同步改造 `BlogPost.astro` 通过 `getEntry` 解析。

## 4. 构建与产物核验

```bash
pnpm build
ls -l dist/blog/ dist/rss.xml
```
确认 `pnpm build` 零报错退出，且 `dist/rss.xml` 与目标 `dist/blog/<slug>/index.html` 已正确生成。
