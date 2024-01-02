import { useState, useContext, useMemo, CSSProperties } from "react";
import classNames from "classnames";

import { FieldsKeeperContext } from "./FieldsKeeper.context";
import {
  IFieldsKeeperBucketProps,
  IFieldsKeeperItem,
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

  // actions
  const assignFieldItem = (
    fieldItems: IFieldsKeeperItem[],
    removeOnly?: boolean
  ) => {
    const newBuckets = [...buckets];
    newBuckets.forEach((bucket) => {
      // removes item from old bucket
      bucket.items = bucket.items.filter(
        (item) =>
          fieldItems.some((fieldItem) => fieldItem.id === item.id) === false
      );

      // insert new item into bucket
      if (!removeOnly && bucket.id === id) bucket.items.push(...fieldItems);
    });

    // update context
    updateState({ buckets: newBuckets });
  };

  const onFieldItemRemove =
    (...fieldItems: IFieldsKeeperItem[]) =>
    () =>
      assignFieldItem(fieldItems, true);

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
    if (fieldItems.length) assignFieldItem(fieldItems);
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
