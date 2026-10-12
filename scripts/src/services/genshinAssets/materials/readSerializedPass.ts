import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedPassRecord } from "#src/models/genshinAssets/materials/SerializedPassRecord";

import { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";
import { readSerializedShaderState } from "#src/services/genshinAssets/materials/readSerializedShaderState";
import { readSerializedSubProgram } from "#src/services/genshinAssets/materials/readSerializedSubProgram";

const PASS_TRAILER_WORDS = 2;
// A pass's stage lists in the order Unity writes them, vertex to domain and then ray tracing, which is read past
const readStage = (cursor: BinaryCursor) => cursor.list(() => readSerializedSubProgram(cursor));
// Reads a pass: its keyword names keyed by index, its state, whose name is the pass's own, its stage programs, then
// Its use name, name and texture name, which are read past, and its tags
export const readSerializedPass = (cursor: BinaryCursor): SerializedPassRecord => {
  const keywordNames = new Map(
    cursor.list(() => {
      const name = cursor.string();
      const index = cursor.int32();
      return [index, name] as const;
    }),
  );
  cursor.int32();
  const name = readSerializedShaderState(cursor);
  cursor.uint32();
  const vertex = readStage(cursor);
  const fragment = readStage(cursor);
  const geometry = readStage(cursor);
  const hull = readStage(cursor);
  const domain = readStage(cursor);
  readStage(cursor);
  cursor.bool();
  cursor.bool();
  cursor.align();
  cursor.string();
  cursor.string();
  cursor.string();
  cursor.list(() => {
    cursor.string();
    cursor.string();
  });
  cursor.skip(PASS_TRAILER_WORDS * 4);
  return {
    keywordNames,
    name,
    subPrograms: {
      [ShaderProgramStage.Domain]: domain,
      [ShaderProgramStage.Fragment]: fragment,
      [ShaderProgramStage.Geometry]: geometry,
      [ShaderProgramStage.Hull]: hull,
      [ShaderProgramStage.Vertex]: vertex,
    },
  };
};
