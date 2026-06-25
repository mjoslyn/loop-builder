/**
 * "Layout" inspector panel — presentation of the loop: grid / list / flex,
 * number of columns, and the gap between items.
 */
/* eslint-disable @wordpress/no-unsafe-wp-apis -- ToggleGroupControl and UnitControl are stable in practice and exported only under the __experimental prefix. */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

const LAYOUTS = [
	{ label: __( 'Grid', 'loop-builder' ), value: 'grid' },
	{ label: __( 'List', 'loop-builder' ), value: 'list' },
	{ label: __( 'Flex', 'loop-builder' ), value: 'flex' },
	{ label: __( 'Slider', 'loop-builder' ), value: 'slider' },
];

const HAS_COLUMNS = [ 'grid', 'flex', 'slider' ];

export default function LayoutPanel( { displayLayout, setDisplayLayout } ) {
	const {
		type = 'grid',
		columns = 3,
		columnsTablet = 2,
		columnsMobile = 1,
		gap = '24px',
		linkItem = false,
	} = displayLayout;

	const showColumns = HAS_COLUMNS.includes( type );

	return (
		<PanelBody title={ __( 'Layout', 'loop-builder' ) }>
			<ToggleGroupControl
				__nextHasNoMarginBottom
				isBlock
				label={ __( 'Display as', 'loop-builder' ) }
				value={ type }
				onChange={ ( value ) => setDisplayLayout( { type: value } ) }
			>
				{ LAYOUTS.map( ( layout ) => (
					<ToggleGroupControlOption
						key={ layout.value }
						value={ layout.value }
						label={ layout.label }
					/>
				) ) }
			</ToggleGroupControl>

			{ showColumns && (
				<>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Columns (desktop)', 'loop-builder' ) }
						value={ columns }
						min={ 1 }
						max={ 6 }
						onChange={ ( value ) =>
							setDisplayLayout( { columns: value } )
						}
					/>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Columns (tablet)', 'loop-builder' ) }
						value={ columnsTablet }
						min={ 1 }
						max={ 6 }
						onChange={ ( value ) =>
							setDisplayLayout( { columnsTablet: value } )
						}
					/>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Columns (mobile)', 'loop-builder' ) }
						value={ columnsMobile }
						min={ 1 }
						max={ 4 }
						onChange={ ( value ) =>
							setDisplayLayout( { columnsMobile: value } )
						}
					/>
				</>
			) }

			<UnitControl
				label={ __( 'Gap', 'loop-builder' ) }
				value={ gap }
				onChange={ ( value ) => setDisplayLayout( { gap: value } ) }
				units={ [
					{ value: 'px', label: 'px' },
					{ value: 'em', label: 'em' },
					{ value: 'rem', label: 'rem' },
				] }
			/>

			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Link entire item to post', 'loop-builder' ) }
				help={ __(
					'Make the whole item clickable, linking to the post. Links and buttons inside the item still work.',
					'loop-builder'
				) }
				checked={ linkItem }
				onChange={ ( value ) =>
					setDisplayLayout( { linkItem: value } )
				}
			/>
		</PanelBody>
	);
}
