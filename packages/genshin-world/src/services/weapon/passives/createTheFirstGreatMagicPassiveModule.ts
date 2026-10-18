import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// The share a count of stacks reaches on the ladder of shares, the first for one stack and the last for that many or more
const getStackShare = (shares: number[], stacks: number): number =>
  stacks === 0 ? 0 : takeOne(shares, Math.min(stacks, shares.length) - 1);

// The First Great Magic at its rank: its wielder's Charged Attack DMG rises by the rank's amount. Each deployed member of the
// Wielder's Elemental Type, the wielder included, is a Gimmick stack, and each of another Elemental Type a Theatrics stack:
// The Gimmick stacks raise its ATK by the next three shares, and the Theatrics stacks its Movement SPD by the three after them
export const createTheFirstGreatMagicPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chargedAttackDamageBonus = takeOne(params, 0);
  const attackShares = params.slice(1, 4);
  const movementSpeedShares = params.slice(4, 7);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants) => {
      const gimmickStacks = deployedCombatants.filter((member) => member.element === combatant.element).length;
      const theatricsStacks = deployedCombatants.length - gimmickStacks;
      return [
        { amount: getStackShare(attackShares, gimmickStacks), attribute: Attribute.AttackPercent },
        { amount: getStackShare(movementSpeedShares, theatricsStacks), attribute: Attribute.MovementSpeed },
      ];
    },
    getStrikeDamageBonus: (strike) => (strike.attackTag === AttackTag.ChargedAttack ? chargedAttackDamageBonus : 0),
  };
};
