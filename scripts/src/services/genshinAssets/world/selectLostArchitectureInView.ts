import type { GroundPoint } from "genshin-engine";

import { ORIGIN_TOLERANCE_METRES } from "#src/services/genshinAssets/shared/constants";
import { selectArchitectureInView } from "#src/services/genshinAssets/world/selectArchitectureInView";

// The lost fathers a capital's architecture view counts as lost: those standing off the origin. A lost father at the
// Origin whose subtree is placed off it is placed by the witness, as a top's subtree is, so it is not lost
export const selectLostArchitectureInView = <T extends { name: string; position: readonly [number, number, number] }>(
  lostFathers: readonly T[],
  place: GroundPoint,
): T[] =>
  selectArchitectureInView(
    lostFathers.filter(({ position }) => position.some((value) => Math.abs(value) > ORIGIN_TOLERANCE_METRES)),
    place,
  );
