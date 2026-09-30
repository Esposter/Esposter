import type { CloudSprite } from "#src/atmosphere/CloudSprite";

import { CanvasTexture, LinearFilter, NoColorSpace } from "three";

// Every cloud sprite in one square texture, a cell each in rows of `getCloudAtlasColumns` of them: its outline filled
// Into the red channel and its lit crown into the green, so a material colours it with whatever the sky's clouds are
// Lit and shaded by at the hour, and none is repainted as the hour turns
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
    const fill = (loops: [number, number][][], column: number, row: number, style: string): void => {
      const path = new Path2D();
      for (const [first, ...rest] of loops) {
        if (!first) continue;
        // The sprite's y runs up and the canvas's down, and a texture's first row is its top
        const toCanvas = ([x, y]: [number, number]): [number, number] => [
          (column + x) * cellSize,
          (row + 1 - y) * cellSize,
        ];
        path.moveTo(...toCanvas(first));
        for (const point of rest) path.lineTo(...toCanvas(point));
        path.closePath();
      }
      context.fillStyle = style;
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      context.fill(path, "evenodd");
    };
    for (const [index, { lit, outline }] of sprites.entries()) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      fill(outline, column, row, "#f00");
      fill(lit, column, row, "#0f0");
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
};
