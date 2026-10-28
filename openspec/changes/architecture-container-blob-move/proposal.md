# Container blob move

## Why

The storage rename in `870c0c4ce9` retires `app-assets`, `dungeons-assets`, `private-user-assets` and `data-exports`, and its commit message and the [azure services](../../specs/architecture/azure-services/design.md) design say their blobs move to the new names. No code in the range moves them, and no backfill ships. Until a move runs, the new read paths find nothing: `apps/web/server/trpc/routers/dungeons.ts` reads a dungeon save at `user-assets/{userId}/save.json`, so a player's saved progress reads as empty; the call background and the logo read from containers that are empty; and the export link reads an archive that is not there.

The blobs are copied to their new names, and the old ones are left in place. The hosted game data is also re-shaped: it is written as one `<dataset>/<hash>.json` object per record, not as the single `genshin/data/` tree it was under `app-assets`, so the game data is republished rather than copied.

## What changes

- The owner confirms whether an out-of-band copy already ran against production. If one ran, the mapping below is verified and no copy runs again.
- If none ran, the blobs are copied to their new names by a scratchpad backfill, run under the `backfills` skill, dry then for real on dev and then prod, and verified by listing each container.
- The hosted game data is republished by `genshin:data` into `public-genshin-assets` under its datasets, under the `genshin-data` skill.
- The old containers are deleted by the owner once the move is verified, as the azure services design says.

## Sequencing question

`870c0c4ce9` already removed the four retired containers, and their grants, from the infra program. The change's gate, that the program no longer names them, therefore holds before any blob moves or 3.1 passes, so it cannot gate the deletion. What the removal does on its own is narrower than the commit message's wording suggests: the old container declarations were protected, so Pulumi refuses to delete them while that protection stands in state, and no workflow runs `pulumi up`. The deletion needs the owner's `infra:up` with the protection lifted. The owner decides how the containers stay in the program until 3.2 (task 1.3), and this change records that choice here before any deletion runs.

## Mapping

| Old container         | Blob                        | New container and name                                      |
| :-------------------- | :-------------------------- | :---------------------------------------------------------- |
| `app-assets`          | the logo                    | `public-app-assets`                                         |
| `app-assets`          | `genshin/data/**`           | `public-genshin-assets/<dataset>/<hash>.json`, by republish |
| `dungeons-assets`     | Phaser file pack            | `public-dungeons-assets`                                    |
| `dungeons-assets`     | `{userId}/save.json`        | `user-assets/{userId}/save.json`                            |
| `private-user-assets` | `{userId}/CallBackground/*` | `user-assets/{userId}/CallBackground/*`                     |
| `data-exports`        | `{dataExportId}.zip`        | `user-assets/exports/{dataExportId}.zip`                    |

## Out of scope

Changing the mapping. The names are settled by the storage rename, and this change moves blobs to them without renaming anything again.
