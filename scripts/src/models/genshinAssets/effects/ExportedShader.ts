import type { SerializedShader } from "#src/models/genshinAssets/materials/SerializedShader";

// A shader a component's `shaders` step exported, by its block and folder, with its serialized form read where the raw
// Export reads, and no shader where it does not
export interface ExportedShader {
  block: string;
  folder: string;
  shader: SerializedShader | undefined;
}
