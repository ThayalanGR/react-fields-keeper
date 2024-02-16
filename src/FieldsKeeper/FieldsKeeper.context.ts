import { create } from 'zustand';
import {
  IFieldsKeeperState,
} from "./FieldsKeeper.types";
import { createContext } from 'react';




type State = IFieldsKeeperState
export type AdditionalContextState = { onStateUpdate: (state: State) => void }

export type ContextSetState = (instanceId: string, newState: Partial<State & AdditionalContextState>) => void

interface ContextState {
  state: Record<string, State & AdditionalContextState>;
  setState: ContextSetState;
  deleteState: (instanceId: string) => void
}


export const useStore = create<ContextState>()((set, get) => ({
  state: {},
  setState: (instanceId, newState) => {
    const prevState = get().state;

    const currentState = prevState[instanceId] ?? {}
    const requiredState = { ...currentState, ...newState };
    set({
      state: {
        ...prevState,
        [instanceId]: requiredState
      }
    })
    currentState.onStateUpdate(requiredState);
  },
  deleteState(instanceId) {
    const prevState = { ...get().state };
    delete prevState[instanceId]
    set({
      state: {
        ...prevState,
      }
    })
  },
}))

export const useStoreState = (instanceId: string) => {

  const state = useStore(state => state.state[instanceId])

  if (!state) throw new Error('Instance not found, all the buckets should be wrapped under provider / unique instanceIds should be passed')

  return state as Required<IFieldsKeeperState>;
}

export const FieldsKeeperContext = createContext<{ instanceId: string }>({ instanceId: '' })