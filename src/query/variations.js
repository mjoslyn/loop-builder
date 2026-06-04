/**
 * Quick-start variations for the query block — each preselects a layout so the
 * inserter offers Grid / List / Slider entry points.
 */
import { __ } from '@wordpress/i18n';

const variations = [
	{
		name: 'list',
		title: __( 'Loop Builder: List', 'loop-builder' ),
		description: __( 'Posts stacked in a single column.', 'loop-builder' ),
		attributes: { displayLayout: { type: 'list', gap: '20px' } },
		isActive: ( blockAttributes ) =>
			blockAttributes.displayLayout?.type === 'list',
		scope: [ 'inserter' ],
	},
	{
		name: 'slider',
		title: __( 'Loop Builder: Slider', 'loop-builder' ),
		description: __(
			'Posts in a horizontal, swipeable slider.',
			'loop-builder'
		),
		attributes: {
			displayLayout: {
				type: 'slider',
				columns: 3,
				columnsTablet: 2,
				columnsMobile: 1,
				gap: '24px',
			},
		},
		isActive: ( blockAttributes ) =>
			blockAttributes.displayLayout?.type === 'slider',
		scope: [ 'inserter' ],
	},
];

export default variations;
