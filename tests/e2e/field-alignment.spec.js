/**
 * End-to-end coverage for the Custom Field block's text alignment. The block
 * defaults to an inline tag, so alignment also has to promote it to a block box
 * for the choice to take visible effect — both are asserted here.
 *
 * The field value is seeded via a public meta key registered by the e2e support
 * mu-plugin (see tests/e2e/mu-plugin.php).
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const FIELD_BLOCK =
	'<!-- wp:loop-builder/field {"metaKey":"lb_test_meta","useAcf":false,"style":{"typography":{"textAlign":"center"}}} /-->';

test.describe( 'Loop Builder — custom field alignment', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test( 'renders the field centered, as a block, with the value', async ( {
		page,
		requestUtils,
	} ) => {
		const post = await requestUtils.createPost( {
			title: 'Field Alignment Post',
			status: 'publish',
			content: FIELD_BLOCK,
			meta: { lb_test_meta: 'Centered Value' },
		} );

		await page.goto( post.link );

		const field = page.locator(
			'.wp-block-loop-builder-field.has-text-align-center'
		);

		await expect( field ).toHaveText( 'Centered Value' );
		await expect( field ).toHaveCSS( 'text-align', 'center' );
		// Our stylesheet promotes an otherwise-inline field to a block so the
		// alignment is actually applied.
		await expect( field ).toHaveCSS( 'display', 'block' );
	} );
} );
