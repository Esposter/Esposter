import type { Node } from "three/webgpu";

import paving from "#src/data/login/paving.json";
import { SceneAxis } from "#src/models/scene/SceneAxis";
import { createPlanCanvasNode } from "#src/services/login/scene/createPlanCanvasNode";
import { LOGIN_PAVING_PIXELS_PER_METRE, LOGIN_PAVING_POCKET_SHADE } from "#src/services/login/walkway/constants";
import { addSmoothLoop } from "genshin-engine";
import { float, mix } from "three/tsl";

// How much the walkway's stone is darkened over its paving's pockets, as `fitLoginPaving` traced them over one copy of
// The walkway, drawn once over that copy's plan and read where each piece's own geometry stands in the copy, so every
// Copy and every rising piece carries its own pockets on its tops. A pocket is filled as a smooth curve bounds it, as
// The stone's carving runs, a step darker than its lane with no line round it, as the game's own plan shows it
export const createLoginPavingShade = (): Node<"float"> => {
  const { sample, weight } = createPlanCanvasNode(
    {
      axes: [SceneAxis.X, SceneAxis.Z],
      corner: paving.corner,
      normalAxis: SceneAxis.Y,
      pixelsPerMetre: LOGIN_PAVING_PIXELS_PER_METRE,
      size: paving.size,
    },
    (context, toCanvas) => {
      const pockets = new Path2D();
      for (const pocket of paving.pockets)
        addSmoothLoop(
          pockets,
          pocket.map((point) => toCanvas(point)),
        );
      context.fillStyle = "#fff";
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      context.fill(pockets);
    },
  );
  return mix(float(1), float(LOGIN_PAVING_POCKET_SHADE), sample.r.mul(weight));
};
