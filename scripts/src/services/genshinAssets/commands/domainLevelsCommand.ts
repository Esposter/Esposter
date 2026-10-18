import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildDomainLevels } from "#src/services/genshinAssets/domains/buildDomainLevels";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const domainLevelsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each challenge domain's kind and levels, by its entrance's entry id, from the dungeon, reward preview and entry tables and the scene's entrance points: each level's recommended Adventure Rank, enemies' level, the days its pair is set for, the resin its tree costs and the tree's rewards",
    name: "domain-levels",
  },
  run: async ({ args }) => {
    const { notes, publication } = await buildDomainLevels();
    console.log(notes.join("\n"));
    console.log(await publishGameDataStep({ isDryRun: args["dry-run"], publication, scopes: [GameDataset.Domains] }));
  },
});
