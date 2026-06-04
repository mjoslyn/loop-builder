/**
 * Loop Builder — no-results edit component. Always visible while editing so the
 * fallback message can be designed; on the front end it only renders when the
 * query is empty.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const TEMPLATE = [
	[
		'core/paragraph',
		{
			placeholder: __(
				'Add text or blocks shown when no results are found…',
				'loop-builder'
			),
		},
	],
];

export default function Edit() {
	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );
	return <div { ...innerBlocksProps } />;
}
