/**
 * Multi-clause taxonomy filtering. Each clause targets one taxonomy with a set
 * of terms and an IN / NOT IN operator; clauses combine with an AND / OR
 * relation. Serialized to query.taxQuery = { relation, clauses: [...] }.
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	SelectControl,
	FormTokenField,
	Flex,
	FlexItem,
} from '@wordpress/components';

import { useTaxonomiesForPostType, useTerms } from '../hooks/use-query-data';
import RelationToggle from './relation-toggle';

/**
 * Normalize the stored attribute (which may be a legacy array) into the
 * { relation, clauses } object shape.
 *
 * @param {*} value Stored taxQuery attribute.
 * @return {{relation: string, clauses: Array}} Normalized wrapper.
 */
function normalize( value ) {
	if ( Array.isArray( value ) ) {
		return { relation: 'AND', clauses: value };
	}
	return {
		relation: value?.relation || 'AND',
		clauses: value?.clauses || [],
	};
}

function TaxonomyClause( { clause, taxonomies, onChange, onRemove } ) {
	const taxObject = taxonomies.find( ( t ) => t.slug === clause.taxonomy );
	const { terms } = useTerms( taxObject?.rest_base );

	const selectedNames = ( clause.terms || [] )
		.map( ( id ) => terms.find( ( t ) => t.id === id )?.name )
		.filter( Boolean );

	const onChangeTerms = ( tokens ) => {
		const ids = tokens
			.map( ( token ) => terms.find( ( t ) => t.name === token )?.id )
			.filter( ( id ) => typeof id === 'number' );
		onChange( { ...clause, terms: ids } );
	};

	return (
		<div className="loop-builder-clause">
			<SelectControl
				__nextHasNoMarginBottom
				label={ __( 'Taxonomy', 'loop-builder' ) }
				value={ clause.taxonomy }
				options={ [
					{ label: __( 'Select…', 'loop-builder' ), value: '' },
					...taxonomies.map( ( t ) => ( {
						label: t.name,
						value: t.slug,
					} ) ),
				] }
				onChange={ ( taxonomy ) =>
					onChange( { ...clause, taxonomy, terms: [] } )
				}
			/>

			{ clause.taxonomy && (
				<>
					<FormTokenField
						label={ __( 'Terms', 'loop-builder' ) }
						value={ selectedNames }
						suggestions={ terms.map( ( t ) => t.name ) }
						onChange={ onChangeTerms }
						__experimentalExpandOnFocus
						__next40pxDefaultSize
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Match', 'loop-builder' ) }
						value={ clause.operator || 'IN' }
						options={ [
							{
								label: __( 'Is one of', 'loop-builder' ),
								value: 'IN',
							},
							{
								label: __( 'Is none of', 'loop-builder' ),
								value: 'NOT IN',
							},
						] }
						onChange={ ( operator ) =>
							onChange( { ...clause, operator } )
						}
					/>
				</>
			) }

			<Button isDestructive variant="link" onClick={ onRemove }>
				{ __( 'Remove taxonomy filter', 'loop-builder' ) }
			</Button>
		</div>
	);
}

export default function TaxonomyFilters( { query, setQuery } ) {
	const taxonomies = useTaxonomiesForPostType( query.postType );
	const { relation, clauses } = normalize( query.taxQuery );

	if ( taxonomies.length === 0 ) {
		return null;
	}

	const update = ( next ) =>
		setQuery( { taxQuery: { relation, clauses: next } } );

	const addClause = () =>
		update( [ ...clauses, { taxonomy: '', terms: [], operator: 'IN' } ] );
	const changeClause = ( index, value ) =>
		update( clauses.map( ( c, i ) => ( i === index ? value : c ) ) );
	const removeClause = ( index ) =>
		update( clauses.filter( ( _, i ) => i !== index ) );

	return (
		<BaseControl __nextHasNoMarginBottom>
			{ clauses.length > 1 && (
				<RelationToggle
					value={ relation }
					onChange={ ( value ) =>
						setQuery( { taxQuery: { relation: value, clauses } } )
					}
				/>
			) }

			{ clauses.map( ( clause, index ) => (
				<TaxonomyClause
					key={ index }
					clause={ clause }
					taxonomies={ taxonomies }
					onChange={ ( value ) => changeClause( index, value ) }
					onRemove={ () => removeClause( index ) }
				/>
			) ) }

			<Flex justify="flex-start">
				<FlexItem>
					<Button variant="secondary" onClick={ addClause }>
						{ __( '+ Add taxonomy filter', 'loop-builder' ) }
					</Button>
				</FlexItem>
			</Flex>
		</BaseControl>
	);
}
