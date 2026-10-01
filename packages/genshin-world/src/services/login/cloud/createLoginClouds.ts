import type { CloudSprite, SkyUniforms } from "genshin-engine";
import type { InstancedBufferAttribute } from "three";

import clouds from "#src/data/login/clouds.json";
import walkway from "#src/data/login/walkway.json";
import { LoginCloudBandMap } from "#src/services/login/cloud/LoginCloudBandMap";
import { LOGIN_CLOUD_SEA_ROW } from "#src/services/login/scene/constants";
import { createCloudAtlasTexture, createCloudBandSprite, placeCloudBand } from "genshin-engine";
import { Group, MathUtils } from "three";

// The texels each painted cloud's cell is drawn at in its band's atlas
const CLOUD_CELL_SIZE = 256;
// The band heaped under the walkway, the sea of cloud that scrolls past with it
const SEA_BAND = "bottom";
// How far the walkway reaches to either side of its middle, its wings and all, which the camera glides along
const WALKWAY_HALF_WIDTH = Math.max(...walkway.pieces.flatMap(({ outline }) => outline.map(([x = 0]) => Math.abs(x))));
// A fitted loop as the data file holds it, its points as pairs
const toLoops = (loops: number[][][]): [number, number][][] =>
  loops.map((loop) => loop.map(([x = 0, y = 0]): [number, number] => [x, y]));
// The login sky's clouds: each band's painted clouds, fitted from its emitter's atlas, drawn once into an atlas of our
// Own and scattered as billboards, one sprite a band, lit and shaded in the sky's cloud colours at the hour. The sea's
// Clouds scroll with the world, each wrapped round the camera within the sea's row, so as many stand ahead as behind;
// None stands where the walkway glides, which would carry it through the camera: each either clears the walkway to its
// Side or stays under it
export const createLoginClouds = (
  skyUniforms: Pick<SkyUniforms, "cloudLitColor" | "cloudShadeColor">,
): { dispose: () => void; group: Group; scroll: (scrolled: number) => void } => {
  const group = new Group();
  const disposables: { dispose: () => void }[] = [];
  let sea: undefined | { depths: number[]; positions: InstancedBufferAttribute };
  const seaLength = LOGIN_CLOUD_SEA_ROW.count * LOGIN_CLOUD_SEA_ROW.length;
  for (const [band, { aspect, sprites: fittedSprites }] of Object.entries(clouds)) {
    const sprites = fittedSprites.map(({ lit, outline }): CloudSprite => ({
      lit: toLoops(lit),
      outline: toLoops(outline),
    }));
    const atlas = createCloudAtlasTexture(sprites, CLOUD_CELL_SIZE);
    const { dispose, positions, sprite } = createCloudBandSprite(
      atlas,
      placeCloudBand(LoginCloudBandMap[band], sprites.length).filter(
        ({ position: [x, y], width }) =>
          band !== SEA_BAND || Math.abs(x) - width / 2 > WALKWAY_HALF_WIDTH || y + width / aspect < walkway.bottom,
      ),
      { aspect, spriteCount: sprites.length },
      skyUniforms,
    );
    disposables.push(atlas, { dispose });
    group.add(sprite);
    if (band === SEA_BAND)
      sea = { depths: Array.from({ length: positions.count }, (_, index) => positions.getZ(index)), positions };
  }
  return {
    dispose: () => {
      for (const disposable of disposables) disposable.dispose();
    },
    group,
    scroll: (scrolled) => {
      if (!sea) return;
      for (const [index, depth] of sea.depths.entries())
        sea.positions.setZ(
          index,
          MathUtils.euclideanModulo(depth - scrolled + seaLength / 2, seaLength) - seaLength / 2,
        );
      sea.positions.needsUpdate = true;
    },
  };
};
