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

export default function Example29() {
    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', sourceId: 'a', label: 'a' },
        { id: 'b', sourceId: 'b', label: 'b' },
        { id: 'c', sourceId: 'c', label: 'c' },
        { id: 'd', sourceId: 'd', label: 'd' },
        {
            id: 'date.quarter',
            label: 'Quarter',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 1,
        },
        {
            id: 'date.year',
            label: 'Year',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 0,
        },
        {
            id: 'date.month',
            label: 'Month',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 2,
        },
        {
            id: 'date.day',
            label: 'Day',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 3,
        },
    ];

    const [contextMenuOptions, setContextMenuOptions] = useState<
        IContextMenuOption[]
    >([
        { label: 'Sum', id: 'sum' },
        { label: 'Average', id: 'avg' },
    ]);

    const [buckets, setBuckets] = useState<IFieldsKeeperBucket[]>([
        { id: 'bucket1', items: [allItems[0]] },
        {
            id: 'bucket2',
            items: [allItems[1], allItems[2]],
        },
        { id: 'bucket3', items: [] },
    ]);

    // paint
    return (
        <div className="example-container">
            <div className="example-container-title">29. Source Id</div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
                allowDuplicates
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1"
                            allowRemoveFields
                            suffixNodeRenderer={({ fieldItem, bucketId }) => {
                                let selectedOptionLabel = '';
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
                                                selectedOptionLabel =
                                                    option.label;
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
                                    setContextMenuOptions((prevOptions) => {
                                        const updatedOption = updateIsActive(
                                            prevOptions,
                                            id,
                                            parentId,
                                        );
                                        const updateAllItems = buckets.map(
                                            (bucket) => {
                                                if (bucket.id === bucketId) {
                                                    return {
                                                        ...bucket,
                                                        items: bucket.items.map(
                                                            (item) => {
                                                                if (
                                                                    item.id ===
                                                                    fieldItem.id
                                                                ) {
                                                                    return {
                                                                        ...item,
                                                                        label: `${selectedOptionLabel} of ${item.label}`,
                                                                    };
                                                                }
                                                                return item;
                                                            },
                                                        ),
                                                    };
                                                }
                                                return bucket;
                                            },
                                        );

                                        setBuckets([...updateAllItems]);
                                        return updatedOption;
                                    });
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
                        <FieldsKeeperRootBucket label="Root Bucket" />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
