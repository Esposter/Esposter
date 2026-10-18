import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { changeKitTeamHealth } from "#src/services/kit/effects/changeKitTeamHealth";

// Rolls a hit's party heal, if the hit has one and its striker's character holds a shield it cast, never a Crystallize
// Shield, or the heal is unshielded, and on a pass heals each member of the deployed team by the flat HP plus the
// Striker's ATK, DEF and Max HP shares as it is priced. It returns whether it healed, so a hit with several Enemies rolls
// Until one heal passes
export const healKitParty = (
  context: KitContext,
  combatant: Combatant,
  pricedCombatant: Combatant,
  kitHit: KitHit,
): boolean => {
  const { healParty } = kitHit;
  if (!healParty) return false;
  const {
    kitEffectState: { effects },
    random,
  } = context;
  const isShielded = effects.some(
    (effect) =>
      effect.kind === "shield" &&
      !effect.isCrystallize &&
      effect.characterId === pricedCombatant.characterId &&
      effect.secondsRemaining > 0,
  );
  if ((!healParty.isUnshielded && !isShielded) || random() >= healParty.chance(pricedCombatant, effects)) return false;
  const healedHp =
    healParty.flatHealth +
    healParty.defenseShare * pricedCombatant.attributes.defense +
    (healParty.attackShare ?? 0) * pricedCombatant.attributes.attack +
    (healParty.maxHealthShare ?? 0) * pricedCombatant.attributes.maxHealth;
  changeKitTeamHealth(context, combatant, healedHp);
  return true;
};
