import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { REFERENCE_PACK_CONCURRENCY } from "#src/services/genshinParity/reference/constants";
import { downloadObjectTo } from "#src/services/genshinParity/reference/downloadObjectTo";
import { getObjectBlobName } from "#src/services/genshinParity/reference/getObjectBlobName";
import { getRecordDestination } from "#src/services/genshinParity/reference/getRecordDestination";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { settleAll } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// Streams every record into its place in the parity folder, each keeping a copy already holding the same hash. No recording
// is fetched: a user's own stays on the machine that recorded it, and a public one is fetched again from its page by the
// Clip tool. Returns how many were fetched and how many were already held
export const restoreManifestFiles = async (
  manifest: ParityReferenceManifest,
): Promise<{ fetched: number; held: number }> => {
  const files = manifest.records.map(({ path, sha256, sourceFormat }) => ({
    destination: getRecordDestination(path),
    extension: sourceFormat,
    sha256,
  }));
  const fetched = await settleAll(
    files.map(({ destination, extension, sha256 }) => async () => {
      if (existsSync(destination) && (await sha256File(destination)) === sha256) return false;
      await mkdir(dirname(destination), { recursive: true });
      await downloadObjectTo(getObjectBlobName(sha256, extension), destination, sha256);
      return true;
    }),
    REFERENCE_PACK_CONCURRENCY,
  );
  const fetchedCount = fetched.filter(Boolean).length;
  return { fetched: fetchedCount, held: fetched.length - fetchedCount };
};
