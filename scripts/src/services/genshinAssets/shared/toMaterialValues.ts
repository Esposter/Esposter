import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { ShaderColorNames } from "#src/models/genshinAssets/shared/ShaderColorNames";

import { toMaterialTextures } from "#src/services/genshinAssets/shared/toMaterialTextures";
import { toLinear } from "#src/services/shared/toLinear";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { materialFloatSchema } from "genshin-world/sceneExport";

// A material's export read as its values: its empty texture slots dropped, and its saved colours as tuples, each read
// As its shader declares it. Unity saves a colour as the sRGB its inspector shows and, in a project lit in linear
// Space, decodes it before a program reads it, so a colour is decoded to linear light: read as saved, the stone's rim
// Glow stood several times too red on the night's moonlit walkway. A vector, saved in the same table, is never decoded:
// Decoded, the avatar's outline width knots read a tenth of the game's. A name the shader does not declare, which none
// Of its programs reads, is still read as a colour, as the stone's fitted `_SpecColor` was, and one declared each way
// Cannot be read. Its keywords are read apart, from its raw bytes (`readMaterialKeywords`), since the export
// Drops them. Its floats are read as numbers, an unbounded one from the token the export saves it as
// (`materialFloatSchema`)
export const toMaterialValues = (
  { m_Name, m_SavedProperties, m_Shader }: ExportedMaterial,
  keywords: readonly string[],
  { colorNames, vectorNames }: ShaderColorNames,
): MaterialValues => ({
  colors: Object.fromEntries(
    Object.entries(m_SavedProperties.m_Colors ?? {}).map(
      ([name, { a, b, g, r }]): [string, [number, number, number, number]] => {
        if (!vectorNames.has(name)) return [name, [toLinear(r), toLinear(g), toLinear(b), a]];
        if (colorNames.has(name))
          throw new InvalidOperationError(Operation.Read, name, `is both a colour and a vector of ${m_Name}'s shader`);
        return [name, [r, g, b, a]];
      },
    ),
  ),
  floats: Object.fromEntries(
    Object.entries(m_SavedProperties.m_Floats ?? {}).map(([name, value]): [string, number] => [
      name,
      materialFloatSchema.parse(value),
    ]),
  ),
  keywords: [...keywords],
  name: m_Name,
  shaderPathId: m_Shader.m_PathID,
  textures: toMaterialTextures(m_SavedProperties.m_TexEnvs),
});
