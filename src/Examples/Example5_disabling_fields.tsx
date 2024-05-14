import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example5() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        {
            id: 'a',
            label: 'a',
            group: 'grp-a',
            groupLabel: 'A',
            disabled: {
                active: true,
                message: 'Locked data item!',
                disableGroupLabel: false,
            },
            rootDisabled: {
                active: true,
                message: 'Locked data item!',
                disableGroupLabel: false,
            },
        },
        {
            id: 'b',
            label: 'b',
            tooltip: 'Normal tooltip!',
            group: 'grp-a',
            groupLabel: 'A',
        },
        { id: 'c', label: 'c', rootTooltip: 'Root tooltip!' },
        {
            id: 'd',
            label: 'd',
            rootDisabled: {
                active: true,
                message: 'This item is not available right now!',
            },
        },
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
                5. Disabling fields / Tooltip provision <br />
                (on both root and individual buckets)
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state, updateInfo) => {
                    console.log({ state, updateInfo });
                }}
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
