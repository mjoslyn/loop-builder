/**
 * Surface the Font controls on the core post field blocks.
 *
 * Post Title, Post Date, Post Excerpt, etc. all support font family, but core
 * hides the control behind the Typography panel's "+" menu. Inside a loop card
 * "change the title font" is a primary action, so default the Font (and Size)
 * dropdowns to visible for the field blocks used in cards. The tweak is
 * editor-wide, which is harmless: it only changes which controls are shown,
 * not what the blocks support.
 */
import { addFilter } from '@wordpress/hooks';

const FIELD_BLOCKS = [
	'core/post-title',
	'core/post-date',
	'core/post-excerpt',
	'core/post-author-name',
	'core/post-terms',
];

function showFontControls( settings, name ) {
	if ( ! FIELD_BLOCKS.includes( name ) ) {
		return settings;
	}

	const typography = settings.supports?.typography;
	if ( ! typography?.__experimentalFontFamily ) {
		return settings;
	}

	return {
		...settings,
		supports: {
			...settings.supports,
			typography: {
				...typography,
				__experimentalDefaultControls: {
					...typography.__experimentalDefaultControls,
					fontFamily: true,
					fontSize: true,
				},
			},
		},
	};
}

addFilter(
	'blocks.registerBlockType',
	'loop-builder/show-font-controls',
	showFontControls
);
