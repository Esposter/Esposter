import type { WwiseCurve } from "#src/models/genshinAssets/music/WwiseCurve";

// What a sound bank's node, or bus, says of how loud it plays: the bus it sends to, none to follow its parent's, its
// Parent, none at the top, its own properties by id and the game parameters' curves on them, and the sources it plays
export interface WwiseNode {
  busId: number;
  curves: WwiseCurve[];
  parentId: number;
  properties: Map<number, number>;
  sourceIds: number[];
}
