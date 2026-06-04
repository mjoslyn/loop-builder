/**
 * Data hooks shared by the inspector panels — post types, taxonomies, terms,
 * authors. Thin wrappers over the core data store so the panels stay declarative.
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Public, REST-visible post types the user can query (excludes internal types
 * like attachments and the FSE template types).
 *
 * @return {Array<{label: string, value: string}>} Options for a SelectControl.
 */
export function usePostTypeOptions() {
	return useSelect( ( select ) => {
		const types =
			select( coreStore ).getPostTypes( { per_page: -1 } ) || [];
		return types
			.filter(
				( type ) =>
					type.viewable &&
					! [
						'attachment',
						'wp_block',
						'wp_template',
						'wp_template_part',
						'wp_navigation',
					].includes( type.slug )
			)
			.map( ( type ) => ( { label: type.name, value: type.slug } ) );
	}, [] );
}

/**
 * Taxonomies registered for the given post type(s). Accepts a single slug or an
 * array; for multiple types it returns the union of their taxonomies.
 *
 * @param {string|string[]} postType Post type slug or slugs.
 * @return {Array<Object>} Taxonomy objects ({ slug, name, rest_base, ... }).
 */
export function useTaxonomiesForPostType( postType ) {
	const types = Array.isArray( postType ) ? postType : [ postType ];
	const key = types.join( ',' );
	return useSelect(
		( select ) => {
			const taxonomies =
				select( coreStore ).getTaxonomies( { per_page: -1 } ) || [];
			return taxonomies.filter(
				( tax ) =>
					tax.visibility?.show_ui !== false &&
					( tax.types || [] ).some( ( type ) =>
						types.includes( type )
					)
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ key ]
	);
}

/**
 * Terms for a taxonomy, as token suggestions keyed by name.
 *
 * @param {string} taxonomyRestBase The taxonomy's REST base (e.g. "categories").
 * @return {{terms: Array<Object>, isResolving: boolean}} Terms and loading state.
 */
export function useTerms( taxonomyRestBase ) {
	return useSelect(
		( select ) => {
			if ( ! taxonomyRestBase ) {
				return { terms: [], isResolving: false };
			}
			const query = {
				per_page: 100,
				_fields: 'id,name,slug',
				context: 'view',
			};
			const terms = select( coreStore ).getEntityRecords(
				'taxonomy',
				taxonomyRestBase,
				query
			);
			const isResolving = select( coreStore ).isResolving(
				'getEntityRecords',
				[ 'taxonomy', taxonomyRestBase, query ]
			);
			return { terms: terms || [], isResolving };
		},
		[ taxonomyRestBase ]
	);
}

/**
 * Site authors.
 *
 * @return {Array<{label: string, value: number}>} Author options.
 */
export function useAuthorOptions() {
	return useSelect( ( select ) => {
		const authors =
			select( coreStore ).getUsers( { who: 'authors', per_page: 100 } ) ||
			[];
		return authors.map( ( author ) => ( {
			label: author.name,
			value: author.id,
		} ) );
	}, [] );
}
