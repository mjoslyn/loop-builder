<?php
/**
 * Plugin Name:       Loop Builder
 * Plugin URI:        https://github.com/loop-builder/loop-builder
 * Description:       A visual query loop builder for the WordPress block editor. Display posts, pages, or any custom post type filtered by taxonomy, author, meta, date, or keyword — in grid, list, or slider layouts with pagination and full styling controls.
 * Version:           0.6.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Loop Builder Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       loop-builder
 *
 * @package LoopBuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LOOP_BUILDER_VERSION', '0.6.0' );
define( 'LOOP_BUILDER_FILE', __FILE__ );
define( 'LOOP_BUILDER_DIR', plugin_dir_path( __FILE__ ) );
define( 'LOOP_BUILDER_URL', plugin_dir_url( __FILE__ ) );
define( 'LOOP_BUILDER_BUILD_DIR', LOOP_BUILDER_DIR . 'build' );

require_once LOOP_BUILDER_DIR . 'includes/class-plugin.php';

\LoopBuilder\Plugin::instance();
