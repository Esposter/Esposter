import { readReferenceRow } from "#src/services/genshinParity/reference/readReferenceRow";
import { getReferencePlateFilePath } from "#src/services/genshinParity/shared/getReferencePlateFilePath";
import { requireCommittedFile } from "#src/services/genshinParity/shared/requireCommittedFile";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Where a reference's committed plate is. A reference whose manifest row holds no plate has none to read
export const getReferencePlatePath = async (referenceId: string): Promise<string> => {
  const { plate } = await readReferenceRow(referenceId);
  if (plate === undefined)
    throw new InvalidOperationError(Operation.Read, referenceId, "has no plate in the reference manifest");
  return requireCommittedFile(
    referenceId,
    getReferencePlateFilePath(referenceId),
    "plate",
    "add its lossless WebP there",
  );
};
