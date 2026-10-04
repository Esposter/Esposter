import type { SampleLibrary } from "#src/models/genshinAssets/SampleLibrary";

import { SAMPLE_DOWNLOAD_TIMEOUT_MS, SAMPLES_DIRECTORY } from "#src/services/genshinAssets/constants";
import { SampleLibraryCommitMap } from "#src/services/genshinAssets/SampleLibraryCommitMap";
import { fetchOk } from "#src/services/shared/fetchOk";
import { existsSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// A file of a sample library, a mapping or a sample, fetched at the library's pinned commit into the cache the first
// Time it is read and found there after that. It is written beside its place and moved in, so a fetch cut short never
// Leaves a file a later read takes for whole
export const fetchSampleFile = async (library: SampleLibrary, path: string): Promise<string> => {
  const localPath = join(SAMPLES_DIRECTORY, library, path);
  if (existsSync(localPath)) return localPath;
  const segments = path.split("/").map((segment) => encodeURIComponent(segment));
  const response = await fetchOk(
    `https://raw.githubusercontent.com/sgossner/${library}/${SampleLibraryCommitMap[library]}/${segments.join("/")}`,
    SAMPLE_DOWNLOAD_TIMEOUT_MS,
  );
  const bytes = new Uint8Array(await response.arrayBuffer());
  await mkdir(dirname(localPath), { recursive: true });
  const partialPath = `${localPath}.part`;
  await writeFile(partialPath, bytes);
  await rename(partialPath, localPath);
  return localPath;
};
