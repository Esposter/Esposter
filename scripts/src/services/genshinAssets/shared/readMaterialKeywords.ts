import { SERIALIZED_POINTER_BYTES } from "#src/services/genshinAssets/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The shader keywords a material compiles its variant with, read from its serialized bytes as AnimeStudio exports them
// Raw, since its JSON drops them: its name, a length and its characters aligned to four bytes, its shader's pointer, a
// File index and a path ID, then its keywords as one string, separated by spaces. A toggle such as the stone's rim glow
// Is drawn only where its keyword is set, whatever its float holds. Bytes ending before their keywords do are truncated,
// Never read as the keywords they still hold
export const readMaterialKeywords = (bytes: Buffer): string[] => {
  const nameLength = bytes.readUInt32LE(0);
  const keywordsStart = Math.ceil((4 + nameLength) / 4) * 4 + SERIALIZED_POINTER_BYTES;
  const keywordsLength = bytes.readUInt32LE(keywordsStart);
  const keywordsEnd = keywordsStart + 4 + keywordsLength;
  if (keywordsEnd > bytes.length)
    throw new InvalidOperationError(
      Operation.Read,
      readMaterialKeywords.name,
      `keywords end at byte ${keywordsEnd} of ${bytes.length}`,
    );
  return bytes
    .subarray(keywordsStart + 4, keywordsEnd)
    .toString("latin1")
    .split(" ")
    .filter(Boolean);
};
