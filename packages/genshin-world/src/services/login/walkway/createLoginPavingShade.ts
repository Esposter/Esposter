import type { Node } from "three/webgpu";

import paving from "#src/data/login/paving.json";
import {
  LOGIN_PAVING_LINE_SHADE,
  LOGIN_PAVING_LINE_WIDTH,
  LOGIN_PAVING_PIXELS_PER_METRE,
} from "#src/services/login/walkway/constants";
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace } from "three";
import { float, mix, normalGeometry, positionGeometry, step, texture, vec2 } from "three/tsl";

// The most a texture is sampled along a grazing line of sight, which the walkway's far paving is seen along
const PAVING_ANISOTROPY = 8;
// How much the walkway's stone is darkened where its paving's lines run: every brick's joints and every pocket's rim,
// As `fitLoginPaving` traced them over one copy of the walkway, drawn once into a texture of that copy and read where
// Each piece's own geometry stands in the copy, so every copy and every rising piece carries its own lines. A pocket's
// Rim is drawn as a smooth curve through its edges' midpoints, as the stone's carving runs, and a brick's straight. Only
// The pieces' tops are paved
export const createLoginPavingShade = (): Node<"float"> => {
  const {
    corner: [cornerX = 0, cornerZ = 0],
    size: [sizeX = 0, sizeZ = 0],
  } = paving;
  const canvas = new OffscreenCanvas(sizeX * LOGIN_PAVING_PIXELS_PER_METRE, sizeZ * LOGIN_PAVING_PIXELS_PER_METRE);
  const context = canvas.getContext("2d");
  if (context) {
    // The texture's first row is its top, which the walkway's far end, its greatest z, stands at
    const toCanvas = ([x = 0, z = 0]: readonly number[]): [number, number] => [
      (x - cornerX) * LOGIN_PAVING_PIXELS_PER_METRE,
      (cornerZ + sizeZ - z) * LOGIN_PAVING_PIXELS_PER_METRE,
    ];
    const lines = new Path2D();
    for (const brick of paving.bricks) {
      const [first, ...rest] = brick.map((point) => toCanvas(point));
      if (!first) continue;
      lines.moveTo(...first);
      for (const point of rest) lines.lineTo(...point);
      lines.closePath();
    }
    for (const pocket of paving.pockets) {
      const points = pocket.map((point) => toCanvas(point));
      const readMidpoint = (index: number): [number, number] => {
        const [startX = 0, startY = 0] = points[index % points.length] ?? [];
        const [endX = 0, endY = 0] = points[(index + 1) % points.length] ?? [];
        return [(startX + endX) / 2, (startY + endY) / 2];
      };
      if (points.length < 3) continue;
      lines.moveTo(...readMidpoint(points.length - 1));
      for (const [index, [x, y]] of points.entries()) lines.quadraticCurveTo(x, y, ...readMidpoint(index));
      lines.closePath();
    }
    context.strokeStyle = "#fff";
    context.lineWidth = LOGIN_PAVING_LINE_WIDTH * LOGIN_PAVING_PIXELS_PER_METRE;
    context.stroke(lines);
  }
  const pavingTexture = new CanvasTexture(canvas);
  pavingTexture.colorSpace = NoColorSpace;
  pavingTexture.magFilter = LinearFilter;
  pavingTexture.minFilter = LinearMipmapLinearFilter;
  pavingTexture.anisotropy = PAVING_ANISOTROPY;
  const line = texture(
    pavingTexture,
    vec2(positionGeometry.x.sub(cornerX).div(sizeX), positionGeometry.z.sub(cornerZ).div(sizeZ)),
  ).r;
  // Only the faces looking up are paved, so the lines never run down a piece's sides
  return mix(float(1), float(LOGIN_PAVING_LINE_SHADE), line.mul(step(0.5, normalGeometry.y)));
};
