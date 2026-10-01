import type { Node } from "three/webgpu";

import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace } from "three";
import { normalGeometry, positionGeometry, step, texture, vec2 } from "three/tsl";

// The most a texture is sampled along a grazing line of sight, which the walkway's far paving is seen along
const PLAN_ANISOTROPY = 8;
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
  }: {
    axes: readonly ["x" | "y" | "z", "x" | "y" | "z"];
    corner: readonly number[];
    normalAxis: "x" | "y" | "z";
    pixelsPerMetre: number;
    size: readonly number[];
  },
  draw: (context: OffscreenCanvasRenderingContext2D, toCanvas: (point: readonly number[]) => [number, number]) => void,
): { sample: Node<"vec4">; weight: Node<"float"> } => {
  const canvas = new OffscreenCanvas(Math.ceil(sizeFirst * pixelsPerMetre), Math.ceil(sizeSecond * pixelsPerMetre));
  const context = canvas.getContext("2d");
  // A texture's first row is its top, which the rectangle's far side along its second axis stands at
  if (context)
    draw(context, ([first = 0, second = 0]) => [
      (first - cornerFirst) * pixelsPerMetre,
      (cornerSecond + sizeSecond - second) * pixelsPerMetre,
    ]);
  const planTexture = new CanvasTexture(canvas);
  planTexture.colorSpace = NoColorSpace;
  planTexture.magFilter = LinearFilter;
  planTexture.minFilter = LinearMipmapLinearFilter;
  planTexture.anisotropy = PLAN_ANISOTROPY;
  return {
    sample: texture(
      planTexture,
      vec2(
        positionGeometry[firstAxis].sub(cornerFirst).div(sizeFirst),
        positionGeometry[secondAxis].sub(cornerSecond).div(sizeSecond),
      ),
    ),
    weight: step(0.5, normalGeometry[normalAxis]),
  };
};
