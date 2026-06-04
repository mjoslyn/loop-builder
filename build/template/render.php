<?php
/**
 * Server render for loop-builder/template.
 *
 * Runs the query from the parent block's context and renders the card's inner
 * blocks once per result, wrapped in the layout container.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved inner-block markup (unused — re-rendered per post).
 * @var WP_Block $block      Block instance (carries the query/layout context).
 *
 * @package LoopBuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$query_attr = isset( $block->context['loop-builder/query'] ) ? (array) $block->context['loop-builder/query'] : array();
$query_id   = isset( $block->context['loop-builder/queryId'] ) ? (int) $block->context['loop-builder/queryId'] : 0;
$display    = isset( $block->context['loop-builder/displayLayout'] ) ? (array) $block->context['loop-builder/displayLayout'] : array();
$card_style = isset( $block->context['loop-builder/cardStyle'] ) ? (array) $block->context['loop-builder/cardStyle'] : array();

$inherit = ! empty( $query_attr['inherit'] );
$page    = \LoopBuilder\Render::current_page( $query_id, $inherit );

if ( $inherit ) {
	// Drive the loop from the page's main query (archive / search / home).
	global $wp_query;
	$query = $wp_query;
	$query->rewind_posts();
} else {
	$query = new WP_Query( \LoopBuilder\Query::to_query_args( $query_attr, $page ) );
}

if ( ! $query->have_posts() ) {
	if ( ! $inherit ) {
		wp_reset_postdata();
	}
	return;
}

$items = \LoopBuilder\Render::render_items( $block, $query, 'li' );

$classes = \LoopBuilder\Render::layout_classes( $display );
if ( ! empty( $card_style ) ) {
	$classes .= ' has-card-style';
}
if ( \LoopBuilder\Render::card_has_hover( $card_style ) ) {
	$classes .= ' has-card-hover';
}

$wrapper_args = array( 'class' => $classes );
$styles       = \LoopBuilder\Render::layout_styles( $display, $card_style );
if ( $styles ) {
	$wrapper_args['style'] = $styles;
}

$wrapper_attrs = get_block_wrapper_attributes( $wrapper_args );

printf(
	'<ul %s data-lb-query="%s">%s</ul>',
	$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
	esc_attr( $query_id ),
	$items // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks.
);
