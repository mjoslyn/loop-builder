/**
 * "Card style" inspector panel — opt-in visual styling applied to every loop
 * item: background, padding, border, corner radius, and a hover lift. Stored on
 * the cardStyle attribute and applied via CSS custom properties at render time.
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

	return (
		<PanelBody
			title={ __( 'Card style', 'loop-builder' ) }
			initialOpen={ false }
		>
			<BaseControl __nextHasNoMarginBottom>
				<BaseControl.VisualLabel>
					{ __( 'Background', 'loop-builder' ) }
				</BaseControl.VisualLabel>
				<ColorPalette
					colors={ colors }
					value={ background }
					onChange={ ( value ) =>
						setCardStyle( { background: value } )
					}
					enableAlpha
				/>
			</BaseControl>

			<UnitControl
				label={ __( 'Padding', 'loop-builder' ) }
				value={ padding }
				onChange={ ( value ) => setCardStyle( { padding: value } ) }
				units={ UNITS }
			/>

			<UnitControl
				label={ __( 'Corner radius', 'loop-builder' ) }
				value={ radius }
				onChange={ ( value ) => setCardStyle( { radius: value } ) }
				units={ UNITS }
			/>

			<UnitControl
				label={ __( 'Border width', 'loop-builder' ) }
				value={ borderWidth }
				onChange={ ( value ) => setCardStyle( { borderWidth: value } ) }
				units={ UNITS }
			/>

			<BaseControl __nextHasNoMarginBottom>
				<BaseControl.VisualLabel>
					{ __( 'Border color', 'loop-builder' ) }
				</BaseControl.VisualLabel>
				<ColorPalette
					colors={ colors }
					value={ borderColor }
					onChange={ ( value ) =>
						setCardStyle( { borderColor: value } )
					}
				/>
			</BaseControl>

			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Lift on hover', 'loop-builder' ) }
				checked={ !! hoverLift }
				onChange={ ( value ) => setCardStyle( { hoverLift: value } ) }
			/>
		</PanelBody>
	);
}
