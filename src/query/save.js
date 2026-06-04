/**
 * The query block is dynamic — its markup is produced by render.php. We still
 * persist the inner blocks (the template + no-results) so they round-trip.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save();
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );
	return <div { ...innerBlocksProps } />;
}
