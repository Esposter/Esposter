# Canonical File and Directory Names

Read when a test creates, reads or names a real filesystem path.

A test file or directory name carries **no meaning**; a distinct one is pure noise and a decision nobody should have to make. Where a package tests real filesystem paths, it declares one canonical file name and one canonical directory in the nearest `constants.test.ts` — `TEST_FILENAME` and `TEST_DIR`, each named with a single character since the name carries nothing — and uses them for **every** test path. **Never invent a custom name** alongside them (`"marker"`, `"helper.cjs"`, `"dist"`, `"nested"`…); diverse names are a recurring mistake. A package with no filesystem tests needs no such constants — don't introduce them speculatively.

- **Extension only when the code under test depends on it** (module resolution, parser/format tests) — then `` `${TEST_FILENAME}.cjs` ``. Otherwise the bare `TEST_FILENAME`.
- **A path that must be absent** (missing-file / non-existent tests) — build it from `TEST_DIR` (the canonical non-existent dir), e.g. ``join(TEST_DIR, `${TEST_FILENAME}.cjs`)``. Never a custom `"missing.cjs"`.
- **File content** follows the string-value convention (`""` base, `" "` for a differing value) — never a custom word like `"x"` or `"scratch"`.
- **When two distinct paths genuinely must coexist** (e.g. a module and the dependency it requires): reuse `TEST_FILENAME` distinguished by nesting (`` `${TEST_FILENAME}/${TEST_FILENAME}.cjs` `` required by `` `${TEST_FILENAME}.cjs` ``) — never a second semantic name. Note a **bare** file `a` and a directory `a` collide, so a flat file plus a nested dir of the same bare name cannot coexist: give the flat file an extension, or test a single nested path. Prefer splitting into separate focused tests over needing two coexisting names.
- **Real artifacts are not fixtures** — an actual on-disk name the production code owns (`pnpm-lock.yaml`, `.gitignore`, the built `dist/index.js`, the real monorepo `packages/` dir) stays its real name (use the existing constant where one exists); only invented _test_ names get canonicalised.
- **Temp-dir prefixes and other repeated path fragments** consolidate into `constants.test.ts` the same way. Reuse across all tests; never hardcode raw path strings or diverse custom prefixes.
