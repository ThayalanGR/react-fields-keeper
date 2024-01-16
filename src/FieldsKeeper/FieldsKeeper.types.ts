import { ReactNode } from "react";

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
}

export interface IGetPriorityTargetBucketToFillProps {
  buckets: IFieldsKeeperBucket[],
  currentFillingItem: IFieldsKeeperItem[];
  priorityGroup?: string
}

export interface IFieldsKeeperRootBucketProps {
  label?: string;
  labelClassName?: string
  isDisabled?: boolean;
  sortGroupOrderWiseOnAssignment?: boolean;
  /**
   * if undefined returned then the default handler will take action
   */
  getPriorityTargetBucketToFill?: (
    props: IGetPriorityTargetBucketToFillProps
  ) => IFieldsKeeperBucket | undefined;
}

export interface IFieldsKeeperState {
  allItems: IFieldsKeeperItem[];
  buckets: IFieldsKeeperBucket[];
  getPriorityTargetBucketToFill?: IFieldsKeeperRootBucketProps['getPriorityTargetBucketToFill']
}

export interface IFieldsKeeperStateInternal {
  instanceId: string;
}

export interface IFieldsKeeperActions {
  updateState: (state: Partial<IFieldsKeeperState>) => void;
}

export interface IFieldsKeeperProviderProps extends IFieldsKeeperState {
  children?: React.ReactNode;
  onUpdate?: (state: IFieldsKeeperState) => void;
}

export interface IFieldsKeeperBucketProps {
  id: string;
  label?: ReactNode;
  /**
   * @default - Infinite
   */
  maxItems?: number;
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
}
