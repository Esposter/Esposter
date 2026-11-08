import { PROVENANCE_NAME, PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// Every stamp under a directory: the folder stamps `provenance.json` and the file sidecars beside their files. A folder
// That does not exist holds none, and a symbolic link is not followed
export const listStampPaths = async (directory: string): Promise<string[]> => {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedStampPaths = await Promise.all(
    entries.filter((entry) => entry.isDirectory()).map((entry) => listStampPaths(join(directory, entry.name))),
  );
  const stampPaths = entries
    .filter(
      (entry) =>
        !entry.isDirectory() && (entry.name === PROVENANCE_NAME || entry.name.endsWith(PROVENANCE_SIDECAR_SUFFIX)),
    )
    .map((entry) => join(directory, entry.name));
  return [...stampPaths, ...nestedStampPaths.flat()];
};
