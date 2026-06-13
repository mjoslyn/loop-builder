/**
 * "Save as pattern" — a block-toolbar action that captures the whole designed
 * loop (the query block plus its template, no-results, and pagination inner
 * blocks) and saves it as a user pattern (wp_block) for reuse on other pages.
 *
 * The queryId attribute is stripped before serializing: each insertion of the
 * pattern gets a fresh ID from the editor, so pagination and load-more never
 * collide between copies of the same pattern.
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	BlockControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarButton,
	Modal,
	TextControl,
	ToggleControl,
	Button,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { useSelect, useDispatch, select } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';
import { serialize, cloneBlock } from '@wordpress/blocks';

const CATEGORY_SLUG = 'loop-builder';

const symbolIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M21.3 10.8l-5.6-5.6c-.7-.7-1.8-.7-2.5 0l-5.6 5.6c-.7.7-.7 1.8 0 2.5l5.6 5.6c.3.3.8.5 1.2.5s.9-.2 1.2-.5l5.6-5.6c.8-.7.8-1.8.1-2.5zm-1 1.4l-5.6 5.6c-.1.1-.3.1-.4 0l-5.6-5.6c-.1-.1-.1-.3 0-.4l5.6-5.6s.1-.1.2-.1.1 0 .2.1l5.6 5.6c.1.1.1.3 0 .4zm-16.6-.4L10 5.5l-1-1-6.3 6.3c-.7.7-.7 1.8 0 2.5L9 19.5l1.1-1.1-6.3-6.3c-.2-.1-.2-.3-.1-.3z" />
	</svg>
);

export default function SaveAsPattern( { clientId } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ title, setTitle ] = useState( '' );
	const [ synced, setSynced ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );

	const { canCreate, categoryId } = useSelect( ( ownSelect ) => {
		const { canUser, getEntityRecords } = ownSelect( coreStore );
		const terms = getEntityRecords( 'taxonomy', 'wp_pattern_category', {
			slug: CATEGORY_SLUG,
			per_page: 1,
		} );
		return {
			canCreate: canUser( 'create', {
				kind: 'postType',
				name: 'wp_block',
			} ),
			categoryId: terms?.[ 0 ]?.id,
		};
	}, [] );

	const { saveEntityRecord } = useDispatch( coreStore );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	if ( ! canCreate ) {
		return null;
	}

	const closeModal = () => {
		setIsOpen( false );
		setTitle( '' );
		setSynced( false );
	};

	const onSave = async () => {
		const block = select( blockEditorStore ).getBlock( clientId );
		if ( ! block ) {
			return;
		}

		const clone = cloneBlock( block );
		delete clone.attributes.queryId;

		const record = {
			title: title.trim() || __( 'Loop', 'loop-builder' ),
			content: serialize( clone ),
			status: 'publish',
		};
		if ( ! synced ) {
			record.meta = { wp_pattern_sync_status: 'unsynced' };
		}
		if ( categoryId ) {
			record.wp_pattern_category = [ categoryId ];
		}

		setIsSaving( true );
		try {
			await saveEntityRecord( 'postType', 'wp_block', record, {
				throwOnError: true,
			} );
			createSuccessNotice(
				synced
					? __( 'Synced pattern saved.', 'loop-builder' )
					: __( 'Pattern saved.', 'loop-builder' ),
				{ type: 'snackbar' }
			);
			closeModal();
		} catch ( error ) {
			createErrorNotice(
				error?.message ||
					__( 'The pattern could not be saved.', 'loop-builder' ),
				{ type: 'snackbar' }
			);
		} finally {
			setIsSaving( false );
		}
	};

	return (
		<>
			<BlockControls group="other">
				<ToolbarGroup>
					<ToolbarButton
						icon={ symbolIcon }
						label={ __( 'Save as pattern', 'loop-builder' ) }
						onClick={ () => setIsOpen( true ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ isOpen && (
				<Modal
					title={ __( 'Save loop as pattern', 'loop-builder' ) }
					onRequestClose={ closeModal }
					size="small"
				>
					<Flex direction="column" gap={ 4 }>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Name', 'loop-builder' ) }
							value={ title }
							onChange={ setTitle }
							placeholder={ __(
								'e.g. Event cards, 3-up',
								'loop-builder'
							) }
							// eslint-disable-next-line jsx-a11y/no-autofocus -- The modal exists to collect this one field.
							autoFocus
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Synced', 'loop-builder' ) }
							help={
								synced
									? __(
											'Editing this pattern updates it everywhere it is used.',
											'loop-builder'
									  )
									: __(
											'Inserts a detached copy you can edit freely.',
											'loop-builder'
									  )
							}
							checked={ synced }
							onChange={ setSynced }
						/>
						<Flex justify="flex-end">
							<FlexItem>
								<Button
									__next40pxDefaultSize
									variant="tertiary"
									onClick={ closeModal }
								>
									{ __( 'Cancel', 'loop-builder' ) }
								</Button>
							</FlexItem>
							<FlexItem>
								<Button
									__next40pxDefaultSize
									variant="primary"
									onClick={ onSave }
									isBusy={ isSaving }
									disabled={ isSaving }
								>
									{ __( 'Save pattern', 'loop-builder' ) }
								</Button>
							</FlexItem>
						</Flex>
					</Flex>
				</Modal>
			) }
		</>
	);
}
