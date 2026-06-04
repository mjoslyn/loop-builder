/**
 * Extend the default @wordpress/scripts config to also build the plugin-wide
 * editor entry (src/index.js → build/index.js), which block.json auto-detection
 * would otherwise omit.
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

const baseEntry =
	typeof defaultConfig.entry === 'function'
		? defaultConfig.entry()
		: defaultConfig.entry;

module.exports = {
	...defaultConfig,
	entry: {
		...baseEntry,
		index: './src/index.js',
	},
};
