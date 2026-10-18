import type { GrassTrail } from "#src/models/vegetation/GrassTrail";

import { GRASS_TRAIL_TEXELS } from "#src/vegetation/constants";
import { DataTexture, LinearFilter, RepeatWrapping, RGBAFormat, Vector2 } from "three";
import { uniform } from "three/tsl";

// An empty trail: no texel bends, and no texel holds a cell yet, so the first step assigns each one its cell
export const createGrassTrail = (): GrassTrail => {
  const texelCount = GRASS_TRAIL_TEXELS * GRASS_TRAIL_TEXELS;
  const data = new Uint8Array(texelCount * 4);
  // Alpha is one everywhere, and the bends a half, which the encoding reads as no bend
  for (let index = 0; index < data.length; index++) data[index] = index % 4 === 3 ? 255 : 128;
  const texture = new DataTexture(data, GRASS_TRAIL_TEXELS, GRASS_TRAIL_TEXELS, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return {
    bends: new Float32Array(texelCount * 2),
    cells: new Float64Array(texelCount * 2).fill(Number.NaN),
    center: uniform(new Vector2()),
    data,
    texture,
  };
};
