// imports
import { useContext, useMemo, useRef, useState } from "react";
import FuzzySearch from "fuzzy-search";
import classNames from "classnames";

import "./fieldsKeeper.less";
import {
  IFieldsKeeperBucket,
  IFieldsKeeperItem,
  IFieldsKeeperRootBucketProps,
} from "./FieldsKeeper.types";
import { FieldsKeeperContext } from "./FieldsKeeper.context";

interface IGroupedFieldsKeeperItem {
  group: string;
  groupLabel: string;
  items: IFieldsKeeperItem[];
}

export const FieldsKeeperRootBucket = (props: IFieldsKeeperRootBucketProps) => {
  // props
  const { label, isDisabled, labelClassName } = props;

  // refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // state
  const { allItems } = useContext(FieldsKeeperContext);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroupedItems = useMemo<IGroupedFieldsKeeperItem[]>(() => {
    const searcher = new FuzzySearch(allItems, ["label", "id"], { sort: true });
    const totalItems = searcher.search(searchQuery);

    // group items
    return totalItems.reduce<IGroupedFieldsKeeperItem[]>((acc, item) => {
      const foundGroup = acc.find((group) => group.group === item.group);
      if (foundGroup) {
        foundGroup.items.push(item);
      } else {
        acc.push({
          group: item.group ?? "NO_GROUP",
          groupLabel: item.groupLabel ?? "NO_GROUP",
          items: [item],
        });
      }
      return acc;
    }, []);
  }, [searchQuery, allItems]);

  console.log(filteredGroupedItems);

  // actions
  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value ?? "");
  };

  const onClearSearchQuery = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  // paint
  return (
    <div
      className={classNames("react-fields-keeper-mapping-container", {
        "react-fields-keeper-mapping-content-disabled": isDisabled,
      })}
    >
      {label && (
        <div
          className={classNames(
            "react-fields-keeper-mapping-subtitle",
            labelClassName
          )}
        >
          {label}
        </div>
      )}
      <div className="react-fields-keeper-mapping-column-searcher">
        <input
          type="text"
          ref={searchInputRef}
          onChange={onSearchInputChange}
          value={searchQuery}
          placeholder="Search values"
        />
        {searchQuery.length > 0 && (
          <div
            className="react-fields-keeper-mapping-column-searcher-clear"
            role="button"
            onClick={onClearSearchQuery}
          >
            <span className="ms-Icon ms-Icon--ChromeClose" />
          </div>
        )}
      </div>
      <div className="react-fields-keeper-mapping-content-scrollable-container react-fields-keeper-mapping-content-scrollable-container-columns">
        {filteredGroupedItems.length > 0 ? (
          filteredGroupedItems.map((filteredGroupedItem, index) => (
            <FilteredGroupedItem
              key={index}
              filteredGroupedItem={filteredGroupedItem}
            />
          ))
        ) : (
          <div className="react-fields-keeper-mapping-no-search-items-found">
            <div>
              No items found for <br /> <code>{searchQuery}</code>
            </div>
            {allItems.length > 0 && (
              <div
                className="react-fields-keeper-mapping-clear-search-link"
                onClick={onClearSearchQuery}
                role="button"
              >
                Clear search
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FilteredGroupedItem = (props: {
  filteredGroupedItem: IGroupedFieldsKeeperItem;
}) => {
  // props
  const {
    filteredGroupedItem: { group, groupLabel, items: filteredItems },
  } = props;

  // state
  const { instanceId, buckets, updateState } = useContext(FieldsKeeperContext);
  const [isGroupCollapsed, setIsGroupCollapsed] = useState(false);

  // compute
  const hasGroup = group !== "NO_GROUP";

  // event handlers
  const onDragStartHandler =
    (fieldItem: IFieldsKeeperItem) => (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(instanceId, fieldItem.id);
    };

  // handlers
  const checkIsFieldItemAssigned = (fieldItem: IFieldsKeeperItem) => {
    return buckets.some((bucket) =>
      bucket.items.some((item) => item.id === fieldItem.id)
    );
  };

  const getPriorityTargetBucketToFill = (buckets: IFieldsKeeperBucket[]) => {
    return [...buckets].sort(
      (bucketA, bucketB) => bucketA.items.length - bucketB.items.length
    )[0];
  };

  const onFieldItemClick =
    (fieldItem: IFieldsKeeperItem, remove = false) =>
    () => {
      const newBuckets = [...buckets];

      if (remove) {
        newBuckets.some((bucket) => {
          // removes item from old bucket
          const foundOldItemIndex = bucket.items.findIndex(
            (item) => item.id === fieldItem.id
          );
          if (foundOldItemIndex !== -1) {
            bucket.items.splice(foundOldItemIndex, 1);
            return true;
          }
          return false;
        });
      } else {
        // fill based on priority
        const bucketToFill = getPriorityTargetBucketToFill(newBuckets);
        bucketToFill.items.push(fieldItem);
      }

      // update context
      updateState({ buckets: newBuckets });
    };

  const onGroupHeaderItemClick =
    (groupItems: IFieldsKeeperItem[], remove = false) =>
    () => {
      const newBuckets = [...buckets];

      if (remove) {
        groupItems.find((fieldItem) => {
          newBuckets.some((bucket) => {
            // removes item from old bucket
            const foundOldItemIndex = bucket.items.findIndex(
              (item) => item.id === fieldItem.id
            );
            if (foundOldItemIndex !== -1) {
              bucket.items.splice(foundOldItemIndex, 1);
              return true;
            }
            return false;
          });
        });
      } else {
        // fill based on priority
        const bucketToFill = getPriorityTargetBucketToFill(newBuckets);
        bucketToFill.items.push(...groupItems);
      }

      // update context
      updateState({ buckets: newBuckets });
    };

  // paint
  const renderFieldItems = ({
    fieldItems,
    isGroupItem,
    groupHeader,
  }: {
    fieldItems: IFieldsKeeperItem[];
    isGroupItem?: boolean;

    groupHeader?: {
      isGroupHeaderSelected: boolean;
      groupItems: IFieldsKeeperItem[];
      isGroupCollapsed: boolean;
      onGroupHeaderToggle: () => void;
    };
  }) => {
    const isGroupHeader = groupHeader !== undefined;

    return fieldItems.map((fieldItem) => {
      const isFieldItemAssigned = isGroupHeader
        ? groupHeader?.isGroupHeaderSelected
        : checkIsFieldItemAssigned(fieldItem);
      return (
        <div
          key={fieldItem.id}
          className={classNames("react-fields-keeper-mapping-column-content", {
            "react-fields-keeper-mapping-column-content-offset": isGroupItem,
          })}
          draggable={!isFieldItemAssigned}
          onDragStart={onDragStartHandler(fieldItem)}
        >
          <div className="react-fields-keeper-mapping-column-content-checkbox">
            <input
              // className={classNames({
              //   "react-fields-keeper-mapping-content-disabled": isDisabled,
              // })}
              type="checkbox"
              checked={isFieldItemAssigned}
              onChange={
                isGroupHeader
                  ? onGroupHeaderItemClick(
                      groupHeader.groupItems,
                      isFieldItemAssigned
                    )
                  : onFieldItemClick(fieldItem, isFieldItemAssigned)
              }
            />
          </div>
          <div className="react-fields-keeper-mapping-column-content-wrapper">
            <div className="react-fields-keeper-mapping-column-content-label">
              {fieldItem.label}
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
          </div>
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
            isGroupHeaderSelected: filteredItems.some((item) =>
              checkIsFieldItemAssigned(item)
            ),
            groupItems: filteredItems,
            isGroupCollapsed,
            onGroupHeaderToggle: () => setIsGroupCollapsed(!isGroupCollapsed),
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
};
