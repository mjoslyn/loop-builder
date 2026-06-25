/**
 * End-to-end coverage for the loop's server render: the "max items" total cap
 * and the "link entire item to post" option, exercised through a real loop on
 * the front end.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Build the block markup for a loop over posts.
 *
 * @param {Object}  query           Overrides merged into the query attribute.
 * @param {Object}  displayLayout   Overrides merged into the displayLayout attribute.
 * @return {string} Serialized block markup for a page.
 */
function loopMarkup( query, displayLayout ) {
	const attrs = {
		queryId: 1,
		query: {
			postType: 'post',
			perPage: 10,
			orderBy: 'title',
			order: 'asc',
			...query,
		},
		displayLayout: { type: 'list', ...displayLayout },
	};

	return `<!-- wp:loop-builder/query ${ JSON.stringify( attrs ) } -->
<div class="wp-block-loop-builder-query">
<!-- wp:loop-builder/template -->
<!-- wp:post-title {"isLink":true} /-->
<!-- /wp:loop-builder/template -->
</div>
<!-- /wp:loop-builder/query -->`;
}

test.describe( 'Loop Builder — loop rendering', () => {
	let posts;

	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.deleteAllPages();

		// Five published posts, titled so an A→Z sort is deterministic.
		posts = [];
		for ( let i = 1; i <= 5; i++ ) {
			posts.push(
				// eslint-disable-next-line no-await-in-loop
				await requestUtils.createPost( {
					title: `Loop Post ${ i }`,
					status: 'publish',
				} )
			);
		}
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.deleteAllPages();
	} );

	test( 'caps the number of items at the max-items total', async ( {
		page,
		requestUtils,
	} ) => {
		const pageRecord = await requestUtils.createPage( {
			title: 'Max Items Page',
			status: 'publish',
			content: loopMarkup( { perPage: 10, maxItems: 3 } ),
		} );

		await page.goto( pageRecord.link );

		// Five posts match, but the cap shows only three.
		await expect( page.locator( '.loop-builder-item' ) ).toHaveCount( 3 );
	} );

	test( 'makes the whole item a link to its post', async ( {
		page,
		requestUtils,
	} ) => {
		const pageRecord = await requestUtils.createPage( {
			title: 'Linked Items Page',
			status: 'publish',
			content: loopMarkup(
				{ perPage: 10, maxItems: 3 },
				{ linkItem: true }
			),
		} );

		await page.goto( pageRecord.link );

		const items = page.locator( '.loop-builder-item--linked' );
		await expect( items ).toHaveCount( 3 );

		// Each item carries a single stretched-link overlay anchor.
		const overlays = page.locator(
			'.loop-builder-item--linked a.loop-builder-item-link'
		);
		await expect( overlays ).toHaveCount( 3 );

		// The first item (sorted A→Z) links to "Loop Post 1".
		await expect( overlays.first() ).toHaveAttribute(
			'href',
			posts[ 0 ].link
		);
	} );

	test( 'omits the overlay when item linking is off', async ( {
		page,
		requestUtils,
	} ) => {
		const pageRecord = await requestUtils.createPage( {
			title: 'Unlinked Items Page',
			status: 'publish',
			content: loopMarkup( { perPage: 10 }, { linkItem: false } ),
		} );

		await page.goto( pageRecord.link );

		await expect( page.locator( '.loop-builder-item' ) ).toHaveCount( 5 );
		await expect(
			page.locator( '.loop-builder-item-link' )
		).toHaveCount( 0 );
	} );
} );
