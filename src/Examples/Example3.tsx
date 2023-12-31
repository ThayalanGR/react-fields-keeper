import {
  FieldsKeeperProvider,
  FieldsKeeperBucket,
  FieldsKeeperRootBucket,
  IFieldsKeeperItem,
  IFieldsKeeperBucket,
} from "..";

export default function Example1() {
  // compute
  const allItems: IFieldsKeeperItem[] = [
    { id: "date.year", label: "Year", group: "date", groupLabel: "Date" },
    { id: "date.quarter", label: "Quarter", group: "date", groupLabel: "Date" },
    { id: "date.month", label: "Month", group: "date", groupLabel: "Date" },
    { id: "date.day", label: "Day", group: "date", groupLabel: "Date" },
    { id: "b", label: "b" },
    { id: "c", label: "c" },
    { id: "d", label: "d" },
  ];

  const buckets: IFieldsKeeperBucket[] = [
    { id: "bucket1", items: allItems.slice(0, 4) },
    {
      id: "bucket2",
      items: [],
    },
    { id: "bucket3", items: [] },
  ];

  // paint
  return (
    <div className="example-container">
      <div className="example-container-title">Grouping items</div>
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
