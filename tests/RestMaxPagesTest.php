<?php
/**
 * Tests for LoopBuilder\Rest::max_pages(), which resolves how many pages the
 * pagination UI should offer, honoring both the "pages" and "max items" caps.
 *
 * @package LoopBuilder
 */

use LoopBuilder\Rest;
use PHPUnit\Framework\TestCase;

final class RestMaxPagesTest extends TestCase {

	public function test_uses_the_querys_page_count_when_uncapped(): void {
		$this->assertSame( 10, Rest::max_pages( new WP_Query( 10 ), array() ) );
	}

	public function test_pages_attribute_caps_the_count(): void {
		$this->assertSame( 3, Rest::max_pages( new WP_Query( 10 ), array( 'pages' => 3 ) ) );
	}

	public function test_pages_attribute_above_the_real_count_does_not_inflate(): void {
		$this->assertSame( 4, Rest::max_pages( new WP_Query( 4 ), array( 'pages' => 99 ) ) );
	}

	public function test_max_items_caps_to_ceil_of_items_over_per_page(): void {
		// 20 items at 6 per page -> 4 pages.
		$this->assertSame(
			4,
			Rest::max_pages(
				new WP_Query( 10 ),
				array(
					'perPage'  => 6,
					'maxItems' => 20,
				)
			)
		);
	}

	public function test_max_items_smaller_than_per_page_yields_one_page(): void {
		$this->assertSame(
			1,
			Rest::max_pages(
				new WP_Query( 10 ),
				array(
					'perPage'  => 6,
					'maxItems' => 3,
				)
			)
		);
	}

	public function test_the_tightest_of_all_caps_wins(): void {
		// real 10, pages 5, maxItems -> ceil(20/6) = 4. Smallest is 4.
		$this->assertSame(
			4,
			Rest::max_pages(
				new WP_Query( 10 ),
				array(
					'pages'    => 5,
					'perPage'  => 6,
					'maxItems' => 20,
				)
			)
		);
	}

	public function test_max_items_defaults_per_page_to_ten_when_absent(): void {
		// No perPage given -> default 10. 25 items -> ceil(25/10) = 3.
		$this->assertSame(
			3,
			Rest::max_pages( new WP_Query( 10 ), array( 'maxItems' => 25 ) )
		);
	}

	public function test_never_returns_less_than_one(): void {
		$this->assertSame( 1, Rest::max_pages( new WP_Query( 0 ), array() ) );
	}
}
