import { SERIALIZED_POINTER_BYTES } from "#src/services/genshinAssets/shared/constants";

// The shader keywords a material compiles its variant with, read from its serialized bytes as AnimeStudio exports them
// Raw, since its JSON drops them: its name, a length and its characters aligned to four bytes, its shader's pointer, a
// File index and a path ID, then its keywords as one string, separated by spaces. A toggle such as the stone's rim glow
// Is drawn only where its keyword is set, whatever its float holds
export const readMaterialKeywords = (bytes: Buffer): string[] => {
  const nameLength = bytes.readUInt32LE(0);
  const keywordsStart = Math.ceil((4 + nameLength) / 4) * 4 + SERIALIZED_POINTER_BYTES;
  const keywordsLength = bytes.readUInt32LE(keywordsStart);
  return bytes
    .subarray(keywordsStart + 4, keywordsStart + 4 + keywordsLength)
    .toString("latin1")
    .split(" ")
    .filter(Boolean);
};
