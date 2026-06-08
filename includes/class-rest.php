<?php
/**
 * REST endpoint powering the "load more" pagination variation.
 *
 * The browser sends the post ID, the block's queryId, and the page to load.
 * The server re-discovers that exact query block inside the post's content
 * (so it can only ever render blocks that genuinely exist on the page),
 * runs the query for the requested page, and returns the rendered items.
 *
 * @package LoopBuilder
 */

namespace LoopBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and handles the load-more REST route.
 */
class Rest {

	const NAMESPACE = 'loop-builder/v1';

	/**
	 * Hook route registration.
	 */
	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Register the /more route.
	 */
	public static function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/more',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'handle_more' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'postId'  => array(
						'required'          => true,
						'type'              => 'integer',
						'minimum'           => 1,
						'sanitize_callback' => 'absint',
						'validate_callback' => 'rest_validate_request_arg',
					),
					'queryId' => array(
						'required'          => true,
						'type'              => 'integer',
						'minimum'           => 1,
						'sanitize_callback' => 'absint',
						'validate_callback' => 'rest_validate_request_arg',
					),
					'page'    => array(
						'required'          => true,
						'type'              => 'integer',
						'minimum'           => 1,
						'default'           => 1,
						'sanitize_callback' => 'absint',
						'validate_callback' => 'rest_validate_request_arg',
					),
				),
			)
		);
	}

	/**
	 * Return the rendered items for the requested page.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function handle_more( \WP_REST_Request $request ) {
		$post_id  = (int) $request['postId'];
		$query_id = (int) $request['queryId'];
		$page     = max( 1, (int) $request['page'] );

		$post = get_post( $post_id );
		if ( ! $post ) {
			return new \WP_Error( 'loop_builder_no_post', __( 'Post not found.', 'loop-builder' ), array( 'status' => 404 ) );
		}
		if ( 'publish' !== get_post_status( $post ) && ! current_user_can( 'read_post', $post_id ) ) {
			return new \WP_Error( 'loop_builder_forbidden', __( 'You cannot read this post.', 'loop-builder' ), array( 'status' => 403 ) );
		}

		$blocks      = parse_blocks( $post->post_content );
		$query_block = self::find_query_block( $blocks, $query_id );
		if ( ! $query_block ) {
			return new \WP_Error( 'loop_builder_no_block', __( 'Query block not found on this post.', 'loop-builder' ), array( 'status' => 404 ) );
		}

		$template_block = self::find_inner_block( $query_block, 'loop-builder/template' );
		if ( ! $template_block ) {
			return new \WP_Error( 'loop_builder_no_template', __( 'Template block not found.', 'loop-builder' ), array( 'status' => 404 ) );
		}

		$query_attr = isset( $query_block['attrs']['query'] ) ? (array) $query_block['attrs']['query'] : array();
		$display    = isset( $query_block['attrs']['displayLayout'] ) ? (array) $query_block['attrs']['displayLayout'] : array();

		$args = Query::to_query_args( $query_attr, $page );
		$wpq  = new \WP_Query( $args );
		$max  = self::max_pages( $wpq, $query_attr );

		$context = array(
			'loop-builder/query'         => $query_attr,
			'loop-builder/queryId'       => $query_id,
			'loop-builder/displayLayout' => $display,
			'postId'                     => $post_id,
		);

		// Establish the page as the global post so dynamic blocks resolve sensibly.
		global $wp_query, $post;
		$prev_post = $post;
		$post      = get_post( $post_id ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		setup_postdata( $post );

		$block = new \WP_Block( $template_block, $context );
		$items = Render::render_items( $block, $wpq, 'li' );

		$post = $prev_post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		wp_reset_postdata();

		return new \WP_REST_Response(
			array(
				'html'    => $items,
				'page'    => $page,
				'maxPage' => $max,
				'hasMore' => $page < $max,
			)
		);
	}

	/**
	 * Resolve the effective maximum page count, honoring the query's `pages` cap.
	 *
	 * @param \WP_Query $wpq        Executed query.
	 * @param array     $query_attr Originating query attribute.
	 * @return int Max pages (>= 1).
	 */
	public static function max_pages( \WP_Query $wpq, array $query_attr ): int {
		$max = (int) $wpq->max_num_pages;
		if ( ! empty( $query_attr['pages'] ) ) {
			$max = min( $max, (int) $query_attr['pages'] );
		}
		return max( 1, $max );
	}

	/**
	 * Recursively locate a loop-builder/query block by its queryId attribute.
	 *
	 * @param array $blocks   Parsed blocks.
	 * @param int   $query_id Target queryId.
	 * @return array|null The parsed block, or null.
	 */
	private static function find_query_block( array $blocks, int $query_id ): ?array {
		foreach ( $blocks as $block ) {
			if (
				'loop-builder/query' === ( $block['blockName'] ?? '' ) &&
				isset( $block['attrs']['queryId'] ) &&
				(int) $block['attrs']['queryId'] === $query_id
			) {
				return $block;
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$found = self::find_query_block( $block['innerBlocks'], $query_id );
				if ( $found ) {
					return $found;
				}
			}
		}
		return null;
	}

	/**
	 * Recursively find the first inner block with the given name.
	 *
	 * @param array  $block Parsed block to search within.
	 * @param string $name  Target block name.
	 * @return array|null The parsed inner block, or null.
	 */
	private static function find_inner_block( array $block, string $name ): ?array {
		foreach ( ( $block['innerBlocks'] ?? array() ) as $inner ) {
			$inner_name = $inner['blockName'] ?? '';
			if ( $name === $inner_name ) {
				return $inner;
			}
			$found = self::find_inner_block( $inner, $name );
			if ( $found ) {
				return $found;
			}
		}
		return null;
	}
}
