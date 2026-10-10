import type { SampleLibrary } from "#src/models/genshinAssets/shared/SampleLibrary";

import { SampleLibraryCommitMap } from "#src/services/genshinAssets/music/SampleLibraryCommitMap";
import { SampleLibraryOwnerMap } from "#src/services/genshinAssets/music/SampleLibraryOwnerMap";
import { SAMPLE_DOWNLOAD_TIMEOUT_MS, SAMPLES_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { publishFile } from "#src/services/shared/publishFile";
import { existsSync } from "node:fs";
import { join } from "node:path";

// A file of a sample library, a mapping or a sample, fetched at the library's pinned commit into the cache the first
// Time it is read and found there after that. It is published through a partial file of its own, so a fetch cut short
// Never leaves a file a later read takes for whole
export const fetchSampleFile = async (library: SampleLibrary, path: string): Promise<string> => {
  const localPath = join(SAMPLES_DIRECTORY, library, path);
  if (existsSync(localPath)) return localPath;
  const segments = path.split("/").map((segment) => encodeURIComponent(segment));
  const response = await fetchOk(
    `https://raw.githubusercontent.com/${SampleLibraryOwnerMap[library]}/${library}/${SampleLibraryCommitMap[library]}/${segments.join("/")}`,
    { timeoutMs: SAMPLE_DOWNLOAD_TIMEOUT_MS },
  );
  await publishFile(localPath, new Uint8Array(await response.arrayBuffer()));
  return localPath;
};
