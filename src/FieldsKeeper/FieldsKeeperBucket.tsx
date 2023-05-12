import { useState, useContext, useMemo } from "react";
import { FieldsKeeperContext } from "./FieldsKeeper.context";
import { IFieldsKeeperBucketProps, IFieldsKeeperItem } from "./FieldsKeeper.types";
import cn from 'classnames';

export const FieldsKeeperBucket = (props: IFieldsKeeperBucketProps) => {
  // props
  const {
    id,
    label,
    allowRemoveFields = false,
    maxItems = Number.MAX_SAFE_INTEGER,
    disabled = false,
    suffixNode,
    emptyFieldPlaceholder = 'Add data fields here'
  } = props;

  // state
  const [isCurrentFieldActive, setIsCurrentFieldActive] = useState(false);
  const { instanceId, allItems, buckets, updateState } = useContext(FieldsKeeperContext);
  const { items } = useMemo(
    () => buckets.find((bucket) => bucket.id === id),
    [buckets, id]
  ) ?? { items: [] };

  // actions
  const assignFieldItem = (fieldItem: IFieldsKeeperItem, removeOnly?: boolean) => {
    const newBuckets = [...buckets];
    newBuckets.forEach((bucket) => {
      // removes item from old bucket
      const foundOldItemIndex = bucket.items.findIndex(
        (item) => item.id === fieldItem.id
      );
      if (foundOldItemIndex !== -1) {
        bucket.items.splice(foundOldItemIndex, 1);
      }

      // insert new item into bucket
      if (!removeOnly && bucket.id === id) {
        bucket.items.push(fieldItem);
      }
    });

    // update context
    updateState({ buckets: newBuckets });
  };

  const onFieldItemRemove = (fieldItem: IFieldsKeeperItem) => () =>
    assignFieldItem(fieldItem, true);

  // event handlers
  const onDragStartHandler =
    (fieldItem: IFieldsKeeperItem) => (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(instanceId, fieldItem.id);
    };

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
    const fieldItemId = e.dataTransfer.getData(instanceId);
    const fieldItem = allItems.find(item => item.id === fieldItemId);
    if (fieldItem)
      assignFieldItem(fieldItem);
    onDragLeaveHandler();
  };

  // compute
  const hasRoomForFieldAssignment = items.length < maxItems;

  // paint
  return (
    <div className="column-as-measure-mapping-content">
      <div className="column-as-measure-mapping-content-title">{label}</div>
      <div
        className={cn("column-as-measure-mapping-content-input", {
          "column-as-measure-mapping-content-multi-input":
            hasRoomForFieldAssignment,
          "column-as-measure-mapping-content-input-active":
            isCurrentFieldActive,
          "column-as-measure-mapping-content-disabled":
            disabled,
        })}
        onDrop={onDropHandler}
        onDragOver={onDragOverHandler}
        onDragEnter={onDragEnterHandler}
        onDragLeave={onDragLeaveHandler}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="column-as-measure-mapping-content-input-filled"
              draggable
              onDragStart={onDragStartHandler(item)}
              onDragOver={onDragOverHandler}
            >
              <div className="column-as-measure-mapping-content-input-filled-value">
                {item.label}
              </div>
              {allowRemoveFields && suffixNode !== undefined && (
                <div
                  className={cn(
                    "column-as-measure-mapping-content-input-filled-close",
                  )}
                  role="button"
                  onClick={onFieldItemRemove(item)}
                >
                  <span className="ms-Icon ms-Icon--ChromeClose" />
                </div>
              )}
              {suffixNode}
            </div>
          ))
        ) : (
          <div className="column-as-measure-mapping-content-input-placeholder">
            {emptyFieldPlaceholder}
          </div>
        )}
      </div>
    </div >
  );
};
