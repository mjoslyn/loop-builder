/**
 * "Query" inspector panel — the core source settings: inherit toggle, post
 * type(s), count, ordering, author, keyword, and sticky handling.
 */
/* eslint-disable @wordpress/no-unsafe-wp-apis -- NumberControl is stable in practice and exported only under the __experimental prefix. */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	TextControl,
	ComboboxControl,
	ToggleControl,
	Notice,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';

import { usePostTypeOptions, useAuthorOptions } from '../hooks/use-query-data';

const ORDER_OPTIONS = [
	{ label: __( 'Newest to oldest', 'loop-builder' ), value: 'date/desc' },
	{ label: __( 'Oldest to newest', 'loop-builder' ), value: 'date/asc' },
	{ label: __( 'A → Z (title)', 'loop-builder' ), value: 'title/asc' },
	{ label: __( 'Z → A (title)', 'loop-builder' ), value: 'title/desc' },
	{
		label: __( 'Recently modified', 'loop-builder' ),
		value: 'modified/desc',
	},
	{ label: __( 'Menu order', 'loop-builder' ), value: 'menu_order/asc' },
	{ label: __( 'Random', 'loop-builder' ), value: 'rand/asc' },
	{
		label: __( 'Custom field: A → Z', 'loop-builder' ),
		value: 'meta_value/asc',
	},
	{
		label: __( 'Custom field: Z → A', 'loop-builder' ),
		value: 'meta_value/desc',
	},
	{
		label: __( 'Custom field: low → high', 'loop-builder' ),
		value: 'meta_value_num/asc',
	},
	{
		label: __( 'Custom field: high → low', 'loop-builder' ),
		value: 'meta_value_num/desc',
	},
];

const isMetaOrder = ( orderBy ) =>
	orderBy === 'meta_value' || orderBy === 'meta_value_num';

const STICKY_OPTIONS = [
	{ label: __( 'Include sticky posts', 'loop-builder' ), value: '' },
	{ label: __( 'Only sticky posts', 'loop-builder' ), value: 'only' },
	{ label: __( 'Exclude sticky posts', 'loop-builder' ), value: 'exclude' },
];

const EMPTY_TAX = { relation: 'AND', clauses: [] };

export default function QueryPanel( { query, setQuery } ) {
	const postTypeOptions = usePostTypeOptions();
	const authorOptions = useAuthorOptions();

	const orderValue = `${ query.orderBy || 'date' }/${
		query.order || 'desc'
	}`;

	// postType may be a string (single) or an array (multi-query).
	const selectedTypes = Array.isArray( query.postType )
		? query.postType
		: [ query.postType || 'post' ];

	const options = postTypeOptions.length
		? postTypeOptions
		: [ { label: __( 'Posts', 'loop-builder' ), value: 'post' } ];

	const onChangeTypes = ( values ) => {
		const next = values.length ? values : [ 'post' ];
		// Collapse a single selection back to a plain string, and reset
		// taxonomy filters since terms won't carry across post types.
		setQuery( {
			postType: next.length === 1 ? next[ 0 ] : next,
			taxQuery: EMPTY_TAX,
		} );
	};

	const isPostOnly =
		selectedTypes.length === 1 && selectedTypes[ 0 ] === 'post';

	return (
		<PanelBody title={ __( 'Query', 'loop-builder' ) }>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Inherit query from the page', 'loop-builder' ) }
				help={ __(
					'Use the current archive, search, or home query. Layout and styling still apply.',
					'loop-builder'
				) }
				checked={ !! query.inherit }
				onChange={ ( inherit ) => setQuery( { inherit } ) }
			/>

			{ query.inherit ? (
				<Notice status="info" isDismissible={ false }>
					{ __(
						'This loop shows the results of the page it is placed on (e.g. a category archive or search results).',
						'loop-builder'
					) }
				</Notice>
			) : (
				<>
					<SelectControl
						__nextHasNoMarginBottom
						multiple
						label={ __( 'Content type(s)', 'loop-builder' ) }
						help={ __(
							'Hold ⌘/Ctrl to select more than one.',
							'loop-builder'
						) }
						value={ selectedTypes }
						options={ options }
						onChange={ onChangeTypes }
					/>

					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Items to show', 'loop-builder' ) }
						value={ query.perPage }
						min={ 1 }
						max={ 50 }
						onChange={ ( perPage ) => setQuery( { perPage } ) }
					/>

					<NumberControl
						label={ __( 'Max items (total)', 'loop-builder' ) }
						value={ query.maxItems || 0 }
						min={ 0 }
						onChange={ ( value ) =>
							setQuery( {
								maxItems: parseInt( value, 10 ) || 0,
							} )
						}
						help={ __(
							'The most items this loop will ever show across all pages. 0 = no limit.',
							'loop-builder'
						) }
					/>

					<NumberControl
						label={ __(
							'Skip first N items (offset)',
							'loop-builder'
						) }
						value={ query.offset }
						min={ 0 }
						onChange={ ( value ) =>
							setQuery( { offset: parseInt( value, 10 ) || 0 } )
						}
					/>

					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Order by', 'loop-builder' ) }
						value={ orderValue }
						options={ ORDER_OPTIONS }
						onChange={ ( value ) => {
							const [ orderBy, order ] = value.split( '/' );
							setQuery( { orderBy, order } );
						} }
					/>

					{ isMetaOrder( query.orderBy ) && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __(
								'Custom field to sort by',
								'loop-builder'
							) }
							value={ query.orderByMetaKey || '' }
							onChange={ ( orderByMetaKey ) =>
								setQuery( { orderByMetaKey } )
							}
							help={ __(
								'Meta key whose value sets the order (e.g. event_date). Items without this field are hidden.',
								'loop-builder'
							) }
						/>
					) }

					<ComboboxControl
						label={ __( 'Author', 'loop-builder' ) }
						value={ query.author ? String( query.author ) : '' }
						options={ [
							{
								label: __( 'Any author', 'loop-builder' ),
								value: '',
							},
							...authorOptions.map( ( a ) => ( {
								label: a.label,
								value: String( a.value ),
							} ) ),
						] }
						onChange={ ( author ) =>
							setQuery( { author: author || '' } )
						}
					/>

					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Keyword', 'loop-builder' ) }
						value={ query.search }
						onChange={ ( search ) => setQuery( { search } ) }
						help={ __(
							'Limit results to a search term.',
							'loop-builder'
						) }
					/>

					{ isPostOnly && (
						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Sticky posts', 'loop-builder' ) }
							value={ query.sticky || '' }
							options={ STICKY_OPTIONS }
							onChange={ ( sticky ) => setQuery( { sticky } ) }
						/>
					) }
				</>
			) }
		</PanelBody>
	);
}
