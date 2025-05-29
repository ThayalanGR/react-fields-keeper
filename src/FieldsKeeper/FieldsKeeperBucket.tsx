import {
    useState,
    useMemo,
    CSSProperties,
    useContext,
    Fragment,
    useRef,
    useEffect,
} from 'react';
import classNames from 'classnames';

import {
    IFieldsKeeperBucket,
    IFieldsKeeperBucketProps,
    IFieldsKeeperItem,
    ISuffixNodeRendererProps,
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
import { findGroupItemOrder, getGroupedItems } from './utils';

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
        customClassNames,
    } = props;

    // state
    const [isCurrentFieldActive, setIsCurrentFieldActive] = useState(false);
    const updateState = useStore((state) => state.setState);
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;
    const preHoveredElementRef = useRef<HTMLDivElement | null>(null);
    const activeDraggedElementRef = useRef<HTMLDivElement | null>(null);
    let isPointerAboveCenter = false;
    let hoveredFieldItemIndex = -1;

    const {
        allItems,
        buckets,
        allowDuplicates,
        receiveFieldItemsFromInstances = [],
        accentColor,
    } = useStoreState(instanceId);

    // compute
    const { currentBucket, groupedItems } = useMemo<{
        groupedItems: IGroupedFieldsKeeperItem[];
        currentBucket: IFieldsKeeperBucket | undefined;
    }>(() => {
        const bucket = buckets.find((bucket) => bucket.id === id);
        if (!bucket) return { groupedItems: [], currentBucket: bucket };

        return {
            currentBucket: bucket,
            groupedItems: getGroupedItems(bucket.items, allItems),
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
                allItems: allItems,
            });

    // event handlers
    const onDragLeaveHandler = () => {
        if (preHoveredElementRef.current) {
            preHoveredElementRef.current.style.borderBottom = 'none';
            preHoveredElementRef.current.style.borderTop = 'none';
            preHoveredElementRef.current.style.paddingBottom = '3px';
            preHoveredElementRef.current.style.marginTop = '';
        }
        setIsCurrentFieldActive(false);
    };

    const onDragEnterHandler = () => {
        setIsCurrentFieldActive(true);
    };

    const onDragOverHandler = (
        e: React.DragEvent<HTMLDivElement>,
        isParentElement = false,
        fieldItemIndex?: number,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (preHoveredElementRef.current) {
            Object.assign(preHoveredElementRef.current.style, {
                borderBottom: 'none',
                borderTop: 'none',
                paddingBottom: '3px',
                marginTop: '',
            });
        }
        const draggableParentSelectors = [
            '.react-fields-keeper-mapping-content-input-filled-group',
            '.react-fields-keeper-tooltip-wrapper',
        ];

        if (!isParentElement) {
            const hoveredElement = e.target as HTMLDivElement;

            let hoveredTargetElement = null as HTMLDivElement | null;
            for (const className of draggableParentSelectors) {
                hoveredTargetElement = hoveredElement.closest(className);
                if (hoveredTargetElement) break;
            }

            if (hoveredTargetElement) {
                if (hoveredTargetElement === activeDraggedElementRef.current) {
                    preHoveredElementRef.current = hoveredTargetElement;
                    return;
                }
                const rect = hoveredTargetElement.getBoundingClientRect();
                const hoveredElementHeight = rect.height;
                const hoveredElementTop = rect.top;

                const cursorOffsetY = e.clientY - hoveredElementTop;

                isPointerAboveCenter = cursorOffsetY < hoveredElementHeight / 2;

                const borderStyle = accentColor
                    ? `3px solid ${accentColor}`
                    : '3px solid #0078d4';
                Object.assign(
                    hoveredTargetElement.style,
                    isPointerAboveCenter
                        ? {
                              borderTop: borderStyle,
                              borderBottom: 'none',
                              paddingBottom: '3px',
                              marginTop: '-3px',
                          }
                        : {
                              borderBottom: borderStyle,
                              borderTop: 'none',
                              paddingBottom: '0px',
                              marginTop: '',
                          },
                );
            }

            preHoveredElementRef.current = hoveredTargetElement;
        }
        if (fieldItemIndex != null && fieldItemIndex >= 0) {
            hoveredFieldItemIndex = fieldItemIndex;
        }
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

        const [idsChunk, sourceIdsChunk] = foundInstanceIdChunk.split('***');
        const fieldItemIds = (idsChunk ?? '').split(',');
        const fieldSourceIds = (sourceIdsChunk ?? '').split(',');

        return { fieldItemIds, fromBucket, fieldItemIndex, fieldSourceIds };
    };

    const onDropHandler = (e: React.DragEvent<HTMLDivElement>) => {
        const { fromBucket, fieldItemIds, fieldItemIndex, fieldSourceIds } =
            getFieldItemIds(e);

        const getDropIndex = () => {
            return hoveredFieldItemIndex;
        };
        const dropIndex = getDropIndex();
        const currentBucket = buckets.find((b) => b.id === fromBucket);
        const currentBucketFieldItems = currentBucket?.items?.filter?.(
            (item, itemIndex) => {
                if (
                    item.group &&
                    item.group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID
                ) {
                    item.groupOrder =
                        item.groupOrder !== undefined
                            ? item.groupOrder
                            : itemIndex;
                }
                return fieldItemIds.some(
                    (fieldItemId) => item.id === fieldItemId,
                );
            },
        );

        const fieldItemsRaw =
            currentBucketFieldItems ??
            allItems.filter((item, itemIndex) => {
                if (
                    item.group &&
                    item.group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID
                ) {
                    item.groupOrder =
                        item.groupOrder !== undefined
                            ? item.groupOrder
                            : itemIndex;
                }
                return (
                    fieldItemIds.some(
                        (fieldItemId) => item.id === fieldItemId,
                    ) ||
                    fieldSourceIds.some(
                        (fieldSourceId) => item.sourceId === fieldSourceId,
                    )
                );
            });

        // const generateUniqueId = (itemId: string) => `${itemId}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        // const destinationItemIds = destinationBucket?.items?.map(item => item.id) ?? [];

        const fieldItems = fieldItemsRaw;
        // const fieldItems = fieldItemsRaw.map((item) => {
        //     if (allowDuplicates && fromBucket !== id && destinationItemIds.includes(item.id)) {
        //         return {
        //             ...item,
        //             id: generateUniqueId(item.id),
        //         };
        //     }
        //     return item;
        // });

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
                dropIndex,
                isPointerAboveCenter,
                allItems: allItems,
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
                onDragOver={(e) => onDragOverHandler(e, true)}
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
                            fieldItemIndex={index}
                            activeDraggedElementRef={activeDraggedElementRef}
                            customClassNames={customClassNames}
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
        onDragOverHandler: (
            e: React.DragEvent<HTMLDivElement>,
            isParentElement?: boolean,
            fieldItemIndex?: number,
        ) => void;
        onFieldItemRemove: (...fieldItem: IFieldsKeeperItem[]) => () => void;
        fieldItemIndex: number;
        activeDraggedElementRef: React.MutableRefObject<HTMLDivElement | null>;
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
        fieldItemIndex,
        activeDraggedElementRef,
        onFieldItemLabelClick,
        customClassNames,
    } = props;

    // state
    const { instanceId: instanceIdFromContext } =
        useContext(FieldsKeeperContext);
    const instanceId = instanceIdFromProps ?? instanceIdFromContext;
    const { iconColor } = useStoreState(instanceId);
    const [isGroupCollapsed, setIsGroupCollapsed] = useState(false);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

    // State to manage editable field items and their labels
    const [editableItemId, setEditableItemId] = useState<string | null>(null);
    const [editedLabels, setEditedLabels] = useState<Record<string, string>>(
        items.reduce((acc, item) => {
            if (
                item.group &&
                item.group != FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID &&
                acc[item.group] === undefined
            ) {
                acc[item.group] = item.groupLabel as string;
            }
            acc[item.id] = item.label;
            return acc;
        }, {} as Record<string, string>),
    );

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

    useEffect(() => {
        setEditedLabels((prev) => {
            const newLabels = { ...prev };
            items.forEach((item) => {
                newLabels[item.id] = item.label;
                if (
                    item.group &&
                    item.group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID
                ) {
                    newLabels[item.group] =
                        item.flatGroupLabel ?? (item.groupLabel as string);
                }
            });
            return newLabels;
        });
    }, [items]);

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
                fieldItems.map((item) => item.id).join(',') +
                    '***' +
                    fieldItems.map((item) => item.sourceId).join(','),
            );
            activeDraggedElementRef.current = e.target as HTMLDivElement;
        };

    const onInputFieldChange = (fieldItemId: string, value: string) => {
        setEditedLabels((prev) => ({ ...prev, [fieldItemId]: value }));
    };

    const onEnterKeyPress = (
        fieldItem: IFieldsKeeperItem,
        isOnBlur = false,
        e?: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (onFieldItemLabelClick && (e?.key === 'Enter' || isOnBlur)) {
            const oldValue = fieldItem.label;
            const updatedFieldItem = {
                ...fieldItem,
                label: editedLabels[fieldItem.id],
            };
            onFieldItemLabelClick({
                bucketId: currentBucket.id,
                fieldItem: updatedFieldItem,
                oldValue,
                newValue: editedLabels[fieldItem.id],
            });
            setEditableItemId(null);
        }
    };

    const getFieldRendererOutput = (
        renderer: unknown,
        arg: ISuffixNodeRendererProps,
    ) => {
        const isRendererValid = typeof renderer === 'function';
        const rendererElement =
            isRendererValid &&
            (arg.fieldItem.group ? arg.groupFieldItems?.length : true)
                ? renderer(arg)
                : null;
        const isValidElement =
            rendererElement !== undefined && rendererElement !== null;
        return { rendererElement, isValidElement };
    };

    const renderFieldItems = ({
        fieldItems,
        isGroupItem,
        groupHeader,
    }: IGroupedItemRenderer) => {
        // compute
        const { suffixNodeRenderer, onContextMenuRenderer } = props;

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

        // style
        const iconColorStyle = (
            iconColor ? { '--bucket-icon-color': iconColor } : {}
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
                        style={iconColorStyle}
                    >
                        {groupHeader.isGroupCollapsed ? (
                            <i className="fk-ms-Icon fk-ms-Icon--ChevronRight" />
                        ) : (
                            <i className="fk-ms-Icon fk-ms-Icon--ChevronDown" />
                        )}
                    </div>
                );

                const {
                    rendererElement: suffixNodeRendererOutput,
                    isValidElement: isSuffixNodeValid,
                } = getFieldRendererOutput(suffixNodeRenderer, {
                    bucketId: currentBucket.id,
                    fieldItem,
                    isGroupHeader,
                    groupFieldItems: groupHeader?.groupItems,
                });

                const {
                    rendererElement: contextMenuRendererOutput,
                    isValidElement: isContextMenuValid,
                } = getFieldRendererOutput(onContextMenuRenderer, {
                    bucketId: currentBucket.id,
                    fieldItem,
                    isGroupHeader,
                    groupFieldItems: groupHeader?.groupItems,
                });

                return (
                    <Fragment>
                        {editableItemId ===
                        (isGroupHeader ? group : fieldItem.id) ? (
                            <input
                                className="react-fields-keeper-mapping-content-input-edit"
                                value={editedLabels[fieldItem.id]}
                                onChange={(e) =>
                                    onInputFieldChange(
                                        fieldItem.id,
                                        e.target.value,
                                    )
                                }
                                onKeyDown={(e) =>
                                    onEnterKeyPress(fieldItem, false, e)
                                }
                                onBlur={() => onEnterKeyPress(fieldItem, true)}
                                onFocus={(e) => e.target.select()}
                                autoFocus
                            />
                        ) : (
                            <div
                                className={classNames(
                                    'react-fields-keeper-mapping-content-input-filled-value',
                                    customClassNames?.customLabelClassName,
                                )}
                            >
                                {editedLabels[fieldItem.id]}
                            </div>
                        )}
                        <div
                            className="react-fields-keeper-mapping-content-action-buttons"
                            style={iconColorStyle}
                        >
                            {orientation === 'vertical' && groupCollapseButton}
                            {isSuffixNodeValid && (
                                <div
                                    className="react-fields-keeper-mapping-content-action-suffixNode"
                                    style={iconColorStyle}
                                >
                                    {suffixNodeRendererOutput}
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
                                        style={iconColorStyle}
                                    >
                                        <i className="fk-ms-Icon fk-ms-Icon--ChromeClose" />
                                    </div>
                                ))}
                            {orientation === 'horizontal' &&
                                groupCollapseButton}
                            {isContextMenuOpen && isContextMenuValid && (
                                <div
                                    className="react-fields-keeper-bucket-mapping-content-action-context-menu"
                                    style={{ paddingLeft: '10px !important' }}
                                >
                                    {contextMenuRendererOutput}
                                </div>
                            )}
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
                    onDoubleClick={() => {
                        if (onFieldItemLabelClick) {
                            setEditableItemId(fieldItem.id);
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setIsContextMenuOpen(true);
                    }}
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
                            customClassNames?.customFieldItemContainerClassName,
                        )}
                        style={itemStyle}
                        draggable={isGroupHeader || isGroupItem ? false : true}
                        data-index={fieldItemIndex}
                        onDragStart={onDragStartHandler(
                            (fieldItem._fieldItemIndex ?? '') + '',
                            currentBucket.id,
                            isGroupHeader
                                ? groupHeader.groupItems
                                : [fieldItem],
                        )}
                        onDragOver={(e) =>
                            onDragOverHandler(
                                e,
                                false,
                                fieldItem._fieldItemIndex,
                            )
                        }
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
                    customClassNames?.customGroupContainerClassName,
                )}
                draggable
                onDragStart={onDragStartHandler('', currentBucket.id, items)}
                onDragOver={(e) => onDragOverHandler(e, false, fieldItemIndex)}
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
    allItems: IFieldsKeeperItem[];
    updateState: ContextSetState;
    removeOnly?: boolean;
    sortGroupOrderWiseOnAssignment?: boolean;
    allowDuplicates?: boolean;
    removeIndex?: number;
    dropIndex?: number;
    isPointerAboveCenter?: boolean;
    isFieldItemClick?: boolean;
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
        dropIndex = -1,
        isPointerAboveCenter = false,
        isFieldItemClick = false,
        allItems,
    } = props;

    const newBuckets = [...buckets];
    let draggedIndex = removeIndex !== undefined ? removeIndex : -1;
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
            bucket.items = bucket.items.filter((item, itemIndex) => {
                const shouldKeepItem =
                    requiredFieldItems.some(
                        (fieldItem) =>
                            (fieldItem.sourceId ?? fieldItem.id) ===
                                (item.sourceId ?? item.id) ||
                            fieldItem.flatGroup === item.id,
                    ) === false ||
                    restrictedItems.some(
                        (fieldItem) => fieldItem.id === item.id,
                    );
                if (!shouldKeepItem) draggedIndex = itemIndex;
                return shouldKeepItem;
            });
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
                    sortBucketItemsBasedOnGroupOrder(bucket.items, allItems);
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

        const getGroupDetails = (
            items: IFieldsKeeperItem<any>[],
            index: number,
        ): { group: string; groupOrder: number } => {
            const item = items[index];
            return {
                group: item?.group ?? '',
                groupOrder: item?.groupOrder ?? -1,
            };
        };

        const insertItemsToBucket = (bucketIndex: number) => {
            if (isFieldItemClick) {
                const updatedItemsInBucket: IFieldsKeeperItem<any>[] = [];
                if (
                    requiredFieldItems.length === 1 &&
                    requiredFieldItems.every(
                        (item) =>
                            item.group &&
                            item.group !== FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID,
                    ) &&
                    targetBucket.items.length
                ) {
                    let currentGroupItems: IFieldsKeeperItem[] = [];
                    let isRequiredItemAdded = false;
                    targetBucket.items.forEach((itemInBucket, itemIndex) => {
                        if (
                            itemInBucket.group &&
                            itemInBucket.group !==
                                FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID &&
                            requiredFieldItems.every(
                                (ite) => ite.group === itemInBucket.group,
                            )
                        ) {
                            if (
                                targetBucket?.items?.length === itemIndex + 1 ||
                                itemInBucket.group !==
                                    targetBucket?.items?.[itemIndex + 1]?.group
                            ) {
                                currentGroupItems.push(itemInBucket);
                                if (
                                    (!allowDuplicates &&
                                        !isRequiredItemAdded) ||
                                    allowDuplicates
                                ) {
                                    currentGroupItems.push(
                                        ...requiredFieldItems,
                                    );
                                    isRequiredItemAdded = true;
                                }
                                if (currentGroupItems.length) {
                                    const sortedCurrentGrpItems =
                                        sortBucketItemsBasedOnGroupOrder(
                                            currentGroupItems,
                                            allItems,
                                        );
                                    updatedItemsInBucket.push(
                                        ...sortedCurrentGrpItems,
                                    );
                                    currentGroupItems = [];
                                }
                            } else {
                                currentGroupItems.push(itemInBucket);
                            }
                        } else {
                            updatedItemsInBucket.push(itemInBucket);
                        }
                    });

                    targetBucket.items = [...updatedItemsInBucket];
                    if(!isRequiredItemAdded) targetBucket.items.push(...requiredFieldItems)
                    return;
                }
            }

            const targetBucketItems = targetBucket.items;

            const { group: groupAbove, groupOrder: orderAbove } =
                getGroupDetails(targetBucketItems, bucketIndex - 1);
            const { group: groupBelow, groupOrder: orderBelow } =
                getGroupDetails(targetBucketItems, bucketIndex);

            const isBetweenSameGroup =
                bucketIndex > 0 &&
                groupAbove === groupBelow &&
                orderAbove < orderBelow;

            if (isBetweenSameGroup) {
                let insertIndex: number;

                if (isPointerAboveCenter) {
                    insertIndex =
                        targetBucketItems.findIndex(
                            (item, index) =>
                                index < bucketIndex &&
                                targetBucketItems[index + 1]?.group === groupAbove &&
                                item.group !== groupAbove,
                        ) + 1;

                    if (insertIndex <= 0) insertIndex = bucketIndex;
                } else {
                    insertIndex = targetBucketItems.findIndex(
                        (item, index) =>
                            index > bucketIndex && item.group !== groupBelow,
                    );

                    if (insertIndex === -1) insertIndex = targetBucketItems.length;
                }

                targetBucketItems.splice(insertIndex, 0, ...requiredFieldItems);
            } else {
                targetBucketItems.splice(bucketIndex, 0, ...requiredFieldItems);
            }
        };

        const updateTargetBucket = (isAssignmentFromSameBucket = false) => {
            if (dropIndex < 0) {
                insertItemsToBucket(targetBucket.items.length);
                return;
            }

            let dropTargetIndex: number;

            if (isAssignmentFromSameBucket) {
                const isDraggingBottomToTop = draggedIndex > dropIndex;
                const isDraggingTopToBottom = draggedIndex < dropIndex;
                const isSamePosition = draggedIndex === dropIndex;

                if (isSamePosition) {
                    dropTargetIndex = dropIndex;
                } else if (isDraggingBottomToTop) {
                    dropTargetIndex = isPointerAboveCenter
                        ? dropIndex
                        : dropIndex + 1;
                } else if (isDraggingTopToBottom) {
                    dropTargetIndex = isPointerAboveCenter
                        ? dropIndex
                        : dropIndex + 1;
                    if (dropIndex > draggedIndex) {
                        dropTargetIndex -= 1;
                    }
                } else {
                    dropTargetIndex = dropIndex;
                }
            } else {
                if (isPointerAboveCenter) {
                    dropTargetIndex = dropIndex;
                } else {
                    dropTargetIndex = dropIndex + 1;
                }
            }

            insertItemsToBucket(dropTargetIndex);
        };

        if (fromBucketId === FIELDS_KEEPER_CONSTANTS.ROOT_BUCKET_ID) {
            // assignment from root bucket
            // clear previously assigned items if any in any of the buckets
            if (!allowDuplicates)
                newBuckets.forEach((bucket) => filterItemsFromBucket(bucket));
            updateTargetBucket();
            checkAndMaintainMaxItems(
                targetBucket,
                targetBucketItemsPreviousLength,
            );

            if (sortGroupOrderWiseOnAssignment)
                sortBucketItemsBasedOnGroupOrder(targetBucket.items, allItems);
        } else {
            const isAssignmentFromSameBucket = fromBucketId === targetBucket.id;

            if (isAssignmentFromSameBucket) {
                filterItemsFromBucket(targetBucket);
                updateTargetBucket(true);
                checkAndMaintainMaxItems(
                    targetBucket,
                    targetBucketItemsPreviousLength,
                );

                if (sortGroupOrderWiseOnAssignment)
                    sortBucketItemsBasedOnGroupOrder(
                        targetBucket.items,
                        allItems,
                    );
            } else {
                // assignment from sibling bucket
                updateTargetBucket();
                const restrictedItems = checkAndMaintainMaxItems(
                    targetBucket,
                    targetBucketItemsPreviousLength,
                );

                if (sortGroupOrderWiseOnAssignment)
                    sortBucketItemsBasedOnGroupOrder(
                        targetBucket.items,
                        allItems,
                    );

                // fromBucket cleanup
                if (fromBucket) {
                    filterItemsFromBucket(fromBucket, restrictedItems);

                    if (sortGroupOrderWiseOnAssignment)
                        sortBucketItemsBasedOnGroupOrder(
                            fromBucket.items,
                            allItems,
                        );
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
    allItems: IFieldsKeeperItem[],
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
                    const itemAIndex = findGroupItemOrder(allItems, itemA);
                    const itemBIndex = findGroupItemOrder(allItems, itemB);
                    if (itemAIndex !== undefined && itemBIndex !== undefined) {
                        return itemAIndex - itemBIndex;
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
