import type { CloudSprite, SkyUniforms } from "genshin-engine";

import clouds from "#src/data/login/clouds.json";
import { LoginCloudBandMap } from "#src/services/login/cloud/LoginCloudBandMap";
import { LOGIN_CLOUD_SEA_ROW } from "#src/services/login/scene/constants";
import { createCloudAtlasTexture, createCloudSpriteMaterial, placeCloudBand } from "genshin-engine";
import { Group, MathUtils, Sprite } from "three";

// The texels each painted cloud's cell is drawn at in its band's atlas
const CLOUD_CELL_SIZE = 256;
// The band heaped under the walkway, the sea of cloud that scrolls past with it
const SEA_BAND = "bottom";
// A fitted loop as the data file holds it, its points as pairs
const toLoops = (loops: number[][][]): [number, number][][] =>
  loops.map((loop) => loop.map(([x = 0, y = 0]): [number, number] => [x, y]));
// The login sky's clouds: each band's painted clouds, fitted from its emitter's atlas, drawn once into an atlas of our
// Own and scattered as billboards, lit and shaded in the sky's cloud colours at the hour. The sea's clouds scroll with
// The world, each wrapped round the camera within the sea's row, so as many stand ahead as behind
export const createLoginClouds = (
  skyUniforms: Pick<SkyUniforms, "cloudLitColor" | "cloudShadeColor">,
): { dispose: () => void; group: Group; scroll: (scrolled: number) => void } => {
  const group = new Group();
  const disposables: { dispose: () => void }[] = [];
  const seaSprites: { depth: number; sprite: Sprite }[] = [];
  const seaLength = LOGIN_CLOUD_SEA_ROW.count * LOGIN_CLOUD_SEA_ROW.length;
  for (const [band, { aspect, sprites: fittedSprites }] of Object.entries(clouds)) {
    const sprites = fittedSprites.map(({ lit, outline }): CloudSprite => ({
      lit: toLoops(lit),
      outline: toLoops(outline),
    }));
    const atlas = createCloudAtlasTexture(sprites, CLOUD_CELL_SIZE);
    const materials = sprites.map((_, index) =>
      createCloudSpriteMaterial(atlas, { index, spriteCount: sprites.length }, skyUniforms),
    );
    disposables.push(atlas, ...materials);
    const bandOptions = LoginCloudBandMap[band];
    for (const { position, spriteIndex, width } of placeCloudBand(bandOptions, sprites.length)) {
      const material = materials[spriteIndex];
      if (!material) continue;
      const sprite = new Sprite(material);
      // A cloud's cell is `aspect` times as wide as it is tall, and its foot sits at its height
      sprite.center.set(0.5, 0);
      sprite.position.set(...position);
      sprite.scale.set(width, width / aspect, 1);
      group.add(sprite);
      if (band === SEA_BAND) seaSprites.push({ depth: position[2], sprite });
    }
  }
  return {
    dispose: () => {
      for (const disposable of disposables) disposable.dispose();
    },
    group,
    scroll: (scrolled) => {
      for (const { depth, sprite } of seaSprites)
        sprite.position.z = MathUtils.euclideanModulo(depth - scrolled + seaLength / 2, seaLength) - seaLength / 2;
    },
  };
};
