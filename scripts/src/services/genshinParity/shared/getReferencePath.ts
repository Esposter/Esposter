import { readCachedReference } from "#src/services/genshinParity/reference/readCachedReference";
import { readReferenceRow } from "#src/services/genshinParity/reference/readReferenceRow";

// Where a reference's packed image is on this machine, fetched into the download cache when it does not hold it yet
export const getReferencePath = async (referenceId: string): Promise<string> =>
  readCachedReference((await readReferenceRow(referenceId)).sha256);
