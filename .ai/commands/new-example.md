# Command: Add a New Example

Use when adding a self-contained usage example to the demo app.

## Steps

1. **Find the next example number**
   ```bash
   ls src/Examples/ | grep -E '^Example[0-9]+' | sort -V | tail -1
   ```

2. **Create the example file**
   Copy the closest existing example as a starting point:
   ```
   src/Examples/Example{N}.tsx
   src/Examples/Example{N}.css  # if styles are needed
   ```
   Follow the existing pattern — each example is a self-contained component that renders its own `FieldsKeeperProvider`.

3. **Register it in `App.tsx`**
   - Import the component
   - Add an entry to the examples list/router (match the existing pattern)
   - The anchor is `#example-{N}`

4. **Verify in dev**
   ```bash
   npm run dev
   # navigate to http://localhost:5173/#example-{N}
   ```

## Conventions

- One file per example. Keep styles co-located in a matching `.css` file.
- Example file names: `Example{N}.tsx` — no gaps in numbering.
- No shared state between examples. Each must be independently runnable.
- Keep the example focused on one feature or prop combination.
