import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";

// Skips a parameter list whose records are read past for the keyword lookup: each record is its fixed words, then an
// Aligned pair of small fields where a parameter carries them
export const skipAlignedParameters = (cursor: BinaryCursor, wordBytes: number, flagBytes: number): void => {
  cursor.list(() => {
    cursor.skip(wordBytes + flagBytes);
    cursor.align();
  });
};
