import "./styles.css";
import {
  FieldsKeeperProvider,
  FieldsKeeperBucket,
  FieldsKeeperRootBucket
} from "./FieldsKeeper/FieldsKeeper";

export default function App() {
  return (
    <div className="App">
      <h1>Fields Keeper</h1>

      <FieldsKeeperProvider
        allItems={["a", "b", "c", "d"]}
        buckets={[
          { id: "bucket1", items: ["a", "c"] },
          { id: "bucket2", items: ["b", "d"] }
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
          </div>
          <div>
            <FieldsKeeperRootBucket label="All Items" />
          </div>
        </div>
      </FieldsKeeperProvider>
    </div>
  );
}
