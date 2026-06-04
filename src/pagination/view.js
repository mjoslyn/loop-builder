/**
 * Front-end behavior for the "load more" pagination type.
 *
 * On click the button asks the REST endpoint for the next page of items and
 * appends them to the matching loop list, then advances (or removes) itself.
 * No framework — just fetch + DOM, so it stays tiny on the front end.
 */
/**
 * Find the loop list a load-more button feeds into.
 *
 * @param {string} queryId The block's queryId.
 * @return {HTMLElement|null} The matching list element.
 */
function findList( queryId ) {
	return document.querySelector(
		`ul.loop-builder-layout[data-lb-query="${ queryId }"]`
	);
}

async function loadMore( button ) {
	const {
		lbQuery: queryId,
		lbPost: postId,
		lbRest: restBase,
	} = button.dataset;

	const list = findList( queryId );
	if ( ! list || ! restBase ) {
		return;
	}

	const page = parseInt( button.dataset.lbPage, 10 );
	const max = parseInt( button.dataset.lbMax, 10 );

	button.disabled = true;
	button.classList.add( 'is-loading' );

	const url = new URL( restBase );
	url.searchParams.set( 'postId', postId );
	url.searchParams.set( 'queryId', queryId );
	url.searchParams.set( 'page', String( page ) );

	try {
		const response = await fetch( url.toString(), {
			headers: { Accept: 'application/json' },
		} );
		if ( ! response.ok ) {
			throw new Error( `Request failed: ${ response.status }` );
		}
		const data = await response.json();

		if ( data.html ) {
			list.insertAdjacentHTML( 'beforeend', data.html );
		}

		if ( data.hasMore && page + 1 <= max ) {
			button.dataset.lbPage = String( page + 1 );
			button.disabled = false;
			button.classList.remove( 'is-loading' );
		} else {
			button.remove();
		}
	} catch ( error ) {
		button.disabled = false;
		button.classList.remove( 'is-loading' );
		// eslint-disable-next-line no-console
		console.error( 'Loop Builder load-more failed:', error );
	}
}

function init() {
	document.addEventListener( 'click', ( event ) => {
		const button = event.target.closest( '.loop-builder-load-more' );
		if ( button ) {
			event.preventDefault();
			loadMore( button );
		}
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
