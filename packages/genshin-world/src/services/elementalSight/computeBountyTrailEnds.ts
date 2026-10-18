import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { GroundPoint } from "genshin-engine";

// The ends the sight leads a trail to for the bounties taken: the spot of each target standing in the world. A bounty whose
// Target is not placed, or is defeated, has none
export const computeBountyTrailEnds = (bountyCamps: readonly EnemyCamp[]): GroundPoint[] =>
  bountyCamps.flatMap(({ members }) => members.map(({ position }) => position));
