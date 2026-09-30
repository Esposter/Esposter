// A material as AnimeStudio exports it: the shader it draws with and its saved properties, each texture slot a
// Reference to a texture by path ID (null when the slot is empty), with its tiling, and each float and colour by name
interface AssetReference {
  IsNull: boolean;
  m_FileID: number;
  m_PathID: string;
}
export interface ExportedMaterial {
  m_Name: string;
  m_SavedProperties: {
    m_Colors: Record<string, { a: number; b: number; g: number; r: number }> | null;
    m_Floats: Record<string, number> | null;
    m_TexEnvs: Record<
      string,
      { m_Offset: { X: number; Y: number }; m_Scale: { X: number; Y: number }; m_Texture: AssetReference }
    >;
  };
  m_Shader: AssetReference;
}
