# Accessibility

Current state of ARIA support and keyboard interaction in the library.

## What's implemented

### FieldsKeeperBucket
- Drop zone: `role="list"`, `aria-label="{label} bucket"`, `aria-disabled`
- Field items: `role="listitem"`, `tabIndex={disabled ? -1 : 0}`, `aria-label`, `aria-disabled`, `data-field-id`
- Group wrapper: `role="group"`, `aria-label={groupLabel}`
- Remove button: `role="button"`, `tabIndex={0}`, `aria-label="Remove {fieldItem.label}"`
- Group collapse button: `role="button"`, `tabIndex={0}`, `aria-label="Expand/Collapse {group}"`
- Inline edit input: `aria-label="Edit label for {name}"`
- Keyboard: `ArrowUp`/`ArrowDown` navigation, `Enter`/`Space` click, `Delete`/`Backspace` remove, `Escape` cancel edit
- Focus restoration: after remove → next/previous item or container; after edit → `data-field-id` lookup

### FieldsKeeperRootBucket
- Container: `role="region"`, `aria-label`, `aria-disabled`
- Scrollable area: `aria-label="Field list"`
- Folder wrapper: `role="group"`, `aria-label={folderLabel}`
- Folder button: `role="button"`, `tabIndex={0}`, `aria-expanded`, `aria-label="Expand/Collapse {folder}"`
- Root items: `aria-label`, `aria-selected={isAssigned}`, `aria-disabled`
- Root items (`ignoreCheckBox=true`): `tabIndex={0}`, `Enter`/`Space` assigns/unassigns
- Checkboxes: `aria-label="Select {fieldItem.label}"`, `tabIndex={0}`
- Inline edit input: `aria-label="Edit label for {name}"`
- Keyboard: `ArrowUp`/`ArrowDown` navigation between focusable items

### FieldsKeeperSearcher
- Search input: `aria-label={searchPlaceholder}`
- Clear button: `role="button"`, `tabIndex={0}`, `aria-label="Clear Search"`

## Known gaps

| Gap | Impact | Notes |
|---|---|---|
| Roving tabindex | Medium | All items have `tabIndex={0}` — N tab stops for N items. WAI-ARIA composite widgets should use one-at-a-time. |
| `aria-live` announcements | High | No screen reader announcements when items are assigned, removed, or moved. |
| `role="listbox"` + `role="option"` | Medium | Bucket items lack positional context ("item 2 of 5") that a proper listbox provides. |
| `role="tree"` hierarchy | Low | Folder hierarchy in RootBucket should use `role="tree"` + `role="treeitem"` + `aria-level`. |
| Keyboard DnD alternative | High | No way to move items between buckets via keyboard — only click/checkbox assign exists. |

## Key implementation details

- **`data-field-id`** attribute on bucket items is used for post-edit focus restoration. Do not remove it.
- **`stopPropagation`** on inline edit input `onKeyDown` prevents Arrow/Delete keys from triggering the parent item's navigation handlers while typing.
- **`removeWithFocusRestore`** in `GroupedItemRenderer` wraps the remove function to shift focus before the DOM update removes the element.
