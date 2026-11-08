import { PROVENANCE_NAME, PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// Every stamp under a directory: the folder stamps `provenance.json` and the file sidecars beside their files. A folder
// That does not exist holds none, and a symbolic link is not followed
export const listStampPaths = async (directory: string): Promise<string[]> => {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return listStampPaths(path);
      return entry.name === PROVENANCE_NAME || entry.name.endsWith(PROVENANCE_SIDECAR_SUFFIX) ? [path] : [];
    }),
  );
  return paths.flat();
};
