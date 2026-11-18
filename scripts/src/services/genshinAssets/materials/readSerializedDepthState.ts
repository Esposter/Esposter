import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedDepthState } from "#src/models/genshinAssets/materials/SerializedDepthState";

import { readSerializedShaderFloat } from "#src/services/genshinAssets/materials/readSerializedShaderFloat";
import { skipFloatValue } from "#src/services/genshinAssets/materials/skipFloatValue";
import { skipFloatValues } from "#src/services/genshinAssets/materials/skipFloatValues";

// The depth values in Unity's order: the clip, the test, the write and the cull, then the polygon offsets and one value
// Past them, which are read past
export const readSerializedDepthState = (cursor: BinaryCursor): SerializedDepthState => {
  skipFloatValue(cursor);
  const zTest = readSerializedShaderFloat(cursor);
  const zWrite = readSerializedShaderFloat(cursor);
  const cull = readSerializedShaderFloat(cursor);
  skipFloatValues(cursor, 3);
  return { cull, zTest, zWrite };
};
