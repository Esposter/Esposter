import type { SerializedSubProgramRecord } from "#src/models/genshinAssets/materials/SerializedSubProgramRecord";
import type { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";

// A pass as it serializes, its variants still unresolved against the blob that follows the shader's subshaders
export interface SerializedPassRecord {
  keywordNames: Map<number, string>;
  name: string;
  subPrograms: Record<ShaderProgramStage, SerializedSubProgramRecord[]>;
}
