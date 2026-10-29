import { readCachedReference } from "#src/services/genshinParity/reference/readCachedReference";
import { readReferenceRow } from "#src/services/genshinParity/reference/readReferenceRow";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Where a reference's plate screenshot is on this machine, fetched into the download cache when it does not hold it yet
export const getReferencePlatePath = async (referenceId: string): Promise<string> => {
  const { plate } = await readReferenceRow(referenceId);
  if (plate === undefined)
    throw new InvalidOperationError(Operation.Read, referenceId, "has no plate in the reference manifest");
  return readCachedReference(plate.sha256);
};
