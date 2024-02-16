import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';
import { clone } from '../FieldsKeeper/utils';

export default function Example7() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
        { id: 'c', label: 'c' },
        { id: 'd', label: 'd' },
    ];

    const buckets: IFieldsKeeperBucket[] = [
        { id: 'bucket1', items: [allItems[0]] },
        {
            id: 'bucket2',
            items: [allItems[1], allItems[2]],
        },
        { id: 'bucket3', items: [] },
    ];

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">
                7. Nested fields keeper use-case
            </div>
            <FieldsKeeperProvider
                allItems={clone(allItems)}
                buckets={clone(buckets)}
                onUpdate={(state) => {
                    console.log('Instance 1', state);
                }}
                instanceId="instance-1"
            >
                <FieldsKeeperProvider
                    allItems={clone(allItems)}
                    buckets={clone(buckets)}
                    onUpdate={(state) => {
                        console.log('Instance 2', state);
                    }}
                    instanceId="instance-2"
                >
                    <div className="keeper-container">
                        <div className="buckets-container">
                            <b>Instance 1 - Buckets</b>
                            <FieldsKeeperBucket
                                id="bucket1"
                                label="Instance - 1 - Bucket 1"
                                instanceId="instance-1"
                                allowRemoveFields
                            />
                            <FieldsKeeperBucket
                                id="bucket2"
                                label="Instance - 1 - Bucket 2"
                                instanceId="instance-1"
                                allowRemoveFields
                            />
                            <FieldsKeeperBucket
                                id="bucket3"
                                label="Instance - 1 - Bucket 3"
                                instanceId="instance-1"
                                allowRemoveFields
                            />
                            <b>Instance 2 - Buckets</b>
                            <FieldsKeeperBucket
                                id="bucket1"
                                label="Instance - 2 - Bucket 1"
                                instanceId="instance-2"
                                allowRemoveFields
                            />
                            <FieldsKeeperBucket
                                id="bucket2"
                                label="Instance - 2 - Bucket 2"
                                instanceId="instance-2"
                                allowRemoveFields
                            />
                            <FieldsKeeperBucket
                                id="bucket3"
                                label="Instance - 2 - Bucket 3"
                                instanceId="instance-2"
                                allowRemoveFields
                            />
                        </div>
                        <div className="root-bucket-container">
                            <b>Instance - 1</b>
                            <FieldsKeeperRootBucket
                                instanceId="instance-1"
                                label="Root Bucket"
                            />
                            <br />
                            <b>Instance - 2</b>
                            <FieldsKeeperRootBucket
                                instanceId="instance-2"
                                label="Root Bucket"
                            />
                        </div>
                    </div>
                </FieldsKeeperProvider>
            </FieldsKeeperProvider>
        </div>
    );
}
