import walkway from "#src/data/login/walkway.json";
import { ExtrudeGeometry, Shape } from "three";

// The walkway as the slab the fit outlined, its outline extruded from its underside up to its surface
export const createLoginWalkwayGeometry = (): ExtrudeGeometry => {
  const [first, ...rest] = walkway.outline;
  // The plan is drawn on x and -z, so its extrusion rotated up stands along +y with z as the scene's own
  const plan = new Shape().moveTo(first?.[0] ?? 0, -(first?.[1] ?? 0));
  for (const [x = 0, z = 0] of rest) plan.lineTo(x, -z);
  plan.closePath();
  return new ExtrudeGeometry(plan, { bevelEnabled: false, depth: walkway.top - walkway.bottom })
    .rotateX(-Math.PI / 2)
    .translate(0, walkway.bottom, 0);
};
