import type { CloudSprite } from "#src/atmosphere/CloudSprite";

import { addSmoothLoop } from "#src/materials/addSmoothLoop";
import { CanvasTexture, LinearFilter, NoColorSpace } from "three";

// How soft a cloud's edge is painted, its outline blurred by this share of a cell, and its lit crown, blurred wider so
// Its light grades into its shade across it rather than stepping
const EDGE_BLUR_SHARE = 0.02;
const CROWN_BLUR_SHARE = 0.035;
// Every cloud sprite in one square texture, a cell each in rows of `getCloudAtlasColumns` of them: its outline filled
// Into the red channel and its lit crown into the green, so a material colours it with whatever the sky's clouds are
// Lit and shaded by at the hour, and none is repainted as the hour turns. Each loop is drawn as a smooth curve through
// Its edges' midpoints, each point bending it, and blurred, so a traced outline's corners round into puffs and its
// Edge fades rather than stepping
export const getCloudAtlasColumns = (spriteCount: number): number => Math.ceil(Math.sqrt(spriteCount));
export const createCloudAtlasTexture = (
  sprites: readonly CloudSprite[],
  cellSize: number,
): CanvasTexture<OffscreenCanvas> => {
  const columns = getCloudAtlasColumns(sprites.length);
  const canvas = new OffscreenCanvas(columns * cellSize, columns * cellSize);
  const context = canvas.getContext("2d");
  if (context) {
    context.globalCompositeOperation = "lighter";
    const fill = (loops: [number, number][][], column: number, row: number, style: string, blurShare: number): void => {
      context.filter = `blur(${cellSize * blurShare}px)`;
      const path = new Path2D();
      // The sprite's y runs up and the canvas's down, and a texture's first row is its top
      const toCanvas = ([x, y]: [number, number]): [number, number] => [
        (column + x) * cellSize,
        (row + 1 - y) * cellSize,
      ];
      for (const loop of loops)
        addSmoothLoop(
          path,
          loop.map((point) => toCanvas(point)),
        );
      context.fillStyle = style;
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      context.fill(path, "evenodd");
    };
    for (const [index, { lit, outline }] of sprites.entries()) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      fill(outline, column, row, "#f00", EDGE_BLUR_SHARE);
      fill(lit, column, row, "#0f0", CROWN_BLUR_SHARE);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
};
