<?php
/**
 * Plugin bootstrap.
 *
 * @package LoopBuilder
 */

namespace LoopBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main plugin singleton. Wires up block registration and the render pipeline.
 */
final class Plugin {

	/**
	 * Block directory names under build/, in registration order. The parent
	 * block must register before its inner blocks are inserted, but WordPress
	 * tolerates any order at registration time.
	 *
	 * @var string[]
	 */
	private const BLOCKS = array(
		'query',
		'template',
		'no-results',
		'pagination',
		'field',
	);

	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * Retrieve (and lazily create) the singleton.
	 */
	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Hook everything up.
	 */
	private function __construct() {
		require_once LOOP_BUILDER_DIR . 'includes/class-query.php';
		require_once LOOP_BUILDER_DIR . 'includes/class-render.php';
		require_once LOOP_BUILDER_DIR . 'includes/class-rest.php';
		require_once LOOP_BUILDER_DIR . 'includes/class-patterns.php';
		require_once LOOP_BUILDER_DIR . 'includes/class-visibility.php';

		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'init', array( $this, 'load_textdomain' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		Rest::init();
		Patterns::init();
		Visibility::init();
	}

	/**
	 * Register every built block from its block.json metadata. The render
	 * callbacks are wired through block.json's "render" field (file:./render.php).
	 */
	public function register_blocks(): void {
		foreach ( self::BLOCKS as $block ) {
			$metadata = LOOP_BUILDER_BUILD_DIR . '/' . $block;
			if ( is_dir( $metadata ) ) {
				register_block_type( $metadata );
			}
		}
	}

	/**
	 * Load translations.
	 */
	public function load_textdomain(): void {
		load_plugin_textdomain( 'loop-builder', false, dirname( plugin_basename( LOOP_BUILDER_FILE ) ) . '/languages' );
	}

	/**
	 * Enqueue the plugin-wide editor bundle (conditional-display controls) and
	 * hand the editor the site's roles for the visibility UI.
	 */
	public function enqueue_editor_assets(): void {
		$asset_path = LOOP_BUILDER_BUILD_DIR . '/index.asset.php';
		if ( ! file_exists( $asset_path ) ) {
			return;
		}
		$asset = require $asset_path;

		wp_enqueue_script(
			'loop-builder-editor',
			LOOP_BUILDER_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		if ( ! function_exists( 'get_editable_roles' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}
		$roles = array();
		foreach ( get_editable_roles() as $slug => $details ) {
			$roles[ $slug ] = translate_user_role( $details['name'] );
		}

		$data = array(
			'roles'     => $roles,
			'hasAcf'    => function_exists( 'get_field' ),
			'acfFields' => $this->acf_field_choices(),
		);

		wp_add_inline_script(
			'loop-builder-editor',
			'window.loopBuilderData = ' . wp_json_encode( $data ) . ';',
			'before'
		);
	}

	/**
	 * Collect ACF field name => label pairs to suggest in the Custom Field block.
	 * Returns an empty array when ACF isn't active.
	 *
	 * @return array<string, string>
	 */
	private function acf_field_choices(): array {
		if ( ! function_exists( 'acf_get_field_groups' ) || ! function_exists( 'acf_get_fields' ) ) {
			return array();
		}

		$choices = array();
		foreach ( acf_get_field_groups() as $group ) {
			$group_key = $group['key'] ?? '';
			if ( ! $group_key ) {
				continue;
			}
			foreach ( (array) acf_get_fields( $group_key ) as $field ) {
				if ( empty( $field['name'] ) ) {
					continue;
				}
				$choices[ $field['name'] ] = ! empty( $field['label'] ) ? $field['label'] : $field['name'];
			}
		}
		return $choices;
	}
}
