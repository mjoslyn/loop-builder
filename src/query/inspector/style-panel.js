/**
 * "Card style" inspector panels — opt-in visual styling applied to every loop
 * item. The card is split into three zones, each stored on the cardStyle
 * attribute and applied via CSS custom properties at render time:
 *
 *   • Card    — the outer frame: background, padding, border, radius, hover lift.
 *   • Image   — the featured-image zone: background and padding.
 *   • Content — the text group (title/date/excerpt): background and padding.
 */
/* eslint-disable @wordpress/no-unsafe-wp-apis -- UnitControl is stable in practice and exported only under the __experimental prefix. */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	BaseControl,
	ColorPalette,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useSettings } from '@wordpress/block-editor';

const UNITS = [
	{ value: 'px', label: 'px' },
	{ value: 'em', label: 'em' },
	{ value: 'rem', label: 'rem' },
];

export default function StylePanel( { cardStyle, setCardStyle } ) {
	const [ palette ] = useSettings( 'color.palette' );
	const colors = palette || [];

	const {
		background,
		padding,
		radius,
		borderWidth,
		borderColor,
		hoverLift,
		imageBackground,
		imagePadding,
		contentBackground,
		contentPadding,
	} = cardStyle || {};

	const colorControl = ( label, value, key ) => (
		<BaseControl __nextHasNoMarginBottom>
			<BaseControl.VisualLabel>{ label }</BaseControl.VisualLabel>
			<ColorPalette
				colors={ colors }
				value={ value }
				onChange={ ( next ) => setCardStyle( { [ key ]: next } ) }
				enableAlpha
			/>
		</BaseControl>
	);

	const unitControl = ( label, value, key ) => (
		<UnitControl
			label={ label }
			value={ value }
			onChange={ ( next ) => setCardStyle( { [ key ]: next } ) }
			units={ UNITS }
		/>
	);

	return (
		<>
			<PanelBody
				title={ __( 'Card frame', 'loop-builder' ) }
				initialOpen={ false }
			>
				{ colorControl(
					__( 'Background', 'loop-builder' ),
					background,
					'background'
				) }
				{ unitControl(
					__( 'Padding', 'loop-builder' ),
					padding,
					'padding'
				) }
				{ unitControl(
					__( 'Corner radius', 'loop-builder' ),
					radius,
					'radius'
				) }
				{ unitControl(
					__( 'Border width', 'loop-builder' ),
					borderWidth,
					'borderWidth'
				) }
				{ colorControl(
					__( 'Border color', 'loop-builder' ),
					borderColor,
					'borderColor'
				) }
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Lift on hover', 'loop-builder' ) }
					checked={ !! hoverLift }
					onChange={ ( value ) =>
						setCardStyle( { hoverLift: value } )
					}
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Image', 'loop-builder' ) }
				initialOpen={ false }
			>
				{ colorControl(
					__( 'Background', 'loop-builder' ),
					imageBackground,
					'imageBackground'
				) }
				{ unitControl(
					__( 'Padding', 'loop-builder' ),
					imagePadding,
					'imagePadding'
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Content', 'loop-builder' ) }
				initialOpen={ false }
			>
				{ colorControl(
					__( 'Background', 'loop-builder' ),
					contentBackground,
					'contentBackground'
				) }
				{ unitControl(
					__( 'Padding', 'loop-builder' ),
					contentPadding,
					'contentPadding'
				) }
			</PanelBody>
		</>
	);
}
