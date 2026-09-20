import { FNV1_64_OFFSET_BASIS, FNV1_64_PRIME, UINT64_MASK } from "#src/services/voiceMatch/constants";

// FNV-1 — multiply, then xor — which is the variant Wwise hashes its 64-bit media ids with
export const getFnv1Hash64 = (text: string): bigint => {
  let hash = FNV1_64_OFFSET_BASIS;
  for (const byte of Buffer.from(text)) {
    hash = (hash * FNV1_64_PRIME) & UINT64_MASK;
    hash ^= BigInt(byte);
  }

  return hash;
};
