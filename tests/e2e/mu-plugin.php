<?php
/**
 * Plugin Name: Loop Builder E2E Test Support
 * Description: Test-only helper, loaded into wp-env as an mu-plugin. Registers a
 *              public post meta key so Playwright specs can seed a custom-field
 *              value over the REST API and assert how the field block renders it.
 *
 * @package LoopBuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'init',
	static function () {
		register_post_meta(
			'post',
			'lb_test_meta',
			array(
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => static function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}
);
