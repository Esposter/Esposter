import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GcsimQueuedHit } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedHit";

// The `AttackInfo` a queue call fires: the literal written inline in its arguments, else the literal of its file assigned
// The name it passes, the nearest one before the call or else the first after it
export const findQueuedAttack = (
  attacks: readonly GcsimAttack[],
  { attackLine, attackName, file, line }: GcsimQueuedAttack,
): GcsimAttack | undefined => {
  if (attackLine !== undefined) return attacks.find((attack) => attack.file === file && attack.line === attackLine);
  if (attackName === undefined) return undefined;
  const namedAttacks = attacks.filter((attack) => attack.file === file && attack.variableName === attackName);
  return namedAttacks.findLast((attack) => attack.line <= line) ?? namedAttacks[0];
};

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
      ? [{ attack, delay, file, hitbox: queuedAttack.hitbox, line: delayLine }]
      : [];
  });
