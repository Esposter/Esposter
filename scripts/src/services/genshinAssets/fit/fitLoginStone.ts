import type { FittedStone } from "#src/models/genshinAssets/fit/FittedStone";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { Vector } from "#src/models/shared/Vector";

import { fitAlbedo } from "#src/services/genshinAssets/fit/fitAlbedo";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeUpperMedian } from "#src/services/genshinAssets/shared/computeUpperMedian";
import { BYTE } from "#src/services/shared/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// The texels a mask is reduced to before its median is taken
const MASK_SAMPLE_SIZE = 64;
// The material property a mask's smoothness is scaled by
const GLOSS_MAP_SCALE_KEY = "_GlossMapScale";
// Each family of the login's parts by the materials it draws with, as the materials are named
const FAMILY_MATERIAL_REGEX_MAP: Record<"bridges" | "door" | "towers" | "walkway", RegExp> = {
  bridges: /^LoginScene_(?:Bridge0[2-4]|Pillar|Broken)/u,
  door: /^LoginScene_Door/u,
  towers: /^LoginScene_Build/u,
  walkway: /^LoginScene_Bridge01/u,
};
const computeMean = (vectors: readonly Vector[]): Vector =>
  ([0, 1, 2] as const).map((channel) =>
    roundFitted(vectors.reduce((sum, vector) => sum + vector[channel], 0) / Math.max(vectors.length, 1)),
  ) as Vector;
// The stone each family of the login's parts is carved from, as its materials hold it (Login/Scene/Index.reference.ts,
// Source `stoneShader`, whose programs do not decompile, so its properties are read, not its code): the median colour
// Of their diffuse textures, the median smoothness of their masks\' red channel at their gloss scale, the specular
// Colour they tint their highlights with, and the rim glow they light their edges with, its colour, power and strength
export const fitLoginStone = async (
  materials: readonly MaterialValues[],
  textureDirectory: string,
): Promise<Record<keyof typeof FAMILY_MATERIAL_REGEX_MAP, FittedStone>> => {
  const entries = await Promise.all(
    Object.entries(FAMILY_MATERIAL_REGEX_MAP).map(async ([family, regex]) => {
      const familyMaterials = materials.filter(({ name }) => regex.test(name));
      const diffusePaths = familyMaterials
        .map(({ name }) => join(textureDirectory, `${name}_Diffuse.png`))
        .filter((path) => existsSync(path));
      const smoothnesses = await Promise.all(
        familyMaterials.map(async ({ floats, name }) => {
          const path = join(textureDirectory, `${name}_SMBE.png`);
          if (!existsSync(path)) return [];
          const { data, info } = await sharp(path)
            .resize(MASK_SAMPLE_SIZE, MASK_SAMPLE_SIZE, { fit: "fill" })
            .raw()
            .toBuffer({ resolveWithObject: true });
          const scale = floats[GLOSS_MAP_SCALE_KEY] ?? 1;
          return Array.from(
            { length: info.width * info.height },
            (_value, texel) => ((data[texel * info.channels] ?? 0) / BYTE) * scale,
          );
        }),
      );
      const getColors = (key: string): Vector[] =>
        familyMaterials.flatMap(({ colors }) => {
          const color = colors[key];
          return color ? [[color[0], color[1], color[2]] satisfies Vector] : [];
        });
      const computeMeanFloat = (key: string): number => {
        const values = familyMaterials.flatMap(({ floats }) => (floats[key] === undefined ? [] : [floats[key]]));
        return roundFitted(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
      };
      return [
        family,
        {
          albedo: await fitAlbedo(diffusePaths),
          rimColor: computeMean(getColors("_RGColor")),
          rimPower: computeMeanFloat("_RGPower"),
          rimStrength: computeMeanFloat("_RGStrength"),
          smoothness: roundFitted(computeUpperMedian(smoothnesses.flat())),
          specularColor: computeMean(getColors("_SpecColor")),
        },
      ] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<keyof typeof FAMILY_MATERIAL_REGEX_MAP, FittedStone>;
};
