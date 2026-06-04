/**
 * Custom-field (meta) query builder. Each clause is a key + comparison +
 * value + type; clauses combine with an AND / OR relation. Serialized to
 * query.metaQuery = { relation, clauses: [...] }.
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	SelectControl,
	TextControl,
	Flex,
	FlexItem,
} from '@wordpress/components';

import RelationToggle from './relation-toggle';

const COMPARE_OPTIONS = [
	{ label: '=', value: '=' },
	{ label: '≠', value: '!=' },
	{ label: '>', value: '>' },
	{ label: '≥', value: '>=' },
	{ label: '<', value: '<' },
	{ label: '≤', value: '<=' },
	{ label: __( 'Contains', 'loop-builder' ), value: 'LIKE' },
	{ label: __( 'Does not contain', 'loop-builder' ), value: 'NOT LIKE' },
	{ label: __( 'Is one of', 'loop-builder' ), value: 'IN' },
	{ label: __( 'Is none of', 'loop-builder' ), value: 'NOT IN' },
	{ label: __( 'Exists', 'loop-builder' ), value: 'EXISTS' },
	{ label: __( 'Does not exist', 'loop-builder' ), value: 'NOT EXISTS' },
];

const TYPE_OPTIONS = [
	{ label: __( 'Text', 'loop-builder' ), value: 'CHAR' },
	{ label: __( 'Number', 'loop-builder' ), value: 'NUMERIC' },
	{ label: __( 'Date', 'loop-builder' ), value: 'DATE' },
	{ label: __( 'Datetime', 'loop-builder' ), value: 'DATETIME' },
	{ label: __( 'Decimal', 'loop-builder' ), value: 'DECIMAL' },
];

function normalize( value ) {
	if ( Array.isArray( value ) ) {
		return { relation: 'AND', clauses: value };
	}
	return {
		relation: value?.relation || 'AND',
		clauses: value?.clauses || [],
	};
}

const valueless = ( compare ) =>
	compare === 'EXISTS' || compare === 'NOT EXISTS';

function MetaClause( { clause, onChange, onRemove } ) {
	const compare = clause.compare || '=';
	return (
		<div className="loop-builder-clause">
			<TextControl
				__nextHasNoMarginBottom
				label={ __( 'Meta key', 'loop-builder' ) }
				value={ clause.key || '' }
				onChange={ ( key ) => onChange( { ...clause, key } ) }
			/>
			<SelectControl
				__nextHasNoMarginBottom
				label={ __( 'Comparison', 'loop-builder' ) }
				value={ compare }
				options={ COMPARE_OPTIONS }
				onChange={ ( value ) =>
					onChange( { ...clause, compare: value } )
				}
			/>
			{ ! valueless( compare ) && (
				<>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Value', 'loop-builder' ) }
						value={ clause.value || '' }
						help={
							compare === 'IN' || compare === 'NOT IN'
								? __(
										'Comma-separate multiple values.',
										'loop-builder'
								  )
								: undefined
						}
						onChange={ ( value ) =>
							onChange( { ...clause, value } )
						}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Treat value as', 'loop-builder' ) }
						value={ clause.type || 'CHAR' }
						options={ TYPE_OPTIONS }
						onChange={ ( type ) => onChange( { ...clause, type } ) }
					/>
				</>
			) }
			<Button isDestructive variant="link" onClick={ onRemove }>
				{ __( 'Remove meta filter', 'loop-builder' ) }
			</Button>
		</div>
	);
}

export default function MetaFilters( { query, setQuery } ) {
	const { relation, clauses } = normalize( query.metaQuery );

	const update = ( next ) =>
		setQuery( { metaQuery: { relation, clauses: next } } );

	const addClause = () =>
		update( [
			...clauses,
			{ key: '', compare: '=', value: '', type: 'CHAR' },
		] );
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
						setQuery( { metaQuery: { relation: value, clauses } } )
					}
				/>
			) }

			{ clauses.map( ( clause, index ) => (
				<MetaClause
					key={ index }
					clause={ clause }
					onChange={ ( value ) => changeClause( index, value ) }
					onRemove={ () => removeClause( index ) }
				/>
			) ) }

			<Flex justify="flex-start">
				<FlexItem>
					<Button variant="secondary" onClick={ addClause }>
						{ __( '+ Add custom field filter', 'loop-builder' ) }
					</Button>
				</FlexItem>
			</Flex>
		</BaseControl>
	);
}
