# Packages

| Unit                      | Notes                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `packages/keyframe-store` | the barrel is generated; `createKeyframeStore` sits at the root as the package's one entry point |

Notes on a tree several units share:

- `packages/db-schema` — `models`: a value set and its schema are one file; a second type with a schema of its own is a second file
- `packages/db-schema` — `schema`, `relations`: a table file declares the table and its select schema; value sets live in `models`
- `apps/jobs`: each `apps/jobs` and `apps/realtime` client wrapper binds its own connection-string source onto the `db` primitive
- `apps/realtime`: each `apps/jobs` and `apps/realtime` client wrapper binds its own connection-string source onto the `db` primitive
- `packages/parse-tmx`: `parse-tmx/src/models` is a layer that never grew features rather than one whose shared bucket is unnamed
- `packages/vue-phaserjs` — `models`: barrel contents are generated — regenerate, never hand-edit
- `packages/vue-phaserjs` — `services`: the three emit type utilities are `models/emit`, the cross-feature primitives `services/shared`
- `packages/genshin-persona`: one card module per character under `personaCards`; the plugin root spelled once in `constants.ts`
