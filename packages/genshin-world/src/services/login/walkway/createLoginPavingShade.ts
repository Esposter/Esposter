import type { Node } from "three/webgpu";

import paving from "#src/data/login/paving.json";
import { createPlanCanvasNode } from "#src/services/login/scene/createPlanCanvasNode";
import {
  LOGIN_PAVING_LINE_SHADE,
  LOGIN_PAVING_LINE_WIDTH,
  LOGIN_PAVING_PIXELS_PER_METRE,
} from "#src/services/login/walkway/constants";
import { addSmoothLoop } from "genshin-engine";
import { float, mix } from "three/tsl";

// How much the walkway's stone is darkened where its paving's lines run: every brick's joints and every pocket's rim,
// As `fitLoginPaving` traced them over one copy of the walkway, drawn once over that copy's plan and read where each
// Piece's own geometry stands in the copy, so every copy and every rising piece carries its own lines on its tops. A
// Pocket's rim is drawn as a smooth curve, as the stone's carving runs, and a brick's straight
export const createLoginPavingShade = (): Node<"float"> => {
  const { sample, weight } = createPlanCanvasNode(
    {
      axes: ["x", "z"],
      corner: paving.corner,
      normalAxis: "y",
      pixelsPerMetre: LOGIN_PAVING_PIXELS_PER_METRE,
      size: paving.size,
    },
    (context, toCanvas) => {
      const lines = new Path2D();
      for (const brick of paving.bricks) {
        const [first, ...rest] = brick.map((point) => toCanvas(point));
        if (!first) continue;
        lines.moveTo(...first);
        for (const point of rest) lines.lineTo(...point);
        lines.closePath();
      }
      for (const pocket of paving.pockets)
        addSmoothLoop(
          lines,
          pocket.map((point) => toCanvas(point)),
        );
      context.strokeStyle = "#fff";
      context.lineWidth = LOGIN_PAVING_LINE_WIDTH * LOGIN_PAVING_PIXELS_PER_METRE;
      context.stroke(lines);
    },
  );
  return mix(float(1), float(LOGIN_PAVING_LINE_SHADE), sample.r.mul(weight));
};
