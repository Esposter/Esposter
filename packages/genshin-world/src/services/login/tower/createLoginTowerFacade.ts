import type { LoginTowerAtlas } from "#src/models/login/LoginTowerAtlas";
import type { Node } from "three/webgpu";

import towers from "#src/data/login/towers.json";
import {
  LOGIN_FACADE_ATTRIBUTE,
  LOGIN_TOWER_FACADE_GUTTER,
  LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
  LOGIN_TOWER_RECESS_OCCLUSION,
} from "#src/services/login/tower/constants";
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace } from "three";
import { attribute, texture } from "three/tsl";

const MAX_ANISOTROPY = 8;
const toTexture = (canvas: OffscreenCanvas): CanvasTexture<OffscreenCanvas> => {
  const canvasTexture = new CanvasTexture(canvas);
  canvasTexture.colorSpace = NoColorSpace;
  canvasTexture.magFilter = LinearFilter;
  canvasTexture.minFilter = LinearMipmapLinearFilter;
  canvasTexture.anisotropy = MAX_ANISOTROPY;
  return canvasTexture;
};
const toPercent = (share: number): string => `${Math.min(Math.max(share, 0), 1) * 100}%`;
// The login towers' surfaces as `fitLoginTowerFacades` traced them, drawn once into two canvases the towers read where
// Their geometry says each vertex stands (`createLoginTowersGeometry`): the shade over the towers' stone, each band's
// Tone, its paint, its recesses and its gilding filled as its loops in its own shade, a recess darkened by the light its
// Depth keeps out, at half since a canvas holds no more than 1 a channel; and a mask white where the tower stands solid
// And black where it stands open. Each tower is drawn clipped to its tile and its gutters, its loops once more a whole
// Turn either side so the gutters carry its surface on round its axis. The gilding is drawn as the stone's colour, not
// As metal: with no reflection of the sky to show it, a metal reads dark against the game's own exports at every hour
export const createLoginTowerFacade = (
  atlas: LoginTowerAtlas,
): { dispose: () => void; shade: Node<"vec3">; solid: Node<"float"> } => {
  const shadeCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const maskCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const shadeContext = shadeCanvas.getContext("2d");
  const maskContext = maskCanvas.getContext("2d");
  if (shadeContext && maskContext) {
    shadeContext.fillStyle = "rgb(50% 50% 50%)";
    shadeContext.fillRect(0, 0, atlas.width, atlas.height);
    maskContext.fillStyle = "#fff";
    maskContext.fillRect(0, 0, atlas.width, atlas.height);
    for (const [tower, { bands, holes, layers, size }] of Object.entries(towers.facades)) {
      const tile = atlas.tiles[tower];
      if (!tile) continue;
      const [breadth = 0] = size;
      const turn = breadth * LOGIN_TOWER_FACADE_PIXELS_PER_UNIT;
      const left = tile.x - LOGIN_TOWER_FACADE_GUTTER;
      const paddedWidth = tile.width + 2 * LOGIN_TOWER_FACADE_GUTTER;
      // A loop's point round the tower and up it, in its mesh's units, to the canvas, its foot at the canvas's foot
      const toCanvas = ([round = 0, up = 0]: readonly number[]): [number, number] => [
        tile.x + round * LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
        atlas.height - up * LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
      ];
      const toPath = (loops: readonly (readonly (readonly number[])[])[]): Path2D => {
        const path = new Path2D();
        for (const offset of [-turn, 0, turn])
          for (const loop of loops)
            for (const [index, point] of loop.entries()) {
              const [x, y] = toCanvas(point);
              if (index === 0) path.moveTo(x + offset, y);
              else path.lineTo(x + offset, y);
            }
        return path;
      };
      const clip = new Path2D();
      clip.rect(left, 0, paddedWidth, atlas.height);
      shadeContext.save();
      shadeContext.clip(clip);
      maskContext.save();
      maskContext.clip(clip);
      const toShadeStyle = (shade: readonly number[]): string => {
        const [red = 1, green = 1, blue = 1] = shade;
        return `rgb(${toPercent(red / 2)} ${toPercent(green / 2)} ${toPercent(blue / 2)})`;
      };
      for (const { from, shade, to } of bands) {
        const [, top] = toCanvas([0, to]);
        const [, foot] = toCanvas([0, from]);
        shadeContext.fillStyle = toShadeStyle(shade);
        shadeContext.fillRect(left, top, paddedWidth, foot - top);
      }
      for (const { depth, loops, shade } of layers) {
        const path = toPath(loops);
        const occlusion = depth > 0 ? LOGIN_TOWER_RECESS_OCCLUSION ** depth : 1;
        shadeContext.fillStyle = toShadeStyle(shade.map((channel) => channel * occlusion));
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
        shadeContext.fill(path, "evenodd");
      }
      maskContext.fillStyle = "#000";
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      maskContext.fill(toPath(holes), "evenodd");
      shadeContext.restore();
      maskContext.restore();
    }
  }
  const facadeUv = attribute<"vec2">(LOGIN_FACADE_ATTRIBUTE);
  const maskTexture = toTexture(maskCanvas);
  const shadeTexture = toTexture(shadeCanvas);
  return {
    dispose: () => {
      maskTexture.dispose();
      shadeTexture.dispose();
    },
    shade: texture(shadeTexture, facadeUv).rgb.mul(2),
    solid: texture(maskTexture, facadeUv).r,
  };
};
