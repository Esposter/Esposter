import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedShaderState } from "#src/models/genshinAssets/materials/SerializedShaderState";

import { readSerializedBlendState } from "#src/services/genshinAssets/materials/readSerializedBlendState";
import { readSerializedDepthState } from "#src/services/genshinAssets/materials/readSerializedDepthState";
import { skipFloatValues } from "#src/services/genshinAssets/materials/skipFloatValues";
import { skipTagMap } from "#src/services/genshinAssets/materials/skipTagMap";

const RENDER_TARGET_COUNT = 8;
const BLEND_VALUE_COUNT = 7;
const STENCIL_OP_COUNT = 3;
const STENCIL_OP_VALUE_COUNT = 4;
const STENCIL_VALUE_COUNT = 3;
const FOG_VALUE_COUNT = 3;
const FOG_COLOR_CHANNEL_COUNT = 4;

// A pass's render state after its name. The first render target's blend is kept, and the others are read past, as are
// The stencil, fog and fog colour values and the rest of the state
export const readSerializedShaderState = (cursor: BinaryCursor): SerializedShaderState => {
  const blend = readSerializedBlendState(cursor);
  skipFloatValues(cursor, BLEND_VALUE_COUNT * (RENDER_TARGET_COUNT - 1));
  cursor.bool();
  cursor.align();
  const depth = readSerializedDepthState(cursor);
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
