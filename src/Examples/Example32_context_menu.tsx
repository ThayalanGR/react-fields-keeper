import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IContextMenuOption,
    ContextMenu,
} from '..';
import { SuffixNode } from '../Components/SuffixNode';

export default function Example32() {
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
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
        { id: 'c', label: 'c' },
        {
            id: 'date.quarter',
            label: 'Quarter',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 1,
        },
        {
            id: 'date.year',
            label: 'Year',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 0,
        },
        {
            id: 'date.month',
            label: 'Month',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
            groupOrder: 2,
        },
        {
            id: 'date.day',
            label: 'Day',
            group: 'date',
            groupLabel: 'Date long group header sample pass',
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

    return (
        <div className="example-container">
            <div className="example-container-title">
                32. Context Menu on right click
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => console.log(state)}
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1"
                            allowRemoveFields
                            suffixNodeRenderer={({ fieldItem, bucketId }) => {
                                console.log(
                                    '🚀 ~ Example32 ~ fieldItem:',
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
                            onContextMenuRenderer={({
                                fieldItem,
                                bucketId,
                            }) => {
                                console.log(
                                    '🚀 ~ Example32 ~ Context Menu Clicked:',
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
                                    <ContextMenu
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
                            suffixNodeRenderer={({ id: fieldId }) => {
                                const contextMenuRootOptions: IContextMenuOption[] =
                                    [
                                        { label: 'Option 1', id: 'option1' },
                                        { label: 'Option 2', id: 'option2' },
                                        { label: 'Option 3', id: 'option3' },
                                    ];

                                const onOptionClick = (id: string) => {
                                    console.log(
                                        'onContextMenuClick',
                                        id,
                                        fieldId,
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
                            onContextMenuRenderer={({ id: fieldId }) => {
                                const contextMenuRootOptions: IContextMenuOption[] =
                                    [
                                        { label: 'Option 1', id: 'option1' },
                                        { label: 'Option 2', id: 'option2' },
                                        { label: 'Option 3', id: 'option3' },
                                    ];

                                const onOptionClick = (id: string) => {
                                    console.log(
                                        'onContextMenuClick',
                                        id,
                                        fieldId,
                                    );
                                };

                                return (
                                    <ContextMenu
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
