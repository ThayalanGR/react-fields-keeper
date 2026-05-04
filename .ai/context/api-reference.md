# API Reference

## Public Exports (`src/index.ts`)

```typescript
// Core components
export { FieldsKeeperProvider }    from './FieldsKeeper/FieldsKeeper';
export { FieldsKeeperBucket }      from './FieldsKeeper/FieldsKeeper';
export { FieldsKeeperRootBucket }  from './FieldsKeeper/FieldsKeeper';
export { FieldsKeeperSearcher }    from './FieldsKeeper/FieldsKeeper';

// Utility function (programmatic assignment)
export { assignFieldItems }        from './FieldsKeeper/FieldsKeeperBucket';

// All TypeScript types/interfaces
export * from './FieldsKeeper/FieldsKeeper.types';

// Shared UI components
export { ContextMenu }             from './Components';
export { SuffixNode }              from './Components';
```

---

## Core Data Types

### `IFieldsKeeperItem<T = any>`
```typescript
interface IFieldsKeeperItem<T = any> {
  id: string;                          // Required. Unique identifier.
  sourceId?: string;                   // For duplicate tracking when allowDuplicates=true
  label: string;                       // Display text
  value?: T;                           // Arbitrary custom payload
  folders?: string[];                  // Folder IDs this item belongs to
  group?: string;                      // Group ID (for collapsible group headers in buckets)
  groupLabel?: string;                 // Group display name
  groupIcon?: 'hierarchy-icon' | ReactNode;
  groupOrder?: number;                 // Sort order within group
  flatGroup?: string;                  // Alternative flat grouping ID
  flatGroupLabel?: string;
  flatGroupIcon?: 'contact-card' | ReactNode;
  type?: string;                       // Used with bucket.acceptTypes to restrict drops
  prefixNode?: string | ReactNode;     // Icon/node shown before label
  activeNodeClassName?: string;        // CSS class when item is in a bucket
  rootBucketActiveNodeClassName?: string; // CSS class when item is in root bucket
  tooltip?: string;                    // Tooltip when assigned to bucket
  rootTooltip?: string;               // Tooltip in root bucket
  disabled?: IFieldKeeperItemDisabled; // Disable in bucket context
  rootDisabled?: IFieldKeeperItemDisabled; // Disable in root bucket context
  _fieldItemIndex?: number;           // Internal — do not set manually
}

type IFieldKeeperItemDisabled = boolean | { message?: string };
```

### `IFieldsKeeperBucket<T = any>`
```typescript
interface IFieldsKeeperBucket<T = any> {
  id: string;
  items: IFieldsKeeperItem<T>[];
  maxItems?: number;                   // Cap on assigned items
  disabled?: boolean;
  acceptTypes?: string[];              // Only accept items whose type is in this list
}
```

### `IFieldsKeeperFolder`
```typescript
interface IFieldsKeeperFolder {
  id: string;
  label: string;
  prefixNodeIcon?: string | ReactNode;
  isHidden?: boolean;
  activeFolderClassName?: string;
}
```

---

## FieldsKeeperProvider Props

```typescript
interface IFieldsKeeperProviderProps {
  allItems: IFieldsKeeperItem[];
  buckets: IFieldsKeeperBucket[];
  onUpdate?: (state: IFieldsKeeperState, updateInfo: StateUpdateInfo) => void;
  instanceId?: string;                // For nested providers; auto-generated if omitted
  allowDuplicates?: boolean;          // Allow same item in multiple buckets
  accentColor?: string;               // Primary highlight color
  accentHighlightColor?: string;      // Secondary highlight color
  iconColor?: string;                 // Icon tint
  foldersMeta?: Record<string, IFieldsKeeperFolder>;
  highlightAcrossBuckets?: IHighlightAcrossBuckets;
}

type StateUpdateInfo = {
  fieldItems: IFieldsKeeperItem[];    // Items that were moved
  fromBucket: string | null;          // Source bucket ID (null = root)
  targetBucket: string | null;        // Destination bucket ID (null = root/removed)
  isRemoved: boolean;                 // True when item was removed from a bucket
};
```

---

## FieldsKeeperBucket Props

```typescript
interface IFieldsKeeperBucketProps {
  id: string;                          // Must match a bucket ID in state
  label?: ReactNode;                   // Bucket header label
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal'; // Default: vertical
  allowRemoveFields?: boolean;         // Show × remove button on items
  allowDragging?: boolean;             // Enable drag-and-drop (default: true)
  maxItems?: number;                   // Override bucket.maxItems
  acceptTypes?: string[];              // Override bucket.acceptTypes
  className?: string;
  labelClassName?: string;
  suffixNodeRenderer?: (props: ISuffixBucketNodeRendererProps) => JSX.Element;
  customItemRenderer?: (props: ICustomBucketItemRendererProps) => JSX.Element;
  onContextMenuRenderer?: (props: ISuffixBucketNodeRendererProps) => JSX.Element;
  bucketLabelSuffixRenderer?: () => JSX.Element;
  onFieldItemClick?: (item: IFieldsKeeperItem, event: MouseEvent) => void;
  onFieldItemLabelChange?: (props: IFieldItemLabelChangeProps) => void;
  onBucketDropBlockHandler?: (args: IBucketDropBlockArgs) => IBucketDropBlock;
  instanceId?: string;                 // For nested providers
  sortGroupItems?: boolean;
  noItemsRenderer?: () => JSX.Element;
}

type IBucketDropBlock = {
  isShouldBlockAssignment: boolean;
  warningMessage: string | JSX.Element;
};

type ISuffixBucketNodeRendererProps = {
  fieldItem: IFieldsKeeperItem;
  bucketId?: string;
  isGroupHeader?: boolean;
  groupFieldItems?: IFieldsKeeperItem[];
  onRenameField?: () => void;
  onMoveFieldToBucket?: (targetBucketId: string, fieldItems?: IFieldsKeeperItem[]) => void;
};
```

---

## FieldsKeeperRootBucket Props

```typescript
interface IFieldsKeeperRootBucketProps {
  label?: string;                      // Section heading
  searchPlaceholder?: string;
  filteredItems?: IFieldsKeeperItem[]; // Override displayed items completely
  shouldRender?: (item: IFieldsKeeperItem) => boolean; // Filter predicate
  collapseFoldersOnMount?: boolean;    // Default: true
  collapseHierarchyOnMount?: boolean;  // Default: false
  sortGroupItems?: boolean;
  prefixNode?: {
    allow: boolean;
    reserveSpace?: boolean;
    reservedWidth?: number;
  };
  suffixNodeRenderer?: (props: ISuffixRootNodeRendererProps) => JSX.Element;
  onContextMenuRenderer?: (props: ISuffixRootNodeRendererProps) => JSX.Element;
  customSearchQuery?: string;          // Controlled search input
  onClearSearch?: () => void;
  getPriorityTargetBucketToFill?: (props: IGetPriorityTargetBucketToFillProps) => IFieldsKeeperBucket;
  onFieldItemClick?: (item: IFieldsKeeperItem, event: MouseEvent) => void;
  onFieldItemLabelChange?: (props: IFieldItemLabelChangeProps) => void;
  onFolderStateChange?: (folderId: string, isExpanded: boolean) => void;
  initialFolderStates?: Record<string, boolean>;
  instanceId?: string;
  noItemsRenderer?: () => JSX.Element;
}

type ISuffixRootNodeRendererProps<T = any> = {
  type: 'folder' | 'group' | 'leaf' | 'table' | 'hierarchy';
  fieldItem?: IFieldsKeeperItem<T>;
  onExpandCollapseAll?: (isCollapse: boolean) => void;
  assignFieldBucketItem?: (bucketId: string, instanceId: string) => void;
  onRenameField?: () => void;
};
```

---

## FieldsKeeperSearcher Props

```typescript
interface IFieldsKeeperSearcherProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (event: KeyboardEvent) => void;
  ref?: RefObject<HTMLInputElement>;
}
```

---

## assignFieldItems (programmatic API)

Exported function for programmatically assigning items outside of drag/drop interactions:

```typescript
function assignFieldItems(params: {
  instanceId: string;
  bucketId: string;
  fieldItems: IFieldsKeeperItem[];
  fromBucketId?: string;       // Source bucket (null = from root)
  removeOnly?: boolean;         // Just remove, don't assign
}): void
```

---

## ContextMenu Props

```typescript
interface IContextMenuProps {
  referenceElement: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  menuOptions: IContextMenuOption[];
  placement?: PopperPlacement;      // react-popper placement
}

interface IContextMenuOption {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  subMenuOptions?: IContextMenuOption[];
  divider?: boolean;
}
```

---

## SuffixNode Props

Convenience wrapper around ContextMenu + a vertical dots (⋮) trigger icon:

```typescript
interface ISuffixNodeProps {
  menuOptions: IContextMenuOption[];
  placement?: PopperPlacement;
}
```

---

## IHighlightAcrossBuckets

```typescript
interface IHighlightAcrossBuckets {
  enabled: boolean;
  highlightColor?: string;
  activeHighlightColor?: string;
}
```
When enabled, hovering/clicking an item in one bucket highlights the same item ID wherever it appears across all buckets (useful with `allowDuplicates`).

---

## Examples Reference

39 examples live in `src/Examples/`. Each is named descriptively:

| File | Feature Demonstrated |
|---|---|
| Example1 | Basic setup |
| Example2 | Item highlighting |
| Example3 | Grouped items |
| Example4 | Priority bucket auto-fill |
| Example5 | Disabled fields |
| Example22 | acceptTypes restriction |
| Example28 | Nested folders |
| Example31 | Custom CSS styling |
| Example32 | Context menus |
| Example38 | Multi-provider nesting |
| Example39_* | Latest features (root label edit, etc.) |

Run `npm run dev` and navigate to `#example-N` in the browser to see any example live.
