import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IFieldItemLabelChangeProps,
} from '..';

export default function Example26() {
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

    const updateFieldLabel = (
        fieldItemLabelClickProps: IFieldItemLabelChangeProps,
    ) => {
        const {
            bucketId,
            fieldItem,
            newValue: newValue,
        } = fieldItemLabelClickProps;
        const updateAllItems = buckets.map((bucket) => {
            if (bucket.id === bucketId) {
                return {
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
                };
            }
            return bucket;
        });

        setBuckets([...updateAllItems]);
    };

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">26. Edit Field Label</div>
            <FieldsKeeperProvider
                allItems={allItems}
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
                            onFieldItemLabelChange={(
                                fieldItemLabelClickProps: IFieldItemLabelChangeProps,
                            ) => {
                                updateFieldLabel(fieldItemLabelClickProps);
                            }}
                        />
                        <FieldsKeeperBucket
                            id="bucket2"
                            label="Bucket 2"
                            allowRemoveFields
                            onFieldItemLabelChange={(
                                fieldItemLabelClickProps: IFieldItemLabelChangeProps,
                            ) => {
                                updateFieldLabel(fieldItemLabelClickProps);
                            }}
                        />
                        <FieldsKeeperBucket
                            id="bucket3"
                            label="Bucket 3"
                            allowRemoveFields
                            onFieldItemLabelChange={(
                                fieldItemLabelClickProps: IFieldItemLabelChangeProps,
                            ) => {
                                updateFieldLabel(fieldItemLabelClickProps);
                            }}
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
