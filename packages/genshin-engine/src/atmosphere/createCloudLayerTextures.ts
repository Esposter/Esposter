import type { CloudLayerTextureProfiles } from "#src/models/atmosphere/CloudLayerTextureProfiles";
import type { DataTexture } from "three";

import { createCloudLayerTexture } from "#src/atmosphere/createCloudLayerTexture";

// A sky's cloud layer's textures at their profiles' sizes, blank until `synthesizeCloudLayerTextures` writes them: its
// Density, its curl, its normal map and its wisps' strip
export const createCloudLayerTextures = ({
  curl,
  density,
  normal,
  wisps,
}: CloudLayerTextureProfiles): {
  curl: DataTexture;
  density: DataTexture;
  normal: DataTexture;
  wisps: DataTexture;
} => ({
  curl: createCloudLayerTexture(curl),
  density: createCloudLayerTexture(density),
  normal: createCloudLayerTexture(normal.height),
  wisps: createCloudLayerTexture(wisps),
});
