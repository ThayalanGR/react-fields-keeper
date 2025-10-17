import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    IContextMenuOption,
    ISuffixBucketNodeRendererProps,
} from '..';
import { SuffixNode } from '../Components/SuffixNode';

export default function Example37() {
    const contextMenuOptions =[
        { label: 'Bucket 1', id: 'bucket1' },
        { label: 'Bucket 2', id: 'bucket2' },
        { label: 'Bucket 3', id: 'bucket3' },
    ]

    const createSuffixNodeRenderer = () => {
        return ({ fieldItem, bucketId, onMoveFieldToBucket }: ISuffixBucketNodeRendererProps) => {
            console.log(
                '🚀 ~ Example37 ~ fieldItem:',
                fieldItem,
                bucketId,
            );

            const onOptionClick = (id: string) => {
                // Safety check: ensure fieldItem exists and has id
                if (fieldItem && fieldItem.id && onMoveFieldToBucket) {
                    onMoveFieldToBucket(id, [fieldItem]);
                }
            };

            return (
                <SuffixNode
                    contextMenuOptions={contextMenuOptions}
                    onOptionClick={onOptionClick}
                />
            );
        };
    };

    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'a', folders: ['folder_1'], prefixNode: 'planning-icon' },
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
        { id: 'bucket1', items: [] },
        {
            id: 'bucket2',
            items: [],
        },
        { id: 'bucket3', items: [] },
    ];

    return (
        <div className="example-container">
            <div className="example-container-title">
                37. Move across bucket
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
                            suffixNodeRenderer={createSuffixNodeRenderer()}
                        />
                        <FieldsKeeperBucket
                            id="bucket2"
                            label="Bucket 2"
                            allowRemoveFields
                            suffixNodeRenderer={createSuffixNodeRenderer()}
                        />
                        <FieldsKeeperBucket
                            id="bucket3"
                            label="Bucket 3"
                            allowRemoveFields
                            suffixNodeRenderer={createSuffixNodeRenderer()}
                        />
                    </div>
                    <div className="root-bucket-container">
                        <FieldsKeeperRootBucket
                            label="Root Bucket"
                            prefixNode={{allow: true, reserveSpace: true}}
                            collapseFoldersOnMount={false}
                            suffixNodeRenderer={({
                                type,
                                onExpandCollapseAll,
                            }) => {
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
                                    if (
                                        (id === 'collapse' ||
                                            id === 'expand') &&
                                        onExpandCollapseAll !== undefined
                                    ) {
                                        onExpandCollapseAll(id === 'collapse');
                                    }
                                };

                                return (
                                    <SuffixNode
                                        contextMenuOptions={
                                            type === 'folder'
                                                ? contextMenuRootLabelOptions
                                                : contextMenuRootOptions
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
