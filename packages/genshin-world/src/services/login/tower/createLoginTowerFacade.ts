import type { LoginTowerAtlas } from "#src/models/login/LoginTowerAtlas";
import type { Node } from "three/webgpu";

import towers from "#src/data/login/towers.json";
import { createShadeCanvasTexture } from "#src/services/login/scene/createShadeCanvasTexture";
import { getHalfShadeStyle } from "#src/services/login/scene/getHalfShadeStyle";
import {
  LOGIN_FACADE_ATTRIBUTE,
  LOGIN_TOWER_FACADE_CONTRAST,
  LOGIN_TOWER_FACADE_GUTTER,
  LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
  LOGIN_TOWER_RECESS_OCCLUSION,
} from "#src/services/login/tower/constants";
import { attribute, texture } from "three/tsl";

// The login towers' surfaces as `fitLoginTowerFacades` traced them, drawn once into two canvases the towers read where
// Their geometry says each vertex stands (`createLoginTowersGeometry`): the shade over the towers' stone, each band's
// Tone, its paint, its recesses and its gilding filled as its loops in its own shade, a recess darkened by the light
// Its depth keeps out (`getHalfShadeStyle`); and a mask white where the tower stands solid and black where it stands
// Open. Each tower is drawn clipped to its tile and its gutters, its loops once more a whole turn either side so the
// Gutters carry its surface on round its axis. The gilding is drawn as the stone's colour, not as metal: with no
// Reflection of the sky to show it, a metal reads dark against the game's own exports at every hour. Every shade, a
// Recess's with the light it keeps out, stands its contrast's share as far from the stone as traced, since the game
// Shows its carving by the light across its relief rather than by its colour alone
export const createLoginTowerFacade = (
  atlas: LoginTowerAtlas,
): { dispose: () => void; shade: Node<"vec3">; solid: Node<"float"> } => {
  const shadeCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const maskCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const shadeContext = shadeCanvas.getContext("2d");
  const maskContext = maskCanvas.getContext("2d");
  if (shadeContext && maskContext) {
    shadeContext.fillStyle = getHalfShadeStyle([1, 1, 1], LOGIN_TOWER_FACADE_CONTRAST);
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
      for (const { from, shade, to } of bands) {
        const [, top] = toCanvas([0, to]);
        const [, foot] = toCanvas([0, from]);
        shadeContext.fillStyle = getHalfShadeStyle(shade, LOGIN_TOWER_FACADE_CONTRAST);
        shadeContext.fillRect(left, top, paddedWidth, foot - top);
      }
      for (const { depth, loops, shade } of layers) {
        const path = toPath(loops);
        const occlusion = depth > 0 ? LOGIN_TOWER_RECESS_OCCLUSION ** depth : 1;
        shadeContext.fillStyle = getHalfShadeStyle(
          shade.map((channel) => channel * occlusion),
          LOGIN_TOWER_FACADE_CONTRAST,
        );
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
  const maskTexture = createShadeCanvasTexture(maskCanvas);
  const shadeTexture = createShadeCanvasTexture(shadeCanvas);
  return {
    dispose: () => {
      maskTexture.dispose();
      shadeTexture.dispose();
    },
    shade: texture(shadeTexture, facadeUv).rgb.mul(2),
    solid: texture(maskTexture, facadeUv).r,
  };
};
