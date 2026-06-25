<?php
/**
 * Server render for loop-builder/field.
 *
 * Resolves a custom-field value for the current post (from the loop's postId
 * context, or the queried post as a fallback) and outputs it as plain text, an
 * image, or a link. Link text can be static or read from another field. Uses
 * ACF's get_field() for formatted values when available and enabled, otherwise
 * the raw post meta.
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

// Don't expose custom-field values for posts whose content is password-protected.
if ( post_password_required( $post_id ) ) {
	return;
}

$use_acf = ! isset( $attributes['useAcf'] ) || $attributes['useAcf'];

// Read a field value: ACF-formatted when available and enabled, else raw meta.
$read = static function ( $key ) use ( $post_id, $use_acf ) {
	if ( $use_acf && function_exists( 'get_field' ) ) {
		return get_field( $key, $post_id );
	}
	return get_post_meta( $post_id, $key, true );
};

$value      = $read( $meta_key );
$display_as = isset( $attributes['displayAs'] ) ? (string) $attributes['displayAs'] : 'text';
$tag        = isset( $attributes['tagName'] ) ? tag_escape( $attributes['tagName'] ) : 'span';
$prefix     = isset( $attributes['prefix'] ) ? (string) $attributes['prefix'] : '';
$suffix     = isset( $attributes['suffix'] ) ? (string) $attributes['suffix'] : '';
$wrapper    = get_block_wrapper_attributes();

/*
 * Image: the field is an attachment (ACF image array, an attachment ID, or a
 * raw URL). Render the sized image, or a bare <img> for an external URL.
 */
if ( 'image' === $display_as ) {
	$size   = isset( $attributes['imageSize'] ) ? sanitize_key( (string) $attributes['imageSize'] ) : 'medium';
	$att_id = 0;
	$url    = '';
	if ( is_array( $value ) ) {
		if ( ! empty( $value['ID'] ) ) {
			$att_id = (int) $value['ID'];
		} elseif ( ! empty( $value['id'] ) ) {
			$att_id = (int) $value['id'];
		} elseif ( ! empty( $value['url'] ) ) {
			$url = (string) $value['url'];
		}
	} elseif ( is_numeric( $value ) ) {
		$att_id = (int) $value;
	} elseif ( is_string( $value ) && '' !== $value ) {
		$url = $value;
	}

	// Optional alt override: static text, or another field. When empty, an
	// attachment keeps its own alt text and a bare URL gets an empty alt.
	$alt_source = isset( $attributes['imageAltSource'] ) ? (string) $attributes['imageAltSource'] : 'custom';
	if ( 'field' === $alt_source ) {
		$alt_key = isset( $attributes['imageAltMetaKey'] ) ? trim( (string) $attributes['imageAltMetaKey'] ) : '';
		$alt     = '' !== $alt_key ? \LoopBuilder\Render::stringify_field_value( $read( $alt_key ) ) : '';
	} else {
		$alt = isset( $attributes['imageAlt'] ) ? (string) $attributes['imageAlt'] : '';
	}

	$img = '';
	if ( $att_id ) {
		// wp_get_attachment_image() esc_attr's the alt; only override when set.
		$attr = ( '' !== trim( $alt ) ) ? array( 'alt' => $alt ) : array();
		$img  = wp_get_attachment_image( $att_id, $size, false, $attr );
	} elseif ( '' !== $url ) {
		$img = sprintf( '<img src="%s" alt="%s" loading="lazy" />', esc_url( $url ), esc_attr( $alt ) );
	}
	if ( '' === $img ) {
		return;
	}

	printf(
		'<%1$s %2$s>%3$s</%1$s>',
		$tag, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- tag_escape'd.
		$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
		$img // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image()/esc_url'd <img>.
	);
	return;
}

/*
 * Link: the field value is the URL (string, or an ACF link/file array). The
 * visible text is static, or read from another field, falling back to the URL.
 */
if ( 'link' === $display_as ) {
	$url = is_array( $value )
		? ( ! empty( $value['url'] ) ? (string) $value['url'] : '' )
		: (string) $value;
	$url = trim( $url );
	if ( '' === $url ) {
		return;
	}

	$source = isset( $attributes['linkTextSource'] ) ? (string) $attributes['linkTextSource'] : 'custom';
	if ( 'field' === $source ) {
		$text_key = isset( $attributes['linkTextMetaKey'] ) ? trim( (string) $attributes['linkTextMetaKey'] ) : '';
		$text     = '' !== $text_key ? \LoopBuilder\Render::stringify_field_value( $read( $text_key ) ) : '';
	} else {
		$text = isset( $attributes['linkText'] ) ? (string) $attributes['linkText'] : '';
	}
	if ( '' === trim( $text ) ) {
		$text = $url;
	}

	// Protocol: a plain URL, a tel: (phone) link, or a mailto: (email) link.
	$protocol = isset( $attributes['linkProtocol'] ) ? (string) $attributes['linkProtocol'] : 'url';
	if ( 'tel' === $protocol ) {
		$href = 'tel:' . preg_replace( '/[^0-9+]/', '', $url );
	} elseif ( 'mailto' === $protocol ) {
		$href = 'mailto:' . $url;
	} else {
		$href = $url;
	}

	// target + rel options.
	$new_tab = ! empty( $attributes['linkNewTab'] );
	$rel     = array();
	if ( $new_tab ) {
		$rel[] = 'noopener';
	}
	if ( ! empty( $attributes['linkNofollow'] ) ) {
		$rel[] = 'nofollow';
	}
	if ( ! empty( $attributes['linkNoreferrer'] ) ) {
		$rel[] = 'noreferrer';
	}

	$attr  = $new_tab ? ' target="_blank"' : '';
	$attr .= $rel ? sprintf( ' rel="%s"', esc_attr( implode( ' ', array_unique( $rel ) ) ) ) : '';

	$link = sprintf(
		'<a href="%1$s"%2$s>%3$s%4$s%5$s</a>',
		esc_url( $href ),
		$attr, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_attr'd rel; static target.
		esc_html( $prefix ),
		esc_html( $text ),
		esc_html( $suffix )
	);

	printf(
		'<%1$s %2$s>%3$s</%1$s>',
		$tag, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- tag_escape'd.
		$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
		$link // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from esc_url()/esc_html().
	);
	return;
}

// Default mode: render the value as text.
$display = \LoopBuilder\Render::stringify_field_value( $value );
if ( '' === $display ) {
	return;
}

printf(
	'<%1$s %2$s>%3$s%4$s%5$s</%1$s>',
	$tag, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- tag_escape'd.
	$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated.
	esc_html( $prefix ),
	esc_html( $display ),
	esc_html( $suffix )
);
