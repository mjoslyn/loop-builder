<?php
/**
 * PHPUnit bootstrap for Loop Builder unit tests.
 *
 * These tests exercise the pure-logic helpers (query-arg building and the
 * pagination caps) in isolation, without a running WordPress. The handful of
 * WordPress functions and the WP_Query type those helpers touch are stubbed
 * below with just enough behavior to make the logic observable.
 *
 * @package LoopBuilder
 */

define( 'ABSPATH', __DIR__ . '/' );

/**
 * Options backing get_option() during a test. Reset between tests via
 * lb_test_set_option(); empty by default.
 *
 * @var array<string,mixed>
 */
$GLOBALS['lb_test_options'] = array();

/**
 * Set (or clear) a fake option value for the current test.
 *
 * @param string $name  Option name.
 * @param mixed  $value Value to return from get_option().
 */
function lb_test_set_option( string $name, $value ): void {
	$GLOBALS['lb_test_options'][ $name ] = $value;
}

if ( ! function_exists( 'wp_parse_args' ) ) {
	function wp_parse_args( $args, $defaults = array() ) {
		return array_merge( $defaults, (array) $args );
	}
}

if ( ! function_exists( 'absint' ) ) {
	function absint( $n ) {
		return abs( (int) $n );
	}
}

if ( ! function_exists( 'sanitize_key' ) ) {
	function sanitize_key( $key ) {
		return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $str ) {
		return trim( preg_replace( '/\s+/', ' ', (string) $str ) );
	}
}

if ( ! function_exists( 'wp_parse_id_list' ) ) {
	function wp_parse_id_list( $list ) {
		if ( ! is_array( $list ) ) {
			$list = preg_split( '/[\s,]+/', (string) $list );
		}
		$ids = array_map( 'absint', $list );
		return array_values( array_unique( array_filter( $ids ) ) );
	}
}

if ( ! function_exists( 'is_post_type_hierarchical' ) ) {
	function is_post_type_hierarchical( $post_type ) {
		// Only 'page' is hierarchical in this stubbed world.
		return 'page' === $post_type;
	}
}

if ( ! function_exists( 'get_option' ) ) {
	function get_option( $name, $default = false ) {
		return $GLOBALS['lb_test_options'][ $name ] ?? $default;
	}
}

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $tag, $value, ...$args ) {
		return $value;
	}
}

if ( ! function_exists( 'current_time' ) ) {
	function current_time( $format ) {
		return gmdate( $format );
	}
}

// Minimal WP_Query stand-in: max_pages() only reads the max_num_pages property.
if ( ! class_exists( 'WP_Query' ) ) {
	class WP_Query {
		/** @var int */
		public $max_num_pages = 0;

		/**
		 * @param int $max_num_pages Total pages the query reports.
		 */
		public function __construct( int $max_num_pages = 0 ) {
			$this->max_num_pages = $max_num_pages;
		}
	}
}

require_once dirname( __DIR__ ) . '/includes/class-query.php';
require_once dirname( __DIR__ ) . '/includes/class-rest.php';
