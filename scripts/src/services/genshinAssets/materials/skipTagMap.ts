import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";

export const skipTagMap = (cursor: BinaryCursor): void => {
  cursor.list(() => {
    cursor.string();
    cursor.string();
  });
};
