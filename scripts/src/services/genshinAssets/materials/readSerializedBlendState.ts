import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedBlendState } from "#src/models/genshinAssets/materials/SerializedBlendState";

import { readSerializedShaderFloat } from "#src/services/genshinAssets/materials/readSerializedShaderFloat";
import { skipFloatValue } from "#src/services/genshinAssets/materials/skipFloatValue";
import { skipFloatValues } from "#src/services/genshinAssets/materials/skipFloatValues";

// A render target's blend in Unity's order: the colour factors, the alpha factors and operation, then the colour mask.
// The alpha factors and the alpha operation are read past
export const readSerializedBlendState = (cursor: BinaryCursor): SerializedBlendState => {
  const source = readSerializedShaderFloat(cursor);
  const destination = readSerializedShaderFloat(cursor);
  skipFloatValues(cursor, 2);
  const operation = readSerializedShaderFloat(cursor);
  skipFloatValue(cursor);
  const colorMask = readSerializedShaderFloat(cursor);
  return { colorMask, destination, operation, source };
};
