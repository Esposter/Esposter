// A material a scene's parts are drawn with, in the terms of the shader it stands in for: its floats and its colours
// (linear red, green, blue, alpha) by the names that shader reads them under, and each texture slot's texture by name,
// With its tiling
export interface SceneMaterial {
  colors: Record<string, [number, number, number, number]>;
  floats: Record<string, number>;
  name: string;
  textures: Record<string, { name: string; offset: [number, number]; scale: [number, number] }>;
}
