// What a material holds, in the shape a scene reads: the path ID of the shader it draws with, each filled texture slot
// With its texture's path ID and its tiling, and every float and colour (a colour as linear red, green, blue, alpha)
export interface MaterialValues {
  colors: Record<string, [number, number, number, number]>;
  floats: Record<string, number>;
  name: string;
  shaderPathId: string;
  textures: Record<string, { offset: [number, number]; pathId: string; scale: [number, number] }>;
}
