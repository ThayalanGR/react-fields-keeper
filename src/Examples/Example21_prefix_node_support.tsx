import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';
import measureIcon from '../assets/icons/measureIcon.svg';

export default function Example21() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        {
            id: 'a',
            label: 'a',
            folders: ['folder_1'],
            prefixNode: 'measure-icon',
        },
        {
            id: 'b',
            label: 'b',
            folders: ['folder_1'],
        },
        {
            id: 'c',
            label: 'c',
            folders: ['folder_2'],
        },
        {
            id: 'd',
            label: 'd',
            folders: ['folder_2'],
            prefixNode: (
                <img
                    src={measureIcon}
                    style={{
                        transform: 'translateX(-3px)',
                    }}
                />
            ),
        },
        {
            id: 'date.quarter',
            label: 'Quarter',
            groupOrder: 1,
            folders: ['folder_2'],
        },
        {
            id: 'date.year',
            label: 'Year',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 0,
            folders: ['folder_2'],
        },
        {
            id: 'date.month',
            label: 'Month long string test pass',
            groupOrder: 2,
            folders: ['folder_2'],
            prefixNode: 'measure-icon',
        },
        {
            id: 'date.day',
            label: 'Day',
            groupOrder: 3,
            folders: ['folder_2'],
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
                21. Prefix Node Support for Root bucket items
            </div>
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
