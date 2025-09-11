/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactElement, ReactNode } from 'react';
import { StateUpdateInfo } from './FieldsKeeper.context';

// types
/**
 * Represents an item within a FieldsKeeper structure.
 */
export interface IFieldsKeeperFolder {
    /** Unique ID for the item */
    id: string;

    /** Display label for the item */
    label: string;

    /** Optional icon or React node shown before the label */
    prefixNodeIcon?:
        | 'folder-icon'
        | 'multi-calculator-icon'
        | 'contact-card'
        | 'hierarchy-icon'
        | 'table-icon'
        | 'calendar-icon'
        | 'globe-icon'
        | ReactNode;

    /** Controls whether the folder is hidden from view */
    isHidden?: boolean;

    /** CSS class name applied to the folder when it is in active state */
    activeFolderClassName?: string;
}

export interface IFieldsKeeperItem<T = any> {
    /** Unique identifier for the item */
    id: string;

    /**
     * Optional unique identifier for the item, which can be used in case of duplicates
     */
    sourceId?: string;

    /** Display label for the item */
    label: string;

    /**
     * Optional value associated with the item, allowing customization.
     */
    value?: T;

    /**
     * Names of folders where this item is placed
     * */
    folders?: string[];

    // Grouping properties

    /** Identifier for grouping items */
    group?: string;

    /** Display label for the item's group */
    groupLabel?: string;

    /**
     * Icon for the group, either a specific icon name or a custom React node.
     * @type {'hierarchy-icon' | ReactNode}
     */
    groupIcon?: 'hierarchy-icon' | ReactNode;

    /** Identifier for grouping items */
    flatGroup?: string;

    /** Display label for the item's group */
    flatGroupLabel?: string;

    /**
     * Icon for the flat group, either a specific icon name or a custom React node.
     * @type {'contact-card' | ReactNode}
     */
    flatGroupIcon?: 'contact-card' | ReactNode;

    /** Order for grouping; lower numbers appear first */
    groupOrder?: number;

    /**
     * Scope within folders. Items are displayed based on this scope.
     * Defaults to a flat view if unspecified.
     * @deprecated
     */
    folderScope?: string;

    /**
     * Display label for the folder scope, used for grouping or categorization.
     * @deprecated
     */
    folderScopeLabel?: string;

    // CSS class names

    /** CSS class name for active state */
    activeNodeClassName?: string;

    /** CSS class name for active state within the root bucket */
    rootBucketActiveNodeClassName?: string;

    // Tooltip properties

    /** Tooltip text displayed on hover */
    tooltip?: string;

    /** Tooltip for the root item */
    rootTooltip?: string;

    // Disabled properties

    /** Controls disabled state */
    disabled?: IFieldKeeperItemDisabled;

    /** Controls root-level disabled state */
    rootDisabled?: IFieldKeeperItemDisabled;

    /**
     * Internal use only: Index of the field item for internal sorting.
     */
    _fieldItemIndex?: number;

    /**
     *
     *
     * pass 'measure-icon' to show default measure icon
     *
     */
    prefixNode?: 'measure-icon' | 'calculator-icon' | 'date-icon' | 'calculation-group-icon' | 'calculation-group-item-icon' | 'globe-icon' | 'planning-icon' | ReactNode;

    /**
     * useful for matching the field item type with corresponding bucket type
     */
    type?: string;
}

/**
 * Describes the disabled state for a FieldsKeeper item.
 */
export interface IFieldKeeperItemDisabled {
    /** Indicates if the item is actively disabled */
    active: boolean;

    /**
     * Determines whether the group label is disabled.
     * Defaults to true.
     */
    disableGroupLabel?: boolean;

    /** Custom message explaining the disabled state */
    message?: string;
}

/**
 * Represents a bucket containing FieldsKeeper items.
 */
export interface IFieldsKeeperBucket<T = any> {
    /** Unique identifier for the bucket */
    id: string;

    /** List of items within the bucket */
    items: IFieldsKeeperItem<T>[];

    /** Maximum number of items allowed in the bucket */
    maxItems?: number;

    /** Indicates if the bucket is disabled */
    disabled?: boolean;
    acceptTypes?: string[];
}

/**
 * Properties required to determine the priority target bucket for filling items.
 */
export interface IGetPriorityTargetBucketToFillProps {
    /** Available buckets to fill */
    buckets: IFieldsKeeperBucket[];

    /** The item being filled into a bucket */
    currentFillingItem: IFieldsKeeperItem[];

    /** Optional group to prioritize */
    priorityGroup?: string;
}

export interface ISuffixRootNodeRendererProps <T = any> {
  type: 'folder' | 'group' | 'leaf' | 'table' | 'hierarchy';
  fieldItem?: IFieldsKeeperItem<T>;
  onExpandCollapseAll?: (isCollapse: boolean) => void;
  assignFieldBucketItem?: (bucketId: string, instanceId: string) => void;
}

export interface IHighlightAcrossBuckets {
    enabled: boolean;
    highlightColor: string;
    highlightDuration?: number;
}
export interface ICrossHighlightAcrossBuckets extends IHighlightAcrossBuckets {
    crossHighlightIds: string[];
}

/**
 * Root properties for configuring a FieldsKeeper bucket.
 */
export interface IFieldsKeeperRootBucketProps {
    /** Label for the root bucket */
    label?: string;

    /** CSS class name for the label */
    labelClassName?: string;

    /** CSS class name for the wrapper */
    wrapperClassName?: string;

    /** Indicates if the root bucket is disabled */
    isDisabled?: boolean;

    /** Sort items based on group order when assigning */
    sortGroupOrderWiseOnAssignment?: boolean;

    /**
     * Function to determine the priority bucket for filling.
     * If undefined, the default handler is used.
     */
    getPriorityTargetBucketToFill?: (
        props: IGetPriorityTargetBucketToFillProps,
    ) => IFieldsKeeperBucket | undefined;

    /** Instance ID, useful for nested FieldsKeeperProvider setups */
    instanceId?: string;

    /** If true, ignores checkboxes */
    ignoreCheckBox?: boolean;

    /** Custom query for internal search */
    customSearchQuery?: string;

    /** Shows clear link for custom search if true */
    showClearSearchLink?: boolean;

    /** Function triggered to clear the search query */
    onClearSearch?: () => void;

    /** Placeholder text for the search input */
    searchPlaceholder?: string;

    /** Message to display when the filter yields no results */
    emptyFilterMessage?: string;

    /** If true, disables the empty filter message */
    disableEmptyFilterMessage?: boolean;

    /** Allows dragging fields after assignment if true */
    allowDragAfterAssignment?: boolean;

    /**
     * Determines if dragging is allowed
     * @default true
     */
    allowDragging?: boolean;

    /**
     * Function to decide if an item should render within this bucket.
     */
    shouldRender?: <T>(item: IFieldsKeeperItem<T>) => boolean;

    /** Toggles checkbox on label click if true */
    toggleCheckboxOnLabelClick?: boolean;

    /**
     * Auto collapse folders on mount
     *
     * default - true
     */
    collapseFoldersOnMount?: boolean;

    /**
     * Auto collapse Hierarchy on mount
     *
     * default - false
     */
    collapseHierarchyOnMount?: boolean;

    prefixNode?: {
        allow: boolean;
        /**
         * defaults to true
         */
        reserveSpace?: boolean;
        /**
         *
         * only applicable if reserveSpace is true
         *
         * default reserve space size (width) (15px)
         *
         */
        reservedWidth?: number;
    };

    /**  Function to customize suffix node rendering **/
    suffixNodeRenderer?: (props: ISuffixRootNodeRendererProps) => JSX.Element;

    /**  Function to render context menu on right click **/
    onContextMenuRenderer?: (props: ISuffixRootNodeRendererProps) => JSX.Element;

    /** If true, assignments will not be allowed */
    disableAssignments?: boolean;

    /** Filtered list of items based on certain conditions. */
    filteredItems?: IFieldsKeeperItem[];

    /** Message to show when there is no data. */
    emptyDataMessage?: string;

    /**
     * Optional object to specify custom class names for different UI components.
     */
    customClassNames?: {
        /**
         * Class name applied to the label element.
         */
        customLabelClassName?: string;

        /**
         * Class name applied to the individual field items.
         */
        customFieldItemClassName?: string;

        /**
         * Class name applied to a group.
         */
        customGroupItemClassName?: string;

        /**
         * Class name applied to checkbox.
         */
        customCheckBoxClassName?: string;
    };

    /**
     * Determines whether items are sorted based on their folder structure.
     * @default true
     */
    sortBasedOnFolder?: boolean;

    /**
     * Indicates whether to highlight the child elements of the group when the group header is hovered.
     */
    isHighlightGroupOnHover?: boolean;

    /**
     * Indicates whether to display suffix node at the time of hover only.
     */
    showSuffixOnHover?: boolean;

    /**
     * Configuration object for managing cross-highlight functionality 
     * across multiple buckets. When provided, it enables items in one 
     * bucket to influence highlighting behavior in others.
     */
    crossHighlightAcrossBucket?: ICrossHighlightAcrossBuckets;

    /**
     * Callback fired when a field item is clicked.
     *
     * @param fieldItem - The clicked field item.
     * @param event - The mouse event triggered by the click.
     */
    onFieldItemClick?: (
        fieldItem: IFieldsKeeperItem,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => void;

    /**
     * Callback fired when a field item is rigth clicked (context menu).
     *
     * @param fieldItem - The clicked field item.
     * @param event - The mouse event triggered by the click.
     */
    onFieldItemContextMenu?: (
        fieldItem: IFieldsKeeperItem,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => void;
}

/**
 * State structure for the FieldsKeeper component.
 */
export interface IFieldsKeeperState {
    /** List of all items managed by FieldsKeeper */
    allItems: IFieldsKeeperItem[];

    /** Buckets for organizing items */
    buckets: IFieldsKeeperBucket[];

    /**
     * Function to determine the priority bucket for filling.
     */
    getPriorityTargetBucketToFill?: IFieldsKeeperRootBucketProps['getPriorityTargetBucketToFill'];

    /** Unique instance identifier for nested providers */
    instanceId?: string;

    /**
     * List of instance IDs allowed to share field items.
     */
    receiveFieldItemsFromInstances?: string[];

    /**
     * If true, allows duplicate items across buckets.
     * @default false
     */
    allowDuplicates?: boolean;

    /**
     * Allows setting an accent color for theming.
     */
    accentColor?: string;

    /**
     * Allows setting a highlight color for text.
     */
    accentHighlightColor?: string;

    /** Color for icons */
    iconColor?: string;

    /**
     * A list of folders with folder name as key and folder details as value
     */
    foldersMeta?: Record<string, IFieldsKeeperFolder>;

    /**
     
     * Configuration for highlighting items across multiple buckets.
     */
    highlightAcrossBuckets?: IHighlightAcrossBuckets;

    /**
     * @internal
     * ID of the currently highlighted item from Bucket.
     */
    highlightedItemId?: string;

    /**
     * @internal
     * Function to set or clear the highlighted item.
     * 
     * @param instanceId - The instance or scope identifier for the operation.
     * @param itemId - The ID of the item to highlight, or `null` to clear the highlight.
     */
    setHighlightedItem?: (instanceId: string, itemId: string | null) => void;

}

/**
 * Defines actions available within FieldsKeeper.
 */
export interface IFieldsKeeperActions {
    /**
     * Updates the FieldsKeeper state
     * @param state - Partial state to merge with the current state
     */
    updateState: (state: Partial<IFieldsKeeperState>) => void;
}

/**
 * Properties for the FieldsKeeper provider component.
 */
export interface IFieldsKeeperProviderProps extends IFieldsKeeperState {
    /** Children components within the provider */
    children?: React.ReactNode;

    /**
     * Callback function triggered on state updates
     * @param state - Current FieldsKeeper state
     * @param updateInfo - Information about the state update
     */
    onUpdate?: (state: IFieldsKeeperState, updateInfo: StateUpdateInfo) => void;
}

/**
 * Properties for configuring individual FieldsKeeper buckets.
 */
export interface IFieldsKeeperBucketProps {
    /** Unique identifier for the bucket */
    id: string;

    /** Label for the bucket */
    label?: ReactNode;

    /**
     * Allows removal of fields within this bucket
     * @default false
     */
    allowRemoveFields?: boolean;

    /** If true, the bucket is disabled */
    disabled?: boolean;

    /** Suffix node displayed at the end of the bucket */
    suffixNode?: ReactNode;

    /** Placeholder text when no fields are present */
    emptyFieldPlaceholder?: string;

    /**
     * Sorts items by group order when assigning
     * @default true
     */
    sortGroupOrderWiseOnAssignment?: boolean;

    /** Instance ID for nested bucket tracking */
    instanceId?: string;

    /** Shows extended assignment placeholder if true */
    showExtendedAssignmentPlaceholder?: boolean;

    /** Centers placeholder text if true */
    centerAlignPlaceholder?: boolean;

    /** CSS class name for placeholder wrapper */
    placeHolderWrapperClassName?: string;

    /** CSS class name for the bucket wrapper */
    wrapperClassName?: string;

    /**
     * Custom function for rendering field items in this bucket
     */
    customItemRenderer?: (props: IFieldItemCustomRendererProps) => JSX.Element;

    /**
     * Custom function for rendering suffix items specific to this bucket
     */
    suffixNodeRenderer?: (props: ISuffixBucketNodeRendererProps) => JSX.Element;

    /**  Function to render context menu on right click **/
    onContextMenuRenderer?: (props: ISuffixBucketNodeRendererProps) => JSX.Element;

    /** Layout orientation for items within the bucket */
    orientation?: 'vertical' | 'horizontal';

    /** Overflow behavior for horizontal layout */
    horizontalFillOverflowType?: 'wrap' | 'scroll';

    /** If true, groups are displayed flat */
    showAllGroupsFlat?: boolean;

    /** Callback triggered when a field item label is changed */
    onFieldItemLabelChange?: (
        fieldItemClickProps: IFieldItemLabelChangeProps,
    ) => void;

    /**
     * Callback fired when a field item is clicked.
     *
     * @param fieldItem - The clicked field item.
     * @param event - The mouse event triggered by the click.
     */
    onFieldItemClick?: (
        fieldItem: IFieldsKeeperItem,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => void;

    /**
     * Optional object to specify custom class names for different UI components.
     */
    customClassNames?: {
        /**
         * Class name applied to the label element.
         */
        customLabelClassName?: string;

        /**
         * Class name applied to the individual field items.
         */
        customFieldItemContainerClassName?: string;

        /**
         * Class name applied to a group.
         */
        customGroupContainerClassName?: string;

        customCheckBoxClassName?: string;
    };

    /**
     * Callback triggered to highlight the element.
     */
    onHighlightElement?: () => void;

    /** Specifies whether the group label can be edited. */
    allowGroupLabelToEdit?: boolean;

    /**
     * A function that renders a JSX element as a suffix for a bucket label.
     *
     * @param bucketId - The unique identifier of the bucket.
     * @returns A JSX element to be appended as a suffix to the bucket label.
     */
    bucketLabelSuffixRenderer?: (bucketId: string) => JSX.Element;

    /**
     * Determines if dragging is allowed
     * @default true
     */
    allowDragging?: boolean;
}

export interface IFieldItemLabelChangeProps {
    /** ID of the bucket containing the field item */
    bucketId: string;

    /** The clicked field item object */
    fieldItem: IFieldsKeeperItem;

    /** Previous value of the field item */
    oldValue: string;

    /** Updated value of the field item */
    newValue: string;

    /**
     * Index of the field item to which the label is updated.
     */
    fieldIndex?: number
}

/**
 * Custom renderer properties for suffix items within a bucket.
 */
export interface ISuffixBucketNodeRendererProps {
    /** The field item being rendered */
    fieldItem: IFieldsKeeperItem;

    /** ID of the bucket containing this item */
    bucketId?: string;

    // up when rendering group label
    isGroupHeader?: boolean;

    // when isGroupHeader is up all its children will be passed
    groupFieldItems?: IFieldsKeeperItem[];

    /**
     * Callback triggered when renaming a field.
     */
    onRenameField?: () => void;
}

/**
 * Interface representing the properties for a Suffix Node component.
 * Extends the ISuffixBucketNodeRendererProps interface.
 */
export interface ISuffixNodeProps extends Omit<IContextMenuProps, 'children'> {
    _dummy?: boolean;
}

/**
 * Represents the structure of a dropdown option.
 * Currently, we support only one level of submenu.
 */
export interface IContextMenuOption extends IDropdownOption {
    /**
     * An array of submenu options.
     * Note: Currently, We do not support submenu options inside other submenu options.
     */
    subMenuOptions?: IDropdownOption[];
}

/**
 * Represents the structure of a dropdown option.
 */
export interface IDropdownOption {
    /**
     * The label to be displayed for the dropdown option.
     */
    label: string;

    /**
     * A unique identifier for the dropdown option.
     */
    id: string;

    /**
     * Adds a separator before this menu option.
     */
    showSeparator?: boolean;

    /**
     * Indicates whether the option is active. If true, a check-mark is displayed.
     */
    isActive?: boolean;
}

/**
 * Custom renderer properties for rendering Context Menu.
 */
export interface IContextMenuProps {
    /** Child elements to be rendered inside the context menu. */
    children?: ReactElement;

    /** List of options available in the context menu, each with a label, ID and subMenuOptions . */
    contextMenuOptions: IContextMenuOption[];

    /** Callback function triggered when an option is clicked, receiving the option ID. */
    onOptionClick: (id: string, parentId?: string) => void;
}

/**
 * Custom renderer properties for field items within a bucket.
 */
export interface IFieldItemCustomRendererProps<T = unknown> {
    /** ID of the bucket containing this item */
    bucketId: string;

    /** The field item being rendered */
    fieldItem: IFieldsKeeperItem<T>;

    /** Function to get the default item renderer */
    getDefaultItemRenderer: () => JSX.Element;

    /** Function to remove the field item from the bucket */
    remove: () => void;

    /** Array of child field items when this item is a group header */
    groupFieldItems?: IFieldsKeeperItem[];
}

export interface IGroupedFieldsKeeperItem {
    group: string;
    groupLabel: string;
    groupIcon?: 'hierarchy-icon' | ReactNode;
    flatGroup?: string;
    flatGroupLabel?: string;
    flatGroupIcon?: 'contact-card' | ReactNode;
    items: IFieldsKeeperItem[];
}

export interface IGroupedItemRenderer {
    fieldItems: IFieldsKeeperItem[];
    isGroupItem?: boolean;
    hasMasterGroup?: boolean;
    groupHeader?: {
        groupItems: IFieldsKeeperItem[];
        isGroupCollapsed: boolean;
        onGroupHeaderToggle: () => void;
        isGroupHeaderSelected?: boolean;
        isFlatGroupHeader?: boolean;
    };
}

export interface IFolderScopedItem<T = IFieldsKeeperItem> {
    folderScope?: string;
    folderScopeLabel?: string;
    folderScopeItems?: T[];
    type?: 'folder' | 'group' | 'leaf' | 'table' | 'hierarchy';
    folderScopeItem?: IFieldsKeeperItem;
}
