import type { SerializedSubProgram } from "#src/models/genshinAssets/materials/SerializedSubProgram";
import type { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";

// One pass of a subshader: its name, its keyword names keyed by their index, and each stage's variants
export interface SerializedPass {
  keywordNames: Map<number, string>;
  name: string;
  subPrograms: Record<ShaderProgramStage, SerializedSubProgram[]>;
}
