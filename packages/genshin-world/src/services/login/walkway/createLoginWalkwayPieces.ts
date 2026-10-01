import walkway from "#src/data/login/walkway.json";
import { ExtrudeGeometry, Shape } from "three";

// The golden ratio's fraction, which spreads the pieces' seeds evenly whatever their count
const SEED_STEP = 0.618034;
// The walkway as the pieces it is laid from, each its outline extruded from the walkway's underside up to its own top,
// With the depth of its middle, which it rises into place by as one, and a share from 0 to 1 staggering its rise from
// Its neighbours'
export const createLoginWalkwayPieces = (): { depth: number; geometry: ExtrudeGeometry; seed: number }[] =>
  walkway.pieces.map(({ outline, top }, index) => {
    const [first, ...rest] = outline;
    // The plan is drawn on x and -z, so its extrusion rotated up stands along +y with z as the scene's own
    const plan = new Shape().moveTo(first?.[0] ?? 0, -(first?.[1] ?? 0));
    for (const [x = 0, z = 0] of rest) plan.lineTo(x, -z);
    plan.closePath();
    const zs = outline.map(([, z = 0]) => z);
    return {
      depth: (Math.min(...zs) + Math.max(...zs)) / 2,
      geometry: new ExtrudeGeometry(plan, { bevelEnabled: false, depth: top - walkway.bottom })
        .rotateX(-Math.PI / 2)
        .translate(0, walkway.bottom, 0),
      seed: (index * SEED_STEP) % 1,
    };
  });
