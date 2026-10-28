import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { CHARACTER_PACKS_DIRECTORY } from "#src/services/genshinAssets/characterPacks/constants";
import { publishCharacterPacks } from "#src/services/genshinAssets/characterPacks/publishCharacterPacks";
import { readCharacterPackFiles } from "#src/services/genshinAssets/characterPacks/readCharacterPackFiles";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const characterPacksCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...dryRunArgs,
    directory: {
      default: CHARACTER_PACKS_DIRECTORY,
      description: "The packs' folder, one folder per avatar id holding that pack's files",
      type: "string",
    },
  },
  meta: { description: "Publish the official character packs to both accounts, each file under its avatar id" },
  run: async ({ args }) => {
    const files = await readCharacterPackFiles(args.directory);
    if (files.length === 0) throw new InvalidOperationError(Operation.Read, args.directory, "holds no pack files");
    const avatarCount = new Set(files.map(({ avatarId }) => avatarId)).size;
    const bytes = files.reduce((total, { size }) => total + size, 0);
    const summary = `${files.length} files of ${avatarCount} packs, ${bytes} bytes`;
    if (args["dry-run"]) {
      console.log(`character packs: ${summary} would be published to both accounts`);
      return;
    }
    await publishCharacterPacks(files);
    console.log(`character packs: ${summary} published to both accounts`);
  },
});
