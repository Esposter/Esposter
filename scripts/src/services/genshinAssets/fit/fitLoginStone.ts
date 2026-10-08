import type { FittedStone } from "#src/models/genshinAssets/fit/FittedStone";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { Vector } from "#src/models/shared/Vector";

import { fitAlbedo } from "#src/services/genshinAssets/fit/fitAlbedo";
import { LoginStoneFamilyMaterialRegexMap } from "#src/services/genshinAssets/fit/LoginStoneFamilyMaterialRegexMap";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeUpperMedian } from "#src/services/genshinAssets/shared/computeUpperMedian";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { BYTE } from "#src/services/shared/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// The texels a mask is reduced to before its median is taken
const MASK_SAMPLE_SIZE = 64;
// The material property a mask's smoothness is scaled by, and the slots its diffuse texture and its mask fill
const GLOSS_MAP_SCALE_KEY = "_GlossMapScale";
const DIFFUSE_SLOT = "_MainTex";
const MASK_SLOT = "_DetailMask";
// The keyword a material's variant draws its rim glow under, and the property its strength is read from
const RIM_GLOW_KEYWORD = "ENABLE_RIM_GLOW_ON";
const RIM_STRENGTH_KEY = "_RGStrength";
// The share of a family's rim glow the game's frame shows where its materials predict more, by family (the light pass,
// `passes login --pass Light`): the frame holds about an eighth of the door's and the towers' glow, and the glow colour
// reads flat from none to an eighth, then climbs; a family not listed draws its materials' glow whole
const GLOW_SCALES: Partial<Record<string, number>> = { door: 0.125, towers: 0.125 };
const computeMeanValue = (values: readonly number[]): number =>
  roundFitted(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
const computeMean = (vectors: readonly Vector[]): Vector =>
  ([0, 1, 2] as const).map((channel) =>
    roundFitted(vectors.reduce((sum, vector) => sum + vector[channel], 0) / Math.max(vectors.length, 1)),
  ) as Vector;
// The stone each family of the login's parts is carved from, as its materials hold it (Login/Scene/Index.reference.ts,
// Source `stoneShader`, whose programs do not decompile, so its properties are read, not its code): the median colour
// Of the diffuse textures their slots draw (two materials may share one), the median smoothness of their masks\' red
// Channel at their gloss scale, the specular colour they tint their highlights with, and the rim glow they light their
// Edges with, its colour, power and strength and the length it is drawn from
export const fitLoginStone = async (
  materials: readonly MaterialValues[],
  textureDirectory: string,
): Promise<Record<keyof typeof LoginStoneFamilyMaterialRegexMap, FittedStone>> => {
  const pathIdNameMap = await readAssetNames(
    new Set(materials.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId))),
  );
  // The exported file of the texture a material's slot draws, where it was exported
  const getTexturePath = ({ textures }: MaterialValues, slot: string): string | undefined => {
    const name = pathIdNameMap.get(textures[slot]?.pathId ?? "");
    const path = name === undefined ? undefined : join(textureDirectory, `${name}.png`);
    return path && existsSync(path) ? path : undefined;
  };
  const entries = await Promise.all(
    Object.entries(LoginStoneFamilyMaterialRegexMap).map(async ([family, regex]) => {
      const familyMaterials = materials.filter(({ name }) => regex.test(name));
      const diffusePaths = [
        ...new Set(familyMaterials.flatMap((material) => getTexturePath(material, DIFFUSE_SLOT) ?? [])),
      ];
      const smoothnesses = await Promise.all(
        familyMaterials.map(async (material) => {
          const path = getTexturePath(material, MASK_SLOT);
          if (!path) return [];
          const { data, info } = await sharp(path)
            .resize(MASK_SAMPLE_SIZE, MASK_SAMPLE_SIZE, { fit: "fill" })
            .raw()
            .toBuffer({ resolveWithObject: true });
          const scale = material.floats[GLOSS_MAP_SCALE_KEY] ?? 1;
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
      const computeMeanFloat = (key: string): number =>
        computeMeanValue(familyMaterials.flatMap(({ floats }) => (floats[key] === undefined ? [] : [floats[key]])));
      // A material whose variant compiles no rim glow draws none, whatever its strength holds
      const rimStrengths = familyMaterials.map(({ floats, keywords }) =>
        keywords.includes(RIM_GLOW_KEYWORD) ? (floats[RIM_STRENGTH_KEY] ?? 0) : 0,
      );
      return [
        family,
        {
          albedo: await fitAlbedo(diffusePaths),
          glowRange: computeMeanFloat("_EmissionRange"),
          rimColor: computeMean(getColors("_RGColor")),
          rimPower: computeMeanFloat("_RGPower"),
          rimStrength: roundFitted(computeMeanValue(rimStrengths) * (GLOW_SCALES[family] ?? 1)),
          smoothness: roundFitted(computeUpperMedian(smoothnesses.flat())),
          specularColor: computeMean(getColors("_SpecColor")),
        },
      ] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<keyof typeof LoginStoneFamilyMaterialRegexMap, FittedStone>;
};
