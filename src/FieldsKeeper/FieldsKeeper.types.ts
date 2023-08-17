import { ReactNode } from "react";

// types
export interface IFieldsKeeperItem<T = string> {
  label: string;
  id: string;
  value?: T;
  activeNodeClassName?: string;
}

export interface IFieldsKeeperBucket<T = string> {
  id: string;
  items: IFieldsKeeperItem<T>[];
}

export interface IFieldsKeeperRootBucketProps {
  label?: string;
  isDisabled?: boolean;
}

export interface IFieldsKeeperState {
  allItems: IFieldsKeeperItem[];
  buckets: IFieldsKeeperBucket[];
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
  label?: string;
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
  defaultBucket?: boolean;
}
