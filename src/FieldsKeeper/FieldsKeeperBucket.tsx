import { useState, useMemo, CSSProperties, useContext, Fragment } from 'react';
import classNames from 'classnames';

import {
    IFieldsKeeperBucket,
    IFieldsKeeperBucketProps,
    IFieldsKeeperItem,
} from './FieldsKeeper.types';
import { IGroupedFieldsKeeperItem, IGroupedItemRenderer } from '..';
import {
    ContextSetState,
    FIELDS_KEEPER_CONSTANTS,
    FieldsKeeperContext,
    StateUpdateInfo,
    useStore,
    useStoreState,
} from './FieldsKeeper.context';
import { getGroupedItems } from './utils';

export const FieldsKeeperBucket = (props: IFieldsKeeperBucketProps) => {
    // props
    const {
        id,
        label,
        disabled = false,
        emptyFieldPlaceholder = 'Add data fields here',
        sortGroupOrderWiseOnAssignment = true,
        instanceId: instanceIdFromProps,
        showExtendedAssignmentPlaceholder = false,
        centerAlignPlaceholder = false,
        placeHolderWrapperClassName,
        wrapperClassName,

        orientation = 'vertical',
        horizontalFillOverflowType = 'scroll',
    } = props;

    // state
    const [isCurrentFieldActive, setIsCurrentFieldActive] = useState(false);
    const updateState = useStore((state) => state.setState);
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;

    const {
        allItems,
        buckets,
        allowDuplicates,
        receiveFieldItemsFromInstances = [],
    } = useStoreState(instanceId);

    // compute
    const { currentBucket, groupedItems } = useMemo<{
        groupedItems: IGroupedFieldsKeeperItem[];
        currentBucket: IFieldsKeeperBucket | undefined;
    }>(() => {
        const bucket = buckets.find((bucket) => bucket.id === id);
        if (!bucket) return { groupedItems: [], currentBucket: bucket };

        // group items
        return {
            groupedItems: getGroupedItems(bucket.items),
            currentBucket: bucket,
        };
    }, [buckets, id]);

    if (!currentBucket) return null;
    const { maxItems = Number.MAX_SAFE_INTEGER } = currentBucket;

    const onFieldItemRemove =
        (...fieldItems: IFieldsKeeperItem[]) =>
        () =>
            assignFieldItems({
                instanceId,
                bucketId: id,
                fromBucket: id,
                buckets,
                fieldItems,
                sortGroupOrderWiseOnAssignment,
                updateState,
                removeOnly: true,
                allowDuplicates,
                removeIndex:
                    fieldItems.length === 1
                        ? fieldItems[0]._fieldItemIndex
                        : undefined,
            });

    // event handlers
    const onDragLeaveHandler = () => {
        setIsCurrentFieldActive(false);
    };

    const onDragEnterHandler = () => {
        setIsCurrentFieldActive(true);
    };

    const onDragOverHandler = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDragEnterHandler();
    };

    const getFieldItemIds = (e: React.DragEvent<HTMLDivElement>) => {
        const lookupInstanceIds: string[] = [
            instanceId,
            ...receiveFieldItemsFromInstances,
        ];
        const fieldItemIndex = e.dataTransfer.getData(
            FIELDS_KEEPER_CONSTANTS.FIELD_ITEM_INDEX,
        );
        const fromBucket = e.dataTransfer.getData(
            FIELDS_KEEPER_CONSTANTS.FROM_BUCKET,
        );
        const foundInstanceId = lookupInstanceIds.find((currentInstanceId) => {
            const foundId = e.dataTransfer.getData(currentInstanceId);
            return foundId;
        });

        const foundInstanceIdChunk = foundInstanceId
            ? e.dataTransfer.getData(foundInstanceId)
            : '';

        const fieldItemIds = (foundInstanceIdChunk ?? '').split(',');

        return { fieldItemIds, fromBucket, fieldItemIndex };
    };

    const onDropHandler = (e: React.DragEvent<HTMLDivElement>) => {
        const { fromBucket, fieldItemIds, fieldItemIndex } = getFieldItemIds(e);
        const fieldItems = allItems.filter((item) =>
            fieldItemIds.some((fieldItemId) => item.id === fieldItemId),
        );
        if (fieldItems.length)
            assignFieldItems({
                instanceId,
                bucketId: id,
                buckets,
                sortGroupOrderWiseOnAssignment,
                fieldItems,
                allowDuplicates,
                fromBucket,
                removeIndex:
                    fieldItems.length === 1 && fieldItemIndex
                        ? +fieldItemIndex
                        : undefined,
                updateState,
            });
        onDragLeaveHandler();
    };

    // compute
    const hasRoomForFieldAssignment = groupedItems.length < maxItems;

    // paint
    const emptyFieldPlaceholderElement = (
        <div
            className={classNames(
                'react-fields-keeper-mapping-content-input-placeholder',
                { 'center-align': centerAlignPlaceholder },
                placeHolderWrapperClassName,
            )}
        >
            {emptyFieldPlaceholder}
        </div>
    );
    if (!currentBucket) return null;
    return (
        <div
            className={classNames(
                'react-fields-keeper-mapping-content',
                wrapperClassName,
            )}
        >
            {label && (
                <div className="react-fields-keeper-mapping-content-title">
                    {label}
                </div>
            )}
            <div
                className={classNames(
                    'react-fields-keeper-mapping-content-input',
                    {
                        'react-fields-keeper-content-input-horizontal':
                            orientation === 'horizontal',
                        'react-fields-keeper-content-input-horizontal-wrap':
                            orientation === 'horizontal' &&
                            horizontalFillOverflowType === 'wrap',
                        'react-fields-keeper-mapping-content-multi-input':
                            hasRoomForFieldAssignment &&
                            !showExtendedAssignmentPlaceholder &&
                            orientation === 'vertical',
                        'react-fields-keeper-mapping-content-input-active':
                            isCurrentFieldActive,
                        'react-fields-keeper-mapping-content-disabled':
                            disabled,
                    },
                )}
                onDrop={onDropHandler}
                onDragOver={onDragOverHandler}
                onDragEnter={onDragEnterHandler}
                onDragLeave={onDragLeaveHandler}
            >
                {groupedItems.length > 0 &&
                    groupedItems.map((groupedItem, index) => (
                        <GroupedItemRenderer
                            {...props}
                            key={index}
                            groupedItem={groupedItem}
                            currentBucket={currentBucket}
                            onDragOverHandler={onDragOverHandler}
                            onFieldItemRemove={onFieldItemRemove}
                        />
                    ))}
                {(groupedItems.length === 0 ||
                    showExtendedAssignmentPlaceholder === true) &&
                    emptyFieldPlaceholderElement}
            </div>
        </div>
    );
};

const GroupedItemRenderer = (
    props: {
        currentBucket: IFieldsKeeperBucket;
        groupedItem: IGroupedFieldsKeeperItem;
        onDragOverHandler: (e: React.DragEvent<HTMLDivElement>) => void;
        onFieldItemRemove: (...fieldItem: IFieldsKeeperItem[]) => () => void;
    } & IFieldsKeeperBucketProps,
) => {
    // props
    const {
        groupedItem: { items, group, groupLabel },
        suffixNode,
        instanceId: instanceIdFromProps,
        currentBucket,
        allowRemoveFields = false,
        orientation = 'vertical',
        horizontalFillOverflowType = 'scroll',
        showAllGroupsFlat = false,
        customItemRenderer,
        onDragOverHandler,
        onFieldItemRemove,
    } = props;

    // state
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;
    const [isGroupCollapsed, setIsGroupCollapsed] = useState(false);

    // compute
    const hasGroup = group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID;

    // handlers
    // event handlers
    const onDragStartHandler =
        (
            fieldItemIndex: string,
            bucketId: string,
            fieldItems: IFieldsKeeperItem[],
        ) =>
        (e: React.DragEvent<HTMLDivElement>) => {
            e.dataTransfer.setData(
                FIELDS_KEEPER_CONSTANTS.FIELD_ITEM_INDEX,
                fieldItemIndex,
            );
            e.dataTransfer.setData(
                FIELDS_KEEPER_CONSTANTS.FROM_BUCKET,
                bucketId,
            );
            e.dataTransfer.setData(
                instanceId,
                fieldItems.map((item) => item.id).join(','),
            );
        };

    // paint
    const renderFieldItems = ({
        fieldItems,
        isGroupItem,
        groupHeader,
    }: IGroupedItemRenderer) => {
        // compute
        const { suffixNodeRenderer } = props;

        const isGroupHeader = groupHeader !== undefined;

        // styles
        const itemStyle = (
            isGroupHeader
                ? {
                      '--bucket-group-items-count':
                          groupHeader.groupItems.length + 1,
                  }
                : {}
        ) as CSSProperties;

        // paint
        return fieldItems.map((fieldItem, fieldIndex) => {
            // handlers
            const remove = onFieldItemRemove(
                ...(isGroupHeader ? groupHeader.groupItems : [fieldItem]),
            );
            const getDefaultItemRenderer = () => {
                const groupCollapseButton = isGroupHeader && (
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
                );
                return (
                    <Fragment>
                        <div className="react-fields-keeper-mapping-content-input-filled-value">
                            {fieldItem.label}
                        </div>
                        <div className="react-fields-keeper-mapping-content-action-buttons">
                            {orientation === 'vertical' && groupCollapseButton}
                            {suffixNodeRenderer !== undefined && (
                                <div className="react-fields-keeper-mapping-content-action-suffixNode">
                                    {suffixNodeRenderer({bucketId: currentBucket.id, fieldItem})}
                                </div>
                            )}
                            {suffixNode ||
                                (allowRemoveFields && (
                                    <div
                                        className={classNames(
                                            'react-fields-keeper-mapping-content-input-filled-close',
                                        )}
                                        role="button"
                                        onClick={remove}
                                    >
                                        <i className="fk-ms-Icon fk-ms-Icon--ChromeClose" />
                                    </div>
                                ))}
                            {orientation === 'horizontal' &&
                                groupCollapseButton}
                        </div>
                    </Fragment>
                );
            };

            // paint
            return (
                <div
                    key={`${fieldItem.id}-${fieldIndex}`}
                    className={classNames(
                        'react-fields-keeper-tooltip-wrapper',
                        {
                            'react-fields-keeper-tooltip-disabled-pointer':
                                fieldItem.disabled?.active,
                        },
                    )}
                    title={
                        (fieldItem.disabled?.active
                            ? fieldItem.disabled?.message
                            : fieldItem.tooltip) ?? fieldItem.tooltip
                    }
                >
                    <div
                        className={classNames(
                            'react-fields-keeper-mapping-content-input-filled',
                            fieldItem.activeNodeClassName,
                            {
                                'react-fields-keeper-mapping-content-input-filled-offset':
                                    isGroupItem,
                                'react-fields-keeper-mapping-content-input-filled-group-header':
                                    isGroupHeader,
                                'react-fields-keeper-mapping-content-input-filled-disabled':
                                    fieldItem.disabled?.active,
                                'react-fields-keeper-mapping-content-input-filled-custom-renderer':
                                    customItemRenderer !== undefined,
                            },
                        )}
                        style={itemStyle}
                        draggable
                        onDragStart={onDragStartHandler(
                            (fieldItem._fieldItemIndex ?? '') + '',
                            currentBucket.id,
                            isGroupHeader
                                ? groupHeader.groupItems
                                : [fieldItem],
                        )}
                        onDragOver={onDragOverHandler}
                    >
                        {customItemRenderer !== undefined
                            ? customItemRenderer({
                                  bucketId: currentBucket.id,
                                  fieldItem,
                                  remove,
                                  getDefaultItemRenderer,
                              })
                            : getDefaultItemRenderer()}
                    </div>
                </div>
            );
        });
    };

    if (hasGroup && !showAllGroupsFlat) {
        let disabled = items.find((item) => item.disabled?.active)?.disabled;

        const shouldDisabledGroupLabel =
            items.length > 1 ? disabled?.disableGroupLabel ?? true : true;

        if (disabled) {
            disabled = {
                ...disabled,
                active: shouldDisabledGroupLabel,
            };
        }

        return (
            <div
                className={classNames(
                    'react-fields-keeper-mapping-content-input-filled-group',
                    {
                        'react-fields-keeper-mapping-content-input-filled-group-horizontal':
                            orientation === 'horizontal',
                        'group-wrap': horizontalFillOverflowType === 'wrap',
                    },
                )}
            >
                {/* group header */}
                {renderFieldItems({
                    fieldItems: [
                        {
                            label: groupLabel,
                            id: group,
                            group,
                            groupLabel,
                            disabled,
                        },
                    ],
                    groupHeader: {
                        groupItems: items,
                        isGroupCollapsed,
                        onGroupHeaderToggle: () =>
                            setIsGroupCollapsed(!isGroupCollapsed),
                    },
                })}
                {/* group sub items */}
                {!isGroupCollapsed &&
                    renderFieldItems({
                        fieldItems: items,
                        isGroupItem: true,
                    })}
            </div>
        );
    }
    return <>{renderFieldItems({ fieldItems: items })}</>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function checkAndMaintainMaxItems(
    bucket: IFieldsKeeperBucket,
    previousBucketItemsLength: number,
) {
    const { maxItems = Number.MAX_SAFE_INTEGER } = bucket;

    // check if the bucket has no items, then slice it from from top
    if (previousBucketItemsLength === 0) {
        const retainedItems = bucket.items.slice(0, maxItems);
        const restrictedItems = bucket.items.slice(maxItems);
        bucket.items = retainedItems;
        return restrictedItems;
    } else {
        // only hold last added item, remove first added items, make sure the lower boundary is not crossed
        const retainedItems = bucket.items.slice(
            Math.max(bucket.items.length - maxItems, 0),
        );
        const restrictedItems = bucket.items.slice(
            0,
            Math.max(bucket.items.length - maxItems, 0),
        );
        bucket.items = retainedItems;
        return restrictedItems;
    }
}

// eslint-disable-next-line react-refresh/only-export-components
export function assignFieldItems(props: {
    instanceId: string;
    bucketId: string | null;
    fromBucket: string;
    buckets: IFieldsKeeperBucket[];
    fieldItems: IFieldsKeeperItem[];
    updateState: ContextSetState;
    removeOnly?: boolean;
    sortGroupOrderWiseOnAssignment?: boolean;
    allowDuplicates?: boolean;
    removeIndex?: number;
}) {
    // props
    const {
        instanceId,
        bucketId,
        buckets,
        fieldItems: currentFieldItems,
        updateState,
        removeOnly = false,
        sortGroupOrderWiseOnAssignment = false,
        allowDuplicates = false,
        removeIndex,
        fromBucket: fromBucketId,
    } = props;

    const newBuckets = [...buckets];

    const requiredFieldItems = currentFieldItems.filter(
        (item) => (item.rootDisabled ?? item.disabled)?.active !== true,
    );

    // compute
    // removes items from bucket
    const filterItemsFromBucket = (
        bucket: IFieldsKeeperBucket,
        restrictedItems: IFieldsKeeperItem[] = [],
    ) => {
        if (removeIndex !== undefined && bucket.id === fromBucketId) {
            bucket.items.splice(removeIndex, requiredFieldItems.length);
        } else {
            bucket.items = bucket.items.filter(
                (item) =>
                    requiredFieldItems.some(
                        (fieldItem) => fieldItem.id === item.id,
                    ) === false ||
                    restrictedItems.some(
                        (fieldItem) => fieldItem.id === item.id,
                    ),
            );
        }
    };

    const targetBucket = newBuckets.find((bucket) => bucket.id === bucketId);
    const fromBucket = newBuckets.find((bucket) => bucket.id === fromBucketId);

    if (removeOnly) {
        // only remove the item from bucket
        if (fromBucketId === FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID) {
            newBuckets.forEach((bucket) => {
                filterItemsFromBucket(bucket);
                if (sortGroupOrderWiseOnAssignment)
                    sortBucketItemsBasedOnGroupOrder(bucket.items);
            });
        } else {
            if (fromBucket) filterItemsFromBucket(fromBucket);
        }
    } else {
        // insert new item into bucket
        if (!targetBucket) return;
        // check if the item type is accepted by the bucket
        if (
            !requiredFieldItems.every((item) => {
                // default case
                if (
                    !targetBucket.acceptTypes ||
                    !targetBucket.acceptTypes.length
                )
                    return true;
                if (!item.type) return true;
                // check if the item type is accepted by the bucket
                return targetBucket.acceptTypes.includes(item.type);
            })
        )
            return;
        const targetBucketItemsPreviousLength = targetBucket.items.length;

        if (fromBucketId === FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID) {
            // assignment from root bucket
            // clear previously assigned items if any in any of the buckets
            if (!allowDuplicates)
                newBuckets.forEach((bucket) => filterItemsFromBucket(bucket));

            targetBucket.items.push(...requiredFieldItems);

            checkAndMaintainMaxItems(
                targetBucket,
                targetBucketItemsPreviousLength,
            );

            if (sortGroupOrderWiseOnAssignment)
                sortBucketItemsBasedOnGroupOrder(targetBucket.items);
        } else {
            const isAssignmentFromSameBucket = fromBucketId === targetBucket.id;

            if (isAssignmentFromSameBucket) {
                if (!allowDuplicates) filterItemsFromBucket(targetBucket);

                targetBucket.items.push(...requiredFieldItems);

                checkAndMaintainMaxItems(
                    targetBucket,
                    targetBucketItemsPreviousLength,
                );

                if (sortGroupOrderWiseOnAssignment)
                    sortBucketItemsBasedOnGroupOrder(targetBucket.items);
            } else {
                // assignment from sibling bucket
                targetBucket.items.push(...requiredFieldItems);

                const restrictedItems = checkAndMaintainMaxItems(
                    targetBucket,
                    targetBucketItemsPreviousLength,
                );

                if (sortGroupOrderWiseOnAssignment)
                    sortBucketItemsBasedOnGroupOrder(targetBucket.items);

                // fromBucket cleanup
                if (fromBucket) {
                    filterItemsFromBucket(fromBucket, restrictedItems);

                    if (sortGroupOrderWiseOnAssignment)
                        sortBucketItemsBasedOnGroupOrder(fromBucket.items);
                }
            }
        }
    }

    const updateInfo: StateUpdateInfo = {
        fieldItems: requiredFieldItems,
        fromBucket: fromBucket?.id,
        targetBucket: targetBucket?.id,
        isRemoved: removeOnly,
    };

    // update context
    updateState(instanceId, { buckets: newBuckets }, updateInfo);
}

// eslint-disable-next-line react-refresh/only-export-components
export function sortBucketItemsBasedOnGroupOrder(
    items: IFieldsKeeperItem[],
): IFieldsKeeperItem[] {
    // grouping based on the group property
    const chunkGroups = items.reduce<
        { group: string; items: IFieldsKeeperItem[] }[]
    >((result, current, index) => {
        let groupBucket = result.find(
            (item) => item.group === (current.group ?? index.toString()),
        );
        if (!groupBucket) {
            groupBucket = {
                group: current.group ?? index.toString(),
                items: [],
            };
            result.push(groupBucket);
        }
        groupBucket.items.push(current);
        return result;
    }, []);

    // sorting if found valid groups
    const sortedItems = chunkGroups.reduce<IFieldsKeeperItem[]>(
        (result, current) => {
            if (current.items.length > 1) {
                // sort the groups based on group order
                current.items.sort((itemA, itemB) => {
                    if (
                        itemA.groupOrder !== undefined &&
                        itemB.groupOrder !== undefined
                    ) {
                        return itemA.groupOrder - itemB.groupOrder;
                    }
                    return 0;
                });
            }
            result.push(...current.items);
            return result;
        },
        [],
    );

    return sortedItems;
}
