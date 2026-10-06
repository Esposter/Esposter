import type { PlanCanvasNode } from "#src/models/scene/PlanCanvasNode";
import type { PlanCanvasOptions } from "#src/models/scene/PlanCanvasOptions";

import { createShadeCanvasTexture } from "#src/services/login/scene/createShadeCanvasTexture";
import { normalGeometry, positionGeometry, step, texture, vec2 } from "three/tsl";

// A rectangle of a part's own geometry drawn once into a canvas, its first axis across the canvas and its second up it,
// And read back where each vertex of the part stands in it: the walkway's tops over x and z, the door's front over x
// And y. A face turned away from the axis the plan looks along (`normalAxis`) reads none of it, so a plan drawn on a
// Part's tops never runs down its sides; its weight, 1 where the plan is read and 0 where not, comes with the sample
export const createPlanCanvasNode = (
  {
    axes: [firstAxis, secondAxis],
    corner: [cornerFirst = 0, cornerSecond = 0],
    normalAxis,
    pixelsPerMetre,
    size: [sizeFirst = 0, sizeSecond = 0],
  }: PlanCanvasOptions,
  draw: (context: OffscreenCanvasRenderingContext2D, toCanvas: (point: readonly number[]) => [number, number]) => void,
): PlanCanvasNode => {
  const canvas = new OffscreenCanvas(Math.ceil(sizeFirst * pixelsPerMetre), Math.ceil(sizeSecond * pixelsPerMetre));
  // A plan is drawn once and read back, by its texture's upload and by a drawing reading its own pixels, so its canvas
  // Lives in memory rather than on the GPU
  const context = canvas.getContext("2d", { willReadFrequently: true });
  // A texture's first row is its top, which the rectangle's far side along its second axis stands at
  if (context)
    draw(context, ([first = 0, second = 0]) => [
      (first - cornerFirst) * pixelsPerMetre,
      (cornerSecond + sizeSecond - second) * pixelsPerMetre,
    ]);
  return {
    sample: texture(
      createShadeCanvasTexture(canvas),
      vec2(
        positionGeometry[firstAxis].sub(cornerFirst).div(sizeFirst),
        positionGeometry[secondAxis].sub(cornerSecond).div(sizeSecond),
      ),
    ),
    weight: step(0.5, normalGeometry[normalAxis]),
  };
};
