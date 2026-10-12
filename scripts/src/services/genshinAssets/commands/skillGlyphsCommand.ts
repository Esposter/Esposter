import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildSkillGlyphs } from "#src/services/genshinAssets/skillGlyphs/buildSkillGlyphs";
import { SKILL_GLYPHS_GENERATED_DIRECTORY } from "#src/services/genshinAssets/skillGlyphs/constants";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const skillGlyphsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish every playable character's skill and burst icons, traced from the wiki's talent renders, to the game data",
    name: "skill-glyphs",
  },
  run: async ({ args }) => {
    const { loaderMapSource, notes, publication } = await buildSkillGlyphs();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({ isDryRun: args["dry-run"], publication, scopes: [GameDataset.SkillGlyphs] }),
    );
    // The loader map names only the characters published, so a dry run that published none leaves it as it is
    if (!args["dry-run"]) {
      mkdirSync(SKILL_GLYPHS_GENERATED_DIRECTORY, { recursive: true });
      writeFileSync(join(SKILL_GLYPHS_GENERATED_DIRECTORY, "SkillGlyphsLoaderMap.ts"), loaderMapSource);
    }
  },
});
