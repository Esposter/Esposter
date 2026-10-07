import type { PlanCanvasOptions } from "#src/models/scene/PlanCanvasOptions";
import type { PlanTones } from "#src/models/scene/PlanTones";
import type { Node } from "three/webgpu";

import { createPlanCanvasNode } from "#src/services/login/scene/createPlanCanvasNode";
import { getHalfShadeStyle } from "#src/services/login/scene/getHalfShadeStyle";
import { addSmoothLoop } from "genshin-engine";
import { mix, vec3 } from "three/tsl";

// The colour a part is painted over its stone, as the tones its texture was read in: the plan filled with the tone
// Most of it shows and each other tone filled over it as smooth loops in its own colour, drawn once and read where the
// Part's own geometry stands on the plan, only on its faces turned along it, the stone's own colour elsewhere. Each
// Colour is drawn at half (`getHalfShadeStyle`) and read back doubled
export const createPlanTonesNode = (options: PlanCanvasOptions, { stone, tones }: PlanTones): Node<"vec3"> => {
  const { sample, weight } = createPlanCanvasNode(options, (context, toCanvas) => {
    context.fillStyle = getHalfShadeStyle(stone);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    for (const { loops, shade } of tones) {
      const path = new Path2D();
      for (const loop of loops)
        addSmoothLoop(
          path,
          loop.map((point) => toCanvas(point)),
        );
      context.fillStyle = getHalfShadeStyle(shade);
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      context.fill(path, "evenodd");
    }
  });
  return mix(vec3(1), sample.rgb.mul(2), weight);
};
