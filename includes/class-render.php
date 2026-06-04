<?php
/**
 * Server-side rendering helpers shared by the Loop Builder blocks.
 *
 * @package LoopBuilder
 */

namespace LoopBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the per-post loop and resolves layout presentation.
 */
class Render {

	/**
	 * Determine the current page for a query block on the front end.
	 *
	 * Mirrors core: an unfiltered single query uses the main `paged` query var;
	 * additional queries on the page namespace their page via `query-N-page`.
	 *
	 * @param int  $query_id   The block's queryId attribute.
	 * @param bool $inherit    Whether the query inherits the main template query.
	 * @return int Current page (1-based).
	 */
	public static function current_page( int $query_id, bool $inherit = false ): int {
		if ( $inherit ) {
			return max( 1, (int) get_query_var( 'paged' ) );
		}
		$key  = 'query-' . $query_id . '-page';
		$page = isset( $_GET[ $key ] ) ? (int) sanitize_text_field( wp_unslash( $_GET[ $key ] ) ) : 1; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return max( 1, $page );
	}

	/**
	 * Run the loop for a `template` block and return the assembled item markup.
	 *
	 * Each post is rendered by re-evaluating the template's inner blocks with a
	 * temporarily injected `postId`/`postType` context, exactly as core's
	 * post-template does.
	 *
	 * @param \WP_Block $block       The template block instance.
	 * @param \WP_Query $query       The executed query.
	 * @param string    $item_tag    Tag for each item wrapper (e.g. 'li').
	 * @return string Concatenated item HTML.
	 */
	public static function render_items( \WP_Block $block, \WP_Query $query, string $item_tag = 'li' ): string {
		$content = '';

		while ( $query->have_posts() ) {
			$query->the_post();
			$post_id   = get_the_ID();
			$post_type = get_post_type();

			// Inject the per-post context the core field blocks consume.
			$inject = static function ( $context ) use ( $post_id, $post_type ) {
				$context['postType'] = $post_type;
				$context['postId']   = $post_id;
				return $context;
			};
			add_filter( 'render_block_context', $inject, 1 );

			$block_instance          = $block->parsed_block;
			$block_instance['attrs'] = $block_instance['attrs'] ?? array();
			$inner                   = ( new \WP_Block(
				$block_instance,
				array(
					'postType' => $post_type,
					'postId'   => $post_id,
				)
			) )->render( array( 'dynamic' => false ) );

			remove_filter( 'render_block_context', $inject, 1 );

			$classes  = 'loop-builder-item';
			$content .= sprintf( '<%1$s class="%2$s">%3$s</%1$s>', tag_escape( $item_tag ), esc_attr( $classes ), $inner );
		}

		wp_reset_postdata();
		return $content;
	}

	/**
	 * Render pagination for an inherited (main-query) loop using core helpers,
	 * which already understand pretty permalinks and the `paged` query var.
	 *
	 * @param string $type     Requested pagination type.
	 * @param int    $max      Total pages.
	 * @param int    $mid_size Numbers shown either side of the current page.
	 * @return string Pagination HTML.
	 */
	public static function inherited_pagination( string $type, int $max, int $mid_size = 2 ): string {
		if ( 'prev-next' === $type ) {
			$prev = get_previous_posts_link( esc_html__( '← Previous', 'loop-builder' ) );
			$next = get_next_posts_link( esc_html__( 'Next →', 'loop-builder' ), $max );
			return (string) $prev . (string) $next;
		}

		// Numbers (also the fallback for load-more under inheritance). Letting
		// paginate_links default its base/total/current reads the main query.
		return (string) paginate_links(
			array(
				'mid_size'  => $mid_size,
				'prev_text' => esc_html__( '← Previous', 'loop-builder' ),
				'next_text' => esc_html__( 'Next →', 'loop-builder' ),
				'type'      => 'plain',
			)
		);
	}

	/**
	 * Reduce a custom-field value (scalar, or an ACF array such as a select or
	 * image field) to a plain display string. Returns '' for empty values.
	 *
	 * @param mixed $value Raw field value.
	 * @return string Display string.
	 */
	public static function stringify_field_value( $value ): string {
		if ( null === $value || false === $value ) {
			return '';
		}

		if ( is_scalar( $value ) ) {
			if ( is_bool( $value ) ) {
				return $value ? '1' : '';
			}
			return trim( (string) $value );
		}

		if ( is_array( $value ) ) {
			// ACF file/image fields return an array; the URL is the safe text fallback.
			if ( isset( $value['url'] ) && is_string( $value['url'] ) ) {
				return $value['url'];
			}
			$parts = array();
			foreach ( $value as $item ) {
				if ( is_scalar( $item ) ) {
					$parts[] = (string) $item;
				} elseif ( is_array( $item ) && isset( $item['label'] ) && is_scalar( $item['label'] ) ) {
					$parts[] = (string) $item['label'];
				}
			}
			return implode( ', ', array_filter( $parts ) );
		}

		return '';
	}

	/**
	 * Build the layout utility classes for a display container.
	 *
	 * @param array $display Display layout attribute ({ type, columns }).
	 * @return string Space-separated class list.
	 */
	public static function layout_classes( array $display ): string {
		$type    = in_array( ( $display['type'] ?? 'grid' ), array( 'grid', 'list', 'flex', 'slider' ), true ) ? $display['type'] : 'grid';
		$columns = isset( $display['columns'] ) ? max( 1, (int) $display['columns'] ) : 3;

		$classes = array( 'loop-builder-layout', 'is-layout-' . $type );
		if ( in_array( $type, array( 'grid', 'flex', 'slider' ), true ) ) {
			$classes[] = 'loop-builder-columns-' . $columns;
		}
		return implode( ' ', $classes );
	}

	/**
	 * Build inline custom-property styles for gap, responsive columns, and any
	 * card-style tokens.
	 *
	 * @param array $display    Display layout attribute.
	 * @param array $card_style Optional card-style attribute.
	 * @return string Inline style attribute value (no `style=`), or empty.
	 */
	public static function layout_styles( array $display, array $card_style = array() ): string {
		$styles = array();

		if ( ! empty( $display['gap'] ) ) {
			$gap = self::sanitize_dimension( (string) $display['gap'] );
			if ( $gap ) {
				$styles[] = '--loop-builder-gap:' . $gap;
			}
		}

		foreach ( array(
			'columns'       => '--loop-builder-columns',
			'columnsTablet' => '--loop-builder-columns-tablet',
			'columnsMobile' => '--loop-builder-columns-mobile',
		) as $key => $var ) {
			if ( ! empty( $display[ $key ] ) ) {
				$styles[] = $var . ':' . max( 1, (int) $display[ $key ] );
			}
		}

		$styles = array_merge( $styles, self::card_style_vars( $card_style ) );

		return implode( ';', $styles );
	}

	/**
	 * Translate the card-style attribute into CSS custom properties consumed by
	 * `.loop-builder-item` (see style.scss).
	 *
	 * @param array $card_style Card-style attribute.
	 * @return string[] List of `--prop:value` declarations.
	 */
	private static function card_style_vars( array $card_style ): array {
		if ( empty( $card_style ) ) {
			return array();
		}

		$vars = array();

		if ( ! empty( $card_style['background'] ) ) {
			$vars[] = '--loop-builder-card-bg:' . self::sanitize_color( (string) $card_style['background'] );
		}
		if ( ! empty( $card_style['padding'] ) ) {
			$pad = self::sanitize_dimension( (string) $card_style['padding'] );
			if ( $pad ) {
				$vars[] = '--loop-builder-card-padding:' . $pad;
			}
		}
		if ( isset( $card_style['radius'] ) && '' !== $card_style['radius'] ) {
			$radius = self::sanitize_dimension( (string) $card_style['radius'] );
			if ( $radius ) {
				$vars[] = '--loop-builder-card-radius:' . $radius;
			}
		}
		if ( ! empty( $card_style['borderWidth'] ) ) {
			$bw = self::sanitize_dimension( (string) $card_style['borderWidth'] );
			if ( $bw ) {
				$vars[] = '--loop-builder-card-border-width:' . $bw;
			}
		}
		if ( ! empty( $card_style['borderColor'] ) ) {
			$vars[] = '--loop-builder-card-border-color:' . self::sanitize_color( (string) $card_style['borderColor'] );
		}

		// Filter out any declarations whose value sanitized to empty.
		return array_values( array_filter( $vars, static fn( $v ) => substr( $v, -1 ) !== ':' ) );
	}

	/**
	 * Whether the card-style attribute requests a hover lift effect.
	 *
	 * @param array $card_style Card-style attribute.
	 * @return bool
	 */
	public static function card_has_hover( array $card_style ): bool {
		return ! empty( $card_style['hoverLift'] );
	}

	/**
	 * Sanitize a color value (hex, rgb/rgba, or a CSS preset var token).
	 *
	 * @param string $value Raw color.
	 * @return string Safe CSS color, or empty.
	 */
	private static function sanitize_color( string $value ): string {
		$value = trim( $value );
		if ( preg_match( '/^var:preset\|color\|([\w-]+)$/', $value, $m ) ) {
			return 'var(--wp--preset--color--' . $m[1] . ')';
		}
		$maybe = sanitize_hex_color( $value );
		if ( $maybe ) {
			return $maybe;
		}
		if ( preg_match( '/^rgba?\(\s*[\d.,%\s\/]+\)$/i', $value ) ) {
			return $value;
		}
		return '';
	}

	/**
	 * Allow only a safe subset of CSS length values.
	 *
	 * @param string $value Raw dimension.
	 * @return string Sanitized dimension or empty string.
	 */
	private static function sanitize_dimension( string $value ): string {
		$value = trim( $value );
		// Accept presets like var:preset|spacing|40 converted to a CSS var, or a raw length.
		if ( preg_match( '/^var:preset\|spacing\|(\w+)$/', $value, $m ) ) {
			return 'var(--wp--preset--spacing--' . $m[1] . ')';
		}
		if ( preg_match( '/^[0-9.]+(px|em|rem|vw|vh|%)?$/', $value ) ) {
			return $value;
		}
		return '';
	}
}
