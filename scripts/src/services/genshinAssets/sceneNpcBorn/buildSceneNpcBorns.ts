import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { DumpedSceneNpcBornFile } from "#src/models/genshinAssets/sceneNpcBorn/DumpedSceneNpcBornFile";

import { NPC_BORN_PATH, SCENE_NPC_BORN_KEY } from "#src/services/genshinAssets/sceneNpcBorn/constants";
import { toSceneNpcBorn } from "#src/services/genshinAssets/sceneNpcBorn/toSceneNpcBorn";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The open world's NPC births as one record of the scene NPC births dataset, the record the scene group record reads its
// NPCs from
export const buildSceneNpcBorns = (): GameDataBuild => {
  const { bornPosList, sceneId } = parseMachineJson<DumpedSceneNpcBornFile>(readFileSync(NPC_BORN_PATH, "utf8"));
  if (sceneId !== OPEN_WORLD_SCENE_ID)
    throw new InvalidOperationError(
      Operation.Read,
      NPC_BORN_PATH,
      `is scene ${sceneId}, not scene ${OPEN_WORLD_SCENE_ID}`,
    );
  const births = bornPosList.map((born) => toSceneNpcBorn(born));
  return {
    notes: [`${births.length} NPC births in scene ${OPEN_WORLD_SCENE_ID}`],
    objects: { [SCENE_NPC_BORN_KEY]: births },
  };
};
