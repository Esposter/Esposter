import type { SpectralNoiseProfile } from "#src/models/noise/SpectralNoiseProfile";

import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat } from "three";

// A cloud layer's texture of four channels a texel at a profile's size, blank until its texels are written
// (`writeCloudLayerTexture`), tiled at every edge and filtered through its mipmaps. A material keeps the texture it was
// Built over, so the layer is built over these and they are written in place once their texels are drawn
export const createCloudLayerTexture = ({
  height,
  width,
}: Pick<SpectralNoiseProfile, "height" | "width">): DataTexture => {
  const texture = new DataTexture(new Uint8Array(width * height * 4), width, height, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};
