// imports
import { useContext, useMemo, useRef, useState } from "react";
import cn from "classnames";
import FuzzySearch from "fuzzy-search";
import "./fieldsKeeper.less";
import {
  IFieldsKeeperItem,
  IFieldsKeeperRootBucketProps,
} from "./FieldsKeeper.types";
import { FieldsKeeperContext } from "./FieldsKeeper.context";

export const FieldsKeeperRootBucket = (props: IFieldsKeeperRootBucketProps) => {
  // props
  const { label, isDisabled } = props;

  // refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // state
  const { instanceId, allItems, buckets, updateState } =
    useContext(FieldsKeeperContext);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredItems = useMemo<IFieldsKeeperItem[]>(() => {
    const searcher = new FuzzySearch(allItems, ["label", "id"], { sort: true });
    return searcher.search(searchQuery);
  }, [searchQuery, allItems]);

  // actions
  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value ?? "");
  };

  const onClearSearchQuery = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const checkIsFieldItemAssigned = (fieldItem: IFieldsKeeperItem) => {
    return buckets.some((bucket) =>
      bucket.items.some((item) => item.id === fieldItem.id)
    );
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
        const randomBucket =
          newBuckets[Math.floor(Math.random() * newBuckets.length)];
        randomBucket.items.push(fieldItem);
      }

      // update context
      updateState({ buckets: newBuckets });
    };

  // event handlers
  const onDragStartHandler =
    (fieldItem: IFieldsKeeperItem) => (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(instanceId, fieldItem.id);
    };

  // paint
  return (
    <div
      className={cn("column-as-measure-mapping-container", {
        "column-as-measure-mapping-content-disabled": isDisabled,
      })}
    >
      {label && (
        <div className="column-as-measure-mapping-subtitle">{label}</div>
      )}
      <div className="column-as-measure-mapping-column-searcher">
        <input
          type="text"
          ref={searchInputRef}
          onChange={onSearchInputChange}
          value={searchQuery}
          placeholder="Search values"
        />
        {searchQuery.length > 0 && (
          <div
            className="column-as-measure-mapping-column-searcher-clear"
            role="button"
            onClick={onClearSearchQuery}
          >
            <span className="ms-Icon ms-Icon--ChromeClose" />
          </div>
        )}
      </div>
      <div className="column-as-measure-mapping-content-scrollable-container column-as-measure-mapping-content-scrollable-container-columns">
        {filteredItems.length > 0 ? (
          filteredItems.map((fieldItem) => {
            const isFieldItemAssigned = checkIsFieldItemAssigned(fieldItem);
            return (
              <div
                key={fieldItem.id}
                className="column-as-measure-mapping-column-content"
                draggable={!isFieldItemAssigned}
                onDragStart={onDragStartHandler(fieldItem)}
              >
                <div className="column-as-measure-mapping-column-content-checkbox">
                  <input
                    className={cn({
                      "column-as-measure-mapping-content-disabled": isDisabled,
                    })}
                    type="checkbox"
                    checked={isFieldItemAssigned}
                    onChange={onFieldItemClick(fieldItem, isFieldItemAssigned)}
                  />
                </div>
                <div className="column-as-measure-mapping-column-content-label">
                  {fieldItem.label}
                </div>
              </div>
            );
          })
        ) : (
          <div className="column-as-measure-mapping-no-search-items-found">
            <div>
              No items found for <br /> <code>{searchQuery}</code>
            </div>
            <div
              className="column-as-measure-mapping-clear-search-link"
              onClick={onClearSearchQuery}
              role="button"
            >
              Clear search
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
