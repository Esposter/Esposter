import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";

import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { getFixtureReferenceFilePath } from "#src/services/genshinParity/shared/getFixtureReferenceFilePath";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The committed file beside each fixture variant's snapshot, by its path, to the ids whose manifest rows hold its bytes.
// The file's bytes are hashed and matched against the rows, since a manifest row names no path.
// A file no row holds is left out, as an uncommitted file is the committed references test's to report.
export const readCommittedBeside = async (
  componentsDirectory: string,
  fixtureRows: FixtureScreenRow[],
): Promise<Map<string, string[]>> => {
  const manifestRows = await readReferenceManifest();
  const committed = await Promise.all(
    fixtureRows.map(async ({ directory, variant }) => {
      const path = getFixtureReferenceFilePath(join(componentsDirectory, directory), variant);
      if (!existsSync(path)) return undefined;
      const sha256 = await sha256File(path);
      const ids = manifestRows.filter((row) => row.sha256 === sha256).map(({ id }) => id);
      return ids.length > 0 ? ([path, ids] as const) : undefined;
    }),
  );
  return new Map(committed.filter((entry) => entry !== undefined));
};
