import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimQueuedHit } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedHit";

import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/findQueuedAttack";

// The hits a file's queue calls fire with an attack of the given tags, in the order they are called, each at its damage
// Delay as gcsim writes it. A call whose attack resolves to no literal, or whose delay has no value, gives none
export const getGcsimQueuedHits = (
  { attacks, queuedAttacks }: GcsimCharacter,
  attackTags: readonly string[],
  file: string,
): GcsimQueuedHit[] =>
  queuedAttacks.flatMap((queuedAttack) => {
    const attack = findQueuedAttack(attacks, queuedAttack);
    const { delay, delayLine } = queuedAttack;
    return queuedAttack.file === file &&
      attack?.attackTag !== undefined &&
      attackTags.includes(attack.attackTag) &&
      delay !== undefined
      ? [
          {
            attack,
            callLine: queuedAttack.line,
            delay,
            file,
            hitbox: queuedAttack.hitbox,
            ...(queuedAttack.iterations !== undefined && { iterations: queuedAttack.iterations }),
            line: delayLine,
          },
        ]
      : [];
  });
