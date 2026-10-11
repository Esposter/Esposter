import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildSkillGlyphs } from "#src/services/genshinAssets/skillGlyphs/buildSkillGlyphs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const skillGlyphsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish every playable character's skill and burst icons, traced from the wiki's talent renders, to the game data",
    name: "skill-glyphs",
  },
  run: async ({ args }) => {
    const { notes, publication } = await buildSkillGlyphs();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({ isDryRun: args["dry-run"], publication, scopes: [GameDataset.SkillGlyphs] }),
    );
  },
});
