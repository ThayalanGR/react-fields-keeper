import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example12() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'Hello world' },
        { id: 'b', label: 'Majestic' },
        { id: 'c', label: 'Magnificent' },
        { id: 'd', label: 'Dancing rose' },
        { id: 'a1', label: 'Hello world - 1' },
        { id: 'b1', label: 'Majestic - 1' },
        { id: 'c1', label: 'Magnificent - 1' },
        { id: 'd1', label: 'Dancing rose - 1' },
        { id: 'a2', label: 'Hello world - 2' },
        { id: 'b2', label: 'Majestic - 2' },
        { id: 'c2', label: 'Magnificent - 2' },
        { id: 'd2', label: 'Dancing rose - 2' },

        {
            id: 'date.quarter',
            label: 'Quarter',
            folders: ['date'],
            groupOrder: 1,
        },
        {
            id: 'date.year',
            label: 'Year',
            folders: ['date'],
            groupOrder: 0,
        },
        {
            id: 'date.month',
            label: 'Month',
            folders: ['date'],
            groupOrder: 2,
        },
        {
            id: 'date.day',
            label: 'Day',
            folders: ['date'],
            groupOrder: 3,
        },
    ];

    const buckets: IFieldsKeeperBucket[] = [
        {
            id: 'bucket1',
            items: allItems.slice(0, 4),
        },
        {
            id: 'bucket2',
            items: allItems.slice(4, 8),
        },
        { id: 'bucket3', items: allItems.slice(8, 12) },
        { id: 'bucket4', items: allItems.slice(12, 16) },
    ];

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">
                12. Horizontal fields bucket
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
                foldersMeta={
                    {   
                        'date': {
                            'id': 'date',
                            'label': 'Date long group header sample pass',
                            'type': 'group',
                        } 
                    }
                }
            >
                <div className="keeper-container-large">
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket label="Root Bucket" />
                    </div>
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1 - scroll style"
                            allowRemoveFields
                            orientation="horizontal"
                        />
                        <FieldsKeeperBucket
                            id="bucket2"
                            label="Bucket 2 - wrap style"
                            allowRemoveFields
                            orientation="horizontal"
                            horizontalFillOverflowType="wrap"
                        />
                        <FieldsKeeperBucket
                            id="bucket3"
                            label="Bucket 3 - vertical filling"
                            allowRemoveFields
                        />
                        <FieldsKeeperBucket
                            id="bucket4"
                            label="Bucket 1 - horizontal hierarchy support"
                            allowRemoveFields
                            orientation="horizontal"
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
