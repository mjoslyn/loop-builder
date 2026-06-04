/**
 * Loop Builder — pagination block registration.
 */
import { registerBlockType } from '@wordpress/blocks';

import Edit from './edit';
import variations from './variations';
import metadata from './block.json';

import './style.scss';

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
	variations,
} );
