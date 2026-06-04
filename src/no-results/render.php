<?php
/**
 * Server render for loop-builder/no-results.
 *
 * Renders its inner content only when the sibling query returns nothing.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Rendered inner blocks.
 * @var WP_Block $block      Block instance (carries the query context).
 *
 * @package LoopBuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( trim( $content ) ) ) {
	return;
}

$query_attr = isset( $block->context['loop-builder/query'] ) ? (array) $block->context['loop-builder/query'] : array();
$query_id   = isset( $block->context['loop-builder/queryId'] ) ? (int) $block->context['loop-builder/queryId'] : 0;

$inherit = ! empty( $query_attr['inherit'] );

if ( $inherit ) {
	global $wp_query;
	$found = $wp_query->post_count > 0;
} else {
	$page = \LoopBuilder\Render::current_page( $query_id );
	$args = \LoopBuilder\Query::to_query_args( $query_attr, $page );

	// We only need to know whether anything matched — keep it cheap.
	$args['posts_per_page'] = 1;
	$args['no_found_rows']  = true;
	$args['fields']         = 'ids';

	$probe = new WP_Query( $args );
	$found = $probe->have_posts();
	wp_reset_postdata();
}

if ( $found ) {
	return;
}

$wrapper_attrs = get_block_wrapper_attributes();

printf(
	'<div %s>%s</div>',
	$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
	$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks.
);
