// imports
import React, {
    CSSProperties,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import FuzzySearch from 'fuzzy-search';
import classNames from 'classnames';
import Mark from 'mark.js';
import './fieldsKeeper.less';
import {
    IFieldsKeeperItem,
    IFieldsKeeperRootBucketProps,
    IFolderScopedItem,
    IGetPriorityTargetBucketToFillProps,
    IGroupedFieldsKeeperItem,
    IGroupedItemRenderer,
} from './FieldsKeeper.types';
import { assignFieldItems } from '..';
import {
    FIELDS_KEEPER_CONSTANTS,
    FieldsKeeperContext,
    useStore,
    useStoreState,
} from './FieldsKeeper.context';
import { FieldsKeeperSearcher } from './FieldsKeeperSearcher';
import { getGroupedItems } from './utils';
import { Icons } from '../Components/svgElements/Icons';

export const FieldsKeeperRootBucket = (props: IFieldsKeeperRootBucketProps) => {
    // props
    const {
        label,
        isDisabled,
        labelClassName,
        instanceId: instanceIdFromProps,
        searchPlaceholder = 'Search',
        wrapperClassName,
        customSearchQuery = undefined,
        onClearSearch,
        showClearSearchLink = true,
        emptyFilterMessage = undefined,
        disableEmptyFilterMessage = false,
        shouldRender = () => true,
        filteredItems,
        emptyDataMessage = 'No data found',
    } = props;

    const [ collapsedNodes, setCollapsedNodes ] = useState<Record<string, boolean>>({});

    // refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const contentContainerRef = useRef<HTMLDivElement>(null);
    // state
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;
    const { allItems: allOriginalItems, accentColor, foldersMeta } =
        useStoreState(instanceId);
    const [searchQuery, setSearchQuery] = useState('');
    const allItems = useMemo(() => {
        // should render to spot the renderers
        const currentItems = filteredItems ?? allOriginalItems;
        return currentItems.filter((item) => shouldRender(item));
    }, [allOriginalItems, filteredItems, shouldRender]);

    const hasData = allItems?.length > 0;

    // compute
    const defaultFolderScope = '___DEFAULT';
    const hasCustomSearchQuery = customSearchQuery !== undefined;
    const hasSearchQuery = (customSearchQuery ?? searchQuery) !== '';
    const folderScopedItems = useMemo<
        IFolderScopedItem<IGroupedFieldsKeeperItem>[]
    >(() => {
        const searcher = new FuzzySearch(allItems, ['label', 'id', 'folders'] satisfies (keyof IFieldsKeeperItem)[], {
            sort: true,
        });
        const currentItems = searcher.search(customSearchQuery ?? searchQuery);

        const scopedItemsMap = currentItems.reduce((acc, curr) => {
            const itemFolders = curr.folders ?? [];
        
            if(curr.folderScope) {
                const folderScope = curr.folderScope ?? defaultFolderScope;
                const folderScopeLabel = curr.folderScopeLabel ?? 'Default';
                if (!acc.has(folderScope)) {
                    acc.set(folderScope, {
                        folderScope: folderScope,
                        folderScopeLabel: folderScopeLabel,
                        folderScopeItems: [],
                        type: 'folder',
                        folders: [],
                        id: folderScope,
                        itemLabel: folderScopeLabel,
                    });
                }
            } else if (itemFolders.length > 0) {
                itemFolders.forEach((folderName, folderIndex) => {
                    const folderMeta = foldersMeta?.[folderName];
                    const folderId = folderMeta?.id as string;
        
                    if (!acc.has(folderName)) {
                        acc.set(folderName, {
                            folderScope: folderName,
                            folderScopeLabel: folderMeta?.label as string,
                            folderScopeItems: [],
                            type: folderMeta?.type,
                            folders: itemFolders.length > 1 && acc.size > 0
                                ? itemFolders.slice(0, folderIndex)
                                : [],
                            id: folderId,
                            itemLabel: folderMeta?.label as string,
                        });
                    } 
                    
                });
            }
            if(curr.group && curr.group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID){
                if(!acc.has(curr.group)){
                    acc.set(curr.group, {
                        folderScopeLabel: curr.groupLabel as string,
                        folderScopeItems: [],
                        type: 'group',
                        folders: curr.folderScope ? [curr.folderScope] : [...itemFolders],
                        id: curr.group,
                        itemLabel: curr.groupLabel,
                    });
                }
                const currentGroup = acc.get(curr.group);
                currentGroup?.folderScopeItems?.push({
                    type: 'leaf',
                    folders: curr.folderScope ? [curr.folderScope] : [...itemFolders],
                    id: curr.id,
                    label: curr.label,
                    group: curr.group,
                    groupLabel: curr.groupLabel,
                    groupOrder: curr.groupOrder,
                });
            } else if (!acc.has(curr.id)) {
                acc.set(curr.id, {
                    type: 'leaf',
                    folders: curr.folderScope ? [curr.folderScope] : [...itemFolders],
                    id: curr.id,
                    itemLabel: curr.label,
                });
            }
        
            return acc;
        }, new Map<string, IFolderScopedItem>());

        const scopeItemValues = Array.from(scopedItemsMap.values());
        const newRefactorFolderScopedItems = scopeItemValues.map(({ folders, type, id, itemLabel, groupId, folderScopeItems }) => {
            
            return {
                folders, 
                type,
                id,
                itemLabel,
                groupId, 
                folderScopeItems: getGroupedItems(folderScopeItems ?? []) ?? []
            } satisfies IFolderScopedItem<IGroupedFieldsKeeperItem>;
        });

        return newRefactorFolderScopedItems;
    }, [customSearchQuery, searchQuery, allItems, foldersMeta]);
    
    useEffect(() => {
        if (contentContainerRef.current) {
            const markInstance = new Mark(contentContainerRef.current);
            const query = customSearchQuery || searchQuery;
    
            if (folderScopedItems.length && query) {
                markInstance.unmark({
                    done: () => {
                        markInstance.mark(query, {
                            className: 'search-highlight',
                            separateWordSearch: true,
                            diacritics: true,
                            caseSensitive: false,
                        });
                    },
                });
            } else {
                markInstance.unmark();
            }
        }
    }, [customSearchQuery, searchQuery, folderScopedItems]);

    const showFlatFolderScope =
        folderScopedItems.length === 1 &&
        folderScopedItems[0].folderScope === defaultFolderScope;

    // actions
    const onClearSearchQuery = () => {
        setSearchQuery('');
        searchInputRef.current?.focus();
        onClearSearch?.();
    };

    // style
    const accentColorStyle = (
        accentColor ? { '--root-bucket-accent-color': accentColor } : {}
    ) as CSSProperties;

    // paint
    return (
        <div
            className={classNames(
                'react-fields-keeper-mapping-container',
                {
                    'react-fields-keeper-mapping-content-disabled': isDisabled,
                },
                wrapperClassName,
            )}
        >
            {label ? (
                <div
                    className={classNames(
                        'react-fields-keeper-mapping-subtitle',
                        labelClassName,
                    )}
                >
                    {label}
                </div>
            ) : (
                // to maintain grid consistency
                <div />
            )}
            {!hasCustomSearchQuery ? (
                <FieldsKeeperSearcher
                    ref={searchInputRef}
                    searchPlaceholder={searchPlaceholder}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    accentColorStyle={accentColorStyle}
                />
            ) : (
                <div />
            )}
            <div
                ref={contentContainerRef}
                className={classNames(
                    'react-fields-keeper-mapping-content-scrollable-container',
                    'react-fields-keeper-mapping-content-scrollable-container-columns',
                )}
            >
                {folderScopedItems.length > 0
                    ? folderScopedItems.map((folderScopedItem, index) => (
                          <FolderScopeItemRenderer
                              {...props}
                              key={index}
                              folderScopedItem={folderScopedItem}
                              showFlatFolderScope={showFlatFolderScope}
                              hasSearchQuery={hasSearchQuery}
                              folderScopedItemsArray={folderScopedItems}
                              collapsedNodes={collapsedNodes}
                              setCollapsedNodes={setCollapsedNodes}
                          />
                      ))
                    : !hasData ? (
                        <div className="react-fields-keeper-mapping-no-search-items-found">{emptyDataMessage}</div>
                    ) : !disableEmptyFilterMessage && (
                          <div className="react-fields-keeper-mapping-no-search-items-found">
                              {emptyFilterMessage ?? (
                                  <>
                                      <div>
                                          No items found for <br />
                                          <br />
                                          <code>'{searchQuery}'</code>
                                      </div>
                                      <br />
                                      {showClearSearchLink &&
                                          allItems.length > 0 && (
                                              <div
                                                  className="react-fields-keeper-mapping-clear-search-link"
                                                  onClick={onClearSearchQuery}
                                                  role="button"
                                                  style={accentColorStyle}
                                              >
                                                  Clear search
                                              </div>
                                          )}
                                  </>
                              )}
                          </div>
                      )}
            </div>
        </div>
    );
};

function FolderScopeItemRenderer(
    props: IFieldsKeeperRootBucketProps & {
        folderScopedItem: IFolderScopedItem<IGroupedFieldsKeeperItem>;
        showFlatFolderScope: boolean;
        hasSearchQuery: boolean;
        folderScopedItemsArray: IFolderScopedItem<IGroupedFieldsKeeperItem>[];
        collapsedNodes: Record<string, boolean>;
        setCollapsedNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    },
) {
    // props
    const {
        folderScopedItem: { id, itemLabel, type, folders, groupId, folderScopeItems },
        showFlatFolderScope,
        hasSearchQuery,
        folderScopedItemsArray,
        collapsedNodes,
        setCollapsedNodes,
        ...rootBucketProps
    } = props;
    
    // state
    const [isFolderCollapsedOriginal, setIsFolderCollapsed] = useState(
        rootBucketProps.collapseFoldersOnMount ?? true,
    );
    const isFolderCollapsed = !hasSearchQuery && isFolderCollapsedOriginal;

    // effects
    useEffect(() => {
        if (rootBucketProps.collapseFoldersOnMount !== undefined)
            setIsFolderCollapsed(rootBucketProps.collapseFoldersOnMount);
    }, [rootBucketProps.collapseFoldersOnMount]);

    // handlers
    const toggleFolderCollapse = (id: string) => {
        setCollapsedNodes((prevState) => ({
            ...prevState,
            [id]: !prevState[id]
        }))

        setIsFolderCollapsed(!isFolderCollapsed);
    }

    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = rootBucketProps.instanceId ?? instanceIdFromContext;
    const { buckets, accentColor } = useStoreState(instanceId);
    const updatedFolderScopeItems = folders?.length === 0 ? folderScopedItemsArray.filter((groupItem) => groupItem.id === id || groupItem.folders.includes(id)) : folderScopedItemsArray.filter((groupedItem) => groupedItem.folders?.includes(folders?.[folders?.length - 1]) && (groupedItem.type === 'leaf' || groupedItem.type === 'group') && groupedItem.folders.length > folders?.length );

    const hasActiveSelection = useMemo(() => {
        const isItemActive = (itemId: string) =>
          buckets.some((bucket) => bucket.items.some((item) => item.id === itemId));
      
        return updatedFolderScopeItems.some((groupedItem) =>
            groupedItem.folderScopeItems?.length
            ? groupedItem.folderScopeItems?.some((group) =>
                group.items.some((groupItem) => isItemActive(groupItem.id))
              )
            : isItemActive(groupedItem.id)
        );
      }, [buckets, updatedFolderScopeItems]);
    
    // style
    const accentColorStyle = (
        accentColor ? { '--root-bucket-accent-color': accentColor } : {}
    ) as CSSProperties;

    // paint
    if (showFlatFolderScope)
        return (
            <>
                {folderScopeItems?.map((groupedItems, index) => (
                    <GroupedItemRenderer
                        {...rootBucketProps}
                        key={index}
                        groupedItems={groupedItems}
                    />
                ))}
            </>
        );
    
    const { group, groupLabel } = (() => {
        let resolvedGroupLabel = 'NO_GROUP';
        if (type === 'group') {
            resolvedGroupLabel = folderScopedItemsArray
                .filter((item) => item.id === groupId)?.[0]?.itemLabel as string;
        }
        return { group: resolvedGroupLabel, groupLabel: resolvedGroupLabel };
    })();

    const checkIsFolderCollapsed = () => {
        let isCollapsed = false;
        folders.forEach((folder) => {
            if (collapsedNodes[folder]) {
                isCollapsed = true;
            } 
        })
        return isCollapsed;
    }

    return (
        <div
            className="folder-scope-wrapper"
            id={`folder-scope-${folders[folders.length - 1]}`}
            style={{paddingLeft: 13 * (folders ? folders?.length : 0)}}
        >   
            {!checkIsFolderCollapsed() && ((type === 'folder' || type === 'table') ?
                <div
                    className="folder-scope-label"
                    role="button"
                    onClick={() => toggleFolderCollapse(id)}
                    title={itemLabel ?? ''}
                >
                    <div className="folder-scope-label-icon">
                        { type === 'folder' ? <Icons.folder className="folder-scope-label-table-icon" style={accentColorStyle} /> : <Icons.table className="folder-scope-label-table-icon" style={accentColorStyle} /> }
                        {hasActiveSelection && (
                            <Icons.checkMark className="folder-scope-label-table-icon checkmark-overlay" style={accentColorStyle} />
                        )}
                    </div>
                    
                    <div className="folder-scope-label-text" style={accentColorStyle}>
                        {itemLabel}
                    </div>
                    <div className="folder-scope-label-collapse-icon react-fields-keeper-mapping-column-content-action" style={accentColorStyle}>
                        {isFolderCollapsed ? (
                            <i className="fk-ms-Icon fk-ms-Icon--ChevronRight" />
                        ) : (
                            <i className="fk-ms-Icon fk-ms-Icon--ChevronDown" />
                        )}
                    </div>  
                </div> 
                : 
                (folderScopeItems?.length ? 
                    <div>
                        {folderScopeItems.map((groupedItems, index) => (
                            <GroupedItemRenderer
                                {...rootBucketProps}
                                key={index}
                                groupedItems={groupedItems}
                            />
                        ))}
                    </div> : 
                    <GroupedItemRenderer
                        {...rootBucketProps}
                        groupedItems={{ "group": group, "groupLabel": groupLabel, items: [{ id, type, folders, label: itemLabel as string }]}}
                    />
                )
            )}
        </div>
    );
}

function GroupedItemRenderer(
    props: {
        groupedItems: IGroupedFieldsKeeperItem;
    } & IFieldsKeeperRootBucketProps,
) {
    // props
    const {
        groupedItems: { group, groupLabel, items: filteredItems },
        sortGroupOrderWiseOnAssignment = true,
        getPriorityTargetBucketToFill: getPriorityTargetBucketToFillFromProps,
        instanceId: instanceIdFromProps,
        ignoreCheckBox = false,
        allowDragAfterAssignment = true,
        allowDragging = true,
        toggleCheckboxOnLabelClick = false,
        prefixNode: prefixNodeConfig,
        disableAssignments = false,
    } = props;

    const {
        allow: allowPrefixNode = false,
        reserveSpace: prefixNodeReserveSpace = true,
        reservedWidth: prefixNodeReservedWidth = 15,
    } = prefixNodeConfig ?? {};

    // state
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;
    const {
        buckets,
        getPriorityTargetBucketToFill: getPriorityTargetBucketToFillFromContext,
        allowDuplicates,
        accentColor,
        accentHighlightColor,
    } = useStoreState(instanceId);
    const updateState = useStore((state) => state.setState);
    const [isGroupCollapsed, setIsGroupCollapsed] = useState(false);

    // compute
    const hasGroup = group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID;

    // event handlers
    const onDragStartHandler =
        (...fieldItems: IFieldsKeeperItem[]) =>
        (e: React.DragEvent<HTMLDivElement>) => {
            e.dataTransfer.setData(
                FIELDS_KEEPER_CONSTANTS.FROM_BUCKET,
                FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID,
            );
            e.dataTransfer.setData(
                instanceId,
                fieldItems.map((item) => item.id).join(','),
            );
        };

    // handlers
    const checkIsFieldItemAssigned = (fieldItem: IFieldsKeeperItem) => {
        return buckets.some((bucket) =>
            bucket.items.some((item) => item.id === fieldItem.id),
        );
    };

    const customTargetBucketIdentifier =
        getPriorityTargetBucketToFillFromProps ??
        getPriorityTargetBucketToFillFromContext;
    const getPriorityTargetBucketToFill = ({
        buckets,
        currentFillingItem,
        priorityGroup,
    }: IGetPriorityTargetBucketToFillProps) => {
        if (customTargetBucketIdentifier) {
            const response = customTargetBucketIdentifier({
                buckets,
                priorityGroup,
                currentFillingItem,
            });
            if (response) return response;
        }

        if (priorityGroup) {
            const priorityGroupBucket = buckets.find((bucket) => {
                return bucket.items.some(
                    (item) => item.group === priorityGroup,
                );
            });
            if (priorityGroupBucket) return priorityGroupBucket;
        }
        const leastFilledOrderedBuckets = [...buckets]
            .filter((bucket) => {
                const currentFillingItemType = currentFillingItem[0]
                    .type as string;
                const currentBucketType = bucket.acceptTypes ?? [];
                const isTypeFilled =
                    currentBucketType.length && currentFillingItemType;
                const isValidBucketType = currentBucketType.includes(
                    currentFillingItemType,
                );
                return (
                    !bucket.disabled &&
                    ((isTypeFilled && isValidBucketType) || !isTypeFilled)
                );
            })
            .sort(
                (bucketA, bucketB) =>
                    bucketA.items.length - bucketB.items.length,
            );
        return leastFilledOrderedBuckets[0];
    };

    const onFieldItemClick =
        (fieldItems: IFieldsKeeperItem[], remove = false) =>
        () => {
            if (disableAssignments) {
                return false;
            }
            const bucketToFill = getPriorityTargetBucketToFill({
                buckets,
                priorityGroup: fieldItems[0].group,
                currentFillingItem: filteredItems,
            });
            assignFieldItems({
                instanceId,
                bucketId: bucketToFill.id,
                fromBucket: FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID,
                fieldItems,
                buckets,
                removeOnly: remove,
                sortGroupOrderWiseOnAssignment,
                allowDuplicates,
                updateState,
            });
        };

    // paint
    const renderFieldItems = ({
        fieldItems,
        isGroupItem,
        groupHeader,
    }: IGroupedItemRenderer) => {
        const { suffixNodeRenderer } = props;
        // compute
        const isGroupHeader = groupHeader !== undefined;

        // styles
        const itemStyle = (
            isGroupHeader
                ? {
                      '--root-bucket-group-items-count':
                          groupHeader.groupItems.length + 1.5,
                  }
                : {}
        ) as CSSProperties;

        // style
        const accentColorStyle = {
            '--root-bucket-accent-color': accentColor ?? '#007bff',
            '--search-highlight-text-color': accentHighlightColor ?? '#ffffff',
        } as CSSProperties;

        // paint
        return fieldItems.map((fieldItem) => {
            const isFieldItemAssigned = isGroupHeader
                ? groupHeader?.isGroupHeaderSelected
                : checkIsFieldItemAssigned(fieldItem);
            const isSuffixNodeRendererValid =
                typeof suffixNodeRenderer === 'function';
            const suffixNodeRendererOutput = isSuffixNodeRendererValid
                ? suffixNodeRenderer(fieldItem)
                : null;
            const isSuffixNodeValid =
                suffixNodeRendererOutput !== undefined &&
                suffixNodeRendererOutput !== null;

            return (
                <div
                    key={fieldItem.id}
                    className={classNames(
                        'react-fields-keeper-tooltip-wrapper',
                        {
                            'react-fields-keeper-tooltip-disabled-pointer':
                                fieldItem.rootDisabled?.active,
                        },
                    )}
                    title={
                        (fieldItem.rootDisabled?.active
                            ? fieldItem.rootDisabled?.message
                            : fieldItem.rootTooltip) ??
                        fieldItem.rootTooltip ??
                        fieldItem.label
                    }
                >
                    <div
                        className={classNames(
                            'react-fields-keeper-mapping-column-content',
                            fieldItem.rootBucketActiveNodeClassName,
                            {
                                'react-fields-keeper-mapping-column-content-offset':
                                    isGroupItem,
                                'react-fields-keeper-mapping-column-content-group-header':
                                    isGroupHeader &&
                                    !groupHeader.isGroupCollapsed,
                                'react-fields-keeper-mapping-column-content-disabled':
                                    fieldItem.rootDisabled?.active,
                                'react-fields-keeper-mapping-column-content-offset-without-checkbox':
                                    ignoreCheckBox && isGroupItem,
                                'react-fields-keeper-mapping-content-disabled':
                                    disableAssignments,
                            },
                        )}
                        style={itemStyle}
                        draggable={
                            allowDragging &&
                            !disableAssignments &&
                            (allowDragAfterAssignment
                                ? true
                                : !isFieldItemAssigned)
                        }
                        onDragStart={onDragStartHandler(
                            ...(isGroupHeader
                                ? groupHeader.groupItems
                                : [fieldItem]),
                        )}
                        onClick={
                            toggleCheckboxOnLabelClick
                                ? onFieldItemClick(
                                      isGroupHeader
                                          ? groupHeader.groupItems
                                          : [fieldItem],
                                      isFieldItemAssigned,
                                  )
                                : undefined
                        }
                    >
                        {!ignoreCheckBox && (
                            <div className="react-fields-keeper-mapping-column-content-checkbox">
                                <input
                                    type="checkbox"
                                    className="react-fields-keeper-checkbox"
                                    checked={isFieldItemAssigned}
                                    style={accentColorStyle}
                                    onChange={
                                        toggleCheckboxOnLabelClick
                                            ? undefined
                                            : onFieldItemClick(
                                                  isGroupHeader
                                                      ? groupHeader.groupItems
                                                      : [fieldItem],
                                                  isFieldItemAssigned,
                                              )
                                    }
                                    readOnly={toggleCheckboxOnLabelClick}
                                />
                            </div>
                        )}
                        <div className="react-fields-keeper-mapping-column-content-wrapper">
                            {allowPrefixNode ? (
                                (fieldItem.prefixNode !== undefined ||
                                    prefixNodeReserveSpace) && (
                                    <div
                                        className="react-fields-keeper-mapping-column-content-prefix"
                                        style={{
                                            width: prefixNodeReservedWidth,
                                            maxWidth: prefixNodeReservedWidth,
                                        }}
                                    >
                                        {fieldItem.prefixNode ===
                                        'measure-icon' ? (
                                            <Icons.measure
                                                className="folder-scope-label-measure-icon"
                                                style={{
                                                    transform:
                                                        'translateX(-3px)',
                                                    ...accentColorStyle,
                                                }}
                                            />
                                        ) : (
                                            fieldItem.prefixNode ??
                                            (isGroupHeader &&
                                            !fieldItem.hideHierarchyIcon ? (
                                                <i className="fk-ms-Icon fk-ms-Icon--Org tilt-left" />
                                            ) : null)
                                        )}
                                    </div>
                                )
                            ) : (
                                <div /> /** grid skeleton placeholder */
                            )}
                            <div
                                className="react-fields-keeper-mapping-column-content-label"
                                style={accentColorStyle}
                            >
                                <span>{fieldItem.label}</span>
                            </div>
                            {isSuffixNodeValid ? (
                                <div className="react-fields-keeper-mapping-column-content-suffix">
                                    {suffixNodeRendererOutput}
                                </div>
                            ) : (
                                <div />
                            )}
                            {isGroupHeader ? (
                                <div
                                    className={classNames(
                                        'react-fields-keeper-mapping-column-content-action',
                                    )}
                                    role="button"
                                    onClick={groupHeader.onGroupHeaderToggle}
                                    style={accentColorStyle}
                                >
                                    {groupHeader.isGroupCollapsed ? (
                                        <i className="fk-ms-Icon fk-ms-Icon--ChevronRight" />
                                    ) : (
                                        <i className="fk-ms-Icon fk-ms-Icon--ChevronDown" />
                                    )}
                                </div>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>
                </div>
            );
        });
    };

    if (hasGroup) {
        let rootDisabled = filteredItems.find(
            (item) => item.rootDisabled?.active,
        )?.rootDisabled;

        const shouldDisabledGroupLabel =
            filteredItems.length > 1
                ? rootDisabled?.disableGroupLabel ?? true
                : true;

        if (rootDisabled) {
            rootDisabled = {
                ...rootDisabled,
                active: shouldDisabledGroupLabel,
            };
        }

        const groupHeaderFieldItem: IFieldsKeeperItem = {
            label: groupLabel,
            id: group,
            group,
            groupLabel,
            rootDisabled,
        };

        return (
            <>
                {renderFieldItems({
                    fieldItems: [groupHeaderFieldItem],
                    groupHeader: {
                        isGroupHeaderSelected:
                            filteredItems.some(
                                (item) =>
                                    item.rootDisabled?.active !== true &&
                                    checkIsFieldItemAssigned(item),
                            ) || checkIsFieldItemAssigned(groupHeaderFieldItem),
                        groupItems: filteredItems,
                        isGroupCollapsed,
                        onGroupHeaderToggle: () =>
                            setIsGroupCollapsed(!isGroupCollapsed),
                    },
                })}
                {!isGroupCollapsed &&
                    renderFieldItems({
                        fieldItems: filteredItems,
                        isGroupItem: true,
                    })}
            </>
        );
    }
    return <>{renderFieldItems({ fieldItems: filteredItems })}</>;
}
