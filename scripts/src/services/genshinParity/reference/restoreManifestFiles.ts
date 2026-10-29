import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { REFERENCE_PACK_CONCURRENCY, USER_RECORDING_SOURCE } from "#src/services/genshinParity/reference/constants";
import { downloadObjectTo } from "#src/services/genshinParity/reference/downloadObjectTo";
import { getObjectBlobName } from "#src/services/genshinParity/reference/getObjectBlobName";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/game/constants";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { settleAll } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

// Streams every user recording into the captures folder and every record into its place in the parity folder, each keeping
// a copy already holding the same hash. A public recording is never uploaded, so its row is left to the public page it
// names. Returns how many were fetched and how many were already held
export const restoreManifestFiles = async (
  manifest: ParityReferenceManifest,
): Promise<{ fetched: number; held: number }> => {
  const files = [
    ...manifest.recordings
      .filter(({ source }) => source === USER_RECORDING_SOURCE)
      .map(({ name, sha256, sourceFormat }) => ({
        destination: join(CAPTURES_DIRECTORY, name),
        extension: sourceFormat,
        sha256,
      })),
    ...manifest.records.map(({ path, sha256, sourceFormat }) => ({
      destination: join(PARITY_DIRECTORY, path),
      extension: sourceFormat,
      sha256,
    })),
  ];
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
