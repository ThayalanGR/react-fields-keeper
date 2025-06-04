import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IContextMenuOption,
} from '..';
import { SuffixNode } from '../Components/SuffixNode';

export default function Example33_add_to_bucket() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'a', folders: ['folder_1'] },
        { id: 'b', label: 'b', folders: ['folder_1'] },
        { id: 'c', label: 'c', folders: ['folder_2'] },
        { id: 'd', label: 'd', folders: ['folder_2'] },
        {
            id: 'date.quarter',
            label: 'Quarter',
            folders: ['folder_2'],
            group: 'dateHierarchy',
            groupLabel: 'Date Hierarchy',
            groupIcon: 'hierarchy-icon',
            groupOrder: 1,
            flatGroup: 'date',
            flatGroupLabel: 'Date',
            flatGroupIcon: 'contact-card',
        },
        {
            id: 'date.year',
            label: 'Year',
            folders: ['folder_2'],
            group: 'dateHierarchy',
            groupLabel: 'Date Hierarchy',
            groupIcon: 'hierarchy-icon',
            groupOrder: 0,
            flatGroup: 'date',
            flatGroupLabel: 'Date',
            flatGroupIcon: 'contact-card',
        },
        {
            id: 'date.month',
            label: 'Month',
            folders: ['folder_2'],
            group: 'dateHierarchy',
            groupLabel: 'Date Hierarchy',
            groupIcon: 'hierarchy-icon',
            groupOrder: 2,
            flatGroup: 'date',
            flatGroupLabel: 'Date',
            flatGroupIcon: 'contact-card',
        },
        {
            id: 'date.day',
            label: 'Day',
            folders: ['folder_2'],
            group: 'dateHierarchy',
            groupLabel: 'Date Hierarchy',
            groupIcon: 'hierarchy-icon',
            groupOrder: 3,
            flatGroup: 'date',
            flatGroupLabel: 'Date',
            flatGroupIcon: 'contact-card',
        },
        {
            id: 'date.time',
            label: 'time',
            folders: ['folder_2'],
            group: 'dateHierarchy',
            groupLabel: 'Date Hierarchy',
            groupIcon: 'hierarchy-icon',
            groupOrder: 4,
            flatGroup: 'date',
            flatGroupLabel: 'Date',
            flatGroupIcon: 'contact-card',
        },
        {
            id: 'date.seconds',
            label: 'seconds',
            folders: ['folder_2'],
            group: 'dateHierarchy',
            groupLabel: 'Date Hierarchy',
            groupIcon: 'hierarchy-icon',
            groupOrder: 5,
            flatGroup: 'date',
            flatGroupLabel: 'Date',
            flatGroupIcon: 'contact-card',
        },
    ];

    const rootBuckets: IFieldsKeeperBucket[] = [
        { id: 'bucket1', items: [] },
        { id: 'bucket2', items: [] },
        { id: 'bucket3', items: [] },
    ];

    const filterBuckets: IFieldsKeeperBucket[] = [
        { id: 'bucket4', items: [] },
        { id: 'bucket5', items: [] },
        { id: 'bucket6', items: [] },
    ];

    return (
        <div className="example-container">
            <div className="example-container-title">Assign Fields directly to Bucket</div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={rootBuckets}
                instanceId="root-bucket"
                onUpdate={(state) => console.log(state)}
                foldersMeta={{
                    folder_1: {
                        id: 'folder_1',
                        label: 'Folder 1',
                        prefixNodeIcon: 'folder-icon',
                    },
                    folder_2: {
                        id: 'folder_2',
                        label: 'Folder 2',
                        prefixNodeIcon: 'folder-icon',
                    },
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
                        <FieldsKeeperProvider
                            allItems={allItems}
                            buckets={filterBuckets}
                            instanceId="filter-bucket"
                            receiveFieldItemsFromInstances={['root-bucket']}
                            onUpdate={(state) => console.log(state)}
                            foldersMeta={{
                                folder_1: {
                                    id: 'folder_1',
                                    label: 'Folder 1',
                                    prefixNodeIcon: 'folder-icon',
                                },
                                folder_2: {
                                    id: 'folder_2',
                                    label: 'Folder 2',
                                    prefixNodeIcon: 'folder-icon',
                                },
                            }}
                        >
                            <div> Filter Items </div>
                            <div className="keeper-container">
                                <div className="buckets-container">
                                    <FieldsKeeperBucket
                                        id="bucket4"
                                        label="Bucket 4"
                                        allowRemoveFields
                                    />
                                    <FieldsKeeperBucket
                                        id="bucket5"
                                        label="Bucket 5"
                                        allowRemoveFields
                                    />
                                    <FieldsKeeperBucket
                                        id="bucket6"
                                        label="Bucket 6"
                                        allowRemoveFields
                                    />
                                </div>
                            </div>
                        </FieldsKeeperProvider>
                    </div>
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket
                            label="Root Bucket"
                            collapseFoldersOnMount={false}
                            suffixNodeRenderer={({
                                assignFieldBucketItem,
                            }
                            ) => {
                                const contextMenuRootOptions: IContextMenuOption[] =
                                    [
                                        {
                                            label: 'Bucket 1',
                                            id: 'bucket1',
                                        },
                                        {
                                            label: 'Bucket 2',
                                            id: 'bucket2',
                                        },
                                        {
                                            label: 'Bucket 3',
                                            id: 'bucket3',
                                        },
                                        {
                                            label: 'Bucket 4',
                                            id: 'bucket4',
                                        },
                                        {
                                            label: 'Bucket 5',
                                            id: 'bucket5',
                                        },
                                        {
                                            label: 'Bucket 6',
                                            id: 'bucket6',
                                        },
                                    ];

                                const onOptionClick = (
                                    assignedBucketId: string,
                                ) => {
                                    const currentInstanceId = [
                                        'bucket4',
                                        'bucket5',
                                        'bucket6',
                                    ].includes(assignedBucketId)
                                        ? 'filter-bucket'
                                        : 'root-bucket';
                                    assignFieldBucketItem?.(
                                        assignedBucketId,
                                        currentInstanceId,
                                    );
                                };

                                return (
                                    <SuffixNode
                                        contextMenuOptions={
                                            contextMenuRootOptions
                                        }
                                        onOptionClick={onOptionClick}
                                    />
                                );
                            }}
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
