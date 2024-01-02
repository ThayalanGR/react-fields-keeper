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
    { id: "a", label: "a" },
    { id: "b", label: "b*", activeNodeClassName: "active-node-class-name" },
    { id: "c", label: "c" },
    { id: "d", label: "d" },
  ];

  const buckets: IFieldsKeeperBucket[] = [
    { id: "bucket1", items: [allItems[0]] },
    {
      id: "bucket2",
      items: [allItems[1], allItems[2]],
    },
    { id: "bucket3", items: [] },
  ];

  // paint
  return (
    <div className="example-container">
      <div className="example-container-title">Highlighting targeted items</div>
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
