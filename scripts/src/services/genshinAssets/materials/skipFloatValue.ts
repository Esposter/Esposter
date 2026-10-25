import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";

// A state's value is a float with the name of the property that drives it, read past as the state is
export const skipFloatValue = (cursor: BinaryCursor): void => {
  cursor.float32();
  cursor.string();
};
