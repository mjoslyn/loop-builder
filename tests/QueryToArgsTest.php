<?php
/**
 * Tests for LoopBuilder\Query::to_query_args(), focused on the "max items"
 * total cap and how it interacts with per-page count, pagination, and offset.
 *
 * @package LoopBuilder
 */

use LoopBuilder\Query;
use PHPUnit\Framework\TestCase;

final class QueryToArgsTest extends TestCase {

	protected function setUp(): void {
		$GLOBALS['lb_test_options'] = array();
	}

	public function test_defaults_without_max_items(): void {
		$args = Query::to_query_args( array() );

		$this->assertSame( 10, $args['posts_per_page'], 'Falls back to the default perPage.' );
		$this->assertSame( 0, $args['offset'] );
		$this->assertSame( 'publish', $args['post_status'] );
		$this->assertArrayNotHasKey( 'post__in', $args, 'No total cap means no neutralizing post__in.' );
	}

	public function test_per_page_is_unbounded_when_max_items_zero(): void {
		$args = Query::to_query_args(
			array(
				'perPage'  => 6,
				'maxItems' => 0,
			),
			3
		);

		$this->assertSame( 6, $args['posts_per_page'] );
		$this->assertSame( 12, $args['offset'], 'offset = perPage * (page - 1).' );
	}

	public function test_full_pages_below_the_cap_are_not_shrunk(): void {
		// perPage 6, cap 20 -> pages 1-3 each show a full 6.
		foreach ( array(
			1 => 0,
			2 => 6,
			3 => 12,
		) as $page => $offset ) {
			$args = Query::to_query_args(
				array(
					'perPage'  => 6,
					'maxItems' => 20,
				),
				$page
			);
			$this->assertSame( 6, $args['posts_per_page'], "Page {$page} keeps the full per-page count." );
			$this->assertSame( $offset, $args['offset'], "Page {$page} offset." );
		}
	}

	public function test_final_page_is_shrunk_to_respect_the_cap(): void {
		// perPage 6, cap 20: page 4 shows only the remaining 2 (18 already shown).
		$args = Query::to_query_args(
			array(
				'perPage'  => 6,
				'maxItems' => 20,
			),
			4
		);

		$this->assertSame( 2, $args['posts_per_page'] );
		$this->assertSame( 18, $args['offset'] );
		$this->assertArrayNotHasKey( 'post__in', $args, 'A partial final page still returns rows.' );
	}

	public function test_page_beyond_the_cap_matches_nothing(): void {
		// perPage 6, cap 20: page 5 starts at item 24, past the cap.
		$args = Query::to_query_args(
			array(
				'perPage'  => 6,
				'maxItems' => 20,
			),
			5
		);

		$this->assertSame( 0, $args['posts_per_page'] );
		$this->assertSame( array( 0 ), $args['post__in'], 'Out-of-range page is neutralized.' );
	}

	public function test_cap_smaller_than_per_page_limits_the_first_page(): void {
		$args = Query::to_query_args(
			array(
				'perPage'  => 6,
				'maxItems' => 3,
			)
		);

		$this->assertSame( 3, $args['posts_per_page'] );
	}

	public function test_cap_that_is_an_exact_multiple_neutralizes_the_next_page(): void {
		// perPage 5, cap 10: page 2 is the last full page; page 3 matches nothing.
		$page2 = Query::to_query_args(
			array(
				'perPage'  => 5,
				'maxItems' => 10,
			),
			2
		);
		$this->assertSame( 5, $page2['posts_per_page'] );
		$this->assertArrayNotHasKey( 'post__in', $page2 );

		$page3 = Query::to_query_args(
			array(
				'perPage'  => 5,
				'maxItems' => 10,
			),
			3
		);
		$this->assertSame( 0, $page3['posts_per_page'] );
		$this->assertSame( array( 0 ), $page3['post__in'] );
	}

	public function test_offset_adds_to_the_query_offset_but_not_the_cap(): void {
		// The cap counts displayed items; the user's offset shifts the window but
		// does not consume the budget. perPage 6, cap 10, offset 3.
		$page1 = Query::to_query_args(
			array(
				'perPage'  => 6,
				'maxItems' => 10,
				'offset'   => 3,
			),
			1
		);
		$this->assertSame( 6, $page1['posts_per_page'] );
		$this->assertSame( 3, $page1['offset'], 'perPage * 0 + offset.' );

		$page2 = Query::to_query_args(
			array(
				'perPage'  => 6,
				'maxItems' => 10,
				'offset'   => 3,
			),
			2
		);
		$this->assertSame( 4, $page2['posts_per_page'], 'Remaining budget is 10 - 6 = 4.' );
		$this->assertSame( 9, $page2['offset'], 'perPage * 1 + offset.' );
	}

	public function test_out_of_range_guard_overrides_sticky_only(): void {
		// Even when sticky "only" would set post__in, the cap guard wins because
		// it is applied last.
		lb_test_set_option( 'sticky_posts', array( 11, 22 ) );

		$args = Query::to_query_args(
			array(
				'perPage'  => 5,
				'maxItems' => 5,
				'sticky'   => 'only',
			),
			2
		);

		$this->assertSame( array( 0 ), $args['post__in'] );
	}

	public function test_page_zero_is_treated_as_page_one(): void {
		$args = Query::to_query_args(
			array(
				'perPage'  => 6,
				'maxItems' => 20,
			),
			0
		);

		$this->assertSame( 6, $args['posts_per_page'] );
		$this->assertSame( 0, $args['offset'] );
	}
}
