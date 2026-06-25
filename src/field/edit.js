/**
 * Loop Builder — custom field edit component.
 *
 * The real value is resolved server-side per loop item; in the editor we show a
 * labelled placeholder reflecting the chosen display mode (text / image / link).
 * The field picker lists the custom fields available for the post type (fetched
 * from the loop-builder/v1/fields endpoint) and still allows typing a key.
 */
/* eslint-disable @wordpress/no-unsafe-wp-apis -- ToggleGroupControl is stable in practice and exported only under the __experimental prefix. */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import ServerSideRender from '@wordpress/server-side-render';
import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

import { previewAttributes } from '../preview-attributes';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
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

const IMAGE_SIZE_OPTIONS = [
	{ label: __( 'Thumbnail', 'loop-builder' ), value: 'thumbnail' },
	{ label: __( 'Medium', 'loop-builder' ), value: 'medium' },
	{ label: __( 'Large', 'loop-builder' ), value: 'large' },
	{ label: __( 'Full', 'loop-builder' ), value: 'full' },
];

// ACF availability is localized from PHP (see Plugin::enqueue_editor_assets).
const HAS_ACF =
	typeof window !== 'undefined' && !! window.loopBuilderData?.hasAcf;

/**
 * Fetch the custom fields available for a post type. Returns [] until loaded.
 *
 * @param {string} postType The post type slug from block context.
 * @return {Array} List of { key, label }.
 */
function useAvailableFields( postType ) {
	const [ fields, setFields ] = useState( [] );
	useEffect( () => {
		let active = true;
		if ( ! postType ) {
			setFields( [] );
			return undefined;
		}
		apiFetch( {
			path: addQueryArgs( '/loop-builder/v1/fields', { postType } ),
		} )
			.then(
				( res ) =>
					active && setFields( Array.isArray( res ) ? res : [] )
			)
			.catch( () => active && setFields( [] ) );
		return () => {
			active = false;
		};
	}, [ postType ] );
	return fields;
}

// A meta-key input: a text box (type any key) plus a dropdown of known fields.
function FieldPicker( { label, help, value, fields, onChange } ) {
	return (
		<>
			<TextControl
				__nextHasNoMarginBottom
				label={ label }
				value={ value || '' }
				onChange={ onChange }
				help={ help }
			/>
			{ fields.length > 0 && (
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Choose a field', 'loop-builder' ) }
					value=""
					options={ [
						{
							label: __( 'Select a field…', 'loop-builder' ),
							value: '',
						},
						...fields.map( ( f ) => ( {
							label:
								f.label && f.label !== f.key
									? `${ f.label } (${ f.key })`
									: f.key,
							value: f.key,
						} ) ),
					] }
					onChange={ ( v ) => v && onChange( v ) }
				/>
			) }
		</>
	);
}

export default function Edit( { attributes, setAttributes, context } ) {
	const {
		metaKey,
		tagName,
		prefix,
		suffix,
		useAcf,
		displayAs = 'text',
		imageSize = 'medium',
		imageAltSource = 'custom',
		imageAlt = '',
		imageAltMetaKey = '',
		linkTextSource = 'custom',
		linkText = '',
		linkTextMetaKey = '',
		linkProtocol = 'url',
		linkNewTab = false,
		linkNofollow = false,
		linkNoreferrer = false,
	} = attributes;
	const blockProps = useBlockProps();

	// Render the real value/image/link server-side. Prefer the loop's per-item
	// postId (from context); outside a loop, fall back to the post being edited
	// so a field placed directly in post content still previews its own meta.
	const currentPostId = useSelect(
		( select ) => select( 'core/editor' )?.getCurrentPostId?.(),
		[]
	);
	const postId = context?.postId || currentPostId;
	const showPreview = !! postId && !! metaKey;

	const fields = useAvailableFields( context?.postType );
	const fieldLabel =
		fields.find( ( f ) => f.key === metaKey )?.label || metaKey;

	// Canvas placeholder text reflecting the chosen mode.
	let placeholder = __( 'Select a custom field', 'loop-builder' );
	if ( metaKey ) {
		if ( displayAs === 'image' ) {
			placeholder = `${ __( 'Image:', 'loop-builder' ) } ${ fieldLabel }`;
		} else if ( displayAs === 'link' ) {
			placeholder =
				linkTextSource === 'field'
					? linkTextMetaKey || fieldLabel
					: linkText || fieldLabel;
		} else {
			placeholder = fieldLabel;
		}
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Custom field', 'loop-builder' ) }>
					<FieldPicker
						label={ __( 'Field key', 'loop-builder' ) }
						help={ __(
							'The meta key or ACF field name to display.',
							'loop-builder'
						) }
						value={ metaKey }
						fields={ fields }
						onChange={ ( value ) =>
							setAttributes( { metaKey: value } )
						}
					/>

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

					<ToggleGroupControl
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Display as', 'loop-builder' ) }
						value={ displayAs }
						onChange={ ( value ) =>
							setAttributes( { displayAs: value } )
						}
					>
						<ToggleGroupControlOption
							value="text"
							label={ __( 'Text', 'loop-builder' ) }
						/>
						<ToggleGroupControlOption
							value="image"
							label={ __( 'Image', 'loop-builder' ) }
						/>
						<ToggleGroupControlOption
							value="link"
							label={ __( 'Link', 'loop-builder' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>

				{ displayAs === 'image' && (
					<PanelBody title={ __( 'Image', 'loop-builder' ) }>
						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Image size', 'loop-builder' ) }
							value={ imageSize }
							options={ IMAGE_SIZE_OPTIONS }
							onChange={ ( value ) =>
								setAttributes( { imageSize: value } )
							}
							help={ __(
								'The field should hold an image (attachment ID or URL).',
								'loop-builder'
							) }
						/>

						<ToggleGroupControl
							__nextHasNoMarginBottom
							isBlock
							label={ __( 'Alt text', 'loop-builder' ) }
							value={ imageAltSource }
							onChange={ ( value ) =>
								setAttributes( { imageAltSource: value } )
							}
						>
							<ToggleGroupControlOption
								value="custom"
								label={ __( 'Custom text', 'loop-builder' ) }
							/>
							<ToggleGroupControlOption
								value="field"
								label={ __( 'Another field', 'loop-builder' ) }
							/>
						</ToggleGroupControl>

						{ imageAltSource === 'custom' ? (
							<TextControl
								__nextHasNoMarginBottom
								label={ __( 'Alt text', 'loop-builder' ) }
								value={ imageAlt }
								placeholder={ __(
									"Defaults to the image's own alt",
									'loop-builder'
								) }
								onChange={ ( value ) =>
									setAttributes( { imageAlt: value } )
								}
							/>
						) : (
							<FieldPicker
								label={ __(
									'Field for alt text',
									'loop-builder'
								) }
								value={ imageAltMetaKey }
								fields={ fields }
								onChange={ ( value ) =>
									setAttributes( {
										imageAltMetaKey: value,
									} )
								}
							/>
						) }
					</PanelBody>
				) }

				{ displayAs === 'link' && (
					<PanelBody title={ __( 'Link', 'loop-builder' ) }>
						<p className="components-base-control__help">
							{ __(
								'The selected field provides the link URL.',
								'loop-builder'
							) }
						</p>
						<ToggleGroupControl
							__nextHasNoMarginBottom
							isBlock
							label={ __( 'Link text', 'loop-builder' ) }
							value={ linkTextSource }
							onChange={ ( value ) =>
								setAttributes( { linkTextSource: value } )
							}
						>
							<ToggleGroupControlOption
								value="custom"
								label={ __( 'Custom text', 'loop-builder' ) }
							/>
							<ToggleGroupControlOption
								value="field"
								label={ __( 'Another field', 'loop-builder' ) }
							/>
						</ToggleGroupControl>

						{ linkTextSource === 'custom' ? (
							<TextControl
								__nextHasNoMarginBottom
								label={ __( 'Link text', 'loop-builder' ) }
								value={ linkText }
								placeholder={ __(
									'Falls back to the URL',
									'loop-builder'
								) }
								onChange={ ( value ) =>
									setAttributes( { linkText: value } )
								}
							/>
						) : (
							<FieldPicker
								label={ __(
									'Field for link text',
									'loop-builder'
								) }
								value={ linkTextMetaKey }
								fields={ fields }
								onChange={ ( value ) =>
									setAttributes( {
										linkTextMetaKey: value,
									} )
								}
							/>
						) }

						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Link to', 'loop-builder' ) }
							value={ linkProtocol }
							options={ [
								{
									label: __( 'URL', 'loop-builder' ),
									value: 'url',
								},
								{
									label: __( 'Phone (tel:)', 'loop-builder' ),
									value: 'tel',
								},
								{
									label: __(
										'Email (mailto:)',
										'loop-builder'
									),
									value: 'mailto',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { linkProtocol: value } )
							}
						/>

						{ linkProtocol === 'url' && (
							<>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Open in new tab',
										'loop-builder'
									) }
									checked={ linkNewTab }
									onChange={ ( value ) =>
										setAttributes( { linkNewTab: value } )
									}
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Add nofollow (rel)',
										'loop-builder'
									) }
									checked={ linkNofollow }
									onChange={ ( value ) =>
										setAttributes( {
											linkNofollow: value,
										} )
									}
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Add noreferrer (rel)',
										'loop-builder'
									) }
									checked={ linkNoreferrer }
									onChange={ ( value ) =>
										setAttributes( {
											linkNoreferrer: value,
										} )
									}
								/>
							</>
						) }
					</PanelBody>
				) }

				<PanelBody title={ __( 'Output', 'loop-builder' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'HTML tag', 'loop-builder' ) }
						value={ tagName || 'span' }
						options={ TAG_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { tagName: value } )
						}
					/>

					{ displayAs !== 'image' && (
						<>
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
						</>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ showPreview ? (
					<ServerSideRender
						block="loop-builder/field"
						attributes={ previewAttributes( attributes ) }
						urlQueryArgs={ { post_id: postId } }
					/>
				) : (
					<span
						className="loop-builder-field-placeholder"
						style={ { opacity: 0.65 } }
					>
						{ displayAs !== 'image' && prefix }
						{ placeholder }
						{ displayAs !== 'image' && suffix }
					</span>
				) }
			</div>
		</>
	);
}
