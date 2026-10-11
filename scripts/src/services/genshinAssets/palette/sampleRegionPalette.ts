import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { PaletteColour } from "#src/models/genshinAssets/palette/PaletteColour";
import type { PaletteRegion } from "#src/models/genshinAssets/palette/PaletteRegion";
import type { Vector } from "#src/models/shared/Vector";

import { computeDominantColour } from "#src/services/genshinAssets/palette/computeDominantColour";
import { matchFamilyTextures } from "#src/services/genshinAssets/palette/matchFamilyTextures";
import { PaletteFamilyMap } from "#src/services/genshinAssets/palette/PaletteFamilyMap";
import { readTextureTexels } from "#src/services/genshinAssets/palette/readTextureTexels";
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { toSrgb } from "#src/services/shared/toSrgb";
import { GameDataset } from "genshin-world";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const CHANNEL_MAXIMUM = 255;

// Each kit field's colour sampled from the diffuse textures of the families that feed it, the region's palette as one record
// Under its own key. Each colour is printed with its families, texel count and spread, the evidence it is kept on
export const sampleRegionPalette = async (region: PaletteRegion): Promise<GameDataBuild> => {
  const textureDirectory = join(EXTRACTED_DIRECTORY, region, "assets", "Texture2D");
  const fileNames = await readdir(textureDirectory);
  const notes: string[] = [];
  const palette: Record<string, PaletteColour> = {};
  for (const [field, families] of Object.entries(PaletteFamilyMap[region])) {
    const texels: Vector[] = [];
    // A field is recorded with only the families whose textures gave it texels, so its evidence never names a family the
    // Extraction lacks or one whose texels are all transparent
    const sampledFamilies: string[] = [];
    for (const family of families)
      for (const fileName of matchFamilyTextures(fileNames, [family])) {
        // oxlint-disable-next-line no-await-in-loop -- one texture is read at a time
        const textureTexels = await readTextureTexels(join(textureDirectory, fileName));
        if (textureTexels.length === 0) continue;
        texels.push(...textureTexels);
        if (!sampledFamilies.includes(family)) sampledFamilies.push(family);
      }
    if (texels.length === 0) {
      notes.push(`${region} ${field}: no visible texel in a diffuse texture of its families, left provisional`);
      continue;
    }
    const { linear, spread, texelCount } = computeDominantColour(texels);
    const hex = `#${linear
      .map((channel) =>
        Math.round(toSrgb(channel) * CHANNEL_MAXIMUM)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
    palette[field] = { families: sampledFamilies, hex, linear, spread, texelCount };
    notes.push(
      `${region} ${field}: ${hex}, ${texelCount} texels in its largest cluster, from ${sampledFamilies.join(", ")}, spread ${spread.toFixed(4)} linear`,
    );
  }
  return { notes, objects: { [`${GameDataset.Regions}/${region}/palette`]: palette } };
};
