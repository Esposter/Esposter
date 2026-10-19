import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";

import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";

// The `AttackInfo`s a queue call fires. A call after an if else whose branches each set the variable's multiplier fires
// The latest attack of each branch, as the call makes whichever branch ran; a call inside the branches, or after a set
// Outside any, fires the one attack `findQueuedAttack` gives. Unless the branches cover every path, the attack the
// Variable had before them, its declaration's or an earlier set's, is fired too, as the call runs when no branch does
export const findQueuedAttacks = (attacks: readonly GcsimAttack[], queuedAttack: GcsimQueuedAttack): GcsimAttack[] => {
  const attack = findQueuedAttack(attacks, queuedAttack);
  if (
    attack?.branch === undefined ||
    attack.file !== queuedAttack.file ||
    attack.branch.endLine >= queuedAttack.line ||
    queuedAttack.attackLine !== undefined
  )
    return attack === undefined ? [] : [attack];
  const latestBranchMap = new Map<number, GcsimAttack>();
  for (const candidate of attacks)
    if (
      candidate.file === queuedAttack.file &&
      candidate.variableName === attack.variableName &&
      candidate.branch?.chain === attack.branch.chain &&
      candidate.line <= queuedAttack.line
    )
      latestBranchMap.set(candidate.branch.index, candidate);
  const branchAttacks = [...latestBranchMap.values()];
  if (attack.branch.isExhaustive && latestBranchMap.size === attack.branch.armCount) return branchAttacks;
  const priorAttack = attacks.findLast(
    (candidate) =>
      candidate.file === queuedAttack.file &&
      candidate.variableName === attack.variableName &&
      candidate.branch === undefined &&
      candidate.line <= queuedAttack.line,
  );
  return priorAttack === undefined ? branchAttacks : [priorAttack, ...branchAttacks];
};
