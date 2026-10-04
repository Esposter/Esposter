import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

// A material's export read as its values: its empty texture slots dropped, and its colours as tuples
export const toMaterialValues = ({ m_Name, m_SavedProperties, m_Shader }: ExportedMaterial): MaterialValues => ({
  colors: Object.fromEntries(
    Object.entries(m_SavedProperties.m_Colors ?? {}).map(
      ([name, { a, b, g, r }]): [string, [number, number, number, number]] => [name, [r, g, b, a]],
    ),
  ),
  floats: { ...m_SavedProperties.m_Floats },
  name: m_Name,
  shaderPathId: m_Shader.m_PathID,
  textures: Object.fromEntries(
    Object.entries(m_SavedProperties.m_TexEnvs).flatMap(
      ([slot, { m_Offset, m_Scale, m_Texture }]): [string, MaterialValues["textures"][string]][] =>
        m_Texture.IsNull
          ? []
          : [
              [
                slot,
                {
                  fileIndex: m_Texture.m_FileID,
                  offset: [m_Offset.X, m_Offset.Y],
                  pathId: m_Texture.m_PathID,
                  scale: [m_Scale.X, m_Scale.Y],
                },
              ],
            ],
    ),
  ),
});
