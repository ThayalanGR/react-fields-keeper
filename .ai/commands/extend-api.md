# Command: Extend the Public API

Use when adding a new prop to `FieldsKeeperBucket`, `FieldsKeeperRootBucket`, or `FieldsKeeperProvider`.

## Steps

1. **Add the type**
   Open `src/FieldsKeeper/FieldsKeeper.types.ts`.
   Add the new prop to the relevant interface with a JSDoc comment:
   - `IFieldsKeeperBucketProps` — for bucket-specific props
   - `IFieldsKeeperRootBucketProps` — for root bucket props
   - `IFieldsKeeperState` / `IFieldsKeeperProviderProps` — for provider-level props

2. **Destructure with a default**
   In the component file, destructure the new prop in the props destructure block.
   Always provide a sensible default inline: `newProp = false`.

3. **Implement the behaviour**
   Keep the implementation close to where the prop is destructured.
   Don't introduce new state unless the prop genuinely needs it.

4. **Export the type if it's new**
   If you added a new interface or type, export it from `src/index.ts`.

5. **Update the context doc**
   Append the new prop to `.ai/context/api-reference.md` under the relevant component section.

6. **Add an example (required)**
   Every new prop or behaviour must have a self-contained example in `src/Examples/` demonstrating it. See `commands/new-example.md` for steps. A feature is not complete without a working example.

## Conventions

- All public props must be optional with defaults — never break existing consumers.
- Callback prop names: `on{Noun}{Verb}` e.g. `onFieldItemClick`, `onFolderStateChange`.
- Boolean flags: prefer `allow{X}` for enabling behaviour, `disable{X}` for disabling.
- Renderer props: `{noun}Renderer` e.g. `suffixNodeRenderer`, `customItemRenderer`.
