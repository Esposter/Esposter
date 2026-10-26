# Where persisted JSON lives

Read when locating which store, blob and writer hold a persisted document that a schema change touches, or when a rewrite must keep a blob's encoding.

| Store                               | Blobs                                                                                                      | Written by                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `resource-assets`                   | `{resourceId}/content.json` — every resource's working copy, a Blueprint's captured entries inside its own | `saveResourceContent`                     |
| `clicker-assets`, `dungeons-assets` | `{userId}/save.json`                                                                                       | `createSaveBlobStateProcedure`            |
| `genshin-assets`                    | `{userId}/save.json`                                                                                       | `saveGenshin`, `writeGenshinSaveEnvelope` |
| `resource-assets`                   | `{resourceId}/objects/{hash}` — version snapshots, content-addressed keyframes and deltas                  | `writeSnapshotVersion`                    |

Every JSON blob is one zstd frame (`writeJsonBlob`): level `JSON_BLOB_COMPRESSION_LEVEL`, window `MAX_CONTENT_ENCODING_WINDOW_LOG`, served as `Content-Encoding: zstd`. A rewrite keeps all three.

Snapshot objects are not rewritten. They are named by their hash and listed in Postgres (`resourceVersions`), prod's database is not reachable from a session, and a version is restored through the save path, which parses it — so a snapshot older than the change no longer restores until it expires (the revision retention, `openspec/specs/resource/resource-snapshots/design.md`), the same accepted tradeoff as the deploy window that "The run" takes for its prod step. A published version of a publishable type is the exception worth a look: if the change reaches a publishable type's content, its published pages read that snapshot, and the change is raised with the user before it ships.

Rewriting a working copy leaves `resources.contentHash` and `contentSize` stale until the next save. That is safe: a delta save against the stale hash is refused with CONFLICT and the client retries it as a full save.
