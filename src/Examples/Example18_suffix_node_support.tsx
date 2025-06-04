import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IContextMenuOption,
} from '..';
import { SuffixNode } from '../Components/SuffixNode';

export default function Example18() {
    const [contextMenuOptions, setContextMenuOptions] = useState<
        IContextMenuOption[]
    >([
        { label: 'Option 1', id: 'option1' },
        {
            label: 'Option 2',
            id: 'option2',
            subMenuOptions: [
                { label: 'SubOption 1', id: 'subOption1', isActive: true },
                { label: 'SubOption 2', id: 'subOption2' },
                { label: 'SubOption 3', id: 'subOption3' },
            ],
        },
        {
            label: 'Option 3',
            id: 'option3',
            subMenuOptions: [
                { label: 'SubOption 4', id: 'subOption4' },
                { label: 'SubOption 5', id: 'subOption5', isActive: true },
                { label: 'SubOption 6', id: 'subOption6' },
            ],
            showSeparator: true,
        },
        { label: 'Option 4', id: 'option4' },
        { label: 'Option 5', id: 'option5', isActive: true },
        { label: 'Option 6', id: 'option6' },
        { label: 'Option 7', id: 'option7' },
        { label: 'Option 8', id: 'option8', showSeparator: true },
        {
            label: 'Option 9',
            id: 'option9',
            subMenuOptions: [
                { label: 'SubOption 7', id: 'subOption7', isActive: true },
                { label: 'SubOption 8', id: 'subOption8' },
                { label: 'SubOption 9', id: 'subOption9' },
            ],
        },
    ]);

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

    return (
        <div className="example-container">
            <div className="example-container-title">
                18. Suffix nodes support for Root bucket items
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
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
                            suffixNodeRenderer={({ fieldItem, bucketId }) => {
                                console.log(
                                    '🚀 ~ Example18 ~ fieldItem:',
                                    fieldItem,
                                    bucketId,
                                );

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
                                    setContextMenuOptions((prevOptions) =>
                                        updateIsActive(
                                            prevOptions,
                                            id,
                                            parentId,
                                        ),
                                    );
                                };
                                return (
                                    <SuffixNode
                                        contextMenuOptions={contextMenuOptions}
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
                            suffixNodeRenderer={({type, onExpandCollapseAll}) => {
                                const contextMenuRootOptions: IContextMenuOption[] =
                                    [
                                        { label: 'Option 1', id: 'option1' },
                                        { label: 'Option 2', id: 'option2' },
                                        { label: 'Option 3', id: 'option3' },
                                    ];

                                    const contextMenuRootLabelOptions: IContextMenuOption[] =
                                    [
                                        { label: 'Expand', id: 'expand' },
                                        { label: 'Collapse', id: 'collapse' },
                                    ];
                                const onOptionClick = (id: string) => {
                                    if((id === 'collapse' || id === 'expand') && onExpandCollapseAll !== undefined){
                                        onExpandCollapseAll((id === 'collapse'));
                                    } 
                                };

                                return (
                                    <SuffixNode
                                        contextMenuOptions={
                                            type === 'folder' ? contextMenuRootLabelOptions : contextMenuRootOptions
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
