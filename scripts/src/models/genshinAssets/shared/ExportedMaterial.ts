import type { AssetReference } from "#src/models/genshinAssets/shared/AssetReference";
import type { materialFloatSchema } from "genshin-world/sceneExport";
import type { z } from "zod";

// A material as AnimeStudio exports it: the shader it draws with and its saved properties, each texture slot a
// Reference to a texture by path ID (null when the slot is empty), with its tiling, and each float and colour by name.
// A float unbounded or undefined is saved as its token, `"Infinity"`, `"-Infinity"` or `"NaN"`
export interface ExportedMaterial {
  m_Name: string;
  m_SavedProperties: {
    m_Colors: null | Record<string, { a: number; b: number; g: number; r: number }>;
    m_Floats: null | Record<string, z.input<typeof materialFloatSchema>>;
    m_TexEnvs: Record<
      string,
      { m_Offset: { X: number; Y: number }; m_Scale: { X: number; Y: number }; m_Texture: AssetReference }
    >;
  };
  m_Shader: AssetReference;
}
