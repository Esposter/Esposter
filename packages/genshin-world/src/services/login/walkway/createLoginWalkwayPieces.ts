import type { LoginWalkwayPiece } from "#src/models/login/LoginWalkwayPiece";
import type { BufferGeometry } from "three";

import walkway from "#src/data/login/walkway.json";
import { mergeGeometryParts } from "genshin-engine";
import { ExtrudeGeometry, Shape } from "three";

// The golden ratio's fraction, which spreads the pieces' seeds evenly whatever their count
const SEED_STEP = 0.618034;
// An outline seen from above extruded up from one height to another. The plan is drawn on x and -z, so its extrusion
// Rotated up stands along +y with z as the scene's own
const extrudeOutline = (outline: readonly (readonly number[])[], bottom: number, top: number): BufferGeometry => {
  const [first, ...rest] = outline;
  const plan = new Shape().moveTo(first?.[0] ?? 0, -(first?.[1] ?? 0));
  for (const [x = 0, z = 0] of rest) plan.lineTo(x, -z);
  plan.closePath();
  return new ExtrudeGeometry(plan, { bevelEnabled: false, depth: top - bottom })
    .rotateX(-Math.PI / 2)
    .translate(0, bottom, 0);
};
// The walkway as the pieces it is laid from, each its outline extruded from the walkway's underside up to its own top
// With what stands raised over its stone (its curbs, its lanes' borders) extruded on up to their own, with the depth of
// Its middle, which it rises into place by as one, and a share from 0 to 1 staggering its rise from its neighbours'
export const createLoginWalkwayPieces = (): LoginWalkwayPiece[] =>
  walkway.pieces.map(({ outline, raised, top }, index) => {
    const zs = [outline, ...raised.map((part) => part.outline)].flatMap((loop) => loop.map(([, z = 0]) => z));
    return {
      depth: (Math.min(...zs) + Math.max(...zs)) / 2,
      geometry: mergeGeometryParts([
        extrudeOutline(outline, walkway.bottom, top),
        ...raised.map((part) => extrudeOutline(part.outline, top, part.top)),
      ]),
      seed: (index * SEED_STEP) % 1,
    };
  });
