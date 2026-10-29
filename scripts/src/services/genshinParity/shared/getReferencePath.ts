import { getPlannedReferencePath } from "#src/services/genshinParity/shared/getPlannedReferencePath";
import { requireCommittedFile } from "#src/services/genshinParity/shared/requireCommittedFile";

// Where a reference's committed image is, which every command that reads one a single id at a time is given. A missing
// file is refused with the path to add it at; a command over every reference reports it instead, through the planned path
export const getReferencePath = async (referenceId: string): Promise<string> =>
  requireCommittedFile(
    referenceId,
    await getPlannedReferencePath(referenceId),
    "image",
    "add its lossless WebP there, or pack it with genshin:parity references pack",
  );
