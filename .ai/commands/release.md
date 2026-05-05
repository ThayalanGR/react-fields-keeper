# Command: Release a New Version

Use when publishing a new version to npm.

## Steps

1. **Ensure the branch is clean and on `main`**
   ```bash
   git status
   git checkout main && git pull
   ```

2. **Run lint and build checks**
   ```bash
   npm run lint
   npm run build:library
   ```
   Both must pass before proceeding.

3. **Bump the version**
   Edit `package.json` — follow semver:
   - Patch (`x.x.N`) — bug fixes, no API changes
   - Minor (`x.N.0`) — new props/features, backwards compatible
   - Major (`N.0.0`) — breaking changes

4. **Publish**
   ```bash
   npm run publish:version
   ```

5. **Commit and tag**
   ```bash
   git add package.json
   git commit -m "version(patch|minor|major): bump to {version}"
   git tag v{version}
   git push origin main --tags
   ```

## Notes

- The library build output is `dist/`. Never commit `dist/` — it's published directly from the build step.
- CSS is injected into the JS bundle via `vite-plugin-css-injected-by-js`. No separate CSS file is shipped.
- Check `library.vite.config.ts` if the build entry point or output format needs adjustment before a release.
