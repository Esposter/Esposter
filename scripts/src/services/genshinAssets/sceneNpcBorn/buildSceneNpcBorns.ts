import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { DumpedSceneNpcBorn } from "#src/models/genshinAssets/sceneNpcBorn/DumpedSceneNpcBorn";
import type { DumpedSceneNpcBornFile } from "#src/models/genshinAssets/sceneNpcBorn/DumpedSceneNpcBornFile";
import type { SceneNpcBorn } from "genshin-world";

import { NPC_BORN_PATH, SCENE_NPC_BORN_KEY } from "#src/services/genshinAssets/sceneNpcBorn/constants";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { z } from "zod";

// One birth as the dataset holds it: its place and turn kept, the dump's underscores dropped, and an unset turn or suite
// List left out or empty rather than written as a value
const toSceneNpcBorn = ({
  _configId,
  _groupId,
  _id,
  _pos,
  _rot,
  suiteIdList = [],
}: DumpedSceneNpcBorn): SceneNpcBorn => ({
  configId: _configId,
  groupId: _groupId,
  id: _id,
  position: { x: _pos.x, y: _pos.y, z: _pos.z },
  ...(_rot?.y === undefined ? {} : { rotationY: _rot.y }),
  suiteIds: suiteIdList,
});

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
  const births = z.array(sceneNpcBornSchema).parse(bornPosList.map((born) => toSceneNpcBorn(born)));
  return {
    notes: [`${births.length} NPC births in scene ${OPEN_WORLD_SCENE_ID}`],
    objects: { [SCENE_NPC_BORN_KEY]: births },
  };
};
