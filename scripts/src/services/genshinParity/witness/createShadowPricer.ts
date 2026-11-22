import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { computeEdgeDistance } from "#src/services/genshinParity/witness/computeEdgeDistance";
import { findShadowEdges } from "#src/services/genshinParity/witness/findShadowEdges";
import { WitnessTarget } from "genshin-world/sceneExport";

// The share of the sun under which a pixel of ours stands in shadow, the middle of its soft edge
const SHADOWED_VISIBILITY = 0.5;

// The price of a sun direction for a reference's shadows: the shadow the exports' occluders cast onto the receivers from
// The direction, its edges' distance to the reference's, in the reference's pixels. The reference's edges and their
// Distance transform are fixed for the solve, so the caller builds them once
export const createShadowPricer =
  ({
    height,
    isReceiver,
    page,
    referenceDistances,
    referenceEdges,
    scale,
    width,
  }: {
    height: number;
    isReceiver: Uint8Array;
    page: Page;
    referenceDistances: Float32Array;
    referenceEdges: Uint8Array;
    scale: number;
    width: number;
  }) =>
  async (candidate: Readonly<Vector>): Promise<{ distance: number; edges: Uint8Array }> => {
    const {
      targets: { shadow = new Float32Array() },
    } = await readWitnessTargets(page, [WitnessTarget.Shadow], false, candidate);
    const isOursShadowed = Uint8Array.from(isReceiver, (isSet, pixel) =>
      Number(Boolean(isSet) && (shadow[pixel * 4] ?? 0) < SHADOWED_VISIBILITY),
    );
    const edges = findShadowEdges(isOursShadowed, isReceiver, width, height);
    const distance = computeEdgeDistance(edges, referenceEdges, width, height, referenceDistances) * scale;
    return { distance, edges };
  };
