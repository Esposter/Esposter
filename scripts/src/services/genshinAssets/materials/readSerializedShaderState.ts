import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";

const RENDER_TARGET_COUNT = 8;
const BLEND_VALUE_COUNT = 7;
const STENCIL_OP_COUNT = 3;
const STENCIL_OP_VALUE_COUNT = 4;
const FLOAT_VALUE_COUNT = 7;
const STENCIL_VALUE_COUNT = 3;
const FOG_VALUE_COUNT = 3;
const FOG_COLOR_CHANNEL_COUNT = 4;
// A state's value is a float with the name of the property that drives it, read past as the state is
const skipFloatValue = (cursor: BinaryCursor): void => {
  cursor.float32();
  cursor.string();
};
const skipFloatValues = (cursor: BinaryCursor, count: number): void => {
  for (let index = 0; index < count; index++) skipFloatValue(cursor);
};
const skipTagMap = (cursor: BinaryCursor): void => {
  cursor.list(() => {
    cursor.string();
    cursor.string();
  });
};
// A pass's render state, its name first. Its blend, depth, stencil and fog values are each a float with a driving name,
// Which are read past in the order Unity writes them, and the name is the pass's own identity
export const readSerializedShaderState = (cursor: BinaryCursor): string => {
  const name = cursor.string();
  skipFloatValues(cursor, RENDER_TARGET_COUNT * BLEND_VALUE_COUNT);
  cursor.bool();
  cursor.align();
  skipFloatValues(cursor, FLOAT_VALUE_COUNT);
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
  return name;
};
