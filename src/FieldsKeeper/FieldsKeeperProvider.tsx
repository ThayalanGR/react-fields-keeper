// imports
import {
  useEffect,
  useMemo,
  useState
} from "react";
import "./fieldsKeeper.less";
import { IFieldsKeeperProviderProps, IFieldsKeeperState } from "./FieldsKeeper.types";
import { FieldsKeeperContext } from "./FieldsKeeper.context";
import isEqual from 'lodash.isequal';


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

  // effects
  useEffect(() => {
    if (!isEqual({ allItems, buckets }, { allItems: state.allItems, buckets: state.buckets }))
      updateState({ allItems, buckets })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems, buckets])

  // paint
  return (
    <FieldsKeeperContext.Provider
      value={{ ...state, instanceId, updateState: tapUpdateState }}
    >
      {children}
    </FieldsKeeperContext.Provider>
  );
};

