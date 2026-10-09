import type { SubCommandsDef } from "citty";

import { CharacterPackTarget } from "#src/models/genshinCharacters/CharacterPackTarget";
import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { CharacterPackTargetGameDataTargetsMap } from "#src/services/genshinCharacters/CharacterPackTargetGameDataTargetsMap";
import { publishCharacterPack } from "#src/services/genshinCharacters/publishCharacterPack";
import { readCharacterPack } from "#src/services/genshinCharacters/readCharacterPack";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export const publishCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...dryRunArgs,
    folder: {
      description: "A folder of extracted official packs, one folder a character, named by the character's id",
      required: true,
      type: "positional",
    },
    target: {
      default: CharacterPackTarget.Both,
      description: "The accounts the files are stored in; the lock names a pack only once both hold it",
      options: Object.values(CharacterPackTarget),
      type: "enum",
    },
  },
  meta: {
    description:
      "Publish each character's official MMD pack to app-assets under its content hash, and its hash to the game data lock",
    name: "publish",
  },
  run: async ({ args }) => {
    const characterFolders = (await readdir(args.folder, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map(({ name }) => name)
      .toSorted();
    const unnamedFolders = characterFolders.filter((name) => !/^[1-9]\d*$/u.test(name));
    if (unnamedFolders.length > 0)
      throw new InvalidOperationError(
        Operation.Read,
        args.folder,
        `holds folders named by no character id: ${unnamedFolders.join(", ")}`,
      );
    // One pack at a time, so no more than one pack's files are held at once
    for (const characterFolder of characterFolders) {
      // oxlint-disable-next-line no-await-in-loop -- As above
      const pack = await readCharacterPack(join(args.folder, characterFolder), Number(characterFolder));
      for (const note of pack.notes) console.log(`${characterFolder}: ${note}`);
      console.log(
        // oxlint-disable-next-line no-await-in-loop -- As above
        await publishCharacterPack({
          isDryRun: args["dry-run"],
          pack,
          targets: CharacterPackTargetGameDataTargetsMap[args.target],
        }),
      );
    }
  },
});
