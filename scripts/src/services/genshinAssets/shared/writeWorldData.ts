import { GENSHIN_ASSETS_PRODUCER_PATHS, WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join } from "node:path";

// One fitted data file of the world package's, as formatted JSON with its sidecar stamp beside it, returning its path. A
// Dry run writes nothing and returns the path it would have written. A record's command names the record, since more than
// One fit can write the same record
export const writeWorldData = async (
  relativePath: string,
  data: unknown,
  { isDryRun = false }: { isDryRun?: boolean } = {},
): Promise<string> => {
  const path = join(WORLD_DATA_DIRECTORY, relativePath);
  if (!isDryRun)
    await writeStampedFiles(
      [path],
      { command: `record ${relativePath}`, producerPaths: GENSHIN_ASSETS_PRODUCER_PATHS },
      () => {
        writeJsonFile(path, data);
      },
    );
  return path;
};
