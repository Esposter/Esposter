import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";
import type { GenshinLockKeys } from "#src/models/genshinProgress/GenshinLockKeys";

import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";

// A dataset's lock is current when every key the world's key list names has an entry in the lock of its own kind: a
// Dataset read whole in the objects, an index read by id in the indexes. Each missing key is named
export const checkDatasetLockCurrent = (
  folder: string,
  required: GenshinLockKeys,
  lock: GenshinLockKeys,
): GenshinExitCheck => {
  const notes = [
    ...required.objects.filter((key) => !lock.objects.includes(key)),
    ...required.indexes.filter((key) => !lock.indexes.includes(key)),
  ].map((key) => `${key} has no entry in the lock`);
  return {
    name: `dataset ${folder}: lock current`,
    notes,
    state: notes.length > 0 ? GenshinExitCheckState.NotMet : GenshinExitCheckState.Met,
  };
};
