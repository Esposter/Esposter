import type { ExportedMaterial } from "#src/models/genshinAssets/shared/ExportedMaterial";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

// A material's filled texture slots, each with its texture's pointer and its tiling, its empty slots dropped
export const toMaterialTextures = (
  texEnvs: ExportedMaterial["m_SavedProperties"]["m_TexEnvs"],
): MaterialValues["textures"] =>
  Object.fromEntries(
    Object.entries(texEnvs).flatMap(
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
  );
