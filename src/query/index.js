/**
 * Loop Builder — query (parent) block registration.
 */
import { registerBlockType } from '@wordpress/blocks';

import Edit from './edit';
import save from './save';
import variations from './variations';
import metadata from './block.json';

import './style.scss';
import './editor.scss';

registerBlockType( metadata.name, {
	edit: Edit,
	save,
	variations,
} );
