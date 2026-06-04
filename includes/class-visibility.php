<?php
/**
 * Conditional display ("advanced visibility").
 *
 * Adds an opt-in `lbVisibility` attribute to every block (the editor side is in
 * src/visibility) and gates the block's front-end output by login status, user
 * role, and a date window.
 *
 * @package LoopBuilder
 */

namespace LoopBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Evaluates visibility rules and filters block output.
 */
class Visibility {

	/**
	 * Hook the render gate.
	 */
	public static function init(): void {
		add_filter( 'render_block', array( __CLASS__, 'maybe_hide' ), 10, 2 );
	}

	/**
	 * Hide a block's output when its visibility rules aren't met.
	 *
	 * @param string $content Rendered block HTML.
	 * @param array  $block   Parsed block.
	 * @return string Original content, or '' when hidden.
	 */
	public static function maybe_hide( string $content, array $block ): string {
		$visibility = $block['attrs']['lbVisibility'] ?? null;
		if ( empty( $visibility ) || empty( $visibility['enabled'] ) ) {
			return $content;
		}

		return self::passes( $visibility['rules'] ?? array() ) ? $content : '';
	}

	/**
	 * Evaluate the rule set. All configured rules must pass (AND).
	 *
	 * @param array $rules { login, roles[], roleMatch, dateStart, dateEnd }.
	 * @return bool Whether the block should be shown.
	 */
	public static function passes( array $rules ): bool {
		// Login status.
		$login = $rules['login'] ?? 'any';
		if ( 'in' === $login && ! is_user_logged_in() ) {
			return false;
		}
		if ( 'out' === $login && is_user_logged_in() ) {
			return false;
		}

		// Roles.
		$roles = array_filter( (array) ( $rules['roles'] ?? array() ) );
		if ( ! empty( $roles ) ) {
			$match    = 'not-in' === ( $rules['roleMatch'] ?? 'in' ) ? 'not-in' : 'in';
			$user     = wp_get_current_user();
			$has_role = (bool) array_intersect( $roles, (array) $user->roles );
			if ( 'in' === $match && ! $has_role ) {
				return false;
			}
			if ( 'not-in' === $match && $has_role ) {
				return false;
			}
		}

		// Date window (site local time).
		$now = current_time( 'timestamp' ); // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested
		if ( ! empty( $rules['dateStart'] ) ) {
			$start = strtotime( (string) $rules['dateStart'] );
			if ( $start && $now < $start ) {
				return false;
			}
		}
		if ( ! empty( $rules['dateEnd'] ) ) {
			$end = strtotime( (string) $rules['dateEnd'] );
			if ( $end && $now > $end ) {
				return false;
			}
		}

		return true;
	}
}
