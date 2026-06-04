<?php
/**
 * Server render for loop-builder/field.
 *
 * Resolves a custom-field value for the current post (from the loop's postId
 * context, or the queried post as a fallback) and outputs it. Uses ACF's
 * get_field() for formatted values when available and enabled, otherwise the
 * raw post meta.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance (carries the postId context).
 *
 * @package LoopBuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$meta_key = isset( $attributes['metaKey'] ) ? trim( (string) $attributes['metaKey'] ) : '';
if ( '' === $meta_key ) {
	return;
}

$post_id = isset( $block->context['postId'] ) ? (int) $block->context['postId'] : (int) get_the_ID();
if ( ! $post_id ) {
	return;
}

$use_acf = ! isset( $attributes['useAcf'] ) || $attributes['useAcf'];

if ( $use_acf && function_exists( 'get_field' ) ) {
	$value = get_field( $meta_key, $post_id );
} else {
	$value = get_post_meta( $post_id, $meta_key, true );
}

$display = \LoopBuilder\Render::stringify_field_value( $value );
if ( '' === $display ) {
	return;
}

$prefix  = isset( $attributes['prefix'] ) ? (string) $attributes['prefix'] : '';
$suffix  = isset( $attributes['suffix'] ) ? (string) $attributes['suffix'] : '';
$tag     = isset( $attributes['tagName'] ) ? tag_escape( $attributes['tagName'] ) : 'span';
$wrapper = get_block_wrapper_attributes();

printf(
	'<%1$s %2$s>%3$s%4$s%5$s</%1$s>',
	$tag, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- tag_escape'd.
	$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
	esc_html( $prefix ),
	esc_html( $display ),
	esc_html( $suffix )
);
