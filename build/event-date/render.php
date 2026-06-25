<?php
/**
 * Server render for loop-builder/event-date.
 *
 * Outputs an event's start date — or its start–end range — using The Events
 * Calendar's own date helpers, formatted with the editor-chosen format. Renders
 * nothing when The Events Calendar is inactive or the post isn't an event, so a
 * stale block left in content after deactivation simply disappears.
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

// The block only registers while The Events Calendar is active, but guard the
// render too: a post saved with this block could be viewed after deactivation.
if ( ! function_exists( 'tribe_get_start_date' ) ) {
	return;
}

$post_id = isset( $block->context['postId'] ) ? (int) $block->context['postId'] : (int) get_the_ID();
if ( ! $post_id ) {
	return;
}

// Only render for actual events; skip any other post type the loop might mix in.
if ( function_exists( 'tribe_is_event' ) && ! tribe_is_event( $post_id ) ) {
	return;
}

$display = ( isset( $attributes['display'] ) && 'start' === $attributes['display'] )
	? 'start'
	: 'start-end';

// Resolve the date format: the site default, a custom string, or a named preset
// (the preset value is itself the PHP date() format string).
$format = isset( $attributes['format'] ) ? (string) $attributes['format'] : 'default';
if ( 'default' === $format ) {
	$date_format = (string) get_option( 'date_format' );
} elseif ( 'custom' === $format ) {
	$custom      = isset( $attributes['customFormat'] ) ? trim( (string) $attributes['customFormat'] ) : '';
	$date_format = '' !== $custom ? $custom : (string) get_option( 'date_format' );
} else {
	$date_format = $format;
}

$start = (string) tribe_get_start_date( $post_id, true, $date_format );
if ( '' === $start ) {
	return;
}

$value = $start;
if ( 'start-end' === $display ) {
	$end = (string) tribe_get_end_date( $post_id, true, $date_format );
	// Collapse to a single date when start and end format identically (e.g. a
	// same-day event shown without a time component).
	if ( '' !== $end && $end !== $start ) {
		$separator = ( isset( $attributes['separator'] ) && '' !== $attributes['separator'] )
			? (string) $attributes['separator']
			: ' – ';
		$value     = $start . $separator . $end;
	}
}

$tag     = isset( $attributes['tagName'] ) ? tag_escape( $attributes['tagName'] ) : 'span';
$wrapper = get_block_wrapper_attributes();

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	$tag, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- tag_escape'd above.
	$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
	esc_html( $value )
);
