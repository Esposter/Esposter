import { getReferencePlateFilePath } from "#src/services/genshinParity/shared/getReferencePlateFilePath";
import { readReferenceRow } from "#src/services/genshinParity/reference/readReferenceRow";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { relative } from "node:path";

// Where a reference's committed plate is. A reference whose manifest row holds no plate has none to read
export const getReferencePlatePath = async (referenceId: string): Promise<string> => {
  const { plate } = await readReferenceRow(referenceId);
  if (plate === undefined)
    throw new InvalidOperationError(Operation.Read, referenceId, "has no plate in the reference manifest");
  const path = getReferencePlateFilePath(referenceId);
  if (!existsSync(path))
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `has no committed plate at ${relative(REPOSITORY_ROOT, path)}: add its lossless WebP there`,
    );
  return path;
};
