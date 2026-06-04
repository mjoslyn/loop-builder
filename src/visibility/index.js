/**
 * Conditional display — editor integration.
 *
 * Adds an `lbVisibility` attribute and a "Visibility" inspector panel to every
 * block via block-editor filters. The actual gating happens server-side in
 * includes/class-visibility.php; these controls just author the rules.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	SelectControl,
	FormTokenField,
	TextControl,
} from '@wordpress/components';

const ATTRIBUTE = 'lbVisibility';

const LOGIN_OPTIONS = [
	{ label: __( 'Everyone', 'loop-builder' ), value: 'any' },
	{ label: __( 'Logged-in users', 'loop-builder' ), value: 'in' },
	{ label: __( 'Logged-out users', 'loop-builder' ), value: 'out' },
];

// Site roles are localized from PHP; fall back to the common defaults.
const ROLE_MAP = ( typeof window !== 'undefined' &&
	window.loopBuilderData?.roles ) || {
	administrator: 'Administrator',
	editor: 'Editor',
	author: 'Author',
	contributor: 'Contributor',
	subscriber: 'Subscriber',
};
const ROLE_SLUGS = Object.keys( ROLE_MAP );
const roleLabel = ( slug ) => ROLE_MAP[ slug ] || slug;
const labelToSlug = ( label ) =>
	ROLE_SLUGS.find( ( slug ) => roleLabel( slug ) === label ) || label;

/**
 * Add the lbVisibility attribute to every block type.
 *
 * @param {Object} settings Block settings.
 * @return {Object} Updated settings.
 */
function addAttribute( settings ) {
	if ( ! settings.attributes ) {
		settings.attributes = {};
	}
	if ( ! settings.attributes[ ATTRIBUTE ] ) {
		settings.attributes = {
			...settings.attributes,
			[ ATTRIBUTE ]: { type: 'object' },
		};
	}
	return settings;
}

const withVisibilityControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { attributes, setAttributes, isSelected } = props;
		const visibility = attributes[ ATTRIBUTE ] || {};
		const rules = visibility.rules || {};

		const setRules = ( next ) =>
			setAttributes( {
				[ ATTRIBUTE ]: {
					...visibility,
					rules: { ...rules, ...next },
				},
			} );

		const selectedRoleLabels = ( rules.roles || [] ).map( roleLabel );

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{ isSelected && (
					<InspectorControls>
						<PanelBody
							title={ __( 'Visibility', 'loop-builder' ) }
							initialOpen={ false }
						>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Enable conditional display',
									'loop-builder'
								) }
								checked={ !! visibility.enabled }
								onChange={ ( enabled ) =>
									setAttributes( {
										[ ATTRIBUTE ]: {
											...visibility,
											enabled,
										},
									} )
								}
							/>

							{ visibility.enabled && (
								<>
									<SelectControl
										__nextHasNoMarginBottom
										label={ __(
											'Show to',
											'loop-builder'
										) }
										value={ rules.login || 'any' }
										options={ LOGIN_OPTIONS }
										onChange={ ( login ) =>
											setRules( { login } )
										}
									/>

									<FormTokenField
										label={ __(
											'User roles',
											'loop-builder'
										) }
										value={ selectedRoleLabels }
										suggestions={ ROLE_SLUGS.map(
											roleLabel
										) }
										onChange={ ( tokens ) =>
											setRules( {
												roles: tokens.map(
													labelToSlug
												),
											} )
										}
										__experimentalExpandOnFocus
										__next40pxDefaultSize
									/>

									{ ( rules.roles || [] ).length > 0 && (
										<SelectControl
											__nextHasNoMarginBottom
											label={ __(
												'Role rule',
												'loop-builder'
											) }
											value={ rules.roleMatch || 'in' }
											options={ [
												{
													label: __(
														'Has one of these roles',
														'loop-builder'
													),
													value: 'in',
												},
												{
													label: __(
														'Has none of these roles',
														'loop-builder'
													),
													value: 'not-in',
												},
											] }
											onChange={ ( roleMatch ) =>
												setRules( { roleMatch } )
											}
										/>
									) }

									<TextControl
										__nextHasNoMarginBottom
										type="datetime-local"
										label={ __(
											'Show from',
											'loop-builder'
										) }
										value={ rules.dateStart || '' }
										onChange={ ( dateStart ) =>
											setRules( { dateStart } )
										}
									/>
									<TextControl
										__nextHasNoMarginBottom
										type="datetime-local"
										label={ __(
											'Show until',
											'loop-builder'
										) }
										value={ rules.dateEnd || '' }
										onChange={ ( dateEnd ) =>
											setRules( { dateEnd } )
										}
									/>
								</>
							) }
						</PanelBody>
					</InspectorControls>
				) }
			</Fragment>
		);
	};
}, 'withVisibilityControls' );

addFilter(
	'blocks.registerBlockType',
	'loop-builder/visibility-attribute',
	addAttribute
);
addFilter(
	'editor.BlockEdit',
	'loop-builder/visibility-controls',
	withVisibilityControls
);
