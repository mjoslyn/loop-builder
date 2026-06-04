<?php
/**
 * Translate Loop Builder block attributes into WP_Query arguments.
 *
 * Modeled on core's build_query_vars_from_query_block() but extended with the
 * advanced filters Loop Builder exposes (multi-clause taxonomy, meta, and date
 * queries). Kept free of side effects so it can be unit tested in isolation.
 *
 * @package LoopBuilder
 */

namespace LoopBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds WP_Query args from the `query` block attribute.
 */
class Query {

	/**
	 * Convert a Loop Builder `query` attribute array into WP_Query args.
	 *
	 * @param array $query The block's `query` attribute.
	 * @param int   $page  Current page number (1-based).
	 * @return array WP_Query arguments.
	 */
	public static function to_query_args( array $query, int $page = 1 ): array {
		$query    = wp_parse_args(
			$query,
			array(
				'postType'  => 'post',
				'perPage'   => 10,
				'offset'    => 0,
				'order'     => 'desc',
				'orderBy'   => 'date',
				'author'    => '',
				'search'    => '',
				'sticky'    => '',
				'exclude'   => array(),
				'postIn'    => array(),
				'parents'   => array(),
				'taxQuery'  => array(),
				'metaQuery' => array(),
				'dateQuery' => array(),
			)
		);
		$per_page = (int) $query['perPage'];
		$offset   = (int) $query['offset'];

		$args = array(
			'post_type'           => is_array( $query['postType'] ) ? array_map( 'sanitize_key', $query['postType'] ) : sanitize_key( $query['postType'] ),
			'order'               => self::sanitize_order( $query['order'] ),
			'orderby'             => self::sanitize_orderby( $query['orderBy'] ),
			'post_status'         => 'publish',
			'posts_per_page'      => $per_page,
			'offset'              => ( $per_page * ( max( 1, $page ) - 1 ) ) + $offset,
			'ignore_sticky_posts' => 1,
			'no_found_rows'       => false,
		);

		// Author. Accepts a comma string or array of IDs.
		if ( ! empty( $query['author'] ) ) {
			$args['author__in'] = wp_parse_id_list( $query['author'] );
		}

		// Keyword search.
		if ( '' !== trim( (string) $query['search'] ) ) {
			$args['s'] = $query['search'];
		}

		// Explicit include / exclude.
		if ( ! empty( $query['postIn'] ) ) {
			$args['post__in'] = wp_parse_id_list( $query['postIn'] );
		}
		if ( ! empty( $query['exclude'] ) ) {
			$args['post__not_in'] = wp_parse_id_list( $query['exclude'] );
		}

		// Hierarchical parents (only meaningful for a single hierarchical type).
		if ( ! empty( $query['parents'] ) && is_string( $query['postType'] ) && is_post_type_hierarchical( $query['postType'] ) ) {
			$args['post_parent__in'] = wp_parse_id_list( $query['parents'] );
		}

		// Sticky handling: 'only' to restrict, 'exclude'/'ignore' to drop them.
		self::apply_sticky( $args, (string) $query['sticky'] );

		// Advanced clauses. tax_query / meta_query are intrinsic to a visual
		// query builder, so the slow-query warnings are expected here.
		$tax_query = self::build_tax_query( $query['taxQuery'] );
		if ( $tax_query ) {
			$args['tax_query'] = $tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		}

		$meta_query = self::build_meta_query( $query['metaQuery'] );
		if ( $meta_query ) {
			$args['meta_query'] = $meta_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
		}

		$date_query = self::build_date_query( $query['dateQuery'] );
		if ( $date_query ) {
			$args['date_query'] = $date_query;
		}

		/**
		 * Filter the final WP_Query args produced for a Loop Builder query.
		 *
		 * @param array $args  WP_Query arguments.
		 * @param array $query The originating block `query` attribute.
		 * @param int   $page  Current page.
		 */
		return apply_filters( 'loop_builder_query_args', $args, $query, $page );
	}

	/**
	 * Normalize the order direction.
	 *
	 * @param string $order Raw order value.
	 * @return string 'ASC' or 'DESC'.
	 */
	private static function sanitize_order( string $order ): string {
		$order = strtoupper( $order );
		return in_array( $order, array( 'ASC', 'DESC' ), true ) ? $order : 'DESC';
	}

	/**
	 * Normalize the orderby key against a safe allow-list.
	 *
	 * @param string $orderby Raw orderby value.
	 * @return string A permitted orderby key, defaulting to 'date'.
	 */
	private static function sanitize_orderby( string $orderby ) {
		$allowed = array( 'date', 'modified', 'title', 'menu_order', 'rand', 'comment_count', 'ID', 'author', 'relevance' );
		return in_array( $orderby, $allowed, true ) ? $orderby : 'date';
	}

	/**
	 * Apply sticky-post behavior to the args in place.
	 *
	 * @param array  $args   WP_Query args (by reference).
	 * @param string $sticky One of '', 'only', 'exclude', 'ignore'.
	 */
	private static function apply_sticky( array &$args, string $sticky ): void {
		$stickies = get_option( 'sticky_posts' );
		if ( 'only' === $sticky ) {
			$args['post__in']            = ! empty( $stickies ) ? $stickies : array( 0 );
			$args['ignore_sticky_posts'] = 1;
		} elseif ( 'exclude' === $sticky && ! empty( $stickies ) ) {
			$args['post__not_in'] = array_merge( $args['post__not_in'] ?? array(), $stickies );
		}
	}

	/**
	 * Build a tax_query from the taxQuery attribute.
	 *
	 * Shape: { relation: 'AND'|'OR', clauses: [ { taxonomy, terms[], operator?,
	 * field?, includeChildren? } ] }.
	 *
	 * @param array $tax_query Raw taxQuery attribute.
	 * @return array tax_query, or empty array when there is nothing to add.
	 */
	private static function build_tax_query( array $tax_query ): array {
		$clauses  = isset( $tax_query['clauses'] ) && is_array( $tax_query['clauses'] ) ? $tax_query['clauses'] : array();
		$relation = isset( $tax_query['relation'] ) ? strtoupper( (string) $tax_query['relation'] ) : 'AND';

		$built = array();
		foreach ( $clauses as $clause ) {
			if ( empty( $clause['taxonomy'] ) || empty( $clause['terms'] ) ) {
				continue;
			}
			$field    = (string) ( $clause['field'] ?? 'term_id' );
			$operator = strtoupper( (string) ( $clause['operator'] ?? 'IN' ) );
			$built[]  = array(
				'taxonomy'         => sanitize_key( $clause['taxonomy'] ),
				'field'            => in_array( $field, array( 'term_id', 'slug', 'name' ), true ) ? $field : 'term_id',
				'terms'            => is_array( $clause['terms'] ) ? array_map( 'sanitize_text_field', $clause['terms'] ) : wp_parse_list( $clause['terms'] ),
				'operator'         => in_array( $operator, array( 'IN', 'NOT IN', 'AND', 'EXISTS', 'NOT EXISTS' ), true ) ? $operator : 'IN',
				'include_children' => isset( $clause['includeChildren'] ) ? (bool) $clause['includeChildren'] : true,
			);
		}

		if ( count( $built ) > 1 ) {
			$built['relation'] = in_array( $relation, array( 'AND', 'OR' ), true ) ? $relation : 'AND';
		}
		return $built;
	}

	/**
	 * Build a meta_query from the metaQuery attribute.
	 *
	 * Shape: { relation: 'AND'|'OR', clauses: [ { key, value?, compare?, type? } ] }.
	 *
	 * @param array $meta_query Raw metaQuery attribute.
	 * @return array meta_query, or empty array.
	 */
	private static function build_meta_query( array $meta_query ): array {
		$clauses  = isset( $meta_query['clauses'] ) && is_array( $meta_query['clauses'] ) ? $meta_query['clauses'] : array();
		$relation = isset( $meta_query['relation'] ) ? strtoupper( (string) $meta_query['relation'] ) : 'AND';

		$valid_compare = array( '=', '!=', '>', '>=', '<', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'NOT BETWEEN', 'EXISTS', 'NOT EXISTS', 'REGEXP', 'NOT REGEXP' );
		$valid_type    = array( 'CHAR', 'NUMERIC', 'BINARY', 'DATE', 'DATETIME', 'DECIMAL', 'SIGNED', 'TIME', 'UNSIGNED' );

		$built = array();
		foreach ( $clauses as $clause ) {
			if ( empty( $clause['key'] ) ) {
				continue;
			}
			$compare = strtoupper( (string) ( $clause['compare'] ?? '=' ) );
			$type    = strtoupper( (string) ( $clause['type'] ?? 'CHAR' ) );
			$entry   = array(
				'key'     => sanitize_text_field( $clause['key'] ),
				'compare' => in_array( $compare, $valid_compare, true ) ? $compare : '=',
				'type'    => in_array( $type, $valid_type, true ) ? $type : 'CHAR',
			);
			// EXISTS / NOT EXISTS take no value.
			if ( ! in_array( $compare, array( 'EXISTS', 'NOT EXISTS' ), true ) && isset( $clause['value'] ) && '' !== $clause['value'] ) {
				$entry['value'] = in_array( $compare, array( 'IN', 'NOT IN', 'BETWEEN', 'NOT BETWEEN' ), true ) ? wp_parse_list( $clause['value'] ) : $clause['value'];
			}
			$built[] = $entry;
		}

		if ( count( $built ) > 1 ) {
			$built['relation'] = in_array( $relation, array( 'AND', 'OR' ), true ) ? $relation : 'AND';
		}
		return $built;
	}

	/**
	 * Build a date_query from a single clause.
	 *
	 * Clause: { after?, before?, inclusive?, lastDays? }. `lastDays` is a
	 * convenience that overrides `after` with "N days ago".
	 *
	 * @param array $clause Raw date clause.
	 * @return array date_query, or empty array.
	 */
	private static function build_date_query( array $clause ): array {
		if ( empty( $clause ) ) {
			return array();
		}

		$entry = array();
		if ( ! empty( $clause['lastDays'] ) ) {
			$entry['after']     = absint( $clause['lastDays'] ) . ' days ago';
			$entry['inclusive'] = true;
		} else {
			if ( ! empty( $clause['after'] ) ) {
				$entry['after'] = sanitize_text_field( $clause['after'] );
			}
			if ( ! empty( $clause['before'] ) ) {
				$entry['before'] = sanitize_text_field( $clause['before'] );
			}
			if ( isset( $clause['inclusive'] ) ) {
				$entry['inclusive'] = (bool) $clause['inclusive'];
			}
		}

		return $entry ? array( $entry ) : array();
	}
}
