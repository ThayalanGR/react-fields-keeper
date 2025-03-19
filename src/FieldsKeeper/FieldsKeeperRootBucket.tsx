// imports
import React, {
    CSSProperties,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import FuzzySearch from 'fuzzy-search';
import classNames from 'classnames';

import tableIcon from '../assets/icons/tableIcon.svg';
import checkMarkIcon from '../assets/icons/checkMarkIcon.svg';
import measureIcon from '../assets/icons/measureIcon.svg';
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
    } = props;

    // refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // state
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;
    const { allItems: allOriginalItems } = useStoreState(instanceId);
    const [searchQuery, setSearchQuery] = useState('');
    const allItems = useMemo(() => {
        // should render to spot the renderers
        return allOriginalItems.filter((item) => shouldRender(item));
    }, [allOriginalItems, shouldRender]);

    // compute
    const defaultFolderScope = '___DEFAULT';
    const hasCustomSearchQuery = customSearchQuery !== undefined;
    const hasSearchQuery = (customSearchQuery ?? searchQuery) !== '';
    const folderScopedItems = useMemo<
        IFolderScopedItem<IGroupedFieldsKeeperItem>[]
    >(() => {
        const searcher = new FuzzySearch(allItems, ['label', 'id'], {
            sort: true,
        });
        const currentItems = searcher.search(customSearchQuery ?? searchQuery);

        const newFolderScopedItemsMapping = currentItems.reduce((acc, curr) => {
            const folderScope = curr.folderScope ?? defaultFolderScope;
            const folderScopeLabel = curr.folderScopeLabel ?? 'Default';
            if (!acc.has(folderScope)) {
                acc.set(folderScope, {
                    folderScope,
                    folderScopeLabel,
                    folderScopeItems: [],
                });
            }
            acc.get(folderScope)?.folderScopeItems.push(curr);
            return acc;
        }, new Map<string, IFolderScopedItem>());

        // folder scoped grouped items
        const newFolderScopedItems = Array.from(
            newFolderScopedItemsMapping.values(),
        ).map(({ folderScope, folderScopeItems, folderScopeLabel }) => {
            return {
                folderScope,
                folderScopeLabel,
                folderScopeItems: getGroupedItems(folderScopeItems),
            } satisfies IFolderScopedItem<IGroupedFieldsKeeperItem>;
        });

        return newFolderScopedItems;
    }, [customSearchQuery, searchQuery, allItems]);

    const showFlatFolderScope =
        folderScopedItems.length === 1 &&
        folderScopedItems[0].folderScope === defaultFolderScope;

    // actions
    const onClearSearchQuery = () => {
        setSearchQuery('');
        searchInputRef.current?.focus();
        onClearSearch?.();
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
                />
            ) : (
                <div />
            )}
            <div
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
                          />
                      ))
                    : !disableEmptyFilterMessage && (
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
    },
) {
    // props
    const {
        folderScopedItem: { folderScope, folderScopeItems, folderScopeLabel },
        showFlatFolderScope,
        hasSearchQuery,
        ...rootBucketProps
    } = props;

    // state
    const [isFolderCollapsedOriginal, setIsFolderCollapsed] = useState(
        rootBucketProps.collapseFoldersOnMount ?? true,
    );
    const [isAnyoneFieldSelected, setIsAnyoneFieldSelected] = useState(false);
    const isFolderCollapsed = !hasSearchQuery && isFolderCollapsedOriginal;

    // handlers
    const toggleFolderCollapse = () =>
        setIsFolderCollapsed((collapsed) => !collapsed);

    const { instanceId: instanceIdFromContext } = useContext(FieldsKeeperContext);
    const instanceId = rootBucketProps.instanceId ?? instanceIdFromContext;
    const { buckets } = useStoreState(instanceId);

    useMemo(() => {
        const isAnySelected = folderScopeItems.some((groupedItem) =>
            groupedItem.items.some((item) =>
                buckets.some((bucket) =>
                    bucket.items.some((bucketItem) => bucketItem.id === item.id)
                )
            )
        );
        setIsAnyoneFieldSelected(isAnySelected);
    }, [folderScopeItems, buckets]);

    // paint
    if (showFlatFolderScope)
        return (
            <>
                {folderScopeItems.map((groupedItems, index) => (
                    <GroupedItemRenderer
                        {...rootBucketProps}
                        key={index}
                        groupedItems={groupedItems}
                    />
                ))}
            </>
        );

    return (
        <div
            className="folder-scope-wrapper"
            id={`folder-scope-${folderScope}`}
        >
            <div
                className="folder-scope-label"
                role="button"
                onClick={toggleFolderCollapse}
                title={folderScopeLabel ?? ''}
            >
                <div className="folder-scope-label-icon">
                    <img src={tableIcon} alt="Table Icon" />
                    {isAnyoneFieldSelected && (
                        <img src={checkMarkIcon} alt="checkMarkIcon" className="checkmark-overlay" />
                    )}
                </div>
                <div className="folder-scope-label-text">
                    {folderScopeLabel}
                </div>
                <div className="folder-scope-label-collapse-icon react-fields-keeper-mapping-column-content-action">
                    {isFolderCollapsed ? (
                        <i className="fk-ms-Icon fk-ms-Icon--ChevronRight" />
                    ) : (
                        <i className="fk-ms-Icon fk-ms-Icon--ChevronDown" />
                    )}
                </div>
            </div>
            {!isFolderCollapsed && (
                <div className="folder-scope-items">
                    {folderScopeItems.map((groupedItems, index) => (
                        <GroupedItemRenderer
                            {...rootBucketProps}
                            key={index}
                            groupedItems={groupedItems}
                        />
                    ))}
                </div>
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
            if(disableAssignments){
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
                          groupHeader.groupItems.length + 1,
                  }
                : {}
        ) as CSSProperties;

        // paint
        return fieldItems.map((fieldItem) => {
            const isFieldItemAssigned = isGroupHeader
                ? groupHeader?.isGroupHeaderSelected
                : checkIsFieldItemAssigned(fieldItem);
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
                                'react-fields-keeper-mapping-content-disabled': disableAssignments
                            },
                        )}
                        style={itemStyle}
                        draggable={
                            allowDragging && !disableAssignments &&
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
                                    checked={isFieldItemAssigned}
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
                            {allowPrefixNode && !isGroupHeader ? (
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
                                            <img
                                                src={measureIcon}
                                                style={{
                                                    transform:
                                                        'translateX(-3px)',
                                                }}
                                            />
                                        ) : (
                                            fieldItem.prefixNode ?? null
                                        )}
                                    </div>
                                )
                            ) : (
                                <div /> /** grid skeleton placeholder */
                            )}
                            <div className="react-fields-keeper-mapping-column-content-label">
                                {fieldItem.label}
                            </div>
                            {suffixNodeRenderer !== undefined ? (
                                <div className="react-fields-keeper-mapping-column-content-suffix">
                                    {suffixNodeRenderer(fieldItem)}
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

        return (
            <>
                {renderFieldItems({
                    fieldItems: [
                        {
                            label: groupLabel,
                            id: group,
                            group,
                            groupLabel,
                            rootDisabled,
                        },
                    ],
                    groupHeader: {
                        isGroupHeaderSelected: filteredItems.some(
                            (item) =>
                                item.rootDisabled?.active !== true &&
                                checkIsFieldItemAssigned(item),
                        ),
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
