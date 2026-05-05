---
feature: Accessibility Support
status: in-progress
started: 2026-05-05
---

# Accessibility Support

Adding screen reader support, keyboard navigation, and proper ARIA semantics to `FieldsKeeperBucket` and `FieldsKeeperRootBucket`.

## Motivation

The library relies entirely on drag-and-drop with no keyboard alternative. Bucket items, folder toggles, and assignment checkboxes are either unreachable or poorly described for assistive technologies.

## Scope

Three components carry all the work:
- `FieldsKeeperBucket.tsx` — drop targets, field items, remove/edit interactions
- `FieldsKeeperRootBucket.tsx` — source items, folder hierarchy, search
- `FieldsKeeperSearcher.tsx` — already had basic aria-label coverage, no changes needed

## Phases

### Phase 1 — ARIA labels ✅
What was done:
- Bucket drop zone: `role="list"`, `aria-label="{label} bucket"`, `aria-disabled`
- Bucket field item rows: `role="listitem"`, `aria-label`, `aria-disabled`, `data-field-id`
- Bucket group wrapper: `role="group"`, `aria-label={groupLabel}`
- Remove button: `aria-label="Remove {fieldItem.label}"` (was generic "Remove Field")
- Inline edit inputs: `aria-label="Edit label for {fieldItem.label}"` in both components
- Root container: `role="region"`, `aria-label`, `aria-disabled`
- Scrollable content area: `aria-label="Field list"`
- Folder scope wrapper: `role="group"`, `aria-label={itemLabel}`
- Folder label button: `aria-expanded={!isFolderCollapsed}` (was missing entirely)
- Root item rows: `aria-label`, `aria-selected={isFieldItemAssigned}`, `aria-disabled`

### Phase 2a — Keyboard controls ✅
What was done:
- Bucket items: `tabIndex={disabled ? -1 : 0}` — reachable by Tab
- `Enter`/`Space` on bucket item → triggers `onFieldItemClick`
- `Delete`/`Backspace` on bucket item → removes item (when `allowRemoveFields`)
- `Escape` in inline edit → cancels and restores original label (was missing in Bucket, present in RootBucket)
- Root items with `ignoreCheckBox=true`: `tabIndex={0}`, `Enter`/`Space` assigns/unassigns
- `stopPropagation` added to inline edit `onKeyDown` in both components to prevent key bubbling

### Phase 2b — Arrow key navigation ✅
What was done:
- `ArrowDown`/`ArrowUp` on bucket items navigates between `[role="listitem"][tabindex="0"]` siblings
- `ArrowDown`/`ArrowUp` on root items navigates between focusable items in the scrollable container

### Phase 3 — Focus restoration ✅
What was done:
- After item remove (keyboard or button click): focus moves to next item, or previous if at end, or bucket container if empty
- After inline edit closes: focus returns to the edited item via `data-field-id` lookup
- `bucketListRef` threaded from `FieldsKeeperBucket` into `GroupedItemRenderer` to support DOM queries

## Known Gaps (next pass)

These deviate from WAI-ARIA Authoring Practices and should be addressed:

**1. Roving tabindex**
All bucket items currently have `tabIndex={0}`, creating N tab stops for N items. The correct pattern for composite widgets is roving tabindex — one item has `tabIndex={0}`, all others `tabIndex={-1}`. Tab enters the widget, arrow keys navigate within it.

**2. `aria-live` announcements**
State changes (item assigned, removed, moved) are not announced to screen readers. A visually-hidden `aria-live="polite"` region in the Provider should announce e.g. *"Sales added to Rows"*, *"Revenue removed"*.

**3. Proper `role="listbox"` / `role="tree"` semantics**
- Bucket items should use `role="listbox"` + `role="option"` — gives screen readers positional context ("item 2 of 5") and selection state for free.
- Folder hierarchy in RootBucket should use `role="tree"` + `role="treeitem"` + `aria-level` + `aria-setsize` + `aria-posinset`.

**4. Keyboard drag-and-drop alternative**
No keyboard mechanism to pick up an item and move it between buckets. WAI-ARIA DnD pattern: Enter to grab, arrow keys to target bucket, Enter to drop, Escape to cancel.

## Key Decisions

- **`stopPropagation` on inline edit inputs**: Prevents Arrow/Delete keys typed in the edit input from triggering the outer item's navigation/remove handlers.
- **`data-field-id` on bucket items**: Used for post-edit focus restoration. Preferred over `aria-label` lookup since labels can contain special characters.
- **`removeWithFocusRestore` wrapper**: Centralises remove + focus logic in `GroupedItemRenderer` so both keyboard Delete and the × button share the same behaviour.
- **Root bucket arrow nav selector**: Uses `[aria-label][tabindex]` filtered to `tabindex >= 0` rather than a role selector, because the root bucket mixes `ignoreCheckBox` and non-`ignoreCheckBox` items with different tab behaviours.
