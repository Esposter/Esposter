import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedPassRecord } from "#src/models/genshinAssets/materials/SerializedPassRecord";

import { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";
import { readSerializedShaderState } from "#src/services/genshinAssets/materials/readSerializedShaderState";
import { readStage } from "#src/services/genshinAssets/materials/readStage";
import { skipTagMap } from "#src/services/genshinAssets/materials/skipTagMap";

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
  skipTagMap(cursor);
  // A pass's trailer is one zero word, or two when the second is zero too. Past the trailer come the subshader's tag
  // Count and LOD, and a subshader with no tags has a zero LOD in the game's shaders, so a nonzero word after a zero tag
  // Count is the next name and the trailer is one word
  cursor.skip(4);
  if (cursor.int32() === 0) {
    const subShaderTagCount = cursor.int32();
    const subShaderLod = cursor.int32();
    cursor.rewind(subShaderTagCount === 0 && subShaderLod !== 0 ? 12 : 8);
  } else cursor.rewind(4);
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
