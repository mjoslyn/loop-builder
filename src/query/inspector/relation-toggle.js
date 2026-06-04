/**
 * Shared AND / OR relation toggle used by the taxonomy and meta filter groups.
 */
/* eslint-disable @wordpress/no-unsafe-wp-apis -- ToggleGroupControl is stable in practice and exported only under the __experimental prefix. */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

export default function RelationToggle( { value, onChange } ) {
	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			isBlock
			label={ __( 'Match clauses', 'loop-builder' ) }
			value={ value || 'AND' }
			onChange={ onChange }
		>
			<ToggleGroupControlOption
				value="AND"
				label={ __( 'All (AND)', 'loop-builder' ) }
			/>
			<ToggleGroupControlOption
				value="OR"
				label={ __( 'Any (OR)', 'loop-builder' ) }
			/>
		</ToggleGroupControl>
	);
}
