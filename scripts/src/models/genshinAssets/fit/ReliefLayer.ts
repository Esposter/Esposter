import type { Loop } from "#src/models/genshinAssets/fit/Loop";

// One depth of a relief seen from the front: every loop round what stands at least that far out, with the foot of
// Each corner on the depth below, where its wall leans down to, or none where its wall stands straight all round
export interface ReliefLayer {
  depth: number;
  loops: { foot: Loop; points: Loop }[];
}
