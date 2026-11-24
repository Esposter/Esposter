import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetPath } from "hosted-assets";

// The decoded length each lock entry records, by the path its object is stored under.
// An entry an index names has no length in the lock.
// It is absent from the map, so its hash is the only check on it.
export const toLockedBytesMap = (lock: HostedAssetLock): Map<string, number> =>
  new Map(
    [...Object.values(lock.indexes), ...Object.values(lock.objects)].map((object) => [
      getHostedAssetPath(object),
      object.bytes,
    ]),
  );
