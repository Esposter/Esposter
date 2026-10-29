import { TEXT_MAP_KEY_VARIANT_MASK } from "#src/services/genshinText/constants";

const HASH_REGEX = /^\d+$/u;
// The other key a text map may hold a hash's text under, the hash with its variant bit flipped. An id that is no hash
// Has none
export const getTextMapKeyVariant = (hash: string): string | undefined =>
  HASH_REGEX.test(hash) ? String((Number(hash) ^ TEXT_MAP_KEY_VARIANT_MASK) >>> 0) : undefined;
