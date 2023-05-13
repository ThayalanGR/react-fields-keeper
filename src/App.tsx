import {
  FieldsKeeperProvider,
  FieldsKeeperBucket,
  FieldsKeeperRootBucket
} from "./FieldsKeeper/FieldsKeeper";

export default function App() {
  return (
    <div className="App">
      <h1>ReactFields Keeper</h1>

      <FieldsKeeperProvider
        allItems={[{ id: "a", label: "a" }, { id: "b", label: "b" }, { id: "c", label: "c" }, { id: "d", label: "d" },]}
        buckets={[
          { id: "bucket1", items: [{ id: "a", label: "a" },] },
          { id: "bucket2", items: [{ id: "b", label: "b" }, { id: "c", label: "c" },] },
          { id: "bucket3", items: [] },
        ]}
        onUpdate={(state) => {
          console.log(state);
        }}
      >
        <div
          style={{
            width: 400,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FieldsKeeperBucket id="bucket1" label="Bucket 1" />
            <FieldsKeeperBucket id="bucket2" label="Bucket 2" />
            <FieldsKeeperBucket id="bucket3" label="Bucket 3" />
          </div>
          <div>
            <FieldsKeeperRootBucket label="Root Bucket" />
          </div>
        </div>
      </FieldsKeeperProvider>
    </div>
  );
}
