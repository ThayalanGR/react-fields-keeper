import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example24() {
    // compute
    const [ pinnedIds, setPinnedIds ] = useState<string[]>([])
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
            folders: ['folder_2'],
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 3,
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

    const pinnedSet = new Set(pinnedIds);


    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">24. Filter Items</div>
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
                        />
                        <FieldsKeeperBucket
                            id="bucket2"
                            label="Bucket 2"
                        />
                        <FieldsKeeperBucket
                            id="bucket3"
                            label="Bucket 3"
                        />
                    </div>
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket
                            label="Pinned"
                            collapseFoldersOnMount={false}
                            filteredItems={
                                allItems.filter(item => pinnedSet.has(item.id) || pinnedSet.has(item.group as string)) as IFieldsKeeperItem[]
                            }
                        />
                        <FieldsKeeperRootBucket
                            label="All Items"
                            collapseFoldersOnMount={false}
                            suffixNodeRenderer={({id}) => {
                                return (
                                    <div>
                                        <span onClick={ () => setPinnedIds((prevState) => [...prevState, id])}>Pin</span>
                                    </div>
                                )
                            }}
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
