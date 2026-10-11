import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildSceneGroups } from "#src/services/genshinAssets/sceneGroups/buildSceneGroups";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const sceneGroupsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the open world's scene group record (each group's NPCs, viewpoints and quest triggers, and the scene's building points) from the hosted NPC births, the codex and trigger tables, the official map and the scene's points to the game data",
    name: "scene-groups",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildSceneGroups();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.SceneGroups],
      }),
    );
  },
});
