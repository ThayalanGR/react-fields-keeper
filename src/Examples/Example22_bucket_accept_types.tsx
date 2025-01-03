import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example22_bucket_accept_types() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'a', type: 'string' },
        { id: 'b', label: 'b', type: 'string' },
        { id: 'c', label: 'c', type: 'string' },
        { id: '1', label: '1', type: 'number' },
        { id: '2', label: '2', type: 'number' },
        { id: '3', label: '3', type: 'number' },
        { id: 'true', label: 'true', type: 'boolean' },
        { id: 'false', label: 'false', type: 'boolean' },
        { id: 'Field without type', label: 'Field without type' },
    ];

    const buckets: IFieldsKeeperBucket[] = [
        { id: 'String', items: [allItems[0]], acceptTypes: ['string'] },
        {
            id: 'Number',
            items: [allItems[4], allItems[5]],
            acceptTypes: ['number'],
        },
        {
            id: 'Any',
            items: [allItems[7], allItems[1]],
            acceptTypes: ['string', 'number', 'boolean'],
        },
        {
            id: 'fieldWithoutType',
            items: [],
        },
    ];

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">20. Bucket types!</div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="String"
                            label="String"
                            allowRemoveFields
                        />
                        <FieldsKeeperBucket
                            id="Number"
                            label="Number"
                            allowRemoveFields
                        />
                        <FieldsKeeperBucket
                            id="Any"
                            label="Any"
                            allowRemoveFields
                        />
                        <FieldsKeeperBucket
                            id="fieldWithoutType"
                            label="Field without types array"
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
