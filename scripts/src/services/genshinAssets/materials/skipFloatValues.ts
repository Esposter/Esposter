import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";

import { skipFloatValue } from "#src/services/genshinAssets/materials/skipFloatValue";

export const skipFloatValues = (cursor: BinaryCursor, count: number): void => {
  for (let index = 0; index < count; index++) skipFloatValue(cursor);
};
