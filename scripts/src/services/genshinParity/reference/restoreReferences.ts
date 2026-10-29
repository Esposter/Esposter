import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { REFERENCE_PACK_CONCURRENCY } from "#src/services/genshinParity/reference/constants";
import { listReferenceImages } from "#src/services/genshinParity/reference/listReferenceImages";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";

// Makes every distinct image the manifest names present on this machine through `ensure`, which fetches a missing one.
// Returns how many distinct images there were and their total size, so a restore reports one line
export const restoreReferences = async (
  rows: ParityReferenceManifestRow[],
  ensure: (sha256: string) => Promise<string>,
): Promise<{ bytes: number; count: number }> => {
  const images = [
    ...new Map(rows.flatMap((row) => listReferenceImages(row)).map((image) => [image.sha256, image])).values(),
  ];
  await forEachConcurrently(images, REFERENCE_PACK_CONCURRENCY, async ({ sha256 }) => {
    await ensure(sha256);
  });
  return { bytes: images.reduce((total, { bytes }) => total + bytes, 0), count: images.length };
};
