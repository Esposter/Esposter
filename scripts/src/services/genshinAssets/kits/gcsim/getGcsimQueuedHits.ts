import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GcsimQueuedHit } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedHit";

// Whether an attack is one a call in the loop iterations given fires: a variant of a copy's attack is only in the one
// Iteration its `if` names, and every other attack is in all of them
const checkIsInIteration = (attack: GcsimAttack, iterations: GcsimQueuedAttack["iterations"]): boolean =>
  attack.iteration === undefined || iterations?.[attack.iteration.variable] === attack.iteration.value;

// The `AttackInfo` a queue call fires: the literal written inline in its arguments, else the literal of its file assigned
// The name it passes, the nearest one before the call or else the first after it, of the loop iteration the call is in
export const findQueuedAttack = (
  attacks: readonly GcsimAttack[],
  { attackLine, attackName, file, iterations, line }: GcsimQueuedAttack,
): GcsimAttack | undefined => {
  if (attackLine !== undefined)
    return attacks.find(
      (attack) => attack.file === file && attack.line === attackLine && checkIsInIteration(attack, iterations),
    );
  if (attackName === undefined) return undefined;
  const namedAttacks = attacks.filter(
    (attack) => attack.file === file && attack.variableName === attackName && checkIsInIteration(attack, iterations),
  );
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
