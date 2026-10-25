import { readSerializedBlobChunk } from "#src/services/genshinAssets/materials/readSerializedBlobChunk";
import { InvalidOperationError, Operation } from "@esposter/shared";

const DXBC_MAGIC = "DXBC";
// A container's magic follows a short prefix of the game's own, so it is searched for within this many leading bytes
const DXBC_SEARCH_BYTES = 32;

export const readContainer = (payload: Buffer): Buffer => {
  if (payload.length === 0) return payload;
  const magicOffset = payload.indexOf(DXBC_MAGIC);
  if (magicOffset === -1 || magicOffset >= DXBC_SEARCH_BYTES)
    throw new InvalidOperationError(Operation.Read, readSerializedBlobChunk.name, "a program holds no DXBC container");
  return payload.subarray(magicOffset);
};
