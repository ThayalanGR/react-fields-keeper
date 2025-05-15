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
        sortBasedOnFolder = true,
    } = props;

    const [collapsedNodes, setCollapsedNodes] = useState<
        Record<string, boolean>
    >({});

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
    const hasSearchQuery = (customSearchQuery ?? searchQuery) !== '';
    const folderScopedItems = useMemo<
        IFolderScopedItem<IGroupedFieldsKeeperItem>[]
    >(() => {
        const searcher = new FuzzySearch(
            allItems,
            [
                'label',
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
                        getGroupedItems(folderScopeItems ?? []) ?? [],
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
                            hasSearchQuery={hasSearchQuery}
                            folderScopedItemsArray={folderScopedItems}
                            collapsedNodes={collapsedNodes}
                            setCollapsedNodes={setCollapsedNodes}
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
                                                style={accentColorStyle}
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
        hasSearchQuery: boolean;
        folderScopedItemsArray: IFolderScopedItem<IGroupedFieldsKeeperItem>[];
        collapsedNodes: Record<string, boolean>;
        setCollapsedNodes: React.Dispatch<
            React.SetStateAction<Record<string, boolean>>
        >;
    },
) {
    // props
    const {
        folderScopedItem: { type, folderScopeItem, folderScopeItems },
        showFlatFolderScope,
        hasSearchQuery,
        folderScopedItemsArray,
        collapsedNodes,
        setCollapsedNodes,
        customClassNames,
        sortBasedOnFolder = true,
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
    const isFolderCollapsed = !hasSearchQuery && isFolderCollapsedOriginal;

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
    }, [rootBucketProps.collapseFoldersOnMount, id, setCollapsedNodes]);

    // handlers
    const toggleFolderCollapse = (id: string) => {
        setCollapsedNodes((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));

        setIsFolderCollapsed(!isFolderCollapsed);
    };

    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = rootBucketProps.instanceId ?? instanceIdFromContext;
    const { buckets, accentColor, iconColor } = useStoreState(instanceId);
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

    const checkIsFolderCollapsed = () => {
        let isCollapsed = false;
        folders?.forEach((folder) => {
            if (collapsedNodes[folder] && !hasSearchQuery) {
                isCollapsed = true;
            }
        });
        return isCollapsed;
    };

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

    return (
        <div
            className="folder-scope-wrapper"
            id={`folder-scope-${folders?.[folders.length - 1]}`}
            style={{ paddingLeft: setIndentation(folders ?? []) }}
        >
            {!checkIsFolderCollapsed() &&
                (type === 'folder' || type === 'table' ? (
                    <div>
                        <div
                            className={classNames(
                                'folder-scope-label',
                                customClassNames?.customLabelClassName,
                            )}
                            role="button"
                            onClick={() => toggleFolderCollapse(id)}
                            title={itemLabel ?? ''}
                        >
                            <div className="folder-scope-label-icon">
                                {getPrefixNodeIcon(prefixNode)}
                                {hasActiveSelection && (
                                    <Icons.checkMark
                                        className="check-mark-overlay"
                                        style={accentColorStyle}
                                    />
                                )}
                            </div>

                            <div
                                className={classNames(
                                    'folder-scope-label-text',
                                    customClassNames?.customLabelClassName,
                                )}
                                style={accentColorStyle}
                            >
                                {itemLabel}
                            </div>
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
                    />
                ))}
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
        iconColor,
    } = useStoreState(instanceId);
    const updateState = useStore((state) => state.setState);
    const [isGroupCollapsed, setIsGroupCollapsed] = useState(false);
    const [isMasterGroupCollapsed, setIsMasterGroupCollapsed] = useState(false);

    const [groupHeight, setGroupHeight] = useState(0);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

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
                fieldItems.map((item) => item.id).join(',') +
                    '***' +
                    fieldItems.map((item) => item.sourceId).join(','),
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

    const getNodeRendererOutput = (
        renderer: unknown,
        item: IFieldsKeeperItem,
        isNotGroupItem = true,
    ) => {
        const isRendererValid = typeof renderer === 'function';
        const rendererOutput =
            isRendererValid && isNotGroupItem ? renderer(item) : null;
        const isValidElement =
            rendererOutput !== undefined && rendererOutput !== null;
        return { rendererOutput, isValidElement };
    };

    // paint
    const renderFieldItems = ({
        fieldItems,
        isGroupItem,
        groupHeader,
        hasMasterGroup,
    }: IGroupedItemRenderer) => {
        const { suffixNodeRenderer, onContextMenuRenderer } = props;
        // compute
        const isGroupHeader = groupHeader !== undefined;

        // styles
        const itemStyle = (
            isGroupHeader
                ? {
                      '--root-bucket-group-items-count': groupHeight,
                  }
                : {}
        ) as CSSProperties;

        // style
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
            } else if (prefixNodeIcon === 'calculator-icon') {
                return (
                    <i
                        className="folder-scope-label-measure-icon fk-ms-Icon fk-ms-Icon--Calculator"
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

            const {
                rendererOutput: suffixNodeRendererOutput,
                isValidElement: isSuffixNodeValid,
            } = getNodeRendererOutput(suffixNodeRenderer, fieldItem);

            const {
                rendererOutput: contextMenuRendererOutput,
                isValidElement: isContextMenuValid,
            } = getNodeRendererOutput(
                onContextMenuRenderer,
                fieldItem,
                !isGroupItem,
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
                    !isGroupItem &&
                    !isGroupHeader
                ) {
                    return {
                        [customClassNames.customFieldItemClassName]: true,
                    };
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
                        setIsContextMenuOpen(true);
                    }}
                >
                    <div
                        className={classNames(
                            'react-fields-keeper-mapping-column-content',
                            fieldItem.rootBucketActiveNodeClassName,
                            {
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
                            if (isGroupHeader && isCursorWithinGroupHeader) {
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
                        }}
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
                        {isContextMenuOpen && isContextMenuValid && (
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
                        })}

                    {!isMasterGroupCollapsed &&
                        !isGroupCollapsed &&
                        renderFieldItems({
                            fieldItems: filteredItems,
                            isGroupItem: true,
                            hasMasterGroup: (flatGroup &&
                                flatGroup !==
                                    FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID) as boolean,
                        })}
                </div>
            </>
        );
    }
    return <>{renderFieldItems({ fieldItems: filteredItems })}</>;
}
