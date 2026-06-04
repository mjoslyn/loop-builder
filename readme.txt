=== Loop Builder ===
Contributors: loopbuilder
Tags: query loop, query builder, posts, grid, gutenberg
Requires at least: 6.5
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.5.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A visual query loop builder for the block editor. Display posts, pages, or any custom post type in flexible layouts — no code.

== Description ==

Loop Builder adds a visual query block to the WordPress editor. Pick a post type,
filter by taxonomy, author, or keyword, choose a grid / list / flex layout, and
design the item card with native WordPress blocks.

It reuses WordPress core field blocks (Post Title, Excerpt, Featured Image, Date,
Author, Terms) inside the item template, so styling and accessibility match the
rest of your site.

This is an open-source alternative to commercial query-builder blocks.

== Installation ==

1. Upload the `loop-builder` folder to `/wp-content/plugins/`.
2. Activate the plugin through the "Plugins" screen in WordPress.
3. Add the "Loop Builder" block to any post or page.

== Changelog ==

= 0.5.0 =
* New Custom Field block: display post meta / ACF values per loop item.
* Pagination style panel (alignment, plain/boxed links, accent color).
* Equal-height grid/flex/slider items; full-width list items.

= 0.4.0 =
* Conditional display (visibility) on any block: login status, role, date window.
* Inherit-query mode for category/search/archive results.
* Multi-post-type queries.

= 0.3.0 =
* Slider layout with prev/next controls; responsive desktop/tablet/mobile columns.
* Card style panel (background, padding, border, radius, hover lift).
* Bundled patterns (Blog grid, News list, Card slider) and layout variations.

= 0.2.0 =
* Multi-clause taxonomy filters, a custom-field (meta) query builder, and a date
  filter.
* Pagination block: numbered, previous/next, or load-more (with a REST endpoint).

= 0.1.0 =
* Initial release: query block, item template, no-results fallback; post type,
  taxonomy, author, keyword filters; grid / list / flex layouts.
