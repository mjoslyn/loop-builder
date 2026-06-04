/**
 * Date filtering. Either a rolling "last N days" window, or an explicit
 * after / before range. Serialized to query.dateQuery.
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';

const MODE_OPTIONS = [
	{ label: __( 'No date filter', 'loop-builder' ), value: '' },
	{ label: __( 'Last N days', 'loop-builder' ), value: 'last' },
	{ label: __( 'Date range', 'loop-builder' ), value: 'range' },
];

function currentMode( dateQuery ) {
	if ( dateQuery?.lastDays ) {
		return 'last';
	}
	if ( dateQuery?.after || dateQuery?.before ) {
		return 'range';
	}
	return '';
}

export default function DateFilter( { query, setQuery } ) {
	const dateQuery = query.dateQuery || {};
	const mode = currentMode( dateQuery );

	const onChangeMode = ( value ) => {
		if ( value === 'last' ) {
			setQuery( { dateQuery: { lastDays: 30 } } );
		} else if ( value === 'range' ) {
			setQuery( {
				dateQuery: { after: '', before: '', inclusive: true },
			} );
		} else {
			setQuery( { dateQuery: {} } );
		}
	};

	return (
		<BaseControl __nextHasNoMarginBottom>
			<SelectControl
				__nextHasNoMarginBottom
				value={ mode }
				options={ MODE_OPTIONS }
				onChange={ onChangeMode }
			/>

			{ mode === 'last' && (
				<TextControl
					__nextHasNoMarginBottom
					type="number"
					min={ 1 }
					label={ __( 'Days', 'loop-builder' ) }
					value={ dateQuery.lastDays || 30 }
					onChange={ ( value ) =>
						setQuery( {
							dateQuery: { lastDays: parseInt( value, 10 ) || 1 },
						} )
					}
				/>
			) }

			{ mode === 'range' && (
				<>
					<TextControl
						__nextHasNoMarginBottom
						type="date"
						label={ __( 'After', 'loop-builder' ) }
						value={ dateQuery.after || '' }
						onChange={ ( after ) =>
							setQuery( { dateQuery: { ...dateQuery, after } } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						type="date"
						label={ __( 'Before', 'loop-builder' ) }
						value={ dateQuery.before || '' }
						onChange={ ( before ) =>
							setQuery( { dateQuery: { ...dateQuery, before } } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Include boundary dates', 'loop-builder' ) }
						checked={ dateQuery.inclusive !== false }
						onChange={ ( inclusive ) =>
							setQuery( {
								dateQuery: { ...dateQuery, inclusive },
							} )
						}
					/>
				</>
			) }
		</BaseControl>
	);
}
