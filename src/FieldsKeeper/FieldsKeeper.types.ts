import { ReactNode } from 'react';
import { StateUpdateInfo } from './FieldsKeeper.context';

// types
export interface IFieldsKeeperItem<T = string> {
    label: string;
    id: string;
    value?: T;
    activeNodeClassName?: string;
    rootBucketActiveNodeClassName?: string;

    tooltip?: string;

    rootTooltip?: string;

    disabled?: IFieldKeeperItemDisabled;

    rootDisabled?: IFieldKeeperItemDisabled;

    group?: string;
    groupLabel?: string;
    groupOrder?: number;

    bucketSuffixNode?:ReactNode;
    rootBucketSuffixNode?:ReactNode;

    /**
     * for internal use only
     */
    fieldItemIndex?: number;
}

export interface IFieldKeeperItemDisabled {
    active: boolean;
    /**
     * default - true
     */
    disableGroupLabel?: boolean;
    message?: string;
}

export interface IFieldsKeeperBucket<T = string> {
    id: string;
    items: IFieldsKeeperItem<T>[];
    maxItems?: number;
    disabled?: boolean;
}

export interface IGetPriorityTargetBucketToFillProps {
    buckets: IFieldsKeeperBucket[];
    currentFillingItem: IFieldsKeeperItem[];
    priorityGroup?: string;
}

export interface IFieldsKeeperRootBucketProps {
    label?: string;
    labelClassName?: string;
    wrapperClassName?: string;
    isDisabled?: boolean;
    sortGroupOrderWiseOnAssignment?: boolean;
    /**
     * if undefined returned then the default handler will take action
     */
    getPriorityTargetBucketToFill?: (
        props: IGetPriorityTargetBucketToFillProps,
    ) => IFieldsKeeperBucket | undefined;

    /**
     * if not passed - custom instanceId will be created and used internally
     *
     * instanceId is useful when using nested FieldsKeeperProvider to achieve complex assignment formation
     */
    instanceId?: string;

    ignoreCheckBox?: boolean;

    /**
     * if passed internal search feature will be switched off
     */
    customSearchQuery?: string;

    /**
     * only consumed when  customSearchQuery is passed
     * default - false
     */
    showClearSearchLink?: boolean;

    /**
     * only consumed when  customSearchQuery is passed
     */
    onClearSearch?: () => void;

    /**
     * placeholder for search values
     */
    searchPlaceholder?: string;

    /**
     * if not passed default message will be displayed
     */
    emptyFilterMessage?: string;

    /**
     *  default - false
     */
    disabledEmptyFilterMessage?: boolean;

    /**
     * allow field item drag after assignment
     *
     * default - true
     */
    allowDragAfterAssignment?: boolean;

    /**
     * mention whether to allow dragging or not
     * @default - true
     */
    allowDragging?: boolean;

    /**
     * shouldRender if passed will be called for each field item render passed in this bucket, if returned true renders or ignores
     */
    shouldRender?: <T>(item: IFieldsKeeperItem<T>) => boolean;

    /**
     * toggle checkbox on label click
     */
    toggleCheckboxOnLabelClick?: boolean;
}

export interface IFieldsKeeperState {
    allItems: IFieldsKeeperItem[];
    buckets: IFieldsKeeperBucket[];
    /**
     * used to flexibly assign between buckets,
     * if not passed assignment will be done based on least bucket items priority
     */
    getPriorityTargetBucketToFill?: IFieldsKeeperRootBucketProps['getPriorityTargetBucketToFill'];
    /**
     * if not passed - custom instanceId will be created and used internally
     *
     * instanceId is useful when using nested FieldsKeeperProvider to achieve complex assignment formation
     */
    instanceId?: string;

    /**
     * accept fields items from other providers based on the instanceId
     *
     * Note: to use this prop, all the items that you are expecting to
     * receive should be mentioned in the current instance as well
     */
    receiveFieldItemsFromInstances?: string[];

    /**
     * default - false
     *
     * allow duplicate field assignment on all buckets
     */
    allowDuplicates?: boolean;
}

export interface IFieldsKeeperActions {
    updateState: (state: Partial<IFieldsKeeperState>) => void;
}

export interface IFieldsKeeperProviderProps extends IFieldsKeeperState {
    children?: React.ReactNode;
    onUpdate?: (state: IFieldsKeeperState, updateInfo: StateUpdateInfo) => void;
}

export interface IFieldsKeeperBucketProps {
    id: string;
    label?: ReactNode;
    /**
     * @default - false
     */
    allowRemoveFields?: boolean;
    /**
     * @default - false
     */
    disabled?: boolean;
    /**
     * suffix node
     */
    suffixNode?: ReactNode;
    emptyFieldPlaceholder?: string;

    /**
     * default - true
     */
    sortGroupOrderWiseOnAssignment?: boolean;

    /**
     * if not passed - internally created instanceId will be used to trace down the parent provider
     *
     * instanceId is useful when using nested FieldsKeeperProvider to achieve complex assignment formation
     */
    instanceId?: string;

    /**
     * default - false
     */
    showExtendedAssignmentPlaceholder?: boolean;
    /**
     * default - false
     */
    centerAlignPlaceholder?: boolean;
    /**
     * default - undefined
     */
    placeHolderWrapperClassName?: string;
    /**
     * default - undefined
     */
    wrapperClassName?: string;

    customItemRenderer?: (props: IFieldItemCustomRendererProps) => JSX.Element;

    /**
     * default - vertical
     */
    orientation?: 'vertical' | 'horizontal';

    /**
     * default - scroll
     */
    horizontalFillOverflowType?: 'wrap' | 'scroll';

    /**
     * decides whether to group the passed in group or not
     */
    showAllGroupsFlat?: boolean;
}

export interface IFieldItemCustomRendererProps<T = unknown> {
    bucketId: string;
    fieldItem: IFieldsKeeperItem<T>;
    getDefaultItemRenderer: () => JSX.Element;
    remove: () => void;
}
