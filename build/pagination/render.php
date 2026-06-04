<?php
/**
 * Server render for loop-builder/pagination.
 *
 * Re-runs the query (as core's pagination blocks do) to learn the total page
 * count, then renders numbered links, previous/next links, or a load-more
 * button depending on the chosen type.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance (carries the query context).
 *
 * @package LoopBuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$query_attr = isset( $block->context['loop-builder/query'] ) ? (array) $block->context['loop-builder/query'] : array();
$query_id   = isset( $block->context['loop-builder/queryId'] ) ? (int) $block->context['loop-builder/queryId'] : 0;
$type       = isset( $attributes['paginationType'] ) ? $attributes['paginationType'] : 'numbers';

// Resolve the appearance settings and build a wrapper-attribute helper used by
// every render path below.
$justify    = in_array( ( $attributes['justify'] ?? 'center' ), array( 'left', 'center', 'right', 'space-between' ), true ) ? $attributes['justify'] : 'center';
$link_style = in_array( ( $attributes['linkStyle'] ?? 'plain' ), array( 'plain', 'boxed' ), true ) ? $attributes['linkStyle'] : 'plain';

$accent = '';
if ( ! empty( $attributes['accentColor'] ) ) {
	$raw = (string) $attributes['accentColor'];
	if ( preg_match( '/^var:preset\|color\|([\w-]+)$/', $raw, $m ) ) {
		$accent = 'var(--wp--preset--color--' . $m[1] . ')';
	} else {
		$hex = sanitize_hex_color( $raw );
		if ( $hex ) {
			$accent = $hex;
		} elseif ( preg_match( '/^rgba?\(\s*[\d.,%\s\/]+\)$/i', $raw ) ) {
			$accent = $raw;
		}
	}
}

$pagination_wrapper = static function ( $resolved_type ) use ( $justify, $link_style, $accent ) {
	$args = array(
		'class' => sprintf(
			'wp-block-loop-builder-pagination is-type-%s is-justify-%s is-pg-%s',
			sanitize_html_class( $resolved_type ),
			sanitize_html_class( $justify ),
			sanitize_html_class( $link_style )
		),
	);
	if ( $accent ) {
		$args['style'] = '--lb-pg-accent:' . $accent;
	}
	return get_block_wrapper_attributes( $args );
};

$inherit = ! empty( $query_attr['inherit'] );
$page    = \LoopBuilder\Render::current_page( $query_id, $inherit );

if ( $inherit ) {
	global $wp_query;
	$max = (int) $wp_query->max_num_pages;
} else {
	$probe = new WP_Query( \LoopBuilder\Query::to_query_args( $query_attr, $page ) );
	$max   = \LoopBuilder\Rest::max_pages( $probe, $query_attr );
	wp_reset_postdata();
}

// Nothing to page through.
if ( $max <= 1 ) {
	return;
}

// Inherited queries page through the main query with standard WordPress links;
// load-more isn't supported there, so it falls back to numbered links.
if ( $inherit ) {
	$mid   = isset( $attributes['midSize'] ) ? (int) $attributes['midSize'] : 2;
	$inner = \LoopBuilder\Render::inherited_pagination( $type, $max, $mid );
	if ( empty( $inner ) ) {
		return;
	}
	$resolved_type = ( 'prev-next' === $type ) ? 'prev-next' : 'numbers';
	printf(
		'<nav %s>%s</nav>',
		$pagination_wrapper( $resolved_type ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
		$inner // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from core helpers.
	);
	return;
}

$page_key = 'query-' . $query_id . '-page';
$inner    = '';

if ( 'load-more' === $type ) {
	if ( $page >= $max ) {
		return;
	}
	$post_id = get_the_ID() ? (int) get_the_ID() : (int) get_queried_object_id();
	$label   = ! empty( $attributes['loadMoreLabel'] ) ? $attributes['loadMoreLabel'] : __( 'Load more', 'loop-builder' );
	$inner   = sprintf(
		'<button type="button" class="loop-builder-load-more" data-lb-query="%1$d" data-lb-post="%2$d" data-lb-page="%3$d" data-lb-max="%4$d" data-lb-rest="%5$s">%6$s</button>',
		$query_id,
		$post_id,
		$page + 1,
		$max,
		esc_url( rest_url( \LoopBuilder\Rest::NAMESPACE . '/more' ) ),
		esc_html( $label )
	);
} elseif ( 'prev-next' === $type ) {
	if ( $page > 1 ) {
		$prev_url = $page - 1 <= 1 ? remove_query_arg( $page_key ) : add_query_arg( $page_key, $page - 1 );
		$inner   .= '<a class="prev-page" href="' . esc_url( $prev_url ) . '">' . esc_html__( '← Previous', 'loop-builder' ) . '</a>';
	}
	if ( $page < $max ) {
		$next_url = add_query_arg( $page_key, $page + 1 );
		$inner   .= '<a class="next-page" href="' . esc_url( $next_url ) . '">' . esc_html__( 'Next →', 'loop-builder' ) . '</a>';
	}
} else {
	// Numbered links. The big-number/str_replace trick yields a clean %#%
	// placeholder for paginate_links while preserving other query args.
	$big   = 999999999;
	$base  = str_replace( $big, '%#%', esc_url( add_query_arg( $page_key, $big ) ) );
	$inner = paginate_links(
		array(
			'base'      => $base,
			'format'    => '',
			'current'   => max( 1, $page ),
			'total'     => $max,
			'mid_size'  => isset( $attributes['midSize'] ) ? (int) $attributes['midSize'] : 2,
			'prev_text' => __( '← Previous', 'loop-builder' ),
			'next_text' => __( 'Next →', 'loop-builder' ),
			'type'      => 'plain',
		)
	);
}

if ( empty( $inner ) ) {
	return;
}

printf(
	'<nav %s>%s</nav>',
	$pagination_wrapper( $type ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
	$inner // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped pieces above.
);
