// imports
import { useEffect, useMemo } from 'react';
import './fieldsKeeper.less';
import {
    IFieldsKeeperProviderProps,
    IFieldsKeeperState,
} from './FieldsKeeper.types';
import {
    AdditionalContextState,
    FieldsKeeperContext,
    useStore,
} from './FieldsKeeper.context';
import isEqual from 'lodash.isequal';
import { getUniqueId } from './utils';

// components
export const FieldsKeeperProvider = (props: IFieldsKeeperProviderProps) => {
    // props
    const {
        children,
        allItems,
        buckets,
        instanceId: instanceIdFromProps,
        receiveFieldItemsFromInstances,
        allowDuplicates,
        getPriorityTargetBucketToFill,
        onUpdate,
    } = props;

    // state
    const { setState, deleteState, state } = useStore();

    // compute
    const instanceId = useMemo(
        () => instanceIdFromProps ?? getUniqueId(),
        [instanceIdFromProps],
    );
    const keeperCoreState = useMemo(() => {
        const coreState: IFieldsKeeperState & AdditionalContextState = {
            allItems,
            buckets,
            instanceId: instanceIdFromProps,
            receiveFieldItemsFromInstances,
            allowDuplicates,
            getPriorityTargetBucketToFill,
            onStateUpdate: (state) => {
                // introduce delayed updates later
                onUpdate?.({
                    allItems: state.allItems,
                    buckets: state.buckets,
                    instanceId: state.instanceId,
                });
            },
        };

        state[instanceId] = coreState;
        return coreState;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        instanceIdFromProps,
        allItems,
        buckets,
        getPriorityTargetBucketToFill,
        onUpdate,
    ]);

    // effects
    useEffect(() => {
        let currentState = state[instanceId];

        if (!currentState) {
            currentState = {} as IFieldsKeeperState & AdditionalContextState;
            state[instanceId] = keeperCoreState;
        }

        if (
            !isEqual(
                { allItems, buckets },
                {
                    allItems: currentState.allItems,
                    buckets: currentState.buckets,
                },
            )
        )
            setState(instanceId, keeperCoreState);

        () => deleteState(instanceId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keeperCoreState]);

    // paint
    return (
        <FieldsKeeperContext.Provider value={{ instanceId }}>
            {children}
        </FieldsKeeperContext.Provider>
    );
};
