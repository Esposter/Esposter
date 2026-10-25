import type { DumpedSceneNpcBorn } from "#src/models/genshinAssets/sceneNpcBorn/DumpedSceneNpcBorn";
import type { SceneNpcBorn } from "genshin-world";

// One birth as the dataset holds it: its place and turn kept, the dump's underscores dropped, and an unset turn or suite
// List left out or empty rather than written as a value
export const toSceneNpcBorn = ({
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
