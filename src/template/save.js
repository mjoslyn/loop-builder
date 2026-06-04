/**
 * Persist the card's inner blocks. render.php ignores this saved markup for
 * output (it re-renders the inner blocks once per post) but the inner blocks
 * must be serialized so they survive as the template definition.
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return <InnerBlocks.Content />;
}
