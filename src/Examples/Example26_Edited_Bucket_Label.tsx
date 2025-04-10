import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IFieldItemLabelClickProps,
} from '..';

export default function Example26() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        {
            id: 'a',
            label: 'a',
            folderScope: 'folder_1',
            folderScopeLabel: 'Folder 1',
            prefixNode: 'measure-icon',
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
            folderScopeLabel: 'Folder 2 Long header sample pass',
        },
        {
            id: 'd',
            label: 'd',
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2 Long header sample pass',
            prefixNode: 'measure-icon'
        },
        {
            id: 'date.quarter',
            label: 'Quarter',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 1,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2 Long header sample pass',
        },
        {
            id: 'date.year',
            label: 'Year',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 0,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2 Long header sample pass',
        },
        {
            id: 'date.month',
            label: 'Month long string test pass',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 2,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2 Long header sample pass',
            prefixNode: 'measure-icon',
        },
        {
            id: 'date.day',
            label: 'Day',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 3,
            folderScope: 'folder_2',
            folderScopeLabel: 'Folder 2 Long header sample pass',
        },
    ];

    const [ buckets, setBuckets ] = useState<IFieldsKeeperBucket[]>([
        { id: 'bucket1', items: [allItems[0]] },
        {
            id: 'bucket2',
            items: [allItems[1], allItems[2]],
        },
        { id: 'bucket3', items: [] },
    ]);

    const updateFieldLabel = (fieldItemLabelClickProps: IFieldItemLabelClickProps)=> {
        const { bucketId, fieldItem, newvalue } = fieldItemLabelClickProps;
        const updateAllItems = buckets.map((bucket) => {
            if(bucket.id === bucketId) {
                return {
                    ...bucket,
                    items: bucket.items.map((item) => {
                        if(item.group === fieldItem.id) {
                            return { ...item, groupLabel: newvalue };
                        }
                        if(item.id === fieldItem.id) {
                            return { ...item, label: newvalue };
                        }
                        return item;
                    }),
                };
            }
            return bucket;
        })

        setBuckets([...updateAllItems])
    }

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">
                26. Edit Field Label
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
                accentColor={'#117865'}
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1"
                            allowRemoveFields
                            onFieldItemLabelClick={(fieldItemLabelClickProps: IFieldItemLabelClickProps) => {
                                updateFieldLabel(fieldItemLabelClickProps);
                            }}
                        />
                        <FieldsKeeperBucket
                            id="bucket2"
                            label="Bucket 2"
                            allowRemoveFields
                            onFieldItemLabelClick={(fieldItemLabelClickProps: IFieldItemLabelClickProps) => {
                                updateFieldLabel(fieldItemLabelClickProps);
                            }}
                        />
                        <FieldsKeeperBucket
                            id="bucket3"
                            label="Bucket 3"
                            allowRemoveFields
                            onFieldItemLabelClick={(fieldItemLabelClickProps: IFieldItemLabelClickProps) => {
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
