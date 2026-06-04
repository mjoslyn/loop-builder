# Changelog

All notable changes to Loop Builder are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

- **Template building** for block (FSE) themes — registering single / archive /
  category / search templates that use Loop Builder. (On classic themes, the
  inherit-query mode added in 0.4.0 already powers archive / search displays.)

## [0.5.0]

### Added
- **Custom Field block** (`loop-builder/field`) — output a post meta or ACF field
  value for the current loop item, with an optional prefix/suffix, a choice of
  HTML tag, and full color/typography/spacing supports. Uses ACF's `get_field()`
  for formatted values when available, falling back to raw post meta; empty values
  render nothing. When ACF is active, its field names are suggested in the editor.

### Changed
- Pagination gained a Style panel (alignment — now centered by default — plus a
  plain/boxed link treatment and accent color).
- Grid, flex, and slider items are equal-height by default; list items are
  full-width.

## [0.4.0] - Phase 4

### Added
- **Conditional display** ("Visibility") on every block — show/hide by login
  status, user role (has one of / none of), and a date window. Authored in the
  editor; enforced server-side via a `render_block` gate.
- **Inherit query** mode — a Loop Builder block can drive itself from the page's
  main query (category / tag / author / search / home), so its layout and styling
  power archive and search results. Pagination falls back to standard WordPress
  page links in this mode.
- **Multi-post-type querying** — target several post types in one loop.

## [0.3.0] - Phase 3

### Added
- **Slider layout** — a dependency-free, scroll-snap carousel with previous/next
  controls (progressive enhancement via the template's view script).
- **Responsive columns** — independent desktop / tablet / mobile column counts for
  grid, flex, and slider layouts (driven by CSS custom properties).
- **Card style panel** — per-item background, padding, corner radius, border, and a
  hover-lift effect (`cardStyle` attribute, applied via custom properties).
- **Bundled patterns** under a "Loop Builder" category: Blog grid, News list, and
  Card slider.
- **Query block variations** for quick-start List and Slider layouts.

## [0.2.0] - Phase 2

### Added
- Multi-clause **taxonomy filters** with AND / OR relation.
- **Custom field (meta) query builder**: key + comparison + value + type, multiple
  clauses with AND / OR relation.
- **Date filter**: rolling "last N days" window or an explicit after / before range.
- `loop-builder/pagination` block with three types (inserter variations): numbered
  links, previous / next, and **load more**.
- REST endpoint `GET /loop-builder/v1/more` powering load-more: it re-discovers the
  query block inside the post by `queryId` and renders the next page of items.
- Pagination is added to the query block's default template.

### Fixed
- Avoided a `strtoupper(null)` deprecation when meta/taxonomy clauses omitted
  optional `type` / `field` / `operator` keys.

### Changed
- `taxQuery` / `metaQuery` attributes now use a `{ relation, clauses[] }` shape
  (the server still accepts the legacy array form).

## [0.1.0] - Phase 1

### Added
- `loop-builder/query` parent block with query and layout settings.
- `loop-builder/template` block: live editor preview loop + server-side render
  that reuses core field blocks via injected `postId`/`postType` context.
- `loop-builder/no-results` fallback block.
- Query controls: post type, items-to-show, offset, order/orderby, author,
  keyword, sticky handling, and a single taxonomy filter.
- Grid / list / flex layouts with configurable columns and gap.
