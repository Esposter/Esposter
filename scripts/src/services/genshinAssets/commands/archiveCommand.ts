import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildBookBodyPublication } from "#src/services/genshinAssets/archive/buildBookBodyPublication";
import { writeArchive } from "#src/services/genshinAssets/archive/writeArchive";
import { writeArchiveText } from "#src/services/genshinAssets/archive/writeArchiveText";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const archiveCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Write the Archive's sections from the dump's codex tables into genshin-world, every entry's name in every language, and every book's body in the game data",
    name: "archive",
  },
  run: async ({ args }) => {
    const { bodyIds, notes } = writeArchive();
    for (const note of notes) console.log(note);
    for (const note of writeArchiveText()) console.log(note);
    const { note, publication } = buildBookBodyPublication(bodyIds);
    console.log(note);
    console.log(await publishGameDataStep({ isDryRun: args["dry-run"], publication, scopes: [GameDataset.BookBody] }));
  },
});
