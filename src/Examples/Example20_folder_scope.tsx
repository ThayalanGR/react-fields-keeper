import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example20() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        {
            id: 'a',
            label: 'a',
            folderScope: 'folder_1',
            folderScopeLabel: 'Folder 1',
        },
        {
            id: 'b',
            label: 'b',
            folderScope: 'folder_1',
            folderScopeLabel: 'Folder 1',
        },
        {
            id: 'c',
            label: 'c',
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2',
        },
        {
            id: 'd',
            label: 'd',
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2',
        },
        {
            id: 'date.quarter',
            label: 'Quarter',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 1,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2',
        },
        {
            id: 'date.year',
            label: 'Year',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 0,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2',
        },
        {
            id: 'date.month',
            label: 'Month',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 2,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2',
        },
        {
            id: 'date.day',
            label: 'Day',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 3,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2',
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
            <div className="example-container-title">20. Folder Scoping</div>
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
