import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IFieldsKeeperRootBucketProps,
} from '..';

export default function Example4() {
    // state
    const [defaultBucket, setDefaultBucket] = useState<'auto' | string>('auto');

    // compute
    const someMetaItems: (IFieldsKeeperItem & { from: string })[] = [
        {
            id: 'date.quarter',
            label: 'Quarter',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 1,
            from: 'category',
        },
        {
            id: 'date.year',
            label: 'Year',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 0,
            from: 'category',
        },
        {
            id: 'date.month',
            label: 'Month',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 2,
            from: 'category',
        },
        {
            id: 'date.day',
            label: 'Day',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 3,
            from: 'category',
        },
        { id: 'b', label: 'b', from: 'category' },
        { id: 'c', label: 'c', from: 'group' },
        { id: 'd', label: 'd', from: 'group' },
    ];

    const allItems: IFieldsKeeperItem[] = someMetaItems.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ from, ...item }) => ({
            ...item,
        }),
    );

    const buckets: IFieldsKeeperBucket[] = [
        { id: 'bucket1', items: allItems.slice(0, 4) },
        {
            id: 'bucket2',
            items: [],
        },
        { id: 'bucket3', items: [] },
    ];

    // handlers
    const getPriorityTargetBucketToFill: IFieldsKeeperRootBucketProps['getPriorityTargetBucketToFill'] =
        ({ buckets }) => {
            if (defaultBucket !== 'auto')
                return buckets.find((bucket) => bucket.id === defaultBucket);
        };

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">
                4. Using custom priority bucket filler
            </div>
            <label htmlFor="choose-bucket">Choose bucket filling style</label>
            <select
                id="choose-bucket"
                value={defaultBucket}
                onChange={(e) => setDefaultBucket(e.target.value)}
            >
                {['auto', ...buckets.map((item) => item.id)].map((item) => (
                    <option key={item}>{item}</option>
                ))}
            </select>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state, updateInfo) => {
                    console.log({ state, updateInfo });
                }}
                getPriorityTargetBucketToFill={getPriorityTargetBucketToFill}
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
