import { create } from 'zustand';
import { IFieldsKeeperItem, IFieldsKeeperState } from './FieldsKeeper.types';
import { createContext } from 'react';

type State = IFieldsKeeperState;

export type StateUpdateInfo = {
    fieldItems: IFieldsKeeperItem[];
    fromBucket: string | null | undefined;
    targetBucket: string | null | undefined;
    isRemoved: boolean;
};

export type AdditionalContextState = {
    onStateUpdate: (state: State, updateInfo: StateUpdateInfo) => void;
};

export type ContextSetState = (
    instanceId: string,
    newState: Partial<State & AdditionalContextState>,
    updateInfo: StateUpdateInfo,
) => void;

interface ContextState {
    state: Record<string, State & AdditionalContextState>;
    setState: ContextSetState;
    deleteState: (instanceId: string) => void;
}

export const useStore = create<ContextState>()((set, get) => ({
    state: {},
    setState: (instanceId, newState, updateInfo) => {
        const prevState = get().state;

        const currentState = prevState[instanceId] ?? {};
        const requiredState = { ...currentState, ...newState };
        set({
            state: {
                ...prevState,
                [instanceId]: requiredState,
            },
        });
        currentState.onStateUpdate(requiredState, updateInfo);
    },
    deleteState(instanceId) {
        const prevState = { ...get().state };
        delete prevState[instanceId];
        set({
            state: {
                ...prevState,
            },
        });
    },
}));

export const useStoreState = (instanceId: string) => {
    const state = useStore((state) => state.state[instanceId]);

    if (!state)
        throw new Error(
            'Instance not found, all the buckets should be wrapped under provider / unique instanceIds should be passed',
        );

    return state as Required<IFieldsKeeperState>;
};

export const FieldsKeeperContext = createContext<{ instanceId: string }>({
    instanceId: '',
});

export const FIELDS_KEEPER_CONSTANTS = {
    ROOT_BUCKET_ID: 'ROOT_BUCKET',
    FROM_BUCKET: 'FROM_BUCKET',
    FIELD_ITEM_INDEX: 'FIELD_ITEM_INDEX',
    NO_GROUP_ID: 'NO_GROUP',
};
