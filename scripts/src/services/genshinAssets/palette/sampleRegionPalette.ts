import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { PaletteColour } from "#src/models/genshinAssets/palette/PaletteColour";
import type { PaletteRegion } from "#src/models/genshinAssets/palette/PaletteRegion";

import { GameDataset } from "genshin-world";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { PaletteFamilyMap } from "#src/services/genshinAssets/palette/PaletteFamilyMap";
import { computeDominantColour } from "#src/services/genshinAssets/palette/computeDominantColour";
import { matchFamilyTextures } from "#src/services/genshinAssets/palette/matchFamilyTextures";
import { readFamilyTexels } from "#src/services/genshinAssets/palette/readFamilyTexels";
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { toSrgb } from "#src/services/shared/toSrgb";

const CHANNEL_MAXIMUM = 255;

// Each kit field's colour sampled from the diffuse textures of the families that feed it, the region's palette as one record
// Under its own key. Each colour is printed with its families, texel count and spread, the evidence it is kept on
export const sampleRegionPalette = async (region: PaletteRegion): Promise<GameDataBuild> => {
  const textureDirectory = join(EXTRACTED_DIRECTORY, region, "assets", "Texture2D");
  const fileNames = await readdir(textureDirectory);
  const notes: string[] = [];
  const palette: Record<string, PaletteColour> = {};
  for (const [field, families] of Object.entries(PaletteFamilyMap[region])) {
    const texturePaths = matchFamilyTextures(fileNames, families).map((fileName) => join(textureDirectory, fileName));
    if (texturePaths.length === 0) {
      notes.push(`${region} ${field}: no diffuse texture of its families in the extraction, left provisional`);
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- one field's textures are read at a time
    const texels = await readFamilyTexels(texturePaths);
    const { linear, spread, texelCount } = computeDominantColour(texels);
    const hex = `#${linear
      .map((channel) =>
        Math.round(toSrgb(channel) * CHANNEL_MAXIMUM)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
    palette[field] = { families, hex, linear, spread, texelCount };
    notes.push(
      `${region} ${field}: ${hex}, ${texelCount} texels in its largest cluster, from ${families.join(", ")}, spread ${spread.toFixed(4)} linear`,
    );
  }
  return { notes, objects: { [`${GameDataset.Regions}/${region}/palette`]: palette } };
};
