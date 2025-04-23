import { useEffect } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
} from '..';

export default function Example31() {


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
            flatGroupIcon: 'contact-card'
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
            flatGroupIcon: 'contact-card'
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
            flatGroupIcon: 'contact-card'
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
            flatGroupIcon: 'contact-card'
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
            flatGroupIcon: 'contact-card'
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
            flatGroupIcon: 'contact-card'
        },
    ];

    const buckets = [
        {
            id: 'bucket1',
            items: [],
        },
        { id: 'bucket2', items: [] },
        { id: 'bucket3', items: [allItems[0], allItems[1], allItems[4], allItems[5], allItems[6], allItems[7], allItems[8], allItems[9]]  },
    ];

    useEffect(() => {
        const customLabelElements = document.getElementsByClassName('custom-label-class-name');
        if (customLabelElements) {
            Array.from(customLabelElements).forEach((element) => {
                element.setAttribute('style', 'font-size: 20px;');
            })
        }
        const customBucketLabelElements = document.getElementsByClassName('custom-bucket-label-class-name');
        if (customBucketLabelElements) {
            Array.from(customBucketLabelElements).forEach((element) => {
                element.setAttribute('style', 'font-size: 20px; color: red;');
            })
        }
        const customBucketFieldItemElements = document.getElementsByClassName('custom-bucket-field-item-class-name');
        if (customBucketFieldItemElements) {
            Array.from(customBucketFieldItemElements).forEach((element) => {
                element.setAttribute('style', 'font-size: 14px; text-align: center; padding: 15px 0px; border-radius: 2px;');
            })
        }
        const customFieldItemElements = document.getElementsByClassName('custom-field-item-class-name');
        if (customFieldItemElements) {
            Array.from(customFieldItemElements).forEach((element) => {
                element.setAttribute('style', 'font-size: 14px; text-align: center; padding: 5px 0px; border-radius: 2px;');
            })
        }
        const customBucketGroupItemElements = document.getElementsByClassName('custom-bucket-group-item-class-name');
        if (customBucketGroupItemElements) {
            Array.from(customBucketGroupItemElements).forEach((element) => {
                element.setAttribute('style', 'font-size: 14px;  padding: 15px 0px; border-radius: 2px;');
            })
        }
        const customGroupItemElements = document.getElementsByClassName('custom-group-item-class-name');
        if (customGroupItemElements) {
            Array.from(customGroupItemElements).forEach((element) => {
                element.setAttribute('style', 'font-size: 14px;  padding: 15px 0px; border-radius: 2px;');
            })
        }
      }, []);

    return (
        <div className="example-container">
            <div className="example-container-title">31. Custom Styling using custom classname </div>
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
                        <FieldsKeeperBucket id="bucket2" label="Bucket 2" allowRemoveFields />
                        <FieldsKeeperBucket id="bucket3" label="Bucket 3" allowRemoveFields 
                            customClassNames=
                                {
                                    {
                                        customLabelClassName: 'custom-bucket-label-class-name',
                                        customFieldItemContainerClassName:'custom-bucket-field-item-class-name',
                                        customGroupContainerClassName: 'custom-bucket-group-item-class-name'
                                    }
                                }
                        />
                    </div>
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket
                            label="Root Bucket"
                            collapseFoldersOnMount={false}
                            prefixNode={{ allow: true, reserveSpace: true }}
                            customClassNames={
                                {
                                    customLabelClassName: 'custom-label-class-name',
                                    customFieldItemClassName: 'custom-field-item-class-name',
                                    customGroupItemClassName: 'custom-group-item-class-name',
                                }
                            }
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}