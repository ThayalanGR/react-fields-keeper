import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example35() {
    const [crossHighlightConfig, setCrossHighlightConfig] = useState({
        enabled: true,
        highlightColor: 'red',
        crossHighlightIds: ['folder_1', 'folder_2'],
    });
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
                35. Cross Highlight Across Buckets
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
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
                            crossHighlightAcrossBucket={crossHighlightConfig}
                            onFieldItemClick={(fieldItem) => {
                                setCrossHighlightConfig((prevState) => ({
                                    ...prevState,
                                    crossHighlightIds: [fieldItem.id],
                                }));
                            }}
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
