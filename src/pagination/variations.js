/**
 * Inserter variations so each pagination style can be added directly.
 */
import { __ } from '@wordpress/i18n';

const variations = [
	{
		name: 'numbers',
		title: __( 'Pagination: Numbers', 'loop-builder' ),
		description: __( 'Numbered page links.', 'loop-builder' ),
		attributes: { paginationType: 'numbers' },
		isActive: ( blockAttributes ) =>
			blockAttributes.paginationType === 'numbers',
		scope: [ 'inserter', 'transform' ],
	},
	{
		name: 'prev-next',
		title: __( 'Pagination: Previous / Next', 'loop-builder' ),
		description: __( 'Previous and next page links only.', 'loop-builder' ),
		attributes: { paginationType: 'prev-next' },
		isActive: ( blockAttributes ) =>
			blockAttributes.paginationType === 'prev-next',
		scope: [ 'inserter', 'transform' ],
	},
	{
		name: 'load-more',
		title: __( 'Pagination: Load More', 'loop-builder' ),
		description: __(
			'A button that appends the next page in place.',
			'loop-builder'
		),
		attributes: { paginationType: 'load-more' },
		isActive: ( blockAttributes ) =>
			blockAttributes.paginationType === 'load-more',
		scope: [ 'inserter', 'transform' ],
	},
];

export default variations;
