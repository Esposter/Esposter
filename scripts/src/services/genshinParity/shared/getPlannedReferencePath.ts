import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { readReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Where a reference's committed image is planned to sit, whether or not a file is there yet.
// A command that reports a missing image reads this path and checks it itself
export const getPlannedReferencePath = async (referenceId: string): Promise<string> => {
  const plan = (await readReferenceFiles()).find(({ id }: ReferenceFilePlan) => id === referenceId);
  if (plan === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      ParityReferenceMap[referenceId] === undefined
        ? "is not a reference in ParityReferenceMap"
        : "is a pending reference, so it has no image to read",
    );
  return plan.path;
};
