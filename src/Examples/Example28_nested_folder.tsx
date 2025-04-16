import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperBucket,
} from '..';

export default function Example28() {
    // compute
    const allItems = [
        {
            id: 'c',
            label: 'c',
            prefixNode: 'measure-icon',
            folders: ['folder_1', 'folder_2'],
        },
        {
            id: 'd',
            label: 'd',
            prefixNode: 'measure-icon',
            folders: ['folder_1', 'folder_2']
        },
        {
            id: 'e',
            label: 'e',
            prefixNode: 'measure-icon',
            folders: ['folder_1','folder_2','folder_3']
        },
        {
            id: 'f',
            label: 'f',
            prefixNode: 'measure-icon',
            folders: ['folder_1','folder_2','folder_3']
        },
        {
            id: 'g',
            label: 'g',
            prefixNode: 'measure-icon',
            folders: ['folder_1','folder_2','folder_3']

        },
        {
            id: 'k',
            label: 'k',
            prefixNode: 'measure-icon',
            folders: ['folder_1','folder_2','folder_3', 'folder_4']
        },
        {
            id: 'l',
            label: 'l',
            prefixNode: 'measure-icon',
            folders: ['folder_1','folder_2','folder_3', 'folder_4']
        },
        {
            id: 'm',
            label: 'm',
            prefixNode: 'measure-icon',
            folders: ['folder_1','folder_2','folder_3', 'folder_4']
        },
        {
            id: 'date.quarter',
            label: 'Quarter',
            groupOrder: 1,
            folders: ['folder_1','folder_2','folder_3', 'folder_4', 'date']
        },
        {
            id: 'date.year',
            label: 'Year',
            groupOrder: 0,
            folders: ['folder_1','folder_2','folder_3', 'folder_4', 'date']
        },
        {
            id: 'date.month',
            label: 'Month long string test pass',
            groupOrder: 2,
            prefixNode: 'measure-icon',
            folders: ['folder_1','folder_2','folder_3', 'folder_4', 'date']
        },
        {
            id: 'date.day',
            label: 'Day',
            groupOrder: 3,
            folders: ['folder_1','folder_2','folder_3', 'folder_4', 'date']
        },
    ]

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
                28. Nested Folder
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
                accentColor={'#117865'}
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
                        'folder_3': 
                        {
                            'id': 'folder_3',
                            'label': 'Folder 3',
                            'type': 'folder',
                        },
                        'folder_4':{
                            'id': 'folder_4',
                            'label': 'Folder 4',
                            'type': 'folder',
                        },
                        'date':{
                            'id': 'date',
                            'label': 'Date ',
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
                        <FieldsKeeperRootBucket
                            label="Root Bucket"
                            collapseFoldersOnMount={false}
                            prefixNode={{ allow: true, reserveSpace: true }}
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
