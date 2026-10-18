import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildTipText } from "#src/services/genshinAssets/tips/buildTipText";
import { buildTips } from "#src/services/genshinAssets/tips/buildTips";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const tipsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the tutorial tips to the game data, each with its Archive entry and its trigger, and every tip's words in every language",
    name: "tips",
  },
  run: async ({ args }) => {
    const { notes, tips } = buildTips();
    for (const note of notes) console.log(note);
    const text = buildTipText(tips);
    for (const note of text.notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { [GameDataset.Tips]: tips, ...text.objects } },
        scopes: [GameDataset.Tips, GameDataset.TipText],
      }),
    );
  },
});
