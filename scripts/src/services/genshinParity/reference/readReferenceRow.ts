import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The manifest's row for one reference id, which a reader needs before it can fetch the reference's images. An id the
// manifest does not hold has no stored image, so it is refused with the command that commits one
export const readReferenceRow = async (referenceId: string): Promise<ParityReferenceManifestRow> => {
  const row = (await readReferenceManifest()).find(({ id }) => id === referenceId);
  if (row === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      "is not in the reference manifest; cut its screenshot and run genshin:parity references pack",
    );
  return row;
};
