# Published character packs

## Decision

The owner has stated that HoYoverse permits redistributing the official character packs. The app therefore publishes each pack to the public game data container, so a browser reads a character's model from the public container. No written grant is in the repository, so the basis is the owner's statement, cited under Sources.

The packs' bundled terms still say 「请勿二次配布」, do not redistribute, and miHoYo is named as the model's copyright holder. The publish carries each pack's terms folder unchanged, so the credit and the terms reach a reader with the model. The decision rests on the owner's permission, not on those terms.

## Layout

Each file of an avatar folder publishes to `public-genshin-assets` under `characterPacks/<avatar id>/<path>`, with the path kept inside the folder and written with forward slashes. That covers the model, its textures, its `sph` files, its `terms` folder, and the pack's own `manifest.json`, which publishes unchanged. Both storage accounts hold the same names. `genshin:data prune` reaches only the game data datasets, so it never deletes a pack.

## Publish

The command is `pnpm genshin:assets character-packs`, with `--directory` naming the packs' folder and `--dry-run` reporting the counts without a request.

```mermaid
flowchart LR
  DIR["the packs' folder: one folder per avatar id"] --> READ["readCharacterPackFiles: every file, named by its avatar id and path"]
  READ --> DEV["dev account: every file under its name"]
  READ --> PROD["prod account: every file under its name"]
```

Both accounts upload in parallel, and each file replaces the account's copy under the same name.

## The world reads the packs

How the world reads the packs, from the index through the cache to each pack's reader, is set out in [the characters index](../README.md#how-the-world-reads-a-pack).

## Not built

- An upload does not compare content first, so an unchanged file uploads again on a rerun.
- A file a pack drops is not unpublished: a rerun replaces only the names the packs still hold.

## Rejected

- **Hosting the official packs in the app's own storage, served to every visitor.** Each pack's bundled terms forbid redistributing it, so the app held no pack and each copy stayed one a player or a developer already had. The owner's permission overturned this, and the Decision above publishes the packs on it.

## Key files

| File                                                                          | Role                                                                     |
| :---------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/commands/characterPacksCommand.ts`        | The `character-packs` command: the dry run, the counts and the publish   |
| `scripts/src/services/genshinAssets/characterPacks/readCharacterPackFiles.ts` | Every file of every avatar folder, named by its blob name                |
| `scripts/src/services/genshinAssets/characterPacks/publishCharacterPacks.ts`  | Uploads every file to both accounts under its name                       |
| `scripts/src/services/genshinAssets/characterPacks/constants.ts`              | The packs' default folder and the blob prefix they publish under         |
| `packages/genshin-world/src/services/character/readCharacterPackReaders.ts`   | Each avatar's reader, read from the cache when the world opens           |
| `packages/genshin-world/src/services/character/createCharacterPackReader.ts`  | A pack's model, terms and textures, each found by the pack's own names   |
| `scripts/src/models/genshinAssets/characterPacks/CharacterPackFile.ts`        | One file read from disk, with its blob name and size                     |
| `scripts/src/services/gameData/createGameDataContainerClient.ts`              | The container client for each account, shared with the game data publish |

## Sources

- The owner's statement that HoYoverse permits redistributing the packs. No written grant is in the repository.
- The bundled terms, read from each release's own file: `{data-root}/character-packs/extracted/10000006/丽莎/使用规则.txt`, which names miHoYo as copyright holder, and `{data-root}/character-packs/extracted/10000030/readme【一定要看】.txt`, which names miHoYo as provider.
