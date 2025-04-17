import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example23() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        {
            id: 'a',
            label: 'a',
            folders: ['folder_1']
        },
        {
            id: 'b',
            label: 'b',
            folders: ['folder_1']
        },
        {
            id: 'c',
            label: 'c',
            folders: ['folder_2']
        },
        {
            id: 'd',
            label: 'd',
            folders: ['folder_2']

        },
        {
            id: 'date.quarter',
            label: 'Quarter',
            folders: ['folder_2'],
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 1,
        },
        {
            id: 'date.year',
            label: 'Year',
            folders: ['folder_2'],
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 0,
        },
        {
            id: 'date.month',
            label: 'Month',
            folders: ['folder_2'],
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 2,
        },
        {
            id: 'date.day',
            label: 'Day',
            groupOrder: 3,
            folders: ['folder_2'],
            group: 'date',
            groupLabel: 'Date',
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
            <div className="example-container-title">23. Disable Field Assignments</div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
                foldersMeta={
                    {
                        'folder_1': 
                        {
                            'id': 'folder_1',
                            'label': 'Folder 1',
                            'type': 'folder',
                        },
                        'folder_2': 
                        {
                            'id': 'folder_2',
                            'label': 'Folder 2',
                            'type': 'folder',
                        },
                    }
                }
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1"
                            allowRemoveFields={false}
                            disabled={true}
                        />
                        <FieldsKeeperBucket
                            id="bucket2"
                            label="Bucket 2"
                            allowRemoveFields={false}
                            disabled={true}
                        />
                        <FieldsKeeperBucket
                            id="bucket3"
                            label="Bucket 3"
                            allowRemoveFields={false}
                            disabled={true}
                        />
                    </div>
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket
                            label="Root Bucket"
                            collapseFoldersOnMount={false}
                            disableAssignments={true}
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
