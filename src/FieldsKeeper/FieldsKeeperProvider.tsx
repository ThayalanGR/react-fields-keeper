// imports
import {
  useMemo,
  useState
} from "react";
import "./fieldsKeeper.less";
import { IFieldsKeeperProviderProps, IFieldsKeeperState } from "./FieldsKeeper.types";
import { FieldsKeeperContext } from "./FieldsKeeper.context";


// components
export const FieldsKeeperProvider = (props: IFieldsKeeperProviderProps) => {
  // props
  const { children, allItems, buckets, onUpdate } = props;

  // state
  const [state, updateState] = useState<IFieldsKeeperState>({
    allItems,
    buckets
  });

  // compute
  const instanceId = useMemo(() => (new Date()).getTime().toString(), []);

  // actions
  const tapUpdateState = (newState: Partial<IFieldsKeeperState>) => {
    const requriedState = { ...state, ...newState };
    updateState(requriedState);

    // intorduce delayed upates later
    onUpdate?.({
      allItems: requriedState.allItems,
      buckets: requriedState.buckets
    });
  };

  // paint
  return (
    <FieldsKeeperContext.Provider
      value={{ ...state, instanceId, updateState: tapUpdateState }}
    >
      {children}
    </FieldsKeeperContext.Provider>
  );
};

