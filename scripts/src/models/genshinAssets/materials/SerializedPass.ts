import type { SerializedShaderState } from "#src/models/genshinAssets/materials/SerializedShaderState";
import type { SerializedSubProgram } from "#src/models/genshinAssets/materials/SerializedSubProgram";
import type { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";

// One pass of a subshader: its name, its render state, its keyword names keyed by their index, and each stage's
// Variants
export interface SerializedPass {
  keywordIndexNameMap: Map<number, string>;
  name: string;
  state: SerializedShaderState;
  subPrograms: Record<ShaderProgramStage, SerializedSubProgram[]>;
}
