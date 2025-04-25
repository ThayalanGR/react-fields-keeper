import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IContextMenuOption,
    SuffixNode,
} from '..';

export default function Example30() {
    const [contextMenuOptions, setContextMenuOptions] = useState<
        IContextMenuOption[]
    >([
        { label: 'Date', id: 'date' },
        { label: 'Date Hierarchy', id: 'dateHierarchy', isActive: true },
    ]);

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

    const [buckets, setBuckets] = useState<IFieldsKeeperBucket[]>([
        {
            id: 'bucket1',
            items: [],
        },
        { id: 'bucket2', items: [] },
        { id: 'bucket3', items: [] },
    ]);

    return (
        <div className="example-container">
            <div className="example-container-title">30. Flat Group </div>
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
                            suffixNodeRenderer={({ fieldItem, bucketId }) => {
                                const updateIsActive = (
                                    options: IContextMenuOption[],
                                    id: string,
                                    parentId?: string,
                                ): IContextMenuOption[] => {
                                    return options.map((option) => {
                                        if (
                                            parentId &&
                                            option.id === parentId &&
                                            option.subMenuOptions
                                        ) {
                                            return {
                                                ...option,
                                                subMenuOptions:
                                                    option.subMenuOptions.map(
                                                        (subOption) =>
                                                            subOption.id === id
                                                                ? {
                                                                      ...subOption,
                                                                      isActive:
                                                                          true,
                                                                  }
                                                                : {
                                                                      ...subOption,
                                                                      isActive:
                                                                          false,
                                                                  },
                                                    ),
                                            };
                                        }
                                        if (!parentId) {
                                            if (option.id === id) {
                                                return {
                                                    ...option,
                                                    isActive: true,
                                                };
                                            }
                                            return {
                                                ...option,
                                                isActive: false,
                                            };
                                        }
                                        if (option.subMenuOptions) {
                                            return {
                                                ...option,
                                                subMenuOptions: updateIsActive(
                                                    option.subMenuOptions,
                                                    id,
                                                    parentId,
                                                ),
                                            };
                                        }
                                        return option;
                                    });
                                };

                                const onOptionClick = (
                                    id: string,
                                    parentId?: string,
                                ) => {
                                    setBuckets((prevBuckets) => {
                                        const currentBucket = prevBuckets.find(
                                            (bucket) => bucket.id === bucketId,
                                        );
                                        if (!currentBucket) return prevBuckets;

                                        let updatedItems: IFieldsKeeperItem[] =
                                            [...currentBucket.items];

                                        let insertIndex =
                                            updatedItems.findIndex(
                                                (item) =>
                                                    item.group ===
                                                        'dateHierarchy' ||
                                                    item.id === 'date',
                                            );

                                        if (insertIndex === -1) {
                                            insertIndex = updatedItems.length;
                                        }

                                        updatedItems = updatedItems.filter(
                                            (item) =>
                                                item.group !==
                                                    'dateHierarchy' &&
                                                item.id !== 'date',
                                        );

                                        if (id === 'date') {
                                            updatedItems.splice(
                                                insertIndex,
                                                0,
                                                {
                                                    id: 'date',
                                                    label: 'Date',
                                                },
                                            );
                                        } else if (id === 'dateHierarchy') {
                                            const dateHierarchyItems = allItems
                                                .filter(
                                                    (item) =>
                                                        item.group ===
                                                        'dateHierarchy',
                                                )
                                                .sort(
                                                    (a, b) =>
                                                        (a.groupOrder || 0) -
                                                        (b.groupOrder || 0),
                                                );
                                            updatedItems.splice(
                                                insertIndex,
                                                0,
                                                ...dateHierarchyItems,
                                            );
                                        }

                                        const updatedBucket = {
                                            ...currentBucket,
                                            items: updatedItems,
                                        };
                                        return prevBuckets.map((bucket) =>
                                            bucket.id === bucketId
                                                ? updatedBucket
                                                : bucket,
                                        );
                                    });

                                    setContextMenuOptions((prevOptions) =>
                                        updateIsActive(
                                            prevOptions,
                                            id,
                                            parentId,
                                        ),
                                    );
                                };

                                const relevantContextMenuOptions =
                                    fieldItem.group === 'dateHierarchy' ||
                                    fieldItem.id === 'date'
                                        ? contextMenuOptions
                                        : [];

                                return (
                                    <SuffixNode
                                        contextMenuOptions={
                                            relevantContextMenuOptions
                                        }
                                        onOptionClick={onOptionClick}
                                    />
                                );
                            }}
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
