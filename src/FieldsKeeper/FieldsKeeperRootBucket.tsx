// imports
import { CSSProperties, useContext, useMemo, useRef, useState } from "react";
import FuzzySearch from "fuzzy-search";
import classNames from "classnames";

import "./fieldsKeeper.less";
import {
  IFieldsKeeperBucket,
  IFieldsKeeperItem,
  IFieldsKeeperRootBucketProps,
} from "./FieldsKeeper.types";
import { FieldsKeeperContext } from "./FieldsKeeper.context";
import { assignFieldItems, sortBucketItemsBasedOnGroupOrder } from "..";

export interface IGroupedFieldsKeeperItem {
  group: string;
  groupLabel: string;
  items: IFieldsKeeperItem[];
}

export interface IGroupedItemRenderer {
  fieldItems: IFieldsKeeperItem[];
  isGroupItem?: boolean;

  groupHeader?: {
    groupItems: IFieldsKeeperItem[];
    isGroupCollapsed: boolean;
    onGroupHeaderToggle: () => void;
    isGroupHeaderSelected?: boolean;
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const getGroupedItems = (
  currentItems: IFieldsKeeperItem[]
): IGroupedFieldsKeeperItem[] => {
  const groupedItems = currentItems.reduce<IGroupedFieldsKeeperItem[]>(
    (acc, item) => {
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
    },
    []
  );

  groupedItems.forEach((groupedItem) => {
    groupedItem.items = sortBucketItemsBasedOnGroupOrder(groupedItem.items);
  });

  return groupedItems;
};

export const FieldsKeeperRootBucket = (props: IFieldsKeeperRootBucketProps) => {
  // props
  const {
    label,
    isDisabled,
    labelClassName,
    sortGroupOrderWiseOnAssignment = true,
  } = props;

  // refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // state
  const { allItems } = useContext(FieldsKeeperContext);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroupedItems = useMemo<IGroupedFieldsKeeperItem[]>(() => {
    const searcher = new FuzzySearch(allItems, ["label", "id"], { sort: true });
    const currentItems = searcher.search(searchQuery);
    // group items
    return getGroupedItems(currentItems);
  }, [searchQuery, allItems]);

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
            <RootBucketGroupedItemRenderer
              key={index}
              filteredGroupedItem={filteredGroupedItem}
              sortGroupOrderWiseOnAssignment={sortGroupOrderWiseOnAssignment}
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

const RootBucketGroupedItemRenderer = (
  props: {
    filteredGroupedItem: IGroupedFieldsKeeperItem;
    sortGroupOrderWiseOnAssignment: boolean;
  } & IFieldsKeeperRootBucketProps
) => {
  // props
  const {
    filteredGroupedItem: { group, groupLabel, items: filteredItems },
    sortGroupOrderWiseOnAssignment,
    getPriorityTargetBucketToFill: getPriorityTargetBucketToFillFromProps,
  } = props;

  // state
  const {
    instanceId,
    buckets,
    getPriorityTargetBucketToFill: getPriorityTargetBucketToFillFromContext,
    updateState,
  } = useContext(FieldsKeeperContext);
  const [isGroupCollapsed, setIsGroupCollapsed] = useState(false);

  // compute
  const hasGroup = group !== "NO_GROUP";

  // event handlers
  const onDragStartHandler =
    (...fieldItems: IFieldsKeeperItem[]) =>
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(
        instanceId,
        fieldItems.map((item) => item.id).join(",")
      );
    };

  // handlers
  const checkIsFieldItemAssigned = (fieldItem: IFieldsKeeperItem) => {
    return buckets.some((bucket) =>
      bucket.items.some((item) => item.id === fieldItem.id)
    );
  };

  const getPriorityTargetBucketToFill =
    getPriorityTargetBucketToFillFromProps ??
    getPriorityTargetBucketToFillFromContext ??
    ((buckets: IFieldsKeeperBucket[], priorityGroup?: string) => {
      if (priorityGroup) {
        const priorityGroupBucket = buckets.find((bucket) => {
          return bucket.items.some((item) => item.group === priorityGroup);
        });
        if (priorityGroupBucket) return priorityGroupBucket;
      }
      const leastFilledOrderedBuckets = [...buckets].sort(
        (bucketA, bucketB) => bucketA.items.length - bucketB.items.length
      );
      return leastFilledOrderedBuckets[0];
    });

  const onFieldItemClick =
    (fieldItems: IFieldsKeeperItem[], remove = false) =>
    () => {
      const bucketToFill = getPriorityTargetBucketToFill(
        buckets,
        fieldItems[0].group
      );
      assignFieldItems({
        bucketId: bucketToFill.id,
        fieldItems,
        buckets,
        removeOnly: remove,
        sortGroupOrderWiseOnAssignment,
        updateState,
      });
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
            "--root-bucket-group-items-count":
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
          className={classNames("react-fields-keeper-mapping-column-content", {
            "react-fields-keeper-mapping-column-content-offset": isGroupItem,
            "react-fields-keeper-mapping-column-content-group-header":
              isGroupHeader && !groupHeader.isGroupCollapsed,
          })}
          style={itemStyle}
          draggable={!isFieldItemAssigned}
          onDragStart={onDragStartHandler(
            ...(isGroupHeader ? groupHeader.groupItems : [fieldItem])
          )}
        >
          <div className="react-fields-keeper-mapping-column-content-checkbox">
            <input
              type="checkbox"
              checked={isFieldItemAssigned}
              onChange={onFieldItemClick(
                isGroupHeader ? groupHeader.groupItems : [fieldItem],
                isFieldItemAssigned
              )}
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
