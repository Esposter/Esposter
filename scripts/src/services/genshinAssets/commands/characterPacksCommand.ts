import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildCharacterPackIndex } from "#src/services/genshinAssets/characterPacks/buildCharacterPackIndex";
import { CHARACTER_PACKS_DIRECTORY } from "#src/services/genshinAssets/characterPacks/constants";
import { publishCharacterPacks } from "#src/services/genshinAssets/characterPacks/publishCharacterPacks";
import { readCharacterPackFiles } from "#src/services/genshinAssets/characterPacks/readCharacterPackFiles";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

// The index is the dataset's one record, under the key the world reads it by
const CHARACTER_PACK_INDEX_KEY = `${GameDataset.CharacterPackIndex}/index`;

export const characterPacksCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...dryRunArgs,
    directory: {
      default: CHARACTER_PACKS_DIRECTORY,
      description: "The packs' folder, one folder per avatar id holding that pack's files",
      type: "string",
    },
  },
  meta: {
    description:
      "Publish the official character packs to both accounts, each file under its avatar id, and the index that lists them",
  },
  run: async ({ args }) => {
    const files = await readCharacterPackFiles(args.directory);
    if (files.length === 0) throw new InvalidOperationError(Operation.Read, args.directory, "holds no pack files");
    const index = await buildCharacterPackIndex(files);
    const indexFiles = index.avatars.flatMap(({ files: avatarFiles }) => avatarFiles);
    const bytes = indexFiles.reduce((total, { bytes: fileBytes }) => total + fileBytes, 0);
    const isDryRun = args["dry-run"];
    console.log(`character packs: ${index.avatars.length} avatars, ${bytes} bytes, ${indexFiles.length} files`);
    // The files upload before the index names them, so no account lists a file it does not hold
    if (!isDryRun) await publishCharacterPacks(files);
    console.log(
      await publishGameDataStep({
        isDryRun,
        publication: { indexes: {}, objects: { [CHARACTER_PACK_INDEX_KEY]: index } },
        scopes: [GameDataset.CharacterPackIndex],
      }),
    );
  },
});
