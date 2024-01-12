import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IFieldsKeeperState,
} from '..';

export default function Example6() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        {
            id: 'a',
            label: 'a',
        },
        { id: 'b', label: 'b' },
        { id: 'c', label: 'c' },
        {
            id: 'd',
            label: 'd',
        },
    ];

    // state
    const [buckets, setBuckets] = useState<IFieldsKeeperBucket[]>([
        { id: 'bucket1', items: [allItems[0]] },
        {
            id: 'bucket2',
            items: [allItems[1], allItems[2]],
        },
        { id: 'bucket3', items: [] },
    ]);

    // handlers
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onItemsChange = (newState: IFieldsKeeperState) => {
        setBuckets((state) => [state[0], ...newState.buckets.slice(1)]);
    };

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">
                Controlled state handler <br />
                (Expect at-least one data item to be selected)
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={JSON.parse(JSON.stringify(buckets))}
                onUpdate={onItemsChange}
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1"
                            allowRemoveFields
                        />
                        <FieldsKeeperBucket
                            id="bucket2"
                            label="Bucket 2"
                            allowRemoveFields
                        />
                        <FieldsKeeperBucket
                            id="bucket3"
                            label="Bucket 3"
                            allowRemoveFields
                        />
                    </div>
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket label="Root Bucket" />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
