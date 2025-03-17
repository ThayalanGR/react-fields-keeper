import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
    FieldsKeeperContextMenu,
    IContextMenuOptions,
} from '..';

export default function Example18() {

    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
        { id: 'c', label: 'c' },

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
                18. Suffix nodes support for Root bucket items
            </div>
            <FieldsKeeperProvider
                allItems={allItems}
                buckets={buckets}
                onUpdate={(state) => {
                    console.log(state);
                }}
            >
                <div className="keeper-container">
                    <div className="buckets-container">
                        <FieldsKeeperBucket
                            id="bucket1"
                            label="Bucket 1"
                            allowRemoveFields
                            suffixNodeRenderer={({ fieldItem, bucketId }) => {

                                const contextMenuOptions: IContextMenuOptions[] = [
                                    { label: "Option 1", id: "option1", subMenuOptions: [
                                        { label: "Sub Option 1", id: "subOption1" },
                                        { label: "Sub Option 2", id: "subOption2" },
                                        { label: "Sub Option 3", id: "subOption3" }
                                    ]},
                                    { label: "Option 2", id: "option2",
                                        subMenuOptions: [
                                            { label: "Sub Option 1", id: "subOption1" },
                                            { label: "Sub Option 2", id: "subOption2" },
                                            { label: "Sub Option 3", id: "subOption3" }
                                        ],
                                        isSeparatorNeeded: true
                                    },
                                    { label: "Option 3", id: "option3" }, 
                                ];

                                const onOptionClick  = (id: string) => {
                                    console.log("onContextMenuClick", id); 
                                }

                                return (
                                    <FieldsKeeperContextMenu fieldItem={fieldItem} bucketId={bucketId} contextMenuOptions={contextMenuOptions} onOptionClick={onOptionClick}>
                                        <i
                                            className="fk-ms-Icon fk-ms-Icon--ChevronDown"
                                            style={{ cursor: "pointer" }}
                                        />
                                    </FieldsKeeperContextMenu>
                                )
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
                            suffixNodeRenderer = {(fieldItem ) => {
                               
                                const contextMenuOptions: IContextMenuOptions[] = [
                                    { label: "Option 1", id: "option1" },
                                    { label: "Option 2", id: "option2" },
                                    { label: "Option 3", id: "option3" }, 
                                ];

                                const onOptionClick  = (id: string) => {
                                    console.log("onContextMenuClick", id); 
                                }
                                return (
                                    <FieldsKeeperContextMenu fieldItem={fieldItem} contextMenuOptions={contextMenuOptions} onOptionClick={onOptionClick}>
                                        <i
                                            className="fk-ms-Icon fk-ms-Icon--ChevronDown"
                                            style={{ cursor: "pointer" }}
                                        />
                                    </FieldsKeeperContextMenu>
                                );
                            }}
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
