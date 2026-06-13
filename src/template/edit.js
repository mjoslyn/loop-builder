/**
 * Loop Builder — template (loop item) edit component.
 *
 * Renders a live preview of the query: it fetches the matching records, then
 * shows the card's inner blocks once per result by wrapping them in a
 * per-post BlockContextProvider. The first/active item is editable; the rest
 * are lightweight BlockPreviews. This mirrors core's post-template/edit.js.
 */
/* eslint-disable @wordpress/no-unsafe-wp-apis -- useBlockPreview is the documented API for repeating block previews and is exported only under the __experimental prefix. */
import { __ } from '@wordpress/i18n';
import { memo, useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	BlockContextProvider,
	__experimentalUseBlockPreview as useBlockPreview,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

const DEFAULT_TEMPLATE = [
	[ 'core/post-featured-image', { isLink: true } ],
	[
		'core/group',
		{ className: 'loop-builder-card-content', layout: { type: 'default' } },
		[
			[ 'core/post-title', { isLink: true, level: 3 } ],
			[ 'core/post-date', {} ],
			[ 'core/post-excerpt', {} ],
		],
	],
];

// REST orderby only supports a subset of WP_Query's keys; map the rest to a
// reasonable preview equivalent (the front end still honors the real value).
const REST_ORDERBY = {
	date: 'date',
	modified: 'modified',
	title: 'title',
	menu_order: 'menu_order',
	rand: 'date',
	comment_count: 'date',
	ID: 'id',
	author: 'author',
	relevance: 'relevance',
};

/**
 * Map a Loop Builder query attribute to REST args for the editor preview.
 *
 * @param {Object} query      The query attribute.
 * @param {Array}  taxonomies Registered taxonomy objects (for rest_base lookup).
 * @return {Object} getEntityRecords query args.
 */
function buildEditorQuery( query, taxonomies ) {
	const {
		perPage = 6,
		offset = 0,
		order = 'desc',
		orderBy = 'date',
		author,
		search,
		taxQuery = [],
	} = query;

	const args = {
		per_page: perPage,
		offset,
		order,
		orderby: REST_ORDERBY[ orderBy ] || 'date',
		context: 'view',
	};

	if ( author ) {
		const id = parseInt( author, 10 );
		if ( id ) {
			args.author = [ id ];
		}
	}
	if ( search ) {
		args.search = search;
	}

	const clause = taxQuery[ 0 ];
	if ( clause?.taxonomy && clause.terms?.length ) {
		const tax = taxonomies.find( ( t ) => t.slug === clause.taxonomy );
		if ( tax?.rest_base ) {
			args[ tax.rest_base ] = clause.terms;
		}
	}

	return args;
}

function TemplateInnerBlocks() {
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'loop-builder-item' },
		{ template: DEFAULT_TEMPLATE, __unstableDisableLayoutClassNames: true }
	);
	return <li { ...innerBlocksProps } />;
}

function TemplateBlockPreview( {
	blocks,
	blockContextId,
	isHidden,
	setActiveBlockContextId,
} ) {
	const blockPreviewProps = useBlockPreview( {
		blocks,
		props: { className: 'loop-builder-item' },
	} );

	const handleOnClick = () => setActiveBlockContextId( blockContextId );

	const style = isHidden ? { display: 'none' } : {};

	return (
		<li
			{ ...blockPreviewProps }
			tabIndex={ 0 }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
			role="button"
			onClick={ handleOnClick }
			onKeyPress={ handleOnClick }
			style={ { ...blockPreviewProps.style, ...style } }
		/>
	);
}

const MemoizedTemplateBlockPreview = memo( TemplateBlockPreview );

export default function Edit( { clientId, context } ) {
	const {
		'loop-builder/query': query = {},
		'loop-builder/displayLayout': displayLayout = {},
		'loop-builder/cardStyle': cardStyle = {},
	} = context;
	const [ activeBlockContextId, setActiveBlockContextId ] = useState();

	// A multi-type query previews its first type; an inherited query previews
	// recent posts as a stand-in (the real archive context exists only on the front end).
	const previewType = Array.isArray( query.postType )
		? query.postType[ 0 ] || 'post'
		: query.postType || 'post';

	const { posts, blocks } = useSelect(
		( select ) => {
			const { getEntityRecords, getTaxonomies } = select( coreStore );
			const { getBlocks } = select( blockEditorStore );
			const taxonomies = getTaxonomies( { per_page: -1 } ) || [];
			const queryArgs = query.inherit
				? {
						per_page: query.perPage || 6,
						order: 'desc',
						orderby: 'date',
						context: 'view',
				  }
				: buildEditorQuery( query, taxonomies );
			return {
				posts: getEntityRecords( 'postType', previewType, queryArgs ),
				blocks: getBlocks( clientId ),
			};
		},
		[ query, clientId, previewType ]
	);

	const blockContexts = useMemo(
		() =>
			posts?.map( ( post ) => ( {
				postType: post.type,
				postId: post.id,
			} ) ),
		[ posts ]
	);

	const layoutType = displayLayout.type || 'grid';
	const columns = displayLayout.columns || 3;
	const hasColumns = [ 'grid', 'flex', 'slider' ].includes( layoutType );
	const hasCard = cardStyle && Object.keys( cardStyle ).length > 0;

	const className = [
		'loop-builder-layout',
		`is-layout-${ layoutType }`,
		hasColumns ? `loop-builder-columns-${ columns }` : '',
		hasCard ? 'has-card-style' : '',
		cardStyle?.hoverLift ? 'has-card-hover' : '',
	]
		.filter( Boolean )
		.join( ' ' );

	const style = {
		'--loop-builder-gap': displayLayout.gap || '24px',
		'--loop-builder-columns': columns,
		'--loop-builder-columns-tablet': displayLayout.columnsTablet || 2,
		'--loop-builder-columns-mobile': displayLayout.columnsMobile || 1,
		...( cardStyle?.background && {
			'--loop-builder-card-bg': cardStyle.background,
		} ),
		...( cardStyle?.padding && {
			'--loop-builder-card-padding': cardStyle.padding,
		} ),
		...( cardStyle?.radius && {
			'--loop-builder-card-radius': cardStyle.radius,
		} ),
		...( cardStyle?.borderWidth && {
			'--loop-builder-card-border-width': cardStyle.borderWidth,
		} ),
		...( cardStyle?.borderColor && {
			'--loop-builder-card-border-color': cardStyle.borderColor,
		} ),
		...( cardStyle?.imageBackground && {
			'--loop-builder-card-image-bg': cardStyle.imageBackground,
		} ),
		...( cardStyle?.imagePadding && {
			'--loop-builder-card-image-padding': cardStyle.imagePadding,
		} ),
		...( cardStyle?.contentBackground && {
			'--loop-builder-card-content-bg': cardStyle.contentBackground,
		} ),
		...( cardStyle?.contentPadding && {
			'--loop-builder-card-content-padding': cardStyle.contentPadding,
		} ),
	};

	const blockProps = useBlockProps( { className, style } );

	if ( ! posts ) {
		return (
			<p { ...blockProps }>
				<Spinner />
			</p>
		);
	}

	if ( ! posts.length ) {
		return (
			<p { ...blockProps }>
				{ __(
					'No results found for these query settings.',
					'loop-builder'
				) }
			</p>
		);
	}

	const activeId = activeBlockContextId || blockContexts[ 0 ]?.postId;

	return (
		<ul { ...blockProps }>
			{ blockContexts &&
				blockContexts.map( ( blockContext ) => (
					<BlockContextProvider
						key={ blockContext.postId }
						value={ blockContext }
					>
						{ blockContext.postId === activeId ? (
							<TemplateInnerBlocks />
						) : null }
						<MemoizedTemplateBlockPreview
							blocks={ blocks }
							blockContextId={ blockContext.postId }
							setActiveBlockContextId={ setActiveBlockContextId }
							isHidden={ blockContext.postId === activeId }
						/>
					</BlockContextProvider>
				) ) }
		</ul>
	);
}
