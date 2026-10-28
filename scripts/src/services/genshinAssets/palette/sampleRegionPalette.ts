import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { PaletteColour } from "#src/models/genshinAssets/palette/PaletteColour";
import type { PaletteRegion } from "#src/models/genshinAssets/palette/PaletteRegion";

import { computeDominantColour } from "#src/services/genshinAssets/palette/computeDominantColour";
import { matchFamilyTextures } from "#src/services/genshinAssets/palette/matchFamilyTextures";
import { PaletteFamilyMap } from "#src/services/genshinAssets/palette/PaletteFamilyMap";
import { readFamilyTexels } from "#src/services/genshinAssets/palette/readFamilyTexels";
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import { toSrgb } from "#src/services/shared/toSrgb";
import { GameDataset } from "genshin-world";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// Each kit field's colour sampled from the diffuse textures of the families that feed it, the region's palette as one record
// Under its own key. Each colour is printed with its families, texel count and spread, the evidence it is kept on
export const sampleRegionPalette = async (region: PaletteRegion): Promise<GameDataBuild> => {
  const textureDirectory = join(EXTRACTED_DIRECTORY, region, "assets", "Texture2D");
  const fileNames = await readdir(textureDirectory);
  const notes: string[] = [];
  const palette: Record<string, PaletteColour> = {};
  for (const [field, fieldFamilies] of Object.entries(PaletteFamilyMap[region])) {
    // Only the families with a diffuse texture in the extraction are read, so the evidence names those alone
    const families = fieldFamilies.filter((family) => matchFamilyTextures(fileNames, [family]).length > 0);
    const texturePaths = matchFamilyTextures(fileNames, families).map((fileName) => join(textureDirectory, fileName));
    if (texturePaths.length === 0) {
      notes.push(`${region} ${field}: no diffuse texture of its families in the extraction, left provisional`);
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- one field's textures are read at a time
    const texels = await readFamilyTexels(texturePaths);
    // Where every texel is transparent the field has no colour to read, so it is left provisional as one with no texture is
    if (texels.length === 0) {
      notes.push(`${region} ${field}: no opaque texel in its families' diffuse textures, left provisional`);
      continue;
    }
    const { linear, spread, texelCount } = computeDominantColour(texels);
    const hex = `#${linear
      .map((channel) =>
        Math.round(toSrgb(channel) * BYTE)
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
