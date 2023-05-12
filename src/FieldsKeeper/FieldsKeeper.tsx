// imports
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import cn from "classnames";
import FuzzySearch from "fuzzy-search";
import "./fieldsKeeper.less";

// types
type IFieldsKeeperItem = string;

interface IFieldsKeeperBucket {
  id: string;
  items: IFieldsKeeperItem[];
}

interface IFieldsKeeperRootBucketProps {
  label?: string;
  isDisabled?: boolean;
}

interface IFieldsKeeperState {
  allItems: IFieldsKeeperItem[];
  buckets: IFieldsKeeperBucket[];
}

interface IFieldsKeeperActions {
  updateState: (state: Partial<IFieldsKeeperState>) => void;
}

interface IFieldsKeeperProviderProps extends IFieldsKeeperState {
  children?: ReactNode;
  onUpdate?: (state: IFieldsKeeperState) => void;
}

interface IFieldsKeeperBucketProps {
  id: string;
  label?: string;
  /**
   * @default - Infinite
   */
  maxItems?: number;
  /**
   * @default - true
   */
  enableRemoveFieldItem?: boolean;
}

// constatns
const FieldsKeeperContext = createContext<
  IFieldsKeeperState & IFieldsKeeperActions
>({
  allItems: [],
  buckets: [],
  updateState: () => {}
});

// components
export const FieldsKeeperProvider = (props: IFieldsKeeperProviderProps) => {
  // props
  const { children, allItems, buckets, onUpdate } = props;

  // state
  const [state, updateState] = useState<IFieldsKeeperState>({
    allItems,
    buckets
  });

  // actions =
  const tapUpdateState = (newState: Partial<IFieldsKeeperState>) => {
    const requriedState = { ...state, ...newState };
    updateState(requriedState);

    // intorduce delayed upates later
    onUpdate?.({
      allItems: requriedState.allItems,
      buckets: requriedState.buckets
    });
  };

  // paint
  return (
    <FieldsKeeperContext.Provider
      value={{ ...state, updateState: tapUpdateState }}
    >
      {children}
    </FieldsKeeperContext.Provider>
  );
};

export const FieldsKeeperBucket = (props: IFieldsKeeperBucketProps) => {
  // props
  const {
    id,
    label,
    enableRemoveFieldItem = true,
    maxItems = Number.MAX_SAFE_INTEGER
  } = props;

  // state
  const [isCurrentFieldActive, setIsCurrentFieldActive] = useState(false);
  const { buckets, updateState } = useContext(FieldsKeeperContext);
  const { items } = useMemo(() => buckets.find((bucket) => bucket.id === id), [
    buckets,
    id
  ]) ?? { items: [] };

  // actions
  const assignFieldItem = (fieldItem: string, removeOnly?: boolean) => {
    const newBuckets = [...buckets];
    newBuckets.forEach((bucket) => {
      // removes item from old bucket
      const foundOldItemIndex = bucket.items.findIndex(
        (item) => item === fieldItem
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

  const onFieldItemRemove = (fieldItem: string) => () =>
    assignFieldItem(fieldItem, true);

  // event handlers
  const onDragStartHandler = (fieldItem: string) => (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.dataTransfer.setData("fieldKeeperItem", fieldItem);
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
    const fieldItem = e.dataTransfer.getData("fieldKeeperItem");
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
          "column-as-measure-mapping-content-multi-input": hasRoomForFieldAssignment,
          "column-as-measure-mapping-content-input-active": isCurrentFieldActive
        })}
        onDrop={onDropHandler}
        onDragOver={onDragOverHandler}
        onDragEnter={onDragEnterHandler}
        onDragLeave={onDragLeaveHandler}
      >
        {items.length > 0 ? (
          items.map((item, measureRoleIndex) => (
            <div
              key={`${item}-${measureRoleIndex}`}
              className="column-as-measure-mapping-content-input-filled"
              draggable
              onDragStart={onDragStartHandler(item)}
              onDragOver={onDragOverHandler}
            >
              <div className="column-as-measure-mapping-content-input-filled-value">
                {item}
              </div>
              {enableRemoveFieldItem && (
                <div
                  className={cn(
                    "column-as-measure-mapping-content-input-filled-close",
                    {
                      "column-as-measure-mapping-content-disabled": enableRemoveFieldItem
                    }
                  )}
                  role="button"
                  onClick={onFieldItemRemove(item)}
                >
                  <span className="ms-Icon ms-Icon--ChromeClose">x</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="column-as-measure-mapping-content-input-placeholder">
            Add data fields here
          </div>
        )}
      </div>
    </div>
  );
};

export const FieldsKeeperRootBucket = (props: IFieldsKeeperRootBucketProps) => {
  // props
  const { label, isDisabled } = props;

  // refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // state
  const { allItems, buckets, updateState } = useContext(FieldsKeeperContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<string[]>(allItems);

  // actions
  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value ?? "");
  };

  const onClearSearchQuery = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const checkIsFieldItemAssigned = (fieldItem: string) => {
    return buckets.some((bucket) =>
      bucket.items.some((item) => item === fieldItem)
    );
  };

  const onFieldItemClick = (fieldItem: string, remove = false) => () => {
    const newBuckets = [...buckets];

    if (remove) {
      newBuckets.some((bucket) => {
        // removes item from old bucket
        const foundOldItemIndex = bucket.items.findIndex(
          (item) => item === fieldItem
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
  const onDragStartHandler = (fieldItem: string) => (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.dataTransfer.setData("fieldKeeperItem", fieldItem);
  };

  // effects
  useEffect(() => {
    const searcher = new FuzzySearch(allItems, [], { sort: true });
    const result = searcher.search(searchQuery);
    setFilteredItems(result);
  }, [searchQuery, allItems]);

  // paint
  return (
    <div
      className={cn("column-as-measure-mapping-container", {
        "column-as-measure-mapping-content-disabled": isDisabled
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
          filteredItems.map((fieldItem, index) => {
            const isFieldItemAssigned = checkIsFieldItemAssigned(fieldItem);
            return (
              <div
                key={`${fieldItem}-${index}`}
                className="column-as-measure-mapping-column-content"
                draggable={!isFieldItemAssigned}
                onDragStart={onDragStartHandler(fieldItem)}
              >
                <div className="column-as-measure-mapping-column-content-checkbox">
                  <input
                    className={cn({
                      "column-as-measure-mapping-content-disabled": isDisabled
                    })}
                    type="checkbox"
                    checked={isFieldItemAssigned}
                    onChange={onFieldItemClick(fieldItem, isFieldItemAssigned)}
                  />
                </div>
                <div className="column-as-measure-mapping-column-content-label">
                  {fieldItem}
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
