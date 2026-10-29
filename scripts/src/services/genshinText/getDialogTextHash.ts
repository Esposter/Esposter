import { DIALOG_TEXT_HASH_VARIANT_MASK } from "#src/services/genshinText/constants";

// A dialog row's text hash as the English text map files its line: the hash itself where the map holds it, else the hash
// With its variant bit flipped where the map holds that, else the hash as it stands
export const getDialogTextHash = (hash: number, englishTextMap: ReadonlyMap<string, string>): number => {
  if (englishTextMap.has(String(hash))) return hash;

  const variantHash = (hash ^ DIALOG_TEXT_HASH_VARIANT_MASK) >>> 0;
  return englishTextMap.has(String(variantHash)) ? variantHash : hash;
};
