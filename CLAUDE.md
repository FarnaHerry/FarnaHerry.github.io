# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro 6 static blog deployed to GitHub Pages at `https://farnaherry.github.io`. Uses the Astro Content Collections API with the new glob loader pattern (Astro 6+).

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build to dist/
pnpm preview      # Preview production build locally
```

No test or lint commands are configured yet.

## Architecture

### Content Collections (`src/content.config.ts`)

Three collections defined with Astro 6 glob loaders:

- **`blog`** — Markdown files from `src/content/blog/`. Schema: `title` (string), `author` (reference to `authors`), `relatedPosts` (array of references to `blog`).
- **`authors`** — JSON files from `src/data/authors/`. Schema: `name` (string), `portfolio` (url).
- **`projects`** — JSON files from `src/data/projects/`. Schema: `name` (string), `description` (string), `repoUrl` (url), `demoUrl` (optional url), `techStack` (string[]), `stars` (number), `featured` (boolean), `order` (number), `badge` (optional string).

References between collections use the Zod `reference()` helper — author and relatedPosts are resolved automatically by Astro's content layer.

### Page Structure

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Home page — Hero intro, featured open source projects, and recent blog posts (50/50 balanced layout) |
| `/projects` | `src/pages/projects/index.astro` | Open source projects showcase page |
| `/about` | `src/pages/about.astro` | About page |
| `/blog` | `src/pages/blog/index.astro` | Blog listing — uses `getCollection("blog")` to list posts |
| `/blog/[...slug]` | `src/pages/blog/[...slug].astro` | Individual blog post — uses dynamic `getCollection("blog")` routing |
| 404 | `src/pages/404.astro` | 404 error page |

### Layouts and Components

- **`BaseLayout.astro`** — Common HTML shell (`BaseHead`, `Header`, `<slot />`, `Footer`, back-to-top button).
- **`BlogPost.astro`** — Article detail layout composing `BaseLayout`, back navigation, article header with publication date and summary box, responsive prose typography, and article footer.
- **`BaseHead.astro`** — Sets `<title>`, charset, and meta description from props.
- **`Header.astro`** — Responsive nav bar: links to `/`, `/projects`, `/blog`, `/about`, and GitHub icon.
- **`Footer.astro`** — Site footer with copyright and GitHub link.
- **`BlogCard.astro`** — Reusable card for blog post items with formatted date, title, description, and hover micro-interaction.
- **`ProjectCard.astro`** — Open source project card with repo link, star counter, tags, and lightweight jumping.
- **`TechBadge.astro`** — Capsule tag component for technologies and badges.
- **`ThemeToggle.astro`** — 3-state theme switcher (system default, light, dark) with instant persistence and zero FOUC.

### Key Observations

- `[...slug].astro` uses hardcoded `getStaticPaths` — this should be refactored to use `getCollection("blog")` to dynamically generate routes from content collection entries.
- `Layout.astro` and `BlogPost.astro` are two separate HTML document shells — there is no shared layout hierarchy. `Layout.astro` is currently unused.
- The site base URL is configured in `astro.config.mjs` as `https://farnaherry.github.io` — all generated links use this as the root.
