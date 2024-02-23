import { useState } from 'react';
import {
    FieldsKeeperProvider,
    FieldsKeeperBucket,
    FieldsKeeperRootBucket,
    IFieldsKeeperItem,
    IFieldsKeeperBucket,
} from '..';
import { FieldsKeeperSearcher } from '../FieldsKeeper/FieldsKeeperSearcher';

export default function Example13() {
    // state
    const [searchQuery, setSearchQuery] = useState('');

    // compute
    const allItems: IFieldsKeeperItem[] = [
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
        { id: 'c', label: 'c' },
        { id: 'd', label: 'd' },
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
                13. Root bucket with custom searcher
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
                            // label="Bucket 3"
                            allowRemoveFields
                        />
                    </div>
                    <div className="root-bucket-container">
                        <div style={{ marginBottom: 10 }}>
                            <FieldsKeeperSearcher
                                searchQuery={searchQuery}
                                onSearchQueryChange={setSearchQuery}
                                searchPlaceholder="Search"
                                className="sample-custom-font-size"
                            />
                        </div>
                        <FieldsKeeperRootBucket
                            label="Root Bucket"
                            customSearchQuery={searchQuery}
                            showClearSearchLink={false}
                            emptyFilterMessage="No categories found!"
                            // disabledEmptyFilterMessage
                        />
                    </div>
                </div>
            </FieldsKeeperProvider>
        </div>
    );
}
