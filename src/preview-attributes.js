/**
 * Strip typography/color attributes for a ServerSideRender preview.
 *
 * Block-support styles (font size, font family, text/background color) are
 * applied by the editor to the block wrapper via useBlockProps() and update
 * instantly. The server-rendered preview, however, bakes the same styles onto
 * its own markup and only refetches on a delay — so the stale inline values
 * override the wrapper's live ones and the text looks "stuck" while editing.
 *
 * Removing these from the attributes sent to the server lets the preview inherit
 * them from the wrapper instead, so changes show immediately. The front end is
 * unaffected: it renders from the saved attributes through render.php.
 *
 * @param {Object} attributes The block attributes.
 * @return {Object} A copy without typography/color presentation attributes.
 */
export function previewAttributes( attributes ) {
	const out = { ...attributes };
	delete out.fontSize;
	delete out.fontFamily;
	delete out.textColor;
	delete out.backgroundColor;
	delete out.gradient;
	if ( out.style ) {
		const { typography, color, ...rest } = out.style;
		out.style = rest;
	}
	return out;
}
