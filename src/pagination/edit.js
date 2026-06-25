/**
 * Loop Builder — pagination edit component. Settings live in the inspector; the
 * canvas shows a representative static preview (real page counts are resolved
 * server-side at render time).
 */
/* eslint-disable @wordpress/no-unsafe-wp-apis -- ToggleGroupControl is stable in practice and exported only under the __experimental prefix. */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	useSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	BaseControl,
	SelectControl,
	TextControl,
	RangeControl,
	ColorPalette,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

const TYPE_OPTIONS = [
	{ label: __( 'Numbers', 'loop-builder' ), value: 'numbers' },
	{ label: __( 'Previous / Next', 'loop-builder' ), value: 'prev-next' },
	{ label: __( 'Load more button', 'loop-builder' ), value: 'load-more' },
];

const JUSTIFY_OPTIONS = [
	{ value: 'left', label: __( 'Left', 'loop-builder' ) },
	{ value: 'center', label: __( 'Center', 'loop-builder' ) },
	{ value: 'right', label: __( 'Right', 'loop-builder' ) },
	{ value: 'space-between', label: __( 'Apart', 'loop-builder' ) },
];

// Variant classes only — useBlockProps() already adds the base
// `wp-block-loop-builder-pagination` class. These go on the same wrapper so the
// flex container (and its `is-justify-*` alignment) matches the front end, which
// renders a single wrapper via get_block_wrapper_attributes().
function paginationVariantClasses( type, justify, linkStyle ) {
	return [
		`is-type-${ type }`,
		`is-justify-${ justify || 'center' }`,
		`is-pg-${ linkStyle || 'plain' }`,
	].join( ' ' );
}

function PreviewItems( { type, loadMoreLabel } ) {
	if ( type === 'load-more' ) {
		return (
			<button type="button" className="loop-builder-load-more" disabled>
				{ loadMoreLabel || __( 'Load more', 'loop-builder' ) }
			</button>
		);
	}

	if ( type === 'prev-next' ) {
		return (
			<>
				<span className="prev-page">
					{ __( '← Previous', 'loop-builder' ) }
				</span>
				<span className="next-page">
					{ __( 'Next →', 'loop-builder' ) }
				</span>
			</>
		);
	}

	return (
		<>
			<span className="page-numbers current">1</span>
			<span className="page-numbers">2</span>
			<span className="page-numbers">3</span>
			<span className="page-numbers dots">…</span>
			<span className="page-numbers">8</span>
		</>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		paginationType,
		loadMoreLabel,
		midSize,
		justify,
		linkStyle,
		accentColor,
	} = attributes;
	const [ palette ] = useSettings( 'color.palette' );
	const resolvedType =
		paginationType === 'load-more' ? 'load-more' : paginationType;
	const blockProps = useBlockProps( {
		className: paginationVariantClasses( resolvedType, justify, linkStyle ),
		style: accentColor ? { '--lb-pg-accent': accentColor } : undefined,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Pagination', 'loop-builder' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Type', 'loop-builder' ) }
						value={ paginationType }
						options={ TYPE_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { paginationType: value } )
						}
					/>

					{ paginationType === 'load-more' && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Button label', 'loop-builder' ) }
							value={ loadMoreLabel || '' }
							placeholder={ __( 'Load more', 'loop-builder' ) }
							onChange={ ( value ) =>
								setAttributes( { loadMoreLabel: value } )
							}
						/>
					) }

					{ paginationType === 'numbers' && (
						<RangeControl
							__nextHasNoMarginBottom
							label={ __(
								'Numbers shown around current',
								'loop-builder'
							) }
							value={ midSize ?? 2 }
							min={ 0 }
							max={ 5 }
							onChange={ ( value ) =>
								setAttributes( { midSize: value } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Pagination style', 'loop-builder' ) }>
					<ToggleGroupControl
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Alignment', 'loop-builder' ) }
						value={ justify || 'center' }
						onChange={ ( value ) =>
							setAttributes( { justify: value } )
						}
					>
						{ JUSTIFY_OPTIONS.map( ( option ) => (
							<ToggleGroupControlOption
								key={ option.value }
								value={ option.value }
								label={ option.label }
							/>
						) ) }
					</ToggleGroupControl>

					{ paginationType !== 'load-more' && (
						<ToggleGroupControl
							__nextHasNoMarginBottom
							isBlock
							label={ __( 'Link style', 'loop-builder' ) }
							value={ linkStyle || 'plain' }
							onChange={ ( value ) =>
								setAttributes( { linkStyle: value } )
							}
						>
							<ToggleGroupControlOption
								value="plain"
								label={ __( 'Plain', 'loop-builder' ) }
							/>
							<ToggleGroupControlOption
								value="boxed"
								label={ __( 'Boxed', 'loop-builder' ) }
							/>
						</ToggleGroupControl>
					) }

					<BaseControl __nextHasNoMarginBottom>
						<BaseControl.VisualLabel>
							{ __( 'Accent color', 'loop-builder' ) }
						</BaseControl.VisualLabel>
						<ColorPalette
							colors={ palette || [] }
							value={ accentColor }
							onChange={ ( value ) =>
								setAttributes( { accentColor: value } )
							}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<PreviewItems
					type={ paginationType }
					loadMoreLabel={ loadMoreLabel }
				/>
			</div>
		</>
	);
}
