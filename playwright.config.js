/**
 * Playwright configuration for Loop Builder end-to-end tests.
 *
 * Extends the base config shipped with @wordpress/scripts, which wires up admin
 * authentication (via a global setup that saves a storage state), sensible
 * timeouts, and a webServer entry that boots wp-env on demand. We only point it
 * at this plugin's spec directory.
 */
const baseConfig = require( '@wordpress/scripts/config/playwright.config' );

module.exports = {
	...baseConfig,
	testDir: './tests/e2e',
};
