import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";

import { checkIsInIteration } from "#src/services/genshinAssets/kits/gcsim/checkIsInIteration";

// The `AttackInfo` a queue call fires: the literal written inline in its arguments, else the literal of its file assigned
// The name it passes, the nearest one before the call or else the first after it, of the loop iteration the call is in.
// A name no literal of the file has is a method's, which fires the attack it returns, in any file of the character
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
  if (namedAttacks.length === 0)
    return attacks.findLast((attack) => attack.returnedBy === attackName && checkIsInIteration(attack, iterations));
  return namedAttacks.findLast((attack) => attack.line <= line) ?? namedAttacks[0];
};
