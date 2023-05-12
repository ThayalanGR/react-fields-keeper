import { createContext } from "react";
import {
  IFieldsKeeperState,
  IFieldsKeeperActions,
  IFieldsKeeperStateInternal,
} from "./FieldsKeeper.types";

// constatns
export const FieldsKeeperContext = createContext<
  IFieldsKeeperState & IFieldsKeeperActions & IFieldsKeeperStateInternal
>({
  allItems: [],
  buckets: [],
  updateState: () => void 0,
  instanceId: new Date().getTime().toString(),
});
