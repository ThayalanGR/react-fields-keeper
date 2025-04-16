import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example27_Group_Only_Selection() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
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
        { id: 'b', label: 'b' },
        { id: 'c', label: 'c' },
        { id: 'd', label: 'd' },
    ];

    const buckets: IFieldsKeeperBucket[] = [
        {
            id: 'bucket1',
            items: [
                {
                    id: 'date', // group only selection
                    label: 'Date',
                },
            ],
        },
        {
            id: 'bucket2',
            items: [],
        },
        { id: 'bucket3', items: [] },
    ];

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">
                27. Group only selection
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
                foldersMeta={
                    {
                        'date':
                        {
                            'id': 'date',
                            'label': 'Date',
                            'type': 'group',
                        }
                    }
                }
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1"
                            allowRemoveFields
                            // showAllGroupsFlat
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
