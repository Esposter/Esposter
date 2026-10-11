import { PRODUCER_STAMP_NAME } from "#src/services/producerStamp/constants";
import { runGit } from "#src/services/shared/runGit";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join } from "node:path";

// Stamps an output written now with the commit HEAD names, and whether its producer's paths hold changes no commit
// Describes yet
export const writeProducerStamp = async (directory: string, producerPaths: string[]): Promise<void> => {
  const commit = runGit(["rev-parse", "HEAD"]).trim();
  const status = runGit(["status", "--porcelain", "--", ...producerPaths]).trim();
  writeJsonFile(join(directory, PRODUCER_STAMP_NAME), { commit, isDirty: Boolean(status), producerPaths });
};
