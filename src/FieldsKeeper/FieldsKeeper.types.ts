/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';
import { StateUpdateInfo } from './FieldsKeeper.context';

// types
/**
 * Represents an item within a FieldsKeeper structure.
 */
export interface IFieldsKeeperItem<T = any> {
    /** Unique identifier for the item */
    id: string;

    /** Display label for the item */
    label: string;

    /**
     * Optional value associated with the item, allowing customization.
     */
    value?: T;

    // Grouping properties

    /** Identifier for grouping items */
    group?: string;

    /** Display label for the item's group */
    groupLabel?: string;

    /** Order for grouping; lower numbers appear first */
    groupOrder?: number;

    /**
     * Scope within folders. Items are displayed based on this scope.
     * Defaults to a flat view if unspecified.
     */
    folderScope?: string;

    /**
     * Display label for the folder scope, used for grouping or categorization.
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

    // Suffix node

    /** Node to display as suffix within the item bucket */
    bucketSuffixNode?: ReactNode;

    /** Node to display as suffix within the root bucket */
    rootBucketSuffixNode?: ReactNode;

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
    prefixNode?: 'measure-icon' | ReactNode;

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

    /** Layout orientation for items within the bucket */
    orientation?: 'vertical' | 'horizontal';

    /** Overflow behavior for horizontal layout */
    horizontalFillOverflowType?: 'wrap' | 'scroll';

    /** If true, groups are displayed flat */
    showAllGroupsFlat?: boolean;
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
}

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

export interface IFolderScopedItem<T = IFieldsKeeperItem> {
    folderScope: string;
    folderScopeLabel: string;
    folderScopeItems: T[];
}
