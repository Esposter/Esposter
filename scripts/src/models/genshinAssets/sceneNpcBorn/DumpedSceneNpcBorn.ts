// A birth record of the scene's NPC births file: the id of the NPC it is, the place it is set down at in the game's axes,
// Its turn about the vertical in degrees, which a record without one leaves unset, the group it is born in and the
// Suites of that group it is placed in, which a record names only when it has any
export interface DumpedSceneNpcBorn {
  _configId: number;
  _groupId: number;
  _id: number;
  _pos: { x: number; y: number; z: number };
  _rot?: { y?: number };
  suiteIdList?: number[];
}
