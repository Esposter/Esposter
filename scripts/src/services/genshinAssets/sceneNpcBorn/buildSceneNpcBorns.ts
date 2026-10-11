import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { DumpedSceneNpcBorn } from "#src/models/genshinAssets/sceneNpcBorn/DumpedSceneNpcBorn";
import type { DumpedSceneNpcBornFile } from "#src/models/genshinAssets/sceneNpcBorn/DumpedSceneNpcBornFile";
import type { SceneNpcBorn } from "genshin-world";

import { NPC_BORN_PATH } from "#src/services/genshinAssets/residents/constants";
import { SCENE_NPC_BORN_SCENE_ID } from "#src/services/genshinAssets/sceneNpcBorn/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset, sceneNpcBornSchema } from "genshin-world";
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

// The scene 3 NPC births as one record of the scene NPC births dataset. The file is read from the dump the residents read,
// So the two agree on every birth, and the births are checked against the reader's schema, since the dump's types are not
export const buildSceneNpcBorns = (): GameDataBuild => {
  const { bornPosList, sceneId } = parseMachineJson<DumpedSceneNpcBornFile>(readFileSync(NPC_BORN_PATH, "utf8"));
  if (sceneId !== SCENE_NPC_BORN_SCENE_ID)
    throw new InvalidOperationError(
      Operation.Read,
      NPC_BORN_PATH,
      `is scene ${sceneId}, not scene ${SCENE_NPC_BORN_SCENE_ID}`,
    );
  const births = z.array(sceneNpcBornSchema).parse(bornPosList.map((born) => toSceneNpcBorn(born)));
  return {
    notes: [`${births.length} NPC births in scene ${SCENE_NPC_BORN_SCENE_ID}`],
    objects: { [`${GameDataset.SceneNpcBorn}/scene${SCENE_NPC_BORN_SCENE_ID}`]: births },
  };
};
