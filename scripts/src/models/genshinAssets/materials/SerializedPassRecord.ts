import type { SerializedShaderState } from "#src/models/genshinAssets/materials/SerializedShaderState";
import type { SerializedSubProgramRecord } from "#src/models/genshinAssets/materials/SerializedSubProgramRecord";
import type { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";

// A pass as it serializes, its variants still unresolved against the blob that follows the shader's subshaders
export interface SerializedPassRecord {
  keywordIndexNameMap: Map<number, string>;
  name: string;
  state: SerializedShaderState;
  subPrograms: Record<ShaderProgramStage, SerializedSubProgramRecord[]>;
}
