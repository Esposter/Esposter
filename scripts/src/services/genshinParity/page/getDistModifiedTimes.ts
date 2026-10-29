import { PARITY_PAGE_PACKAGES } from "#src/services/genshinParity/page/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

// The modification time of every file under each parity page package's `dist`, in epoch milliseconds, which a build
// Rewrites. A package with no build on disk contributes none
export const getDistModifiedTimes = async (): Promise<number[]> => {
  const times = await Promise.all(
    PARITY_PAGE_PACKAGES.map(async (packageName) => {
      const distDirectory = join(REPOSITORY_ROOT, "packages", packageName, "dist");
      if (!existsSync(distDirectory)) return [];
      const files = await readdir(distDirectory, { recursive: true });
      return Promise.all(files.map(async (file) => (await stat(join(distDirectory, file))).mtimeMs));
    }),
  );
  return times.flat();
};
