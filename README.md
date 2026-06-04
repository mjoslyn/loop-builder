# Loop Builder

A visual **query loop builder** for the WordPress block editor — an open-source
alternative to commercial query blocks like GutenKit Query Builder.

Drop the **Loop Builder** block on any page and visually build a query: pick a
post type, filter by taxonomy / author / keyword, choose grid, list, or flex
layouts, and design the item card with native WordPress blocks. No code required.

## Why it's built this way

Loop Builder deliberately **reuses WordPress core field blocks** (Post Title,
Post Excerpt, Featured Image, Post Date, Post Author, Post Terms, Read More)
inside its item template. Those blocks already consume `postId` / `postType`
block context; Loop Builder provides that context, so you get full native
styling, accessibility, and future compatibility for free — instead of a parallel
universe of bespoke field blocks.

It ships three blocks:

| Block | Role |
| --- | --- |
| `loop-builder/query` | Parent. Holds the query + layout settings; provides context. |
| `loop-builder/template` | The repeated item card. Runs the loop and renders results. |
| `loop-builder/no-results` | Fallback content shown when the query is empty. |

## Features

- Query any public post type
- Order by date / title / modified / menu order / random
- Filter by author, keyword, and sticky status
- **Multi-clause taxonomy filters** (AND / OR)
- **Custom field (meta) query builder** — key, comparison, value, type
- **Date filter** — rolling "last N days" or an explicit after / before range
- Items-to-show, offset, and sticky-post handling
- Grid / list / flex / **slider** layouts with **responsive desktop/tablet/mobile
  columns** and gap
- **Card styling** — background, padding, border, radius, and hover lift
- **Pagination**: numbered, previous / next, or a **load-more** button
- **Custom Field block** — output post meta / ACF values per item (prefix/suffix, tag)
- **Conditional display** on any block — by login status, user role, and date window
- **Inherit query** mode — power category / search / archive results with your layout
- **Multi-post-type** queries
- **Ready-made patterns** (Blog grid, News list, Card slider) and quick-start
  layout variations
- Fully server-rendered (SEO-friendly) with a live editor preview
- Editable card built from core blocks

FSE template building is the remaining roadmap item — see `CHANGELOG.md`.

## Install / develop

```bash
npm install      # install build tooling (@wordpress/scripts)
npm run build    # compile blocks into build/
npm run start    # watch mode for development
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

Then activate **Loop Builder** from the Plugins screen (or
`wp plugin activate loop-builder`). The compiled `build/` directory is committed
so the plugin works without a build step when installed from a release.

## Requirements

- WordPress 6.5+
- PHP 7.4+

## License

GPL-2.0-or-later. See `LICENSE`.
