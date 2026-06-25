/**
 * "Card style" inspector panel — opt-in visual styling for the outer frame of
 * every loop item (background, padding, border, radius, hover lift), stored on
 * the cardStyle attribute and applied via CSS custom properties at render time.
 *
 * The featured-image and content zones are styled directly on their own blocks
 * (the Featured Image block and the content Group), so they have no panel here.
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

	const { background, padding, radius, borderWidth, borderColor, hoverLift } =
		cardStyle || {};

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
		</>
	);
}
