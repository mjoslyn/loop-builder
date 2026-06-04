/**
 * Loop Builder — custom field edit component.
 *
 * The real value is resolved server-side per loop item; in the editor we show a
 * labelled placeholder (the field's key/label) wrapped in the chosen tag, plus
 * any prefix/suffix, so the design reads correctly.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';

const TAG_OPTIONS = [
	{ label: 'span', value: 'span' },
	{ label: 'div', value: 'div' },
	{ label: 'p', value: 'p' },
	{ label: 'h2', value: 'h2' },
	{ label: 'h3', value: 'h3' },
	{ label: 'h4', value: 'h4' },
	{ label: 'h5', value: 'h5' },
	{ label: 'h6', value: 'h6' },
	{ label: 'strong', value: 'strong' },
	{ label: 'em', value: 'em' },
];

// ACF fields and availability are localized from PHP (see Plugin::enqueue_editor_assets).
const ACF_FIELDS =
	( typeof window !== 'undefined' && window.loopBuilderData?.acfFields ) ||
	{};
const ACF_NAMES = Object.keys( ACF_FIELDS );
const HAS_ACF =
	( typeof window !== 'undefined' && window.loopBuilderData?.hasAcf ) ||
	ACF_NAMES.length > 0;

export default function Edit( { attributes, setAttributes } ) {
	const { metaKey, tagName, prefix, suffix, useAcf } = attributes;
	const TagName = tagName || 'span';
	const blockProps = useBlockProps();

	const fieldLabel = ACF_FIELDS[ metaKey ] || metaKey;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Custom field', 'loop-builder' ) }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Field key', 'loop-builder' ) }
						value={ metaKey }
						onChange={ ( value ) =>
							setAttributes( { metaKey: value } )
						}
						help={ __(
							'The meta key or ACF field name to display.',
							'loop-builder'
						) }
					/>

					{ ACF_NAMES.length > 0 && (
						<SelectControl
							__nextHasNoMarginBottom
							label={ __(
								'Insert an ACF field',
								'loop-builder'
							) }
							value=""
							options={ [
								{
									label: __(
										'Choose a field…',
										'loop-builder'
									),
									value: '',
								},
								...ACF_NAMES.map( ( name ) => ( {
									label: `${ ACF_FIELDS[ name ] } (${ name })`,
									value: name,
								} ) ),
							] }
							onChange={ ( value ) =>
								value && setAttributes( { metaKey: value } )
							}
						/>
					) }

					{ HAS_ACF && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Use ACF formatting', 'loop-builder' ) }
							help={ __(
								'Format the value with ACF (dates, choices, etc.) instead of the raw stored value.',
								'loop-builder'
							) }
							checked={ useAcf !== false }
							onChange={ ( value ) =>
								setAttributes( { useAcf: value } )
							}
						/>
					) }

					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'HTML tag', 'loop-builder' ) }
						value={ tagName || 'span' }
						options={ TAG_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { tagName: value } )
						}
					/>

					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Prefix', 'loop-builder' ) }
						value={ prefix }
						onChange={ ( value ) =>
							setAttributes( { prefix: value } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Suffix', 'loop-builder' ) }
						value={ suffix }
						onChange={ ( value ) =>
							setAttributes( { suffix: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<TagName { ...blockProps }>
				{ prefix }
				<span
					className="loop-builder-field-placeholder"
					style={ { opacity: 0.65 } }
				>
					{ metaKey
						? fieldLabel
						: __( 'Select a custom field', 'loop-builder' ) }
				</span>
				{ suffix }
			</TagName>
		</>
	);
}
