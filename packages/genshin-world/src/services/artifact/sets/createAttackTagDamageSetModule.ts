import type { AttackTag } from "#src/models/combat/AttackTag";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

// A set's bonus that raises the DMG its wearer's strikes of the attack tag deal by the amount, as the two-piece bonuses
// Of the Gambler, Noblesse Oblige, Golden Troupe and Long Night's Oath sets do, each naming only its own attack
export const createAttackTagDamageSetModule = ({
  amount,
  attackTag,
}: {
  amount: number;
  attackTag: AttackTag;
}): PassiveModule => ({ getStrikeDamageBonus: (strike) => (strike.attackTag === attackTag ? amount : 0) });
