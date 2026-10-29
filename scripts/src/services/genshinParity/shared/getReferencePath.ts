import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { readReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { relative } from "node:path";

// Where a reference's committed image is, which every command that reads a reference is given. A reference the map names
// with no file at its path is refused with the path to add it at, since nothing fetches a reference any more
export const getReferencePath = async (referenceId: string): Promise<string> => {
  const plan = (await readReferenceFiles()).find(({ id }: ReferenceFilePlan) => id === referenceId);
  if (plan === undefined)
    throw new InvalidOperationError(Operation.Read, referenceId, "is a pending reference, so it has no image to read");
  if (!existsSync(plan.path))
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `has no committed image at ${relative(REPOSITORY_ROOT, plan.path)}: add its lossless WebP there, or pack it with genshin:parity references pack`,
    );
  return plan.path;
};
