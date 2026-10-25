import type { ParsedObject } from "#src/models/ParsedObject";

import { decodeObject } from "#src/services/decodeObject";
import { getContentAddress } from "#src/services/getContentAddress";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The only decode this store makes, so no read path can hand back plaintext its key was never checked against.
// Cheap, because the hash is already computed on every write, and it turns the one failure this format can
// Suffer — a truncated or mismatched object — into a refused read rather than a plausible-looking document
export const decodeVerifiedObject = async (
  hash: string,
  parsedObject: ParsedObject,
  basePlaintext?: Uint8Array,
): Promise<Uint8Array> => {
  const plaintext = await decodeObject(parsedObject, basePlaintext);
  if (getContentAddress(plaintext) !== hash)
    throw new InvalidOperationError(Operation.Read, hash, "object does not hash to its key");

  return plaintext;
};
