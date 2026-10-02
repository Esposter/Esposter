import type { LoginTowerAtlas } from "#src/models/login/LoginTowerAtlas";
import type { Node } from "three/webgpu";

import towers from "#src/data/login/towers.json";
import {
  LOGIN_FACADE_ATTRIBUTE,
  LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
  LOGIN_TOWER_RECESS_OCCLUSION,
} from "#src/services/login/tower/constants";
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace } from "three";
import { attribute, texture } from "three/tsl";

// The relief each layer stands at in the facade's mask, the wall at half: what stands out from it above, a shallow
// Recess and a deep one below
const WALL_RELIEF = 0.5;
const RELIEF_PER_UNIT = 0.1;
const MAX_ANISOTROPY = 8;
const toPercent = (share: number): string => `${Math.min(Math.max(share, 0), 1) * 100}%`;
// The login towers' surfaces as `fitLoginTowerFacades` traced them, drawn once into two canvases the towers read where
// Their geometry says each vertex stands (`createLoginTowersGeometry`): the shade over the towers' stone, each band's
// Tone, its paint, its recesses and its gilding filled as its loops in its own shade, a recess darkened by the light
// Its depth keeps out, at half since a canvas holds no
// More than 1 a channel; and a mask whose red is the metal, whose green is the relief a bump map tilts the light by,
// And whose blue is where the tower stands solid rather than open
export const createLoginTowerFacade = (
  atlas: LoginTowerAtlas,
): { metalness: Node<"float">; relief: Node<"float">; shade: Node<"vec3">; solid: Node<"float"> } => {
  const shadeCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const maskCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const shadeContext = shadeCanvas.getContext("2d");
  const maskContext = maskCanvas.getContext("2d");
  if (shadeContext && maskContext) {
    shadeContext.fillStyle = "rgb(50% 50% 50%)";
    shadeContext.fillRect(0, 0, atlas.width, atlas.height);
    maskContext.fillStyle = `rgb(0% ${toPercent(WALL_RELIEF)} 100%)`;
    maskContext.fillRect(0, 0, atlas.width, atlas.height);
    for (const [tower, { bands, holes, layers }] of Object.entries(towers.facades)) {
      const tile = atlas.tiles[tower];
      if (!tile) continue;
      // A loop's point round the tower and up it, in its mesh's units, to the canvas, its foot at the canvas's foot
      const toCanvas = ([round = 0, up = 0]: readonly number[]): [number, number] => [
        tile.x + round * LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
        atlas.height - up * LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
      ];
      const toPath = (loops: readonly (readonly (readonly number[])[])[]): Path2D => {
        const path = new Path2D();
        for (const loop of loops)
          for (const [index, point] of loop.entries()) {
            const [x, y] = toCanvas(point);
            if (index === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          }
        return path;
      };
      const toShadeStyle = (shade: readonly number[]): string => {
        const [red = 1, green = 1, blue = 1] = shade;
        return `rgb(${toPercent(red / 2)} ${toPercent(green / 2)} ${toPercent(blue / 2)})`;
      };
      for (const { from, shade, to } of bands) {
        const [, top] = toCanvas([0, to]);
        const [, foot] = toCanvas([0, from]);
        shadeContext.fillStyle = toShadeStyle(shade);
        shadeContext.fillRect(tile.x, top, tile.width, foot - top);
      }
      for (const { depth, loops, metalness, shade } of layers) {
        const path = toPath(loops);
        const occlusion = depth > 0 ? LOGIN_TOWER_RECESS_OCCLUSION ** depth : 1;
        shadeContext.fillStyle = toShadeStyle(shade.map((channel) => channel * occlusion));
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
        shadeContext.fill(path, "evenodd");
        maskContext.fillStyle = `rgb(${toPercent(metalness)} ${toPercent(WALL_RELIEF - depth * RELIEF_PER_UNIT)} 100%)`;
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
        maskContext.fill(path, "evenodd");
      }
      maskContext.fillStyle = `rgb(0% ${toPercent(WALL_RELIEF)} 0%)`;
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      maskContext.fill(toPath(holes), "evenodd");
    }
  }
  const toTexture = (canvas: OffscreenCanvas): CanvasTexture<OffscreenCanvas> => {
    const canvasTexture = new CanvasTexture(canvas);
    canvasTexture.colorSpace = NoColorSpace;
    canvasTexture.magFilter = LinearFilter;
    canvasTexture.minFilter = LinearMipmapLinearFilter;
    canvasTexture.anisotropy = MAX_ANISOTROPY;
    return canvasTexture;
  };
  const facadeUv = attribute<"vec2">(LOGIN_FACADE_ATTRIBUTE);
  const mask = texture(toTexture(maskCanvas), facadeUv);
  return {
    metalness: mask.r,
    relief: mask.g,
    shade: texture(toTexture(shadeCanvas), facadeUv).rgb.mul(2),
    solid: mask.b,
  };
};
