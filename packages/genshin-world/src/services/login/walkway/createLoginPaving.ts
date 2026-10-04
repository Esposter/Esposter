import type { Node } from "three/webgpu";

import paving from "#src/data/login/paving.json";
import { SceneAxis } from "#src/models/scene/SceneAxis";
import { createPlanCanvasNode } from "#src/services/login/scene/createPlanCanvasNode";
import { LOGIN_PAVING_PIXELS_PER_METRE, LOGIN_PAVING_POCKET_SHADE } from "#src/services/login/walkway/constants";
import { addSmoothLoop, MAX_BYTE } from "genshin-engine";
import { float, mix, normalView, transformNormalToView, vec3 } from "three/tsl";

// The box a rim is blurred by, twice over: a quarter of the rim's width either side, and a pixel at the least
const BEVEL_PIXELS = Math.max(Math.round((paving.bevel.width * LOGIN_PAVING_PIXELS_PER_METRE) / 4), 1);
// A step blurred twice by that box falls at most by one over the box's width a pixel
const BEVEL_PEAK_PIXELS = BEVEL_PIXELS * 2 + 1;
// A slope a pixel as its share of the steepest a rim falls, about the byte's middle
const toByte = (slope: number): number =>
  Math.round((Math.min(Math.max(slope * BEVEL_PEAK_PIXELS, -1), 1) * 0.5 + 0.5) * MAX_BYTE);
// A canvas's one channel blurred by a box of the radius along one axis, in place, twice over for a bevel that eases
// In and out
const blurChannel = (values: Float32Array, width: number, height: number, radius: number): void => {
  const line = new Float32Array(Math.max(width, height));
  for (const [count, length, stride, step] of [
    [height, width, width, 1],
    [width, height, 1, width],
  ] as const)
    for (let index = 0; index < count; index++) {
      const start = index * stride;
      for (let pass = 0; pass < 2; pass++) {
        let sum = 0;
        for (let offset = -radius; offset <= radius; offset++)
          sum += values[start + Math.min(Math.max(offset, 0), length - 1) * step] ?? 0;
        for (let position = 0; position < length; position++) {
          line[position] = sum / (radius * 2 + 1);
          sum +=
            (values[start + Math.min(position + radius + 1, length - 1) * step] ?? 0) -
            (values[start + Math.max(position - radius, 0) * step] ?? 0);
        }
        for (let position = 0; position < length; position++) values[start + position * step] = line[position] ?? 0;
      }
    }
};
// The walkway's paving over its tops, as `fitLoginPaving` traced it over one copy of the walkway: each pocket sunk
// Into its lane's stone and each groove, a joint between two bricks or a lane's border, cut into it, their rims
// Bevels, as the game's stone carves them in its normal map, so a low sun lights the rims turned to it and leaves the
// Rims turned away dark, which is how the game shows its carving. Drawn once over that copy's plan and read where
// Each piece's own geometry stands in the copy, so every copy and every rising piece carries its own paving: the
// Pockets and the grooves filled as smooth curves and blurred over the rim's width into the stone's depth, whose
// Slopes across and along the walkway are the canvas's red and green about their middle, the pockets alone its blue.
// The shade is a pocket's stone a step darker than its lane's; the normal tilts by the slopes on the tops alone, a
// Rim falling its fitted slope's and width's depth
export const createLoginPaving = (): { normalNode: Node<"vec3">; shade: Node<"float"> } => {
  const { sample, weight } = createPlanCanvasNode(
    {
      axes: [SceneAxis.X, SceneAxis.Z],
      corner: paving.corner,
      normalAxis: SceneAxis.Y,
      pixelsPerMetre: LOGIN_PAVING_PIXELS_PER_METRE,
      size: paving.size,
    },
    (context, toCanvas) => {
      const { height, width } = context.canvas;
      const pockets = new Path2D();
      for (const pocket of paving.pockets)
        addSmoothLoop(
          pockets,
          pocket.map((point) => toCanvas(point)),
        );
      context.fillStyle = "#fff";
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      context.fill(pockets);
      const getFilledShares = (): Float32Array => {
        const { data } = context.getImageData(0, 0, width, height);
        return Float32Array.from({ length: width * height }, (_value, pixel) => (data[pixel * 4] ?? 0) / MAX_BYTE);
      };
      const pocketShares = getFilledShares();
      // A groove falls its own slope's share of a rim's depth
      const grooveByte = Math.round(Math.min(paving.grooveSlope / paving.bevel.slope, 1) * MAX_BYTE);
      context.globalCompositeOperation = "lighten";
      context.fillStyle = `rgb(${grooveByte} ${grooveByte} ${grooveByte})`;
      const grooves = new Path2D();
      // A joint runs straight and turns square, and the bricks it runs round are holes in its loop
      for (const groove of paving.grooves) {
        for (const [index, point] of groove.entries()) {
          const [x, y] = toCanvas(point);
          if (index === 0) grooves.moveTo(x, y);
          else grooves.lineTo(x, y);
        }
        grooves.closePath();
      }
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      context.fill(grooves, "evenodd");
      const depths = getFilledShares();
      blurChannel(depths, width, height, BEVEL_PIXELS);
      const image = context.getImageData(0, 0, width, height);
      for (let pixel = 0; pixel < width * height; pixel++) {
        const [column, row] = [pixel % width, Math.floor(pixel / width)];
        const across =
          (depths[row * width + Math.min(column + 1, width - 1)] ?? 0) -
          (depths[row * width + Math.max(column - 1, 0)] ?? 0);
        // The canvas's rows run from the walkway's far side to its near one
        const along =
          (depths[Math.max(row - 1, 0) * width + column] ?? 0) -
          (depths[Math.min(row + 1, height - 1) * width + column] ?? 0);
        image.data[pixel * 4] = toByte(across / 2);
        image.data[pixel * 4 + 1] = toByte(along / 2);
        image.data[pixel * 4 + 2] = Math.round((pocketShares[pixel] ?? 0) * MAX_BYTE);
        image.data[pixel * 4 + 3] = MAX_BYTE;
      }
      context.putImageData(image, 0, 0);
    },
  );
  // A pocket's floor lies under its lane, so its depth rising across the walkway tilts the stone's normal that way:
  // The rim's depth in metres, its slope over its width, by the share of it a pixel falls, in pixels a metre
  const slopes = sample.rg
    .mul(2)
    .sub(1)
    .mul((paving.bevel.slope * paving.bevel.width * LOGIN_PAVING_PIXELS_PER_METRE) / BEVEL_PEAK_PIXELS);
  return {
    normalNode: mix(normalView, transformNormalToView(vec3(slopes.x, 1, slopes.y).normalize()), weight),
    shade: mix(float(1), float(LOGIN_PAVING_POCKET_SHADE), sample.b.mul(weight)),
  };
};
