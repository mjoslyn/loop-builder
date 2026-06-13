# Loop Builder

A visual **query loop builder** for the WordPress block editor — build dynamic,
no-code post layouts with powerful filtering.

Drop the **Loop Builder** block on any page or template and build a query
visually: pick a post type, filter by taxonomy / meta / date / author / keyword,
choose a grid, list, flex, or slider layout, design the item card with native
WordPress blocks, and add pagination — all without writing code.

- **Server-rendered** for SEO, with a **live editor preview**.
- **Reuses core field blocks** (Post Title, Excerpt, Featured Image, Date, Author,
  Terms…) so styling and accessibility match the rest of your site.
- Works on **classic and block (FSE) themes**.

---

## Table of contents

- [Quick start](#quick-start)
- [The blocks](#the-blocks)
- [Query options](#query-options)
- [Filters](#filters)
- [Layout & styling](#layout--styling)
- [Pagination](#pagination)
- [Custom fields (post meta / ACF)](#custom-fields-post-meta--acf)
- [Conditional display](#conditional-display)
- [Multiple queries on a page](#multiple-queries-on-a-page)
- [Inherit query (archives & search)](#inherit-query-archives--search)
- [Patterns & variations](#patterns--variations)
- [How it works](#how-it-works)
- [Development](#development)
- [Coding standards](#coding-standards)
- [Requirements](#requirements)
- [Roadmap](#roadmap)
- [License](#license)

---

## Quick start

1. Edit a post, page, or template and insert the **Loop Builder** block.
2. In the sidebar, open **Query** and choose a content type and how many items to
   show.
3. Open **Layout** to pick grid / list / flex / slider and the number of columns.
4. Edit the card in the canvas — add or remove core blocks (title, image, excerpt,
   a custom field, etc.). Your edits apply to every item.
5. Publish. The loop renders on the front end exactly as previewed.

## The blocks

| Block | Role |
| --- | --- |
| `loop-builder/query` | **Parent.** Holds the query, layout, card-style, and visibility settings; provides them as context to its children. |
| `loop-builder/template` | The repeated **item card**. Runs the query and renders each result. |
| `loop-builder/no-results` | Fallback content shown when the query returns nothing. |
| `loop-builder/pagination` | Page through results: numbers, previous/next, or load-more. |
| `loop-builder/field` | Output a **custom field** (post meta / ACF) value for the current item. |

The pagination and custom-field blocks live **inside** the query block. The card is
built from ordinary core blocks plus `loop-builder/field`.

## Query options

In the **Query** panel:

- **Content type(s)** — any public post type; hold ⌘/Ctrl to select several.
- **Items to show** and **offset** (skip the first N).
- **Order by** — newest/oldest, title A→Z / Z→A, recently modified, menu order,
  or random.
- **Author** and **keyword** search.
- **Sticky posts** — include, only, or exclude (for the Posts type).
- **Inherit query from the page** — see [below](#inherit-query-archives--search).

## Filters

Three collapsible filter panels:

- **Taxonomy filters** — one or more clauses (taxonomy + terms, *is one of* /
  *is none of*), combined with an **AND / OR** relation.
- **Custom field filters** — a meta query: key, comparison (`=`, `≠`, `>`, contains,
  in, exists…), value, and type (text/number/date…), with AND / OR across clauses.
- **Date filter** — a rolling **"last N days"** window or an explicit **after /
  before** range.

## Layout & styling

**Layout** panel:

- **Grid** — a strict, equal-width matrix.
- **List** — a single full-width column.
- **Flex** — wrapping rows where trailing items grow to fill the row.
- **Slider** — a horizontal, swipeable carousel with prev/next controls.
- **Columns** for desktop / tablet / mobile, plus the **gap**.

Items are **equal-height by default**.

**Card style** panel — opt-in per-item styling: background, padding, border, corner
radius, and a hover lift. (Applied via CSS custom properties, so it stays light.)

**Typography** — the query block, the item template, and the Custom Field block
all support the standard typography tools (font family, size, appearance, line
height, letter spacing, case, decoration) in the Styles tab. Set a base font on
the whole loop or just the cards; the core field blocks inside the card (Post
Title, Post Date, …) carry their own typography controls for per-field overrides.

## Pagination

Add the **Pagination** block inside the loop and choose a type:

- **Numbers** — numbered page links (with a configurable window around the current
  page).
- **Previous / Next** — just the two links.
- **Load more** — a button that fetches and appends the next page in place (via a
  REST endpoint), no full reload.

The **Pagination style** panel adds **alignment** (centered by default), a
**plain / boxed** link treatment, and an **accent color**.

## Custom fields (post meta / ACF)

Add the **Custom Field** block inside the card to print a field value for each item:

- **Field key** — any post meta key or ACF field name.
- When **ACF** is active, its fields are suggested in a dropdown, and values are
  formatted with `get_field()` (dates, choices, etc.). Toggle this off to use the
  raw stored meta.
- **Prefix / suffix**, an **HTML tag** (span, p, h2–h6, …), and full
  color/typography/spacing supports.

Empty values render nothing, so cards stay clean.

## Conditional display

Every block gains a **Visibility** panel (under "Enable conditional display"):

- **Show to** — everyone, logged-in, or logged-out users.
- **User roles** — show to users who *have one of* / *have none of* the chosen roles.
- **Show from / until** — a date-and-time window.

Rules are enforced **server-side**, so hidden blocks are never sent to the browser.

## Multiple queries on a page

Just add more than one **Loop Builder** block. Each gets its own `queryId`, so the
loops — and their pagination — are **independent** (pagination is namespaced as
`?query-<id>-page=…`). For a single combined feed instead, select multiple content
types in one block.

## Inherit query (archives & search)

Turn on **Inherit query from the page** and the loop drives itself from the page's
**main query** — category / tag / author / search / home. This lets you design
archive and search results with Loop Builder's layouts and styling. On block (FSE)
themes, place such a block in the relevant template; on classic themes it works
wherever the main query runs. Pagination falls back to standard WordPress page
links in this mode.

## Patterns & variations

- **Patterns** (Inserter → "Loop Builder"): **Blog grid**, **News list**,
  **Card slider**.
- **Save your own**: design a loop, then click **Save as pattern** in the query
  block's toolbar. Name it, choose synced or unsynced, and it's saved as a user
  pattern in the same "Loop Builder" category — ready to insert on any page.
  Pagination stays independent between copies (each insertion gets its own
  query ID).
- **Variations**: quick-start **List** and **Slider** layouts for the query block.

## How it works

Loop Builder mirrors WordPress core's own Query Loop architecture but ships its own,
more capable blocks:

- The card is rendered by **reusing core field blocks**. They already consume
  `postId` / `postType` context; Loop Builder **provides** that context (in the
  editor via `BlockContextProvider`, on the server via the `render_block_context`
  filter), so there's no parallel universe of bespoke field blocks to maintain.
- The query is built server-side from the block attributes (see
  `includes/class-query.php`) and rendered through `WP_Query`.
- Load-more uses a small REST endpoint (`/loop-builder/v1/more`) that re-discovers
  the exact query block inside the post by `queryId`, so it only ever renders blocks
  that genuinely exist on the page.

## Development

```bash
npm install      # install build tooling (@wordpress/scripts)
npm run build    # compile blocks into build/
npm run start    # watch mode for development
```

The compiled `build/` directory is committed, so the plugin runs from a release
without a build step. Activate it from the Plugins screen, or:

```bash
wp plugin activate loop-builder
```

## Coding standards

JS and CSS follow the WordPress standard via `@wordpress/scripts`; PHP follows the
WordPress Coding Standards via PHPCS.

```bash
npm run lint:js && npm run lint:css   # JavaScript + styles
composer install                      # one-time: install PHPCS + WPCS
composer run lint:php                 # PHP (phpcs)
composer run lint:php:fix             # auto-fix PHP (phpcbf)
```

## Requirements

- WordPress 6.5+
- PHP 7.4+
- Advanced Custom Fields (optional — enables ACF field suggestions and formatting)

## Roadmap

Block (FSE) **template building** — registering ready-made single / archive /
category / search templates that use Loop Builder. See `CHANGELOG.md`.

## License

GPL-2.0-or-later. See `LICENSE`.
