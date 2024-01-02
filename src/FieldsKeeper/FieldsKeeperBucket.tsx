import { useState, useContext, useMemo, CSSProperties } from "react";
import classNames from "classnames";

import { FieldsKeeperContext } from "./FieldsKeeper.context";
import {
  IFieldsKeeperBucket,
  IFieldsKeeperBucketProps,
  IFieldsKeeperItem,
  IFieldsKeeperState,
} from "./FieldsKeeper.types";
import {
  IGroupedFieldsKeeperItem,
  IGroupedItemRenderer,
  getGroupedItems,
} from "..";

export const FieldsKeeperBucket = (props: IFieldsKeeperBucketProps) => {
  // props
  const {
    id,
    label,
    maxItems = Number.MAX_SAFE_INTEGER,
    disabled = false,
    emptyFieldPlaceholder = "Add data fields here",
    sortGroupOrderWiseOnAssignment = true,
  } = props;

  // state
  const [isCurrentFieldActive, setIsCurrentFieldActive] = useState(false);
  const { instanceId, allItems, buckets, updateState } =
    useContext(FieldsKeeperContext);

  // compute
  const groupedItems = useMemo<IGroupedFieldsKeeperItem[]>(() => {
    const bucket = buckets.find((bucket) => bucket.id === id);
    if (!bucket) return [];

    // group items
    return getGroupedItems(bucket.items);
  }, [buckets, id]);

  const onFieldItemRemove =
    (...fieldItems: IFieldsKeeperItem[]) =>
    () =>
      assignFieldItems({
        bucketId: id,
        buckets,
        fieldItems,
        sortGroupOrderWiseOnAssignment,
        updateState,

        removeOnly: true,
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

  const onDropHandler = (e: React.DragEvent<HTMLDivElement>) => {
    const fieldItemIds = (e.dataTransfer.getData(instanceId) ?? "").split(",");
    const fieldItems = allItems.filter((item) =>
      fieldItemIds.some((fieldItemId) => item.id === fieldItemId)
    );
    if (fieldItems.length)
      assignFieldItems({
        bucketId: id,
        buckets,
        sortGroupOrderWiseOnAssignment,
        fieldItems,
        updateState,
      });
    onDragLeaveHandler();
  };

  // compute
  const hasRoomForFieldAssignment = groupedItems.length < maxItems;

  // paint
  return (
    <div className="react-fields-keeper-mapping-content">
      <div className="react-fields-keeper-mapping-content-title">{label}</div>
      <div
        className={classNames("react-fields-keeper-mapping-content-input", {
          "react-fields-keeper-mapping-content-multi-input":
            hasRoomForFieldAssignment,
          "react-fields-keeper-mapping-content-input-active":
            isCurrentFieldActive,
          "react-fields-keeper-mapping-content-disabled": disabled,
        })}
        onDrop={onDropHandler}
        onDragOver={onDragOverHandler}
        onDragEnter={onDragEnterHandler}
        onDragLeave={onDragLeaveHandler}
      >
        {groupedItems.length > 0 ? (
          groupedItems.map((groupedItem, index) => (
            <GroupedItemRenderer
              key={index}
              {...props}
              groupedItem={groupedItem}
              onDragOverHandler={onDragOverHandler}
              onFieldItemRemove={onFieldItemRemove}
            />
          ))
        ) : (
          <div className="react-fields-keeper-mapping-content-input-placeholder">
            {emptyFieldPlaceholder}
          </div>
        )}
      </div>
    </div>
  );
};

const GroupedItemRenderer = (
  props: {
    groupedItem: IGroupedFieldsKeeperItem;
    onDragOverHandler: (e: React.DragEvent<HTMLDivElement>) => void;
    onFieldItemRemove: (...fieldItem: IFieldsKeeperItem[]) => () => void;
  } & IFieldsKeeperBucketProps
) => {
  // props
  const {
    groupedItem: { items, group, groupLabel },
    allowRemoveFields = false,
    suffixNode,
    onDragOverHandler,
    onFieldItemRemove,
  } = props;

  // state
  const { instanceId } = useContext(FieldsKeeperContext);
  const [isGroupCollapsed, setIsGroupCollapsed] = useState(false);

  // compute
  const hasGroup = group !== "NO_GROUP";

  // handlers
  // event handlers
  const onDragStartHandler =
    (...fieldItems: IFieldsKeeperItem[]) =>
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(
        instanceId,
        fieldItems.map((item) => item.id).join(",")
      );
    };

  // paint
  const renderFieldItems = ({
    fieldItems,
    isGroupItem,
    groupHeader,
  }: IGroupedItemRenderer) => {
    // compute
    const isGroupHeader = groupHeader !== undefined;

    // styles
    const itemStyle = (
      isGroupHeader
        ? {
            "--bucket-group-items-count": groupHeader.groupItems.length + 1,
          }
        : {}
    ) as CSSProperties;

    // paint
    return fieldItems.map((item) => {
      return (
        <div
          key={item.id}
          className={classNames(
            "react-fields-keeper-mapping-content-input-filled",
            item.activeNodeClassName,
            {
              "react-fields-keeper-mapping-content-input-filled-offset":
                isGroupItem,
              "react-fields-keeper-mapping-content-input-filled-group-header":
                isGroupHeader,
              "react-fields-keeper-mapping-content-input-filled-group-header-after":
                isGroupHeader && !groupHeader.isGroupCollapsed,
            }
          )}
          style={itemStyle}
          draggable
          onDragStart={onDragStartHandler(
            ...(isGroupHeader ? groupHeader.groupItems : [item])
          )}
          onDragOver={onDragOverHandler}
        >
          <div className="react-fields-keeper-mapping-content-input-filled-value">
            {item.label}
          </div>
          {isGroupHeader && (
            <div
              className={classNames(
                "react-fields-keeper-mapping-column-content-action"
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
          )}
          {suffixNode ||
            (allowRemoveFields && (
              <div
                className={classNames(
                  "react-fields-keeper-mapping-content-input-filled-close"
                )}
                role="button"
                onClick={onFieldItemRemove(
                  ...(isGroupHeader ? groupHeader.groupItems : [item])
                )}
              >
                <i className="fk-ms-Icon fk-ms-Icon--ChromeClose" />
              </div>
            ))}
        </div>
      );
    });
  };

  if (hasGroup) {
    return (
      <>
        {renderFieldItems({
          fieldItems: [{ label: groupLabel, id: group, group, groupLabel }],
          groupHeader: {
            groupItems: items,
            isGroupCollapsed,
            onGroupHeaderToggle: () => setIsGroupCollapsed(!isGroupCollapsed),
          },
        })}
        {!isGroupCollapsed &&
          renderFieldItems({
            fieldItems: items,
            isGroupItem: true,
          })}
      </>
    );
  }
  return <>{renderFieldItems({ fieldItems: items })}</>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function assignFieldItems(props: {
  bucketId: string | null;
  buckets: IFieldsKeeperBucket[];
  fieldItems: IFieldsKeeperItem[];
  updateState: (state: Partial<IFieldsKeeperState>) => void;
  removeOnly?: boolean;
  sortGroupOrderWiseOnAssignment?: boolean;
}) {
  // props
  const {
    bucketId,
    buckets,
    fieldItems,
    updateState,
    removeOnly = false,
    sortGroupOrderWiseOnAssignment = false,
  } = props;

  // compute
  const newBuckets = [...buckets];
  newBuckets.forEach((bucket) => {
    // removes item from old bucket
    bucket.items = bucket.items.filter(
      (item) =>
        fieldItems.some((fieldItem) => fieldItem.id === item.id) === false
    );

    // insert new item into bucket
    if (!removeOnly && bucket.id === bucketId) bucket.items.push(...fieldItems);

    // sort the same group items based on the group order
    if (sortGroupOrderWiseOnAssignment)
      bucket.items = sortBucketItemsBasedOnGroupOrder(bucket.items);
  });

  // update context
  updateState({ buckets: newBuckets });
}

// eslint-disable-next-line react-refresh/only-export-components
export function sortBucketItemsBasedOnGroupOrder(
  items: IFieldsKeeperItem[]
): IFieldsKeeperItem[] {
  // grouping based on the group property
  const chunkGroups = items.reduce<
    { group: string; items: IFieldsKeeperItem[] }[]
  >((result, current, index) => {
    let groupBucket = result.find(
      (item) => item.group === (current.group ?? index.toString())
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
    []
  );

  return sortedItems;
}
