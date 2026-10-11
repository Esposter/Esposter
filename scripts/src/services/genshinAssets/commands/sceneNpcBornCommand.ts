import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildSceneNpcBorns } from "#src/services/genshinAssets/sceneNpcBorn/buildSceneNpcBorns";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const sceneNpcBornCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the open world's NPC births in scene 3 from the dump (each one's id, config id, group, place, turn and suites) to the game data",
    name: "scene-npc-born",
  },
  run: async ({ args }) => {
    const { notes, objects } = buildSceneNpcBorns();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.SceneNpcBorn],
      }),
    );
  },
});
