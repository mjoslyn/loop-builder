/**
 * Loop Builder — query (parent) block edit component.
 *
 * Owns the query + layout settings and hosts the inner blocks (the per-post
 * template and the no-results fallback). The actual preview loop lives in the
 * template block, which consumes the query/layout context this block provides.
 */
import { useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';

import QueryPanel from './inspector/query-panel';
import FiltersPanel from './inspector/filters-panel';
import LayoutPanel from './inspector/layout-panel';
import StylePanel from './inspector/style-panel';

const TEMPLATE = [
	[ 'loop-builder/template' ],
	[ 'loop-builder/no-results' ],
	[ 'loop-builder/pagination' ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { queryId, query, displayLayout, cardStyle } = attributes;
	const instanceId = useInstanceId( Edit );

	// Assign a stable queryId once so pagination can namespace its page var.
	useEffect( () => {
		if ( queryId === undefined || queryId === null ) {
			setAttributes( { queryId: instanceId } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ queryId ] );

	const setQuery = ( next ) =>
		setAttributes( { query: { ...query, ...next } } );
	const setDisplayLayout = ( next ) =>
		setAttributes( { displayLayout: { ...displayLayout, ...next } } );
	const setCardStyle = ( next ) =>
		setAttributes( { cardStyle: { ...( cardStyle || {} ), ...next } } );

	const blockProps = useBlockProps( { className: 'wp-block-loop-builder' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateInsertUpdatesSelection: false,
	} );

	return (
		<>
			<InspectorControls>
				<QueryPanel query={ query } setQuery={ setQuery } />
				<FiltersPanel query={ query } setQuery={ setQuery } />
				<LayoutPanel
					displayLayout={ displayLayout }
					setDisplayLayout={ setDisplayLayout }
				/>
				<StylePanel
					cardStyle={ cardStyle }
					setCardStyle={ setCardStyle }
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}
