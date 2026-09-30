import { fitCloudSprites } from "#src/services/genshinAssets/fitCloudSprites";
import { join } from "node:path";

// The login sky's three cloud emitters, the cloud sea's billows under the walkway and the cumulus in the middle and
// Top of the sky, each as the painted clouds of its own atlas
const CLOUD_ATLAS_BAND_MAP = {
  bottom: "Enviro_Clouds_Particle_Atlas",
  middle: "Enviro_Clouds_Middle_Particle_Atlas",
  top: "Enviro_Clouds_Top_Particle_Atlas",
} as const;
export const fitLoginClouds = async (
  textureDirectory: string,
): Promise<Record<keyof typeof CLOUD_ATLAS_BAND_MAP, Awaited<ReturnType<typeof fitCloudSprites>>>> => {
  const entries = await Promise.all(
    Object.entries(CLOUD_ATLAS_BAND_MAP).map(
      async ([band, atlas]) => [band, await fitCloudSprites(join(textureDirectory, `${atlas}.png`))] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<
    keyof typeof CLOUD_ATLAS_BAND_MAP,
    Awaited<ReturnType<typeof fitCloudSprites>>
  >;
};
