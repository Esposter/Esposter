import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedSubShaderRecord } from "#src/models/genshinAssets/materials/SerializedSubShaderRecord";

import { readSerializedPass } from "#src/services/genshinAssets/materials/readSerializedPass";
import { skipTagMap } from "#src/services/genshinAssets/materials/skipTagMap";

export const readSubShader = (cursor: BinaryCursor): SerializedSubShaderRecord => {
  const passes = cursor.list(() => readSerializedPass(cursor));
  skipTagMap(cursor);
  cursor.int32();
  return { passes };
};
