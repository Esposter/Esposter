import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";

export const skipWordList = (cursor: BinaryCursor, wordBytes: number): void => {
  cursor.list(() => {
    cursor.skip(wordBytes);
  });
};
