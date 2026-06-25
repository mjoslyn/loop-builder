/**
 * Loop Builder — event date edit component.
 *
 * When an event is in context (inside a tribe_events loop, or a single event
 * template) we render the real start/end dates server-side via ServerSideRender,
 * so the editor matches the front end and reflects the chosen format live.
 * Outside an event context we fall back to a labelled placeholder. The block
 * only registers when The Events Calendar is active.
 */
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ExternalLink,
} from '@wordpress/components';

import { previewAttributes } from '../preview-attributes';

const DISPLAY_OPTIONS = [
	{ label: __( 'Start date only', 'loop-builder' ), value: 'start' },
	{ label: __( 'Start – End range', 'loop-builder' ), value: 'start-end' },
];

// Values are PHP date() format strings; the two sentinels resolve server-side.
const FORMAT_OPTIONS = [
	{ label: __( 'Site default', 'loop-builder' ), value: 'default' },
	{ label: 'August 5, 2026', value: 'F j, Y' },
	{ label: 'Aug 5, 2026', value: 'M j, Y' },
	{ label: '08/05/2026', value: 'm/d/Y' },
	{ label: 'Mon, Aug 5', value: 'D, M j' },
	{ label: 'August 5, 2026 7:00 pm', value: 'F j, Y g:i a' },
	{ label: '7:00 pm', value: 'g:i a' },
	{ label: __( 'Custom…', 'loop-builder' ), value: 'custom' },
];

const TAG_OPTIONS = [
	{ label: 'span', value: 'span' },
	{ label: 'div', value: 'div' },
	{ label: 'p', value: 'p' },
	{ label: 'h2', value: 'h2' },
	{ label: 'h3', value: 'h3' },
	{ label: 'h4', value: 'h4' },
	{ label: 'h5', value: 'h5' },
	{ label: 'h6', value: 'h6' },
	{ label: 'time', value: 'time' },
	{ label: 'strong', value: 'strong' },
];

export default function Edit( { attributes, setAttributes, context } ) {
	const {
		display = 'start-end',
		format = 'default',
		customFormat = '',
		separator = ' – ',
		tagName = 'span',
	} = attributes;
	const blockProps = useBlockProps();

	// Render real dates when an event is in context; the block-renderer endpoint
	// resolves it via post_id (render.php falls back to get_the_ID()).
	const postId = context?.postId;
	const isEvent = context?.postType === 'tribe_events' && !! postId;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Event date', 'loop-builder' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Show', 'loop-builder' ) }
						value={ display }
						options={ DISPLAY_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { display: value } )
						}
					/>

					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Date format', 'loop-builder' ) }
						value={ format }
						options={ FORMAT_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { format: value } )
						}
					/>

					{ format === 'custom' && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Custom format', 'loop-builder' ) }
							value={ customFormat }
							onChange={ ( value ) =>
								setAttributes( { customFormat: value } )
							}
							help={
								<>
									{ __(
										'A PHP date format string, e.g. "l, F j".',
										'loop-builder'
									) }{ ' ' }
									<ExternalLink href="https://wordpress.org/documentation/article/customize-date-and-time-format/">
										{ __(
											'Format reference',
											'loop-builder'
										) }
									</ExternalLink>
								</>
							}
						/>
					) }

					{ display === 'start-end' && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Separator', 'loop-builder' ) }
							value={ separator }
							onChange={ ( value ) =>
								setAttributes( { separator: value } )
							}
							help={ __(
								'Shown between the start and end dates.',
								'loop-builder'
							) }
						/>
					) }

					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'HTML tag', 'loop-builder' ) }
						value={ tagName }
						options={ TAG_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { tagName: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ isEvent ? (
					<ServerSideRender
						block="loop-builder/event-date"
						attributes={ previewAttributes( attributes ) }
						urlQueryArgs={ { post_id: postId } }
					/>
				) : (
					<span
						className="loop-builder-field-placeholder"
						style={ { opacity: 0.65 } }
					>
						{ display === 'start-end'
							? __( 'Event start – end date', 'loop-builder' )
							: __( 'Event start date', 'loop-builder' ) }
					</span>
				) }
			</div>
		</>
	);
}
