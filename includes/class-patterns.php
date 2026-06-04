<?php
/**
 * Bundled block patterns — ready-to-use Loop Builder layouts.
 *
 * @package LoopBuilder
 */

namespace LoopBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers a pattern category and a handful of starter patterns.
 */
class Patterns {

	const CATEGORY = 'loop-builder';

	/**
	 * Hook registration.
	 */
	public static function init(): void {
		add_action( 'init', array( __CLASS__, 'register' ), 11 );
	}

	/**
	 * Register the category and patterns. Runs after blocks are registered.
	 */
	public static function register(): void {
		if ( ! function_exists( 'register_block_pattern' ) ) {
			return;
		}

		register_block_pattern_category(
			self::CATEGORY,
			array( 'label' => __( 'Loop Builder', 'loop-builder' ) )
		);

		foreach ( self::patterns() as $name => $pattern ) {
			register_block_pattern( 'loop-builder/' . $name, $pattern );
		}
	}

	/**
	 * Pattern definitions, keyed by slug.
	 *
	 * @return array<string, array>
	 */
	private static function patterns(): array {
		return array(
			'blog-grid'   => array(
				'title'       => __( 'Blog grid', 'loop-builder' ),
				'description' => __( 'Three-column grid of posts with image, title, date, and excerpt.', 'loop-builder' ),
				'categories'  => array( self::CATEGORY ),
				'content'     => self::blog_grid(),
			),
			'news-list'   => array(
				'title'       => __( 'News list', 'loop-builder' ),
				'description' => __( 'Single-column list of posts with title, date, and excerpt.', 'loop-builder' ),
				'categories'  => array( self::CATEGORY ),
				'content'     => self::news_list(),
			),
			'card-slider' => array(
				'title'       => __( 'Card slider', 'loop-builder' ),
				'description' => __( 'Horizontal slider of post cards with image and title.', 'loop-builder' ),
				'categories'  => array( self::CATEGORY ),
				'content'     => self::card_slider(),
			),
		);
	}

	/**
	 * Blog grid pattern markup.
	 */
	private static function blog_grid(): string {
		return '<!-- wp:loop-builder/query {"query":{"postType":"post","perPage":6,"order":"desc","orderBy":"date"},"displayLayout":{"type":"grid","columns":3,"columnsTablet":2,"columnsMobile":1,"gap":"24px"},"cardStyle":{"hoverLift":true}} -->
<div class="wp-block-loop-builder">
<!-- wp:loop-builder/template -->
<!-- wp:post-featured-image {"isLink":true} /-->
<!-- wp:post-title {"isLink":true,"level":3} /-->
<!-- wp:post-date /-->
<!-- wp:post-excerpt /-->
<!-- /wp:loop-builder/template -->
<!-- wp:loop-builder/no-results -->
<div class="wp-block-loop-builder-no-results"><!-- wp:paragraph --><p>' . esc_html__( 'No posts found.', 'loop-builder' ) . '</p><!-- /wp:paragraph --></div>
<!-- /wp:loop-builder/no-results -->
<!-- wp:loop-builder/pagination {"paginationType":"numbers"} /-->
</div>
<!-- /wp:loop-builder/query -->';
	}

	/**
	 * News list pattern markup.
	 */
	private static function news_list(): string {
		return '<!-- wp:loop-builder/query {"query":{"postType":"post","perPage":8,"order":"desc","orderBy":"date"},"displayLayout":{"type":"list","gap":"20px"}} -->
<div class="wp-block-loop-builder">
<!-- wp:loop-builder/template -->
<!-- wp:post-title {"isLink":true,"level":3} /-->
<!-- wp:post-date /-->
<!-- wp:post-excerpt /-->
<!-- /wp:loop-builder/template -->
<!-- wp:loop-builder/no-results -->
<div class="wp-block-loop-builder-no-results"><!-- wp:paragraph --><p>' . esc_html__( 'No posts found.', 'loop-builder' ) . '</p><!-- /wp:paragraph --></div>
<!-- /wp:loop-builder/no-results -->
<!-- wp:loop-builder/pagination {"paginationType":"load-more"} /-->
</div>
<!-- /wp:loop-builder/query -->';
	}

	/**
	 * Card slider pattern markup.
	 */
	private static function card_slider(): string {
		return '<!-- wp:loop-builder/query {"query":{"postType":"post","perPage":9,"order":"desc","orderBy":"date"},"displayLayout":{"type":"slider","columns":3,"columnsTablet":2,"columnsMobile":1,"gap":"24px"},"cardStyle":{"hoverLift":true}} -->
<div class="wp-block-loop-builder">
<!-- wp:loop-builder/template -->
<!-- wp:post-featured-image {"isLink":true} /-->
<!-- wp:post-title {"isLink":true,"level":3} /-->
<!-- /wp:loop-builder/template -->
<!-- wp:loop-builder/no-results -->
<div class="wp-block-loop-builder-no-results"><!-- wp:paragraph --><p>' . esc_html__( 'No posts found.', 'loop-builder' ) . '</p><!-- /wp:paragraph --></div>
<!-- /wp:loop-builder/no-results -->
</div>
<!-- /wp:loop-builder/query -->';
	}
}
