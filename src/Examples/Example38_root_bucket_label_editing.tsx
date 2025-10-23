import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IRootBucketFieldItemLabelChangeProps,
} from '..';

export default function Example38() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        {
            id: 'a',
            label: 'a',
            folders: ['folder_1'],
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

    const [buckets, setBuckets] = useState<IFieldsKeeperBucket[]>([
        { id: 'bucket1', items: [allItems[0]] },
        {
            id: 'bucket2',
            items: [allItems[1], allItems[2]],
        },
        { id: 'bucket3', items: [] },
    ]);


    const [rootItems, setRootItems] = useState<IFieldsKeeperItem[]>(allItems);

    const updateRootFieldLabel = (
        fieldItemLabelClickProps: IRootBucketFieldItemLabelChangeProps,
    ) => {
        const {
            fieldItem,
            newValue,
        } = fieldItemLabelClickProps;
        
        console.log(`Updating root field label: ${fieldItem.label} -> ${newValue}`);
        
        // Update root items
        const updatedRootItems = rootItems.map((item) => {
            if (item.group === fieldItem.id) {
                return { ...item, groupLabel: newValue };
            }
            if (item.id === fieldItem.id) {
                return { ...item, label: newValue };
            }
            return item;
        });
        
        setRootItems(updatedRootItems);
        
        // Also update any items that might be in buckets to keep them in sync
        const updatedBuckets = buckets.map((bucket) => ({
            ...bucket,
            items: bucket.items.map((item) => {
                if (item.group === fieldItem.id) {
                    return { ...item, groupLabel: newValue };
                }
                if (item.id === fieldItem.id) {
                    return { ...item, label: newValue };
                }
                return item;
            }),
        }));
        
        setBuckets(updatedBuckets);
    };

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">38. Edit Root Field Label</div>
            <FieldsKeeperProvider
                allItems={rootItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
                accentColor={'#117865'}
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
                    </div>
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket
                            label="Root Bucket"
                            collapseFoldersOnMount={false}
                            prefixNode={{ allow: true, reserveSpace: true }}
                            onFieldItemLabelChange={(
                                fieldItemLabelClickProps: IRootBucketFieldItemLabelChangeProps,
                            ) => {
                                updateRootFieldLabel(fieldItemLabelClickProps);
                            }}
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
