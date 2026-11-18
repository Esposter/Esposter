import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedBlendState } from "#src/models/genshinAssets/materials/SerializedBlendState";
import type { SerializedDepthState } from "#src/models/genshinAssets/materials/SerializedDepthState";
import type { SerializedShaderFloat } from "#src/models/genshinAssets/materials/SerializedShaderFloat";
import type { SerializedShaderState } from "#src/models/genshinAssets/materials/SerializedShaderState";

import { UNNAMED_PROPERTY } from "#src/services/genshinAssets/materials/constants";
import { skipFloatValue } from "#src/services/genshinAssets/materials/skipFloatValue";
import { skipFloatValues } from "#src/services/genshinAssets/materials/skipFloatValues";
import { skipTagMap } from "#src/services/genshinAssets/materials/skipTagMap";

const RENDER_TARGET_COUNT = 8;
const BLEND_VALUE_COUNT = 7;
const STENCIL_OP_COUNT = 3;
const STENCIL_OP_VALUE_COUNT = 4;
const STENCIL_VALUE_COUNT = 3;
const FOG_VALUE_COUNT = 3;
const FOG_COLOR_CHANNEL_COUNT = 4;

// A value is a float, then the name of the property that drives it, which Unity writes as UNNAMED_PROPERTY where none does
const readFloatValue = (cursor: BinaryCursor): SerializedShaderFloat => {
  const value = cursor.float32();
  const name = cursor.string();
  return { name: name === UNNAMED_PROPERTY ? "" : name, value };
};

// A render target's blend in Unity's order: the colour factors, the alpha factors and operation, then the colour mask.
// The alpha factors and the alpha operation are read past
const readBlendState = (cursor: BinaryCursor): SerializedBlendState => {
  const source = readFloatValue(cursor);
  const destination = readFloatValue(cursor);
  skipFloatValues(cursor, 2);
  const operation = readFloatValue(cursor);
  skipFloatValue(cursor);
  const colorMask = readFloatValue(cursor);
  return { colorMask, destination, operation, source };
};

// The depth values in Unity's order: the clip, the test, the write and the cull, then the polygon offsets and one value
// Past them, which are read past
const readDepthState = (cursor: BinaryCursor): SerializedDepthState => {
  skipFloatValue(cursor);
  const zTest = readFloatValue(cursor);
  const zWrite = readFloatValue(cursor);
  const cull = readFloatValue(cursor);
  skipFloatValues(cursor, 3);
  return { cull, zTest, zWrite };
};

// A pass's render state after its name. The first render target's blend is kept, and the others are read past, as are
// The stencil, fog and fog colour values and the rest of the state
export const readSerializedShaderState = (cursor: BinaryCursor): SerializedShaderState => {
  const blend = readBlendState(cursor);
  skipFloatValues(cursor, BLEND_VALUE_COUNT * (RENDER_TARGET_COUNT - 1));
  cursor.bool();
  cursor.align();
  const depth = readDepthState(cursor);
  skipFloatValues(cursor, STENCIL_OP_COUNT * STENCIL_OP_VALUE_COUNT);
  skipFloatValues(cursor, STENCIL_VALUE_COUNT);
  skipFloatValues(cursor, FOG_VALUE_COUNT);
  skipFloatValues(cursor, FOG_COLOR_CHANNEL_COUNT);
  cursor.string();
  cursor.int32();
  cursor.int32();
  skipTagMap(cursor);
  cursor.int32();
  cursor.bool();
  cursor.align();
  return { blend, depth };
};
