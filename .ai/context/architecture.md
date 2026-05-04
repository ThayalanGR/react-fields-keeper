# Architecture

## Component Hierarchy

```
FieldsKeeperProvider          (src/FieldsKeeper/FieldsKeeperProvider.tsx)
│  Creates a Zustand store keyed by instanceId
│  Distributes instanceId via React Context
│
├── FieldsKeeperRootBucket    (src/FieldsKeeper/FieldsKeeperRootBucket.tsx)
│   │  Renders all unassigned items with grouping, folders, search
│   └── FieldsKeeperSearcher  (src/FieldsKeeper/FieldsKeeperSearcher.tsx)
│       Items are draggable HTML elements; click assigns to priority bucket
│
└── FieldsKeeperBucket        (src/FieldsKeeper/FieldsKeeperBucket.tsx)
    Renders assigned items for one named slot
    Items are draggable; bucket is a drop target
    exportable: assignFieldItems() (programmatic assignment)
```

---

## State Management (Zustand)

**Store file**: `src/FieldsKeeper/FieldsKeeper.context.ts`

The store is a **global singleton with per-instance slices** — each `FieldsKeeperProvider` registers its own key in the store using its `instanceId` (defaults to a UUID). This makes nested providers possible without state collision.

**State shape per instance**:
```typescript
{
  allItems: IFieldsKeeperItem[];         // Full catalog of items
  buckets: IFieldsKeeperBucket[];        // Named buckets + their assigned items
  instanceId?: string;
  allowDuplicates?: boolean;
  accentColor?: string;
  accentHighlightColor?: string;
  iconColor?: string;
  foldersMeta?: Record<string, IFieldsKeeperFolder>;
  highlightAcrossBuckets?: IHighlightAcrossBuckets;
  highlightedItemId?: string;
  setHighlightedItem: (instanceId, itemId | null) => void;
}
```

**Reading state**: components call `useFieldsKeeperStore(instanceId)` to subscribe to their instance slice.  
**Writing state**: the `onUpdate` callback on `FieldsKeeperProvider` is the primary external update path; internally Zustand actions update the store.

---

## Data Flow

```
Consumer code
  │
  ▼
FieldsKeeperProvider
  Props: { allItems, buckets, onUpdate, ...config }
  │  Initializes Zustand store slice
  │
  ├─► FieldsKeeperRootBucket
  │     Reads: store.allItems minus items already in buckets
  │     On item click → calls assignFieldItems() → updates store → triggers onUpdate
  │     On drag start → sets HTML5 drag data
  │
  └─► FieldsKeeperBucket (one per slot)
        Reads: store.buckets[id].items
        On drop → calls assignFieldItems() → updates store → triggers onUpdate
        On remove icon → calls assignFieldItems(remove=true) → updates store → triggers onUpdate
```

**`assignFieldItems`** (in `FieldsKeeperBucket.tsx`) is the single core mutation function. It handles:
- Moving items between buckets
- Respecting `acceptTypes` on target bucket
- Enforcing `maxItems` per bucket
- `allowDuplicates` guard
- Group-preserving sort (by `groupOrder`)
- Triggering `onUpdate` with `StateUpdateInfo`

---

## Drag & Drop

Uses **native HTML5 drag/drop API** — no external DnD library.

- `draggable="true"` on item elements
- `onDragStart`: serializes item ID + source bucket ID into `dataTransfer`
- `onDragOver`: bucket listens and calls `onBucketDropBlockHandler` if provided to check if drop is allowed; shows `WarningTooltip` if blocked
- `onDrop`: deserializes, calls `assignFieldItems`
- `onDragEnd`: clears drag state

Drop blocking: `onBucketDropBlockHandler(args) => { isShouldBlockAssignment, warningMessage }` — consumer controls what can be dropped where.

---

## Grouping & Hierarchy

Items support two grouping modes (can coexist):

| Mode | Fields | Visual Result |
|---|---|---|
| **Group** | `group`, `groupLabel`, `groupIcon`, `groupOrder` | Collapsible group headers within a bucket |
| **Flat group** | `flatGroup`, `flatGroupLabel`, `flatGroupIcon` | Flat section separators |

**Folders** (`folders: string[]` on item + `foldersMeta` on provider) — root bucket can scope items into expandable folder sections (like a sidebar tree).

**Search** — `fuzzy-search` library does fuzzy matching across item labels. `mark.js` highlights matched text in DOM.

---

## Rendering Customization

All components accept escape-hatch renderer props:

| Prop | Where | Purpose |
|---|---|---|
| `customItemRenderer` | Bucket | Full replacement for item row |
| `suffixNodeRenderer` | Bucket & RootBucket | Custom icon/menu at end of item row |
| `onContextMenuRenderer` | Bucket & RootBucket | Custom right-click menu content |
| `bucketLabelSuffixRenderer` | Bucket | Addon to bucket header |
| `prefixNode` | RootBucket | Icon area config before item label |

The `SuffixNode` component + `ContextMenu` component (in `src/Components/`) are provided as convenience building blocks for implementing common "⋮ more" menus.

---

## Multi-Provider / Nesting

Pass a unique `instanceId` to each `FieldsKeeperProvider` to scope their Zustand slices independently. Nested providers are fully supported for complex layouts (e.g. a dashboard with multiple independent field-assignment panels).

---

## CSS Architecture

- Written in **Less** (`src/FieldsKeeper/fieldsKeeper.less`)
- Class prefix: `react-fields-keeper-*`
- MS Fluent icon classes: `.fk-ms-Icon-*`
- At build time, Less is compiled and **injected into the JS bundle** via `vite-plugin-css-injected-by-js` — consumers don't need to import any CSS file separately
- Theming done via props (`accentColor`, `iconColor`, `accentHighlightColor`) applied as inline styles to specific elements
