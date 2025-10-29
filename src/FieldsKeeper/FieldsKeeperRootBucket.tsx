// imports
import React, {
    CSSProperties,
    ReactNode,
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
    getStoreState,
    useStore,
    useStoreState,
} from './FieldsKeeper.context';
import { FieldsKeeperSearcher } from './FieldsKeeperSearcher';
import {
    DOUBLE_CLICK_THRESHOLD,
    FIELD_DELIMITER,
    getFolderIdsFromValues,
    getGroupedItems,
    getNodeRendererOutput,
    IHighlightInfo,
} from './utils';
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
        sortBasedOnFolder = true,
        onFolderStateChange,
        initialFolderStates,
    } = props;

    const [collapsedNodes, setCollapsedNodes] = useState<
        Record<string, boolean>
    >(initialFolderStates || {});

    // refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const contentContainerRef = useRef<HTMLDivElement>(null);
    // state
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;
    const {
        allItems: allOriginalItems,
        accentColor,
        iconColor,
        foldersMeta,
    } = useStoreState(instanceId);
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
    const folderScopedItems = useMemo<
        IFolderScopedItem<IGroupedFieldsKeeperItem>[]
    >(() => {
        const searcher = new FuzzySearch(
            allItems,
            [
                'label',
                'folders',
                'groupLabel',
                'flatGroupLabel',
            ] satisfies (keyof IFieldsKeeperItem)[],
            {
                sort: true,
            },
        );
        const currentItems = searcher.search(customSearchQuery ?? searchQuery);

        const scopedItemsMap = currentItems.reduce((acc, curr) => {
            const itemFolders = curr.folders ?? [];

            if (curr.folderScope) {
                const folderScope = curr.folderScope ?? defaultFolderScope;
                const folderScopeLabel = curr.folderScopeLabel ?? 'Default';
                if (!acc.has(folderScope)) {
                    acc.set(folderScope, {
                        folderScope: folderScope,
                        folderScopeLabel: folderScopeLabel,
                        folderScopeItems: [],
                        type: 'folder',
                        folderScopeItem: {
                            ...curr,
                            id: folderScope,
                            label: folderScopeLabel,
                            folders: [],
                            prefixNode: 'folder-icon',
                        },
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
                            type: 'folder',
                            folderScopeItem: {
                                ...curr,
                                id: folderId,
                                label: folderMeta?.label as string,
                                folders:
                                    itemFolders.length > 1 && acc.size > 0
                                        ? itemFolders.slice(0, folderIndex)
                                        : [],
                                prefixNode: folderMeta?.prefixNodeIcon,
                            },
                        });
                    }
                    if (
                        folderIndex === itemFolders.length - 1 &&
                        sortBasedOnFolder
                    ) {
                        const currentFolder = acc.get(folderName);
                        currentFolder?.folderScopeItems?.push(curr);
                    }
                });
            }
            if (sortBasedOnFolder === false || itemFolders.length === 0) {
                if (
                    curr.group &&
                    curr.group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID
                ) {
                    if (!acc.has(curr.group)) {
                        acc.set(curr.group, {
                            folderScopeLabel: curr.groupLabel as string,
                            folderScopeItems: [],
                            type: 'group',
                            folderScopeItem: {
                                ...curr,
                                folders: curr.folderScope
                                    ? [curr.folderScope]
                                    : [...itemFolders],
                            },
                        });
                    }
                    const currentGroup = acc.get(curr.group);
                    currentGroup?.folderScopeItems?.push(curr);
                } else if (!acc.has(curr.id)) {
                    acc.set(curr.id, {
                        type: 'leaf',
                        folderScopeItem: {
                            ...curr,
                            folders: curr.folderScope
                                ? [curr.folderScope]
                                : [...itemFolders],
                        },
                    });
                }
            }

            return acc;
        }, new Map<string, IFolderScopedItem>());

        const scopeItemValues = Array.from(scopedItemsMap.values());
        const newRefactorFolderScopedItems = scopeItemValues.map(
            ({ type, folderScopeItems, folderScopeItem }) => {
                return {
                    type,
                    folderScopeItems:
                        getGroupedItems(
                            folderScopeItems ?? [],
                            allItems,
                            true,
                        ) ?? [],
                    folderScopeItem,
                } satisfies IFolderScopedItem<IGroupedFieldsKeeperItem>;
            },
        );

        return newRefactorFolderScopedItems;
    }, [
        customSearchQuery,
        searchQuery,
        allItems,
        foldersMeta,
        sortBasedOnFolder,
    ]);

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
        accentColor ? { '--bucket-accent-color': accentColor } : {}
    ) as CSSProperties;

    const iconColorStyle = (
        iconColor ? { '--bucket-icon-color': iconColor } : {}
    ) as CSSProperties;

    const onExpandCollapseAll = (isCollapse: boolean) => {
        const collapsedFolders: Record<string, boolean> = {};
        folderScopedItems.map((folderItem) => {
            if (folderItem.folderScopeItem) {
                const folderId = folderItem.folderScopeItem.id as string;
                collapsedFolders[folderId] = isCollapse;
            }
        });
        setCollapsedNodes((prevState) => {
            const newState = {
                ...prevState,
                ...collapsedFolders,
            };
            
            if (onFolderStateChange) {
                Object.keys(collapsedFolders).forEach(folderId => {
                    onFolderStateChange(folderId, isCollapse, newState);
                });
            }
            
            return newState;
        });
    };
    const onKeyDown = (
        e: React.KeyboardEvent<HTMLElement>,
        handler: () => void,
    ) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
        }
    };

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
                    iconColorStyle={iconColorStyle}
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
                {folderScopedItems.length > 0 ? (
                    folderScopedItems.map((folderScopedItem, index) => (
                        <FolderScopeItemRenderer
                            {...props}
                            key={index}
                            folderScopedItem={folderScopedItem}
                            showFlatFolderScope={showFlatFolderScope}
                            folderScopedItemsArray={folderScopedItems}
                            collapsedNodes={collapsedNodes}
                            setCollapsedNodes={setCollapsedNodes}
                            onExpandCollapseAll={onExpandCollapseAll}
                        />
                    ))
                ) : !hasData ? (
                    <div className="react-fields-keeper-mapping-no-search-items-found">
                        {emptyDataMessage}
                    </div>
                ) : (
                    !disableEmptyFilterMessage && (
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
                                                tabIndex={0}
                                                aria-label="Clear search"
                                                style={accentColorStyle}
                                                onKeyDown={(
                                                    e: React.KeyboardEvent<HTMLDivElement>,
                                                ) =>
                                                    onKeyDown(
                                                        e,
                                                        onClearSearchQuery,
                                                    )
                                                }
                                            >
                                                Clear search
                                            </div>
                                        )}
                                </>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

function FolderScopeItemRenderer(
    props: IFieldsKeeperRootBucketProps & {
        folderScopedItem: IFolderScopedItem<IGroupedFieldsKeeperItem>;
        showFlatFolderScope: boolean;
        folderScopedItemsArray: IFolderScopedItem<IGroupedFieldsKeeperItem>[];
        collapsedNodes: Record<string, boolean>;
        setCollapsedNodes: React.Dispatch<
            React.SetStateAction<Record<string, boolean>>
        >;
        onExpandCollapseAll: (isCollapse: boolean) => void;
    },
) {
    // props
    const {
        folderScopedItem: { type, folderScopeItem, folderScopeItems },
        showFlatFolderScope,
        folderScopedItemsArray,
        collapsedNodes,
        setCollapsedNodes,
        customClassNames,
        sortBasedOnFolder = true,
        suffixNodeRenderer,
        onContextMenuRenderer,
        onExpandCollapseAll,
        ...rootBucketProps
    } = props;

    const {
        id,
        label: itemLabel,
        folders,
        group,
        prefixNode,
    } = folderScopeItem as IFieldsKeeperItem;
    // state
    const [isFolderCollapsedOriginal, setIsFolderCollapsed] = useState(
        rootBucketProps.collapseFoldersOnMount ?? true,
    );
    const [hoveredFolderItems, setHoveredFolderItems] = useState<
        Record<string, boolean>
    >({});
    const getCrossHighlightIds = () => {
        if (rootBucketProps.crossHighlightAcrossBucket?.enabled) {
            return rootBucketProps?.crossHighlightAcrossBucket
                .crossHighlightIds;
        }
        return [];
    };
    const [crossHighlightItemIds, setCrossHighlightItemIds] = useState(
        getCrossHighlightIds(),
    );

    const [editableFolderName, setEditableFolderName] = useState<string | null>(null);
    const [editedFolderLabels, setEditedFolderLabels] = useState<Record<string, string>>({});
    const folderInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    
    const folderClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const folderClickCountRef = useRef<number>(0);

    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = rootBucketProps.instanceId ?? instanceIdFromContext;
    const {
        buckets,
        accentColor,
        iconColor,
        highlightAcrossBuckets,
        foldersMeta,
        highlightedItemId,
        setHighlightedItem,
    } = useStoreState(instanceId);
    const highlightedItem = highlightedItemId?.split(FIELD_DELIMITER)?.[0];
    const getIsItemHighlighted = (): boolean => {
        if (!folderScopeItems) return false;
        return folderScopeItems.some((scopeItem) =>
            scopeItem.items.some(
                (item) =>
                    item.id === highlightedItem ||
                    crossHighlightItemIds.includes(item.id),
            ),
        );
    };

    const isItemHighlighted =
        highlightAcrossBuckets?.enabled ||
        rootBucketProps.crossHighlightAcrossBucket?.enabled
            ? getIsItemHighlighted()
            : false;
    let isFolderCollapsed = isFolderCollapsedOriginal;
    if (isFolderCollapsed && isItemHighlighted) {
        isFolderCollapsed = false;
    }

    // effects
    useEffect(() => {
        if (rootBucketProps.collapseFoldersOnMount !== undefined) {
            setIsFolderCollapsed(rootBucketProps.collapseFoldersOnMount);
            if (rootBucketProps.collapseFoldersOnMount) {
                setCollapsedNodes((prevState) => ({
                    ...prevState,
                    [id]: true,
                }));
            }
        }
    }, [rootBucketProps.collapseFoldersOnMount, id]);

    useEffect(() => {
        if (Object.keys(collapsedNodes).includes(id)) {
            setIsFolderCollapsed(collapsedNodes[id]);
        }
    }, [collapsedNodes]);

    useEffect(() => {
        setCrossHighlightItemIds(
            rootBucketProps?.crossHighlightAcrossBucket?.crossHighlightIds ??
                [],
        );
    }, [rootBucketProps?.crossHighlightAcrossBucket?.crossHighlightIds]);

    useEffect(() => {
        if (itemLabel) {
            setEditedFolderLabels((prev) => {
                if (prev[id] !== itemLabel) {
                    return {
                        ...prev,
                        [id]: itemLabel,
                    };
                }
                return prev;
            });
        }
    }, [id, itemLabel]);

    useEffect(() => {
        if (editableFolderName === id && folderScopeItem) {
            setEditedFolderLabels((prev) => ({
                ...prev,
                [id]: itemLabel || '',
            }));
            setTimeout(() => {
                folderInputRefs.current[id]?.focus();
                folderInputRefs.current[id]?.select();
            }, 0);
        }
    }, [editableFolderName, id, itemLabel, folderScopeItem]);

    // handlers
    const toggleFolderCollapse = (
        id: string,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        const target = event?.target as HTMLElement;

        const iconClassList = [
            'fk-ms-Icon',
            'fk-ms-Icon--ChevronRight',
            'folder-scope-label-collapse-icon',
            'react-fields-keeper-mapping-column-content-action',
        ];

        const isExpansionNeeded = iconClassList.some((className) =>
            target?.classList?.contains(className),
        );

        if (
            !isExpansionNeeded &&
            rootBucketProps.onFieldItemClick &&
            folderScopeItem
        ) {
            rootBucketProps.onFieldItemClick(folderScopeItem, event);
            return; // Restricting the expand collapse functionality if onFieldItemClick is called
        }

        setHighlightedItem(instanceId, null);
        const toggleCollapse = (id: string) => {
            setCollapsedNodes((prevState) => {
                const newCollapsed = !prevState[id];
                const newState = {
                    ...prevState,
                    [id]: newCollapsed,
                };
                
                if (rootBucketProps.onFolderStateChange) {
                    rootBucketProps.onFolderStateChange(id, newCollapsed, newState);
                }
                
                return newState;
            });

            // Move highlight update logic outside of render phase
            const highlightedIds = getCrossHighlightIds();
            const folderIds = getFolderIdsFromValues(foldersMeta);
            const updatedHighlightIds = !collapsedNodes[id]
                ? [...highlightedIds.filter((id) => folderIds.includes(id))]
                : highlightedIds;
            setCrossHighlightItemIds(updatedHighlightIds);
        };

        toggleCollapse(id);
        setIsFolderCollapsed(!isFolderCollapsed);
    };

    // Folder label editing handlers
    const onFolderLabelChange = (folderId: string, newValue: string) => {
        setEditedFolderLabels((prev) => ({
            ...prev,
            [folderId]: newValue,
        }));
    };

    const onFolderLabelSave = (
        folderItem: IFieldsKeeperItem,
        isBlur: boolean,
        e?: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e && e.key !== 'Enter' && !isBlur) {
            return;
        }
        
        // Stop event propagation to prevent folder expand/collapse
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        
        const oldLabel = folderItem.label;
        const newLabel = editedFolderLabels[folderItem.id] ?? oldLabel;
        
        if (rootBucketProps.onFieldItemLabelChange && newLabel !== oldLabel) {
            rootBucketProps.onFieldItemLabelChange({
                fieldItem: folderItem,
                oldValue: oldLabel,
                newValue: newLabel,
            });
        }
        setEditableFolderName(null);
    };

    const handleFolderLabelClick = (
        folderItem: IFieldsKeeperItem,
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        folderClickCountRef.current += 1;

        if (folderClickCountRef.current === 1) {
            folderClickTimeoutRef.current = setTimeout(() => {
                if (folderClickCountRef.current === 1) {
                    toggleFolderCollapse(id, e);
                }
                folderClickCountRef.current = 0;
                folderClickTimeoutRef.current = null;
            }, DOUBLE_CLICK_THRESHOLD);
        } else if (folderClickCountRef.current === 2 && rootBucketProps.onFieldItemLabelChange) {
            if (folderClickTimeoutRef.current) {
                clearTimeout(folderClickTimeoutRef.current);
                folderClickTimeoutRef.current = null;
            }
            setEditableFolderName(folderItem.id);
            folderClickCountRef.current = 0;
        }
    };

    const checkIsFolderCollapsed = () => {
        let isCollapsed = false;
        let isHidden = false;
        folders?.forEach((folder) => {
            if (foldersMeta[folder].isHidden) {
                isHidden = true;
            }
            if (collapsedNodes[folder]) {
                isCollapsed = true;
            }
        });

        if (
            !isHidden &&
            (type === 'folder' || type === 'table') &&
            folderScopeItem?.id
        ) {
            isHidden = foldersMeta[folderScopeItem?.id].isHidden ?? false;
        }

        return { isCollapsed, isHidden };
    };

    const updatedFolderScopeItems =
        folders?.length === 0
            ? folderScopedItemsArray.filter(
                  (groupItem) =>
                      groupItem.folderScopeItem?.id === id ||
                      groupItem.folderScopeItem?.folders?.includes(id),
              )
            : folderScopedItemsArray.filter(
                  (groupedItem) =>
                      groupedItem.folderScopeItem?.folders?.includes(
                          folders?.[folders?.length - 1] as string,
                      ) &&
                      (groupedItem.type === 'leaf' ||
                          groupedItem.type === 'group') &&
                      groupedItem.folderScopeItem.folders.length >
                          (folders?.length ?? 0),
              );

    const hasActiveSelection = useMemo(() => {
        const isItemActive = (itemId: string, flatGroupId?: string) => {
            return buckets.some((bucket) =>
                bucket.items.some((item) => {
                    const defaultId = item.sourceId ?? item.id;
                    return defaultId === itemId || defaultId === flatGroupId;
                }),
            );
        };

        return updatedFolderScopeItems.some((groupedItem) =>
            groupedItem.folderScopeItems?.length
                ? groupedItem.folderScopeItems?.some((group) =>
                      group.items.some((groupItem) =>
                          isItemActive(
                              groupItem.sourceId || groupItem.id,
                              groupItem.flatGroup,
                          ),
                      ),
                  )
                : isItemActive(
                      (groupedItem.folderScopeItem?.sourceId ??
                          groupedItem.folderScopeItem?.id) as string,
                  ),
        );
    }, [buckets, updatedFolderScopeItems]);

    const [isContextMenuFolderOpen, setIsContextMenuFolderOpen] =
        useState(false);
    const [contextMenuFolderId, setContextMenuFolderId] = useState('');

    // style
    const accentColorStyle = (
        accentColor ? { '--bucket-accent-color': accentColor } : {}
    ) as CSSProperties;

    const iconColorStyle = (
        iconColor ? { '--bucket-icon-color': iconColor } : {}
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
                        suffixNodeRenderer={suffixNodeRenderer}
                        onContextMenuRenderer={onContextMenuRenderer}
                    />
                ))}
            </>
        );

    const { groupName, groupLabel } = (() => {
        let resolvedGroupLabel = 'NO_GROUP';
        if (type === 'group') {
            resolvedGroupLabel = folderScopedItemsArray.filter(
                (item) => item.folderScopeItem?.id === group,
            )?.[0]?.folderScopeItem?.label as string;
        }
        return {
            groupName: resolvedGroupLabel,
            groupLabel: resolvedGroupLabel,
        };
    })();

    const getPrefixNodeIcon = (prefixNodeIcon: ReactNode) => {
        if (React.isValidElement(prefixNode)) {
            return prefixNodeIcon;
        } else if (prefixNodeIcon === 'folder-icon') {
            return (
                <Icons.folder
                    className="folder-scope-label-table-icon"
                    style={iconColorStyle}
                />
            );
        } else if (prefixNodeIcon === 'table-icon') {
            return (
                <Icons.table
                    className="folder-scope-label-table-icon"
                    style={iconColorStyle}
                />
            );
        } else if (prefixNodeIcon === 'multi-calculator-icon') {
            return (
                <i
                    className="folder-scope-label-table-icon fk-ms-Icon fk-ms-Icon--CalculatorGroup"
                    style={iconColorStyle}
                />
            );
        } else if (prefixNodeIcon === 'calculation-group-icon') {
            return (
                <Icons.calculationGroup
                    className="folder-scope-label-calculation-group"
                    style={{
                        ...accentColorStyle,
                    }}
                />
            );
        } else if (prefixNodeIcon === 'calculation-group-item-icon') {
            return (
                <Icons.calculationGroupItem
                    className="folder-scope-label-calculation-group"
                    style={{
                        ...accentColorStyle,
                    }}
                />
            );
        } else if (prefixNodeIcon === 'planning-icon') {
            return (
                <Icons.planningIcon
                    className="folder-scope-label-planning-icon"
                    style={{
                        ...accentColorStyle,
                    }}
                />
            );
        } else if (prefixNodeIcon === 'calendar-icon') {
            return (
                <i
                    className="folder-scope-label-table-icon fk-ms-Icon fk-ms-Icon--Calculator"
                    style={iconColorStyle}
                />
            );
        } else if (prefixNodeIcon) {
            return (
                <div
                    className="folder-scope-label-table-icon"
                    style={iconColorStyle}
                >
                    {prefixNodeIcon}
                </div>
            );
        } else {
            return null;
        }
    };

    const setIndentation = (folders: string[]) => {
        const indentSize = folders.length * 13;
        return `${indentSize}px`;
    };

    const folderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            highlightAcrossBuckets?.enabled &&
            highlightedItem &&
            isItemHighlighted
        ) {
            if (folderRef.current) {
                const highlightedElement = folderRef.current.querySelector(
                    `[data-item-id="${highlightedItem}"]`,
                );
                if (highlightedElement instanceof HTMLElement) {
                    highlightedElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'start',
                    });
                }
            }
            if (isFolderCollapsedOriginal) {
                setIsFolderCollapsed(false);
                setCollapsedNodes((prevState) => ({
                    ...prevState,
                    [id]: false,
                }));
            }
        }
    }, [highlightedItem, isItemHighlighted, id, isFolderCollapsedOriginal]);

    const { isCollapsed, isHidden } = checkIsFolderCollapsed();
    const onKeyDown =
        (callback: (e: React.KeyboardEvent) => void) =>
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callback(e);
            }
        };

    return (
        <div
            ref={folderRef}
            className="folder-scope-wrapper"
            id={`folder-scope-${folders?.[folders.length - 1]}`}
            style={{ paddingLeft: setIndentation(folders ?? []) }}
        >
            {!isCollapsed &&
                !isHidden &&
                (type === 'folder' || type === 'table' ? (
                    <div>
                        <div
                            className={classNames(
                                'folder-scope-label',
                                customClassNames?.customLabelClassName,
                                foldersMeta?.[id]?.activeFolderClassName,
                            )}
                            role="button"
                            tabIndex={0}
                            aria-label={`${
                                isFolderCollapsed
                                    ? `Expand ${itemLabel ?? null}`
                                    : `Collapse ${itemLabel ?? null}`
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFolderLabelClick(folderScopeItem as IFieldsKeeperItem, e);
                            }}
                            onKeyDown={onKeyDown((e) => {
                                e.stopPropagation();
                                toggleFolderCollapse(
                                    id,
                                    e as unknown as React.MouseEvent<
                                        HTMLDivElement,
                                        MouseEvent
                                    >,
                                );
                            })}
                            title={itemLabel ?? ''}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenuFolderId(id);
                                setIsContextMenuFolderOpen(true);
                                rootBucketProps?.onFieldItemContextMenu?.(
                                    {
                                        ...folderScopeItem,
                                        type,
                                    } as IFieldsKeeperItem,
                                    e,
                                );
                            }}
                            onMouseLeave={() => {
                                if (rootBucketProps.showSuffixOnHover) {
                                    setHoveredFolderItems((prev) => {
                                        const newHoveredFolderItems = {
                                            ...prev,
                                        };
                                        delete newHoveredFolderItems[id];
                                        return Object.keys(
                                            newHoveredFolderItems,
                                        ).length === 0
                                            ? {}
                                            : newHoveredFolderItems;
                                    });
                                }
                            }}
                            onMouseOver={() => {
                                if (rootBucketProps.showSuffixOnHover) {
                                    setHoveredFolderItems((prev) => ({
                                        ...prev,
                                        [id]: true,
                                    }));
                                }
                            }}
                            style={{
                                backgroundColor: crossHighlightItemIds.includes(
                                    id,
                                )
                                    ? rootBucketProps
                                          ?.crossHighlightAcrossBucket
                                          ?.highlightColor
                                    : 'transparent',
                            }}
                        >
                            <div
                                className="folder-scope-label-collapse-icon react-fields-keeper-mapping-column-content-action"
                                style={iconColorStyle}
                            >
                                {isFolderCollapsed ? (
                                    <i className="fk-ms-Icon fk-ms-Icon--ChevronRight" />
                                ) : (
                                    <i className="fk-ms-Icon fk-ms-Icon--ChevronDown" />
                                )}
                            </div>
                            <div className="folder-scope-label-icon">
                                {getPrefixNodeIcon(prefixNode)}
                                {!React.isValidElement(prefixNode) &&
                                    hasActiveSelection && (
                                        <Icons.checkMark
                                            className="check-mark-overlay"
                                            style={accentColorStyle}
                                        />
                                    )}
                            </div>

                        {editableFolderName === id ? (
                            <input
                                ref={(el) => {
                                    folderInputRefs.current[id] = el;
                                }}
                                type="text"
                                className={classNames(
                                    'folder-scope-label-input folder-scope-label-input-custom',
                                    customClassNames?.customEditableInputClassName,
                                )}
                                value={editedFolderLabels[id] ?? itemLabel}
                                onChange={(e) => onFolderLabelChange(id, e.target.value)}
                                onKeyDown={(e) => onFolderLabelSave(folderScopeItem as IFieldsKeeperItem, false, e)}
                                onBlur={() => onFolderLabelSave(folderScopeItem as IFieldsKeeperItem, true)}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <div
                                className={classNames(
                                    'folder-scope-label-text',
                                    customClassNames?.customLabelClassName,
                                )}
                                style={accentColorStyle}
                            >
                                {editedFolderLabels[id] || itemLabel}
                            </div>
                        )}
                            <div className="folder-label-context-menu">
                                {contextMenuFolderId === id &&
                                isContextMenuFolderOpen &&
                                onContextMenuRenderer != undefined &&
                                typeof onContextMenuRenderer === 'function'
                                    ? onContextMenuRenderer({
                                          type,
                                          fieldItem: folderScopeItem,
                                          onExpandCollapseAll:
                                              onExpandCollapseAll,
                                      })
                                    : null}
                            </div>
                            <div
                                className="folder-label-suffix-content"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                style={{
                                    display:
                                        editableFolderName === id ||
                                        (rootBucketProps.showSuffixOnHover &&
                                        !hoveredFolderItems?.[id])
                                            ? 'none'
                                            : 'block',
                                }}
                            >
                                {suffixNodeRenderer != undefined &&
                                typeof suffixNodeRenderer === 'function'
                                    ? suffixNodeRenderer({
                                          type,
                                          fieldItem: folderScopeItem,
                                          onExpandCollapseAll:
                                              onExpandCollapseAll,
                                          onRenameField: () => {
                                              if (rootBucketProps.onFieldItemLabelChange) {
                                                  setEditableFolderName(id);
                                              }
                                          },
                                      })
                                    : null}
                            </div>
                        </div>
                        {!isFolderCollapsed &&
                        sortBasedOnFolder &&
                        folderScopeItems?.length ? (
                            <div className="folder-scope-items">
                                {folderScopeItems.map((groupedItems, index) => (
                                    <GroupedItemRenderer
                                        {...rootBucketProps}
                                        key={index}
                                        groupedItems={groupedItems}
                                        customClassNames={customClassNames}
                                        suffixNodeRenderer={suffixNodeRenderer}
                                        onContextMenuRenderer={
                                            onContextMenuRenderer
                                        }
                                        onExpandCollapseAll={
                                            onExpandCollapseAll
                                        }
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                ) : folderScopeItems?.length ? (
                    <div>
                        {folderScopeItems.map((groupedItems, index) => (
                            <GroupedItemRenderer
                                {...rootBucketProps}
                                key={index}
                                groupedItems={groupedItems}
                                customClassNames={customClassNames}
                                suffixNodeRenderer={suffixNodeRenderer}
                                onContextMenuRenderer={onContextMenuRenderer}
                                onExpandCollapseAll={onExpandCollapseAll}
                            />
                        ))}
                    </div>
                ) : (
                    <GroupedItemRenderer
                        {...rootBucketProps}
                        groupedItems={{
                            group: groupName,
                            groupLabel: groupLabel,
                            items: [
                                folderScopeItem ?? {
                                    id,
                                    type,
                                    folders,
                                    label: itemLabel as string,
                                },
                            ],
                        }}
                        customClassNames={customClassNames}
                        suffixNodeRenderer={suffixNodeRenderer}
                        onContextMenuRenderer={onContextMenuRenderer}
                    />
                ))}
        </div>
    );
}

function GroupedItemRenderer(
    props: {
        groupedItems: IGroupedFieldsKeeperItem;
        onExpandCollapseAll?: (isCollapsed: boolean) => void;
    } & IFieldsKeeperRootBucketProps,
) {
    // props
    const {
        groupedItems: {
            group,
            groupLabel,
            groupIcon,
            flatGroup,
            flatGroupLabel,
            flatGroupIcon,
            items: filteredItems,
        },
        sortGroupOrderWiseOnAssignment = true,
        getPriorityTargetBucketToFill: getPriorityTargetBucketToFillFromProps,
        instanceId: instanceIdFromProps,
        ignoreCheckBox = false,
        allowDragAfterAssignment = true,
        allowDragging = true,
        toggleCheckboxOnLabelClick = false,
        prefixNode: prefixNodeConfig,
        disableAssignments = false,
        customClassNames,
        isHighlightGroupOnHover = false,
        showSuffixOnHover = false,
        crossHighlightAcrossBucket,
        onFieldItemClick,
        onFieldItemLabelChange,
        onFieldItemContextMenu,
        collapseHierarchyOnMount
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
        allItems,
        buckets,
        getPriorityTargetBucketToFill: getPriorityTargetBucketToFillFromContext,
        allowDuplicates,
        accentColor,
        accentHighlightColor,
        iconColor,
        highlightedItemId,
        highlightAcrossBuckets,
    } = useStoreState(instanceId);
    const highlightedItem = highlightedItemId?.split(FIELD_DELIMITER)[0];
    const updateState = useStore((state) => state.setState);
    const [isGroupCollapsed, setIsGroupCollapsed] = useState(collapseHierarchyOnMount ?? false);
    const [isMasterGroupCollapsed, setIsMasterGroupCollapsed] = useState(() => {
        if (collapseHierarchyOnMount && (!flatGroup || flatGroup === FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID)) {
            return false;
        }
        return collapseHierarchyOnMount ?? false;
    });
    const [hoveredItems, setHoveredItems] = useState<Record<string, boolean>>({});
    
    // State to manage editable field items and their labels
    const [editableItemId, setEditableItemId] = useState<string | null>(null);
    const [editedLabels, setEditedLabels] = useState<Record<string, string>>(
        allItems.reduce((acc: Record<string, string>, item: IFieldsKeeperItem) => {
            acc[item.id] = item.label;
            return acc;
        }, {} as Record<string, string>)
    );
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    
    // Click tracking for double-click detection
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const clickCountRef = useRef<number>(0);
    const [groupHeight, setGroupHeight] = useState(0);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [contextMenuId, setContextMenuId] = useState('');

    const getInitialActiveHighlightIds = () => {
        const activeIds: Record<string, IHighlightInfo> = {};
        if (
            crossHighlightAcrossBucket?.enabled &&
            crossHighlightAcrossBucket?.crossHighlightIds?.length
        ) {
            crossHighlightAcrossBucket?.crossHighlightIds.forEach(
                (highlightedId) => {
                    activeIds[highlightedId] = {
                        enabled: crossHighlightAcrossBucket.enabled,
                        backgroundColor:
                            crossHighlightAcrossBucket.highlightColor,
                    };
                },
            );
        }
        return activeIds;
    };
    const [activeHighlightIds, setActiveHighlightIds] = useState<
        Record<string, IHighlightInfo>
    >(getInitialActiveHighlightIds());
    useEffect(() => {
        if (highlightedItem) {
            setActiveHighlightIds((prev) => ({
                ...prev,
                [highlightedItem]: {
                    enabled: true,
                    backgroundColor: highlightAcrossBuckets?.highlightColor,
                },
            }));

            const timer = setTimeout(() => {
                setActiveHighlightIds({});
            }, highlightAcrossBuckets?.highlightDuration ?? 3000);

            return () => clearTimeout(timer);
        }
    }, [highlightedItemId, instanceId]);

    useEffect(() => {
        if (crossHighlightAcrossBucket) {
            const updatedActiveIds: Record<string, IHighlightInfo> = {};
            crossHighlightAcrossBucket.crossHighlightIds.forEach(
                (highlightId) => {
                    updatedActiveIds[highlightId] = {
                        enabled: true,
                        backgroundColor:
                            crossHighlightAcrossBucket?.highlightColor as string,
                    };
                },
            );
            setActiveHighlightIds(() => ({
                ...updatedActiveIds,
            }));
            if (
                crossHighlightAcrossBucket?.enabled &&
                crossHighlightAcrossBucket?.crossHighlightIds &&
                crossHighlightAcrossBucket?.highlightDuration
            ) {
                const timer = setTimeout(() => {
                    setActiveHighlightIds({});
                }, crossHighlightAcrossBucket?.highlightDuration);

                return () => clearTimeout(timer);
            }
        }
    }, [crossHighlightAcrossBucket]);

    useEffect(() => {
        if (isContextMenuOpen) {
            const handleClick = () => {
                setIsContextMenuOpen(false);
            };
            document.addEventListener('mousedown', handleClick);
            return () => {
                document.removeEventListener('mousedown', handleClick);
            };
        }
    }, [isContextMenuOpen]);

    // Focus management for inline editing
    useEffect(() => {
        if (editableItemId && inputRefs.current[editableItemId]) {
            const input = inputRefs.current[editableItemId];
            input?.focus();
            input?.setSelectionRange(input.value.length, input.value.length);
        }
    }, [editableItemId]);

    // Update editedLabels when allItems change
    useEffect(() => {
        setEditedLabels((prev) => {
            const newLabels = { ...prev };
            allItems.forEach((item) => {
                if (!(item.id in newLabels)) {
                    newLabels[item.id] = item.label;
                }
            });
            return newLabels;
        });
    }, [allItems]);

    // Handler functions for inline editing
    const onInputFieldChange = (fieldId: string, newValue: string) => {
        setEditedLabels((prev) => ({
            ...prev,
            [fieldId]: newValue,
        }));
    };

    const onEnterKeyPress = (
        fieldItem: IFieldsKeeperItem,
        isBlur: boolean,
        fieldIndex?: number,
        e?: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e && e.key !== 'Enter' && !isBlur) {
            return;
        }
        
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        
        if (onFieldItemLabelChange && editedLabels[fieldItem.id] !== fieldItem.label) {
            onFieldItemLabelChange({
                fieldItem: fieldItem,
                oldValue: fieldItem.label,
                newValue: editedLabels[fieldItem.id] ? editedLabels[fieldItem.id] : fieldItem.label,
                fieldIndex,
            });
        }
        setEditableItemId(null);
    };

    // Handle field item click with double-click detection for label editing
    const handleFieldItemClick = (
        fieldItem: IFieldsKeeperItem,
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        clickCountRef.current += 1;

        if (clickCountRef.current === 1) {
            clickTimeoutRef.current = setTimeout(() => {
                if (clickCountRef.current === 1 && onFieldItemClick) {
                    onFieldItemClick(fieldItem, e);
                }
                clickCountRef.current = 0;
                clickTimeoutRef.current = null;
            }, DOUBLE_CLICK_THRESHOLD);
        } else if (onFieldItemLabelChange && clickCountRef.current === 2) {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
                setEditableItemId(fieldItem.id);
            clickCountRef.current = 0;
        }
    };

    // compute
    const hasGroup = group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID;

    // event handlers
    const onDragStartHandler =
        (...fieldItems: IFieldsKeeperItem[]) =>
        (e: React.DragEvent<HTMLDivElement>) => {
            // suspicious - 1
            // if (e.currentTarget) {
            //     const parent = e.currentTarget.closest('.folder-scope-wrapper') as HTMLElement;
            //     if (parent) {
            //       parent.style.overflow = 'hidden';
            //     }
            // }

            e.dataTransfer.setData(
                FIELDS_KEEPER_CONSTANTS.FROM_BUCKET,
                FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID,
            );
            e.dataTransfer.setData(
                instanceId,
                fieldItems.map((item) => item.id).join(FIELD_DELIMITER) +
                    '***' +
                    fieldItems
                        .map((item) => item.sourceId)
                        .join(FIELD_DELIMITER),
            );
        };

    // handlers
    const checkIsFieldItemAssigned = (fieldItem: IFieldsKeeperItem) => {
        return buckets.some((bucket) =>
            bucket.items.some(
                (item) => (item.sourceId ?? item.id) === fieldItem.id,
            ),
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

    const assignFieldItemToBucket = (
        fieldItems: IFieldsKeeperItem[],
        assignedField: { bucketId: string; currentInstanceId: string },
    ) => {
        const { bucketId, currentInstanceId } = assignedField || {};
        const isDifferentInstance =
            currentInstanceId && currentInstanceId !== instanceId;

        let currentBuckets = buckets;
        let currentAllItems = allItems;
        let currentFieldItems = fieldItems;
        let targetBucketId = bucketId;

        if (isDifferentInstance) {
            try {
                const storeState = getStoreState(currentInstanceId);
                currentBuckets = storeState.buckets;
                currentAllItems = storeState.allItems;

                const fieldItemIds = new Set(fieldItems.map((item) => item.id));
                const fieldItemSourceIds = new Set(
                    fieldItems.map((item) => item.sourceId).filter(Boolean),
                );

                currentFieldItems = currentAllItems.filter(
                    (item) =>
                        fieldItemIds.has(item.id) ||
                        (item.sourceId &&
                            fieldItemSourceIds.has(item.sourceId)),
                );
            } catch {
                // Keep using local `buckets` and `allItems` if store fetch fails
            }
        } else {
            if (disableAssignments) return false;

            const bucketToFill = getPriorityTargetBucketToFill({
                buckets,
                priorityGroup: fieldItems[0]?.group,
                currentFillingItem: filteredItems,
            });

            targetBucketId = bucketToFill.id;
        }

        assignFieldItems({
            instanceId: currentInstanceId || instanceId,
            bucketId: targetBucketId!,
            fromBucket: FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID,
            fieldItems: currentFieldItems,
            buckets: currentBuckets,
            removeOnly: false,
            sortGroupOrderWiseOnAssignment,
            allowDuplicates,
            updateState,
            isFieldItemClick: true,
            allItems: currentAllItems,
        });
    };

    const onFieldItemClickHandler =
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
                instanceId: instanceId,
                bucketId: bucketToFill.id,
                fromBucket: FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID,
                fieldItems,
                buckets,
                removeOnly: remove,
                sortGroupOrderWiseOnAssignment,
                allowDuplicates,
                updateState,
                isFieldItemClick: true,
                allItems: allItems,
            });
        };

    // paint
    const renderFieldItems = ({
        fieldItems,
        isGroupItem,
        groupHeader,
        hasMasterGroup,
        activeHighlightIds,
    }: IGroupedItemRenderer & {
        activeHighlightIds: Record<string, IHighlightInfo>;
    }) => {
        const {
            suffixNodeRenderer,
            onContextMenuRenderer,
            onExpandCollapseAll,
        } = props;
        const isGroupHeader = groupHeader !== undefined;

        const itemStyle = (
            isGroupHeader
                ? {
                      '--root-bucket-group-items-count': groupHeight,
                  }
                : {}
        ) as CSSProperties;

        const accentColorStyle = {
            '--bucket-accent-color': accentColor ?? '#007bff',
            '--highlight-element-color': accentHighlightColor ?? '#ffffff',
            '--bucket-icon-color': iconColor ?? '#000000',
        } as CSSProperties;

        const getPrefixNodeIconElement = (
            prefixNodeIcon: string | ReactNode,
        ) => {
            if (React.isValidElement(prefixNodeIcon)) {
                return prefixNodeIcon;
            } else if (prefixNodeIcon === 'measure-icon') {
                return (
                    <Icons.measure
                        className="folder-scope-label-measure-icon"
                        style={{
                            transform: 'translateX(-3px)',
                            ...accentColorStyle,
                        }}
                    />
                );
            } else if (prefixNodeIcon === 'calculation-group-icon') {
                return (
                    <Icons.calculationGroup
                        className="folder-scope-label-calculation-group"
                        style={{
                            transform: 'translateX(-3px)',
                            ...accentColorStyle,
                        }}
                    />
                );
            } else if (prefixNodeIcon === 'calculation-group-item-icon') {
                return (
                    <Icons.calculationGroupItem
                        className="folder-scope-label-calculation-group-item"
                        style={{
                            transform: 'translateX(-3px)',
                            ...accentColorStyle,
                        }}
                    />
                );
            } else if (prefixNodeIcon === 'calculator-icon') {
                return (
                    <i
                        className="folder-scope-label-measure-icon fk-ms-Icon fk-ms-Icon--Calculator"
                        style={{
                            ...accentColorStyle,
                        }}
                    />
                );
            } else if (prefixNodeIcon === 'globe-icon') {
                return (
                    <i
                        className="folder-scope-label-measure-icon fk-ms-Icon fk-ms-Icon--Globe"
                        style={{
                            ...accentColorStyle,
                        }}
                    />
                );
            } else if (prefixNodeIcon === 'date-icon') {
                return (
                    <i
                        className="folder-scope-label-measure-icon fk-ms-Icon fk-ms-Icon--ContactCard"
                        style={{
                            ...accentColorStyle,
                        }}
                    />
                );
            } else if (prefixNodeIcon === 'hierarchy-icon') {
                return (
                    <i
                        className="folder-scope-label-measure-icon fk-ms-Icon fk-ms-Icon--Org tilt-left"
                        style={{
                            ...accentColorStyle,
                        }}
                    />
                );
            } else if (prefixNodeIcon === 'contact-card') {
                return (
                    <i
                        className="folder-scope-label-measure-icon fk-ms-Icon fk-ms-Icon--ContactCard"
                        style={{
                            ...accentColorStyle,
                        }}
                    />
                );
            } else {
                return null;
            }
        };

        // paint
        return fieldItems.map((fieldItem) => {
            const prefixNodeIcon = isGroupHeader
                ? fieldItem.flatGroupIcon ?? fieldItem.groupIcon
                : fieldItem.prefixNode;
            const isFieldItemAssigned = isGroupHeader
                ? groupHeader?.isGroupHeaderSelected
                : checkIsFieldItemAssigned(fieldItem);

            const onRenameField = () => {
                setEditableItemId(fieldItem.id);
            };

            const {
                rendererOutput: suffixNodeRendererOutput,
                isValidElement: isSuffixNodeValid,
            } = getNodeRendererOutput(
                suffixNodeRenderer,
                fieldItem,
                isGroupHeader ? groupHeader.groupItems : [fieldItem],
                assignFieldItemToBucket,
                onExpandCollapseAll,
                onRenameField,
            );
            const {
                rendererOutput: contextMenuRendererOutput,
                isValidElement: isContextMenuValid,
            } = getNodeRendererOutput(
                onContextMenuRenderer,
                fieldItem,
                isGroupHeader ? groupHeader.groupItems : [fieldItem],
                assignFieldItemToBucket,
                onExpandCollapseAll,
            );

            const getCustomClassName = ():
                | Record<string, boolean>
                | undefined => {
                if (
                    customClassNames?.customGroupItemClassName &&
                    (isGroupItem || (hasMasterGroup && isGroupHeader))
                ) {
                    return {
                        [customClassNames.customGroupItemClassName]: true,
                    };
                }

                if (
                    customClassNames?.customFieldItemClassName &&
                    !isGroupItem
                ) {
                    return {
                        [customClassNames.customFieldItemClassName]: true,
                    };
                }
            };

            const itemId = fieldItem.sourceId ?? fieldItem.id;
            const isItemHovered = showSuffixOnHover && hoveredItems[itemId];
            const onKeyDown = (
                e: React.KeyboardEvent<HTMLElement>, // ✅ fixes "any"
                handler: () => void,
            ) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handler();
                }
            };

            return (
                <div
                    key={fieldItem.id}
                    className={classNames(
                        'react-fields-keeper-tooltip-wrapper',
                        {
                            'react-fields-keeper-tooltip-disabled-pointer':
                                fieldItem.rootDisabled?.active,
                            'react-fields-keeper-mapping-column-content-group-item':
                                isGroupItem || groupHeader,
                            'react-fields-keeper-master-group-header':
                                groupHeader?.isFlatGroupHeader,
                        },
                    )}
                    data-item-id={fieldItem.id}
                    title={
                        (fieldItem.rootDisabled?.active
                            ? fieldItem.rootDisabled?.message
                            : fieldItem.rootTooltip) ??
                        fieldItem.rootTooltip ??
                        fieldItem.label
                    }
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenuId(itemId);
                        setIsContextMenuOpen(true);
                    }}
                    style={{
                        backgroundColor: activeHighlightIds?.[fieldItem.id]
                            ? activeHighlightIds?.[fieldItem.id]
                                  ?.backgroundColor
                            : 'transparent',
                    }}
                >
                    <div
                        className={classNames(
                            'react-fields-keeper-mapping-column-content',
                            fieldItem.rootBucketActiveNodeClassName,
                            {
                                'react-fields-keeper-master-group-header-offset':
                                    groupHeader?.isFlatGroupHeader ||
                                    (isGroupHeader && !hasMasterGroup),
                                'react-fields-keeper-mapping-column-content-offset':
                                    isGroupItem ||
                                    (isGroupHeader && hasMasterGroup),
                                'react-fields-keeper-mapping-column-content-group-header':
                                    isGroupHeader &&
                                    !groupHeader.isGroupCollapsed,
                                'react-fields-keeper-mapping-column-content-disabled':
                                    fieldItem.rootDisabled?.active,
                                'react-fields-keeper-mapping-column-content-offset-without-checkbox':
                                    ignoreCheckBox && isGroupItem,
                                'react-fields-keeper-mapping-content-disabled':
                                    disableAssignments,
                                'react-fields-keeper-mapping-column-content-offset-with-master':
                                    isGroupItem && hasMasterGroup,
                                ...getCustomClassName(),
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
                        onClick={(e) => {
                            if (toggleCheckboxOnLabelClick) {
                                onFieldItemClickHandler(
                                    isGroupHeader
                                        ? groupHeader.groupItems
                                        : [fieldItem],
                                    isFieldItemAssigned,
                                )();
                            }
                            handleFieldItemClick(fieldItem, e);
                        }}
                        onContextMenu={(e) => {
                            onFieldItemContextMenu?.(fieldItem, e);
                        }}
                        onMouseLeave={() => {
                            if (showSuffixOnHover) {
                                setHoveredItems((prev) => {
                                    const newHoveredItems = { ...prev };
                                    delete newHoveredItems[itemId];
                                    return Object.keys(newHoveredItems)
                                        .length === 0
                                        ? {}
                                        : newHoveredItems;
                                });
                            }
                        }}
                        onMouseOver={(
                            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
                        ) => {
                            const currentTargetRect =
                                e.currentTarget.getClientRects();
                            const isCursorWithinGroupHeader =
                                currentTargetRect.length &&
                                e.clientY >= currentTargetRect[0]?.y &&
                                e.clientY <=
                                    currentTargetRect[0].y +
                                        currentTargetRect[0].height;
                            if (
                                isHighlightGroupOnHover &&
                                isGroupHeader &&
                                isCursorWithinGroupHeader
                            ) {
                                const groupWrapper = e.currentTarget.closest(
                                    '.react-fields-keeper-grouped-item-wrapper',
                                );
                                const folderRect =
                                    groupWrapper?.getClientRects();

                                if (groupHeader?.isFlatGroupHeader) {
                                    setGroupHeight(folderRect?.[0].height ?? 0);
                                } else {
                                    let masterHeaderHeight = 0;
                                    const hasMasterHeader =
                                        groupWrapper?.querySelector(
                                            '.react-fields-keeper-master-group-header',
                                        ) !== null;
                                    if (hasMasterHeader) {
                                        const masterHeader =
                                            document.getElementsByClassName(
                                                'react-fields-keeper-master-group-header',
                                            )[0];
                                        masterHeaderHeight =
                                            masterHeader?.getClientRects()?.[0]
                                                ?.height ?? 0;
                                    }
                                    setGroupHeight(
                                        (folderRect?.[0].height ?? 0) -
                                            masterHeaderHeight,
                                    );
                                }
                            } else {
                                setGroupHeight(0);
                            }
                            if (showSuffixOnHover) {
                                setHoveredItems((prev) => ({
                                    ...prev,
                                    [itemId]: true,
                                }));
                            }
                        }}
                    >
                        {isGroupHeader ? (
                            <div
                                className={classNames(
                                    'react-fields-keeper-mapping-column-content-action',
                                )}
                                role="button"
                                tabIndex={0}
                                aria-label={`${
                                    groupHeader.isGroupCollapsed
                                        ? `Expand ${groupLabel}`
                                        : `Collapse ${groupLabel}`
                                }`}
                                onClick={(e) => {
                                    if (toggleCheckboxOnLabelClick) {
                                        e.stopPropagation();
                                    }
                                    groupHeader.onGroupHeaderToggle();
                                }}
                                style={
                                    groupHeight > 0
                                        ? { zIndex: 1, ...accentColorStyle }
                                        : { ...accentColorStyle }
                                }
                                onKeyDown={(
                                    e: React.KeyboardEvent<HTMLDivElement>,
                                ) =>
                                    onKeyDown(
                                        e,
                                        groupHeader.onGroupHeaderToggle,
                                    )
                                }
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
                        {!ignoreCheckBox && (
                            <div className="react-fields-keeper-mapping-column-content-checkbox">
                                <input
                                    type="checkbox"
                                    className={classNames(
                                        'react-fields-keeper-checkbox',
                                        customClassNames?.customCheckBoxClassName,
                                    )}
                                    checked={isFieldItemAssigned}
                                    style={accentColorStyle}
                                    aria-label={`Select ${
                                        fieldItem?.label || 'field'
                                    }`}
                                    tabIndex={0}
                                    onChange={
                                        toggleCheckboxOnLabelClick
                                            ? undefined
                                            : onFieldItemClickHandler(
                                                  isGroupHeader
                                                      ? groupHeader.groupItems
                                                      : [fieldItem],
                                                  isFieldItemAssigned,
                                              )
                                    }
                                    onKeyDown={(e) =>
                                        onKeyDown(e, () =>
                                            onFieldItemClickHandler(
                                                isGroupHeader
                                                    ? groupHeader.groupItems
                                                    : [fieldItem],
                                                isFieldItemAssigned,
                                            )(),
                                        )
                                    }
                                    readOnly={toggleCheckboxOnLabelClick}
                                />
                            </div>
                        )}
                        <div
                            className="react-fields-keeper-mapping-column-content-wrapper"
                            style={groupHeight > 0 ? { zIndex: 1 } : {}}
                        >
                            {allowPrefixNode ? (
                                ((prefixNodeIcon !== undefined &&
                                    prefixNodeIcon != '') ||
                                    prefixNodeReserveSpace) && (
                                    <div
                                        className="react-fields-keeper-mapping-column-content-prefix"
                                        style={{
                                            width: prefixNodeReservedWidth,
                                            maxWidth: prefixNodeReservedWidth,
                                        }}
                                    >
                                        {getPrefixNodeIconElement(
                                            prefixNodeIcon,
                                        )}
                                    </div>
                                )
                            ) : (
                                <div /> /** grid skeleton placeholder */
                            )}
                            <div
                                className={classNames(
                                    'react-fields-keeper-mapping-column-content-label',
                                    customClassNames?.customLabelClassName,
                                )}
                                style={accentColorStyle}
                            >
                                {editableItemId === fieldItem.id ? (
                                    <input
                                        ref={(el) => {
                                            inputRefs.current[fieldItem.id] = el;
                                        }}
                                        className={classNames(
                                            'react-fields-keeper-mapping-content-input-edit',
                                            customClassNames?.customEditableInputClassName,
                                        )}
                                        value={editedLabels[fieldItem.id]}
                                        onChange={(e) =>
                                            onInputFieldChange(
                                                fieldItem.id,
                                                e.target.value,
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            onEnterKeyPress(
                                                fieldItem,
                                                false,
                                                undefined,
                                                e,
                                            )
                                        }
                                        onBlur={() =>
                                            onEnterKeyPress(
                                                fieldItem,
                                                true,
                                            )
                                        }
                                        onFocus={(e) => e.target.select()}
                                        autoFocus
                                    />
                                ) : (
                                    <span>{editedLabels[fieldItem.id] || fieldItem.label}</span>
                                )}
                            </div>
                            {isSuffixNodeValid && (
                                <div
                                    className="react-fields-keeper-mapping-column-content-suffix"
                                    style={{
                                        display:
                                            editableItemId === fieldItem.id ||
                                            (showSuffixOnHover && !isItemHovered)
                                                ? 'none'
                                                : 'block',
                                    }}
                                    onClick={(e) => {
                                        if (toggleCheckboxOnLabelClick) {
                                            e.stopPropagation();
                                        }
                                    }}
                                >
                                    {suffixNodeRendererOutput}
                                </div>
                            )}
                        </div>
                        {contextMenuId ===
                            (fieldItem.sourceId ?? fieldItem.id) &&
                            isContextMenuOpen &&
                            isContextMenuValid && (
                                <div className="react-fields-keeper-root-mapping-content-action-context-menu">
                                    {contextMenuRendererOutput}
                                </div>
                            )}
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
            groupIcon,
            rootDisabled,
        };

        const flatGroupHeaderItem: IFieldsKeeperItem = {
            label: flatGroupLabel as string,
            id: flatGroup as string,
            group,
            groupLabel,
            flatGroupIcon,
            rootDisabled,
        };

        const isChildrenAssignedFound =
            filteredItems.some(
                (item) =>
                    item.rootDisabled?.active !== true &&
                    checkIsFieldItemAssigned(item),
            ) || checkIsFieldItemAssigned(groupHeaderFieldItem);

        return (
            <>
                <div className="react-fields-keeper-grouped-item-wrapper">
                    {flatGroup &&
                        flatGroup !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID &&
                        renderFieldItems({
                            fieldItems: [flatGroupHeaderItem],
                            groupHeader: {
                                isGroupHeaderSelected:
                                    isChildrenAssignedFound ||
                                    checkIsFieldItemAssigned(
                                        flatGroupHeaderItem,
                                    ),
                                groupItems: filteredItems,
                                isGroupCollapsed: isMasterGroupCollapsed,
                                onGroupHeaderToggle: () => {
                                    setIsMasterGroupCollapsed(
                                        !isMasterGroupCollapsed,
                                    );
                                    setIsGroupCollapsed(!isGroupCollapsed);
                                },
                                isFlatGroupHeader: true,
                            },
                            activeHighlightIds,
                        })}

                    {!isMasterGroupCollapsed &&
                        renderFieldItems({
                            fieldItems: [groupHeaderFieldItem],
                            groupHeader: {
                                isGroupHeaderSelected: isChildrenAssignedFound,
                                groupItems: filteredItems,
                                isGroupCollapsed,
                                onGroupHeaderToggle: () =>
                                    setIsGroupCollapsed(!isGroupCollapsed),
                            },
                            hasMasterGroup: (flatGroup &&
                                flatGroup !==
                                    FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID) as boolean,
                            activeHighlightIds,
                        })}

                    {!isMasterGroupCollapsed &&
                        !isGroupCollapsed &&
                        renderFieldItems({
                            fieldItems: filteredItems,
                            isGroupItem: true,
                            hasMasterGroup: (flatGroup &&
                                flatGroup !==
                                    FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID) as boolean,
                            activeHighlightIds,
                        })}
                </div>
            </>
        );
    }
    return (
        <>
            {renderFieldItems({
                fieldItems: filteredItems,
                activeHighlightIds,
            })}
        </>
    );
}
