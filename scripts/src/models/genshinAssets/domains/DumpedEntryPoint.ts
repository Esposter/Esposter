import type { ScenePointVector } from "#src/models/genshinAssets/domains/ScenePointVector";

// A scene point an entrance stands at, read by its place the transport goes to and the turn it arrives facing, each
// Named as the 7.1 dump names it. Either is left out when the dump holds no vector for it
export interface DumpedEntryPoint {
  tranPos?: ScenePointVector;
  tranRot?: ScenePointVector;
}
