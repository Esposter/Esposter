import type { LoginTowerAtlas } from "#src/models/login/LoginTowerAtlas";
import type { LoginTowerFacade } from "#src/models/login/LoginTowerFacade";
import type { LoginTowers } from "#src/models/login/LoginTowers";

import { createShadeCanvasTexture } from "#src/services/login/scene/createShadeCanvasTexture";
import { getHalfShadeStyle } from "#src/services/login/scene/getHalfShadeStyle";
import {
  LOGIN_FACADE_ATTRIBUTE,
  LOGIN_FACADE_CUT_ATTRIBUTE,
  LOGIN_TOWER_FACADE_GUTTER,
  LOGIN_TOWER_FACADE_PIXELS_PER_UNIT,
} from "#src/services/login/tower/constants";
import { attribute, float, texture } from "three/tsl";

// The login towers' surfaces as `fitLoginTowerFacades` traced them, drawn once into two canvases the towers read where
// Their geometry says each vertex stands (`createLoginTowersGeometry`): the shade over the towers' stone, each band's
// Tone, its paint, its recesses and its gilding filled as its loops in its own shade as its texture paints it
// (`getHalfShadeStyle`); and a mask white where the tower stands solid and black where it stands open. Each tower is
// Drawn clipped to its tile and its gutters, its loops once more a whole turn either side so the gutters carry its
// Surface on round its axis. The gilding is drawn as the stone's colour, not as metal: with no reflection of the sky to
// Show it, a metal reads dark against the game's own exports at every hour
export const createLoginTowerFacade = (towers: LoginTowers, atlas: LoginTowerAtlas): LoginTowerFacade => {
  const shadeCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const maskCanvas = new OffscreenCanvas(atlas.width, atlas.height);
  const shadeContext = shadeCanvas.getContext("2d");
  const maskContext = maskCanvas.getContext("2d");
  if (shadeContext && maskContext) {
    shadeContext.fillStyle = getHalfShadeStyle([1, 1, 1]);
    shadeContext.fillRect(0, 0, atlas.width, atlas.height);
    maskContext.fillStyle = "#fff";
    maskContext.fillRect(0, 0, atlas.width, atlas.height);
    for (const [tower, { bands, holes, layers, recesses, size }] of Object.entries(towers.facades)) {
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
        shadeContext.fillStyle = getHalfShadeStyle(shade);
        shadeContext.fillRect(left, top, paddedWidth, foot - top);
      }
      for (const { loops, shade } of layers) {
        const path = toPath(loops);
        shadeContext.fillStyle = getHalfShadeStyle(shade);
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
        shadeContext.fill(path, "evenodd");
      }
      maskContext.fillStyle = "#000";
      // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
      maskContext.fill(toPath(holes), "evenodd");
      // The lathe opens over each recess, whose own box stands behind it
      maskContext.fill(
        toPath(
          recesses.map((recess) => {
            // A slab's span round the tower and up it follows its radius and its depth
            const [roundFrom = 0, roundTo = 0, bottom = 0, top = 0] = recess.slice(2);
            return [
              [roundFrom, bottom],
              [roundTo, bottom],
              [roundTo, top],
              [roundFrom, top],
            ];
          }),
        ),
      );
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
    // A slab's vertices never read the facade's openings, which cut the lathe alone
    solid: float(1).sub(
      attribute<"float">(LOGIN_FACADE_CUT_ATTRIBUTE).mul(float(1).sub(texture(maskTexture, facadeUv).r)),
    ),
  };
};
