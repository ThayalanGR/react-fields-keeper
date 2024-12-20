import { ReactNode } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';

export default function Example18() {
    const onIconClick = () => alert('Icon clicked');

    const rootBucketSuffixNode: ReactNode = (
        <div className="react-fields-keeper-mapping-column-content-sample-suffix-node">
            <div className="react-fields-keeper-mapping-column-content-sample-suffix-node-button">
                <i
                    onClick={onIconClick}
                    className="fk-ms-Icon fk-ms-Icon--Edit"
                />
            </div>
            <div className="react-fields-keeper-mapping-column-content-sample-suffix-node-button">
                <i
                    onClick={onIconClick}
                    className="fk-ms-Icon fk-ms-Icon--Delete"
                />
            </div>
        </div>
    );

    const bucketSuffixNode: ReactNode = (
        <div className="react-fields-keeper-mapping-column-content-sample-suffix-node">
            <div className="react-fields-keeper-mapping-column-content-sample-suffix-node-button">
                <i
                    onClick={onIconClick}
                    className="fk-ms-Icon fk-ms-Icon--ChevronDown"
                />
            </div>
        </div>
    );

    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'a', bucketSuffixNode },
        { id: 'b', label: 'b', bucketSuffixNode },
        { id: 'c', label: 'c', bucketSuffixNode, rootBucketSuffixNode },

        {
            id: 'date.quarter',
            label: 'Quarter',
            group: 'date',
            groupLabel: 'Date',
            groupOrder: 1,
            rootBucketSuffixNode,
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
