import type { HostedAssetLock } from "hosted-assets";

import { getDifferingLockNames } from "#src/services/gameData/getDifferingLockNames";
import { toLockHashes } from "#src/services/gameData/toLockHashes";

// The keys whose hash differs between the generated lock and the committed one, or that only one of them holds, each
// Named by its kind. Sorted, so a failure lists them in one order
export const getGameDataLockDifferences = (generated: HostedAssetLock, committed: HostedAssetLock): string[] =>
  [
    ...getDifferingLockNames("object", toLockHashes(generated.objects), toLockHashes(committed.objects)),
    ...getDifferingLockNames("index", toLockHashes(generated.indexes), toLockHashes(committed.indexes)),
  ].toSorted();
