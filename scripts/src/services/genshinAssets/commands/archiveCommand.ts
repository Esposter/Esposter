import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildArchive } from "#src/services/genshinAssets/archive/buildArchive";
import { buildArchiveText } from "#src/services/genshinAssets/archive/buildArchiveText";
import { buildBookBodyPublication } from "#src/services/genshinAssets/archive/buildBookBodyPublication";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const archiveCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Archive's sections from the dump's codex tables to the game data, every entry's name in every language, and every book's body",
    name: "archive",
  },
  run: async ({ args }) => {
    const { bodyIds, notes, objects } = buildArchive();
    for (const note of notes) console.log(note);
    const text = buildArchiveText(objects);
    for (const note of text.notes) console.log(note);
    const { note, publication } = buildBookBodyPublication(bodyIds);
    console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: publication.indexes, objects: { ...objects, ...text.objects } },
        scopes: [GameDataset.Archive, GameDataset.ArchiveText, GameDataset.BookBody],
      }),
    );
  },
});
