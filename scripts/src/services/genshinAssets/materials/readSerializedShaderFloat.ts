import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedShaderFloat } from "#src/models/genshinAssets/materials/SerializedShaderFloat";

import { UNNAMED_PROPERTY } from "#src/services/genshinAssets/materials/constants";

// A value is a float, then the name of the property that drives it, which Unity writes as UNNAMED_PROPERTY where none does
export const readSerializedShaderFloat = (cursor: BinaryCursor): SerializedShaderFloat => {
  const value = cursor.float32();
  const name = cursor.string();
  return { name: name === UNNAMED_PROPERTY ? "" : name, value };
};
