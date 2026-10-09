// A material a scene's parts are drawn with, in the terms of the shader it stands in for: its floats and its colours
// (linear red, green, blue, alpha) by the names that shader reads them under, and each texture slot's texture by name,
// With its tiling, and the keywords that shader compiles its variant with
export interface SceneMaterial {
  colors: Record<string, [number, number, number, number]>;
  floats: Record<string, number>;
  keywords: string[];
  name: string;
  // The asset name of the shader it draws with, which says which of its values and keywords the variant reads
  shader?: string;
  textures: Record<string, { name: string; offset: [number, number]; scale: [number, number] }>;
}
