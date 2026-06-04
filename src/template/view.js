/**
 * Front-end enhancement for the slider layout.
 *
 * Progressive enhancement only: the markup is a horizontal scroll-snap list that
 * already works with touch/trackpad. This adds previous/next buttons and keeps
 * their disabled state in sync with scroll position. No dependencies.
 */
/**
 * Wrap a slider track and append previous/next controls.
 *
 * @param {HTMLElement} track The scroll-snap list element.
 * @return {{prev: HTMLButtonElement, next: HTMLButtonElement}} The controls.
 */
function buttonsFor( track ) {
	const wrapper = document.createElement( 'div' );
	wrapper.className = 'loop-builder-slider';
	track.parentNode.insertBefore( wrapper, track );
	wrapper.appendChild( track );

	const nav = document.createElement( 'div' );
	nav.className = 'loop-builder-slider-nav';

	const prev = document.createElement( 'button' );
	prev.type = 'button';
	prev.className = 'loop-builder-slider-button is-prev';
	prev.setAttribute( 'aria-label', 'Previous' );
	prev.textContent = '‹';

	const next = document.createElement( 'button' );
	next.type = 'button';
	next.className = 'loop-builder-slider-button is-next';
	next.setAttribute( 'aria-label', 'Next' );
	next.textContent = '›';

	nav.append( prev, next );
	wrapper.appendChild( nav );

	return { prev, next };
}

function step( track ) {
	const item = track.querySelector( '.loop-builder-item' );
	if ( ! item ) {
		return track.clientWidth;
	}
	const gap =
		parseFloat( window.getComputedStyle( track ).columnGap || '0' ) || 0;
	return item.getBoundingClientRect().width + gap;
}

function syncDisabled( track, prev, next ) {
	const max = track.scrollWidth - track.clientWidth - 1;
	prev.disabled = track.scrollLeft <= 0;
	next.disabled = track.scrollLeft >= max;
}

function enhance( track ) {
	if ( track.dataset.lbSlider === 'ready' ) {
		return;
	}
	track.dataset.lbSlider = 'ready';

	const { prev, next } = buttonsFor( track );

	prev.addEventListener( 'click', () => {
		track.scrollBy( { left: -step( track ), behavior: 'smooth' } );
	} );
	next.addEventListener( 'click', () => {
		track.scrollBy( { left: step( track ), behavior: 'smooth' } );
	} );

	track.addEventListener( 'scroll', () => syncDisabled( track, prev, next ), {
		passive: true,
	} );
	window.addEventListener( 'resize', () =>
		syncDisabled( track, prev, next )
	);
	syncDisabled( track, prev, next );
}

function init() {
	document
		.querySelectorAll( 'ul.loop-builder-layout.is-layout-slider' )
		.forEach( enhance );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
