/**
 * Filters inspector — groups the advanced query filters: taxonomy and custom
 * fields (meta). Each lives in its own collapsible panel.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';

import TaxonomyFilters from './taxonomy-filters';
import MetaFilters from './meta-filters';

export default function FiltersPanel( { query, setQuery } ) {
	return (
		<>
			<PanelBody
				title={ __( 'Taxonomy filters', 'loop-builder' ) }
				initialOpen={ false }
			>
				<TaxonomyFilters query={ query } setQuery={ setQuery } />
			</PanelBody>

			<PanelBody
				title={ __( 'Custom field filters', 'loop-builder' ) }
				initialOpen={ false }
			>
				<MetaFilters query={ query } setQuery={ setQuery } />
			</PanelBody>
		</>
	);
}
