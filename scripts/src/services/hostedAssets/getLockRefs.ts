import type { HostedAssetLock, HostedAssetName } from "hosted-assets";

import { hostedAssetIndexSchema } from "#src/models/hostedAssets/HostedAssetIndex";
import { toHostedAssetNames } from "#src/services/hostedAssets/toHostedAssetNames";
import { toUniqueHostedAssetNames } from "#src/services/hostedAssets/toUniqueHostedAssetNames";
import { settleAll } from "@esposter/shared";

// Every object the locks reach: each index they name, then each object they name and each entry an index names. An
// Index's entries are stored under that index's own scope and extension. `readIndex` reads an index's body however its
// Store serves it, so each caller brings its own, and an index named by two locks is read once. `concurrency` bounds
// The Index reads in flight, and a caller that passes none reads them all at once
export const getLockRefs = async (
  locks: HostedAssetLock[],
  readIndex: (index: HostedAssetName) => Promise<unknown>,
  concurrency?: number,
): Promise<{ indexes: HostedAssetName[]; objects: HostedAssetName[] }> => {
  const indexes = toUniqueHostedAssetNames(locks.flatMap((lock) => toHostedAssetNames(lock.indexes)));
  const entries = (
    await settleAll(
      indexes.map(
        (index) => async () =>
          Object.values(hostedAssetIndexSchema.parse(await readIndex(index))).map((sha256) => ({
            extension: index.extension,
            scope: index.scope,
            sha256,
          })),
      ),
      concurrency,
    )
  ).flat();
  return {
    indexes,
    objects: toUniqueHostedAssetNames([...locks.flatMap((lock) => toHostedAssetNames(lock.objects)), ...entries]),
  };
};
