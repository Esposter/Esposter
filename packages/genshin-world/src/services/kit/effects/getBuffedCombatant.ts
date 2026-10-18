import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { computeAttack } from "#src/services/character/computeAttack";
import { DAMAGE_BONUS_ATTRIBUTES } from "#src/services/combat/damage/constants";
import { checkIsEnduringRock } from "#src/services/party/checkIsEnduringRock";
import { ENDURING_ROCK_DAMAGE_BONUS } from "#src/services/party/constants";
import { getPartyMember } from "#src/services/party/getPartyMember";

// The combatant as its hits are priced while the buffs on it are on and its passives read its HP in the party: every
// Bonus adds to its attribute total and its attack is summed from that total again, so a hit reads each bonus where it reads
// The attribute.
// Enduring Rock's DMG dealt raises every Element's DMG Bonus and the Physical DMG Bonus while a shield holds the team
export const getBuffedCombatant = (
  combatant: Combatant,
  effects: readonly KitEffect[],
  party: Party,
  position?: GroundPoint,
): Combatant => {
  const buffs = effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.characterId === combatant.characterId,
  );
  const passiveBonuses =
    combatant.kit.getPassiveBonuses?.(combatant, getPartyMember(party, combatant.characterId).healthShare) ?? [];
  const enduringRockBonuses = checkIsEnduringRock(combatant, effects, party.lunarCrystallize.moondrifts, position)
    ? DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: ENDURING_ROCK_DAMAGE_BONUS, attribute }))
    : [];
  const bonuses = [...buffs, ...passiveBonuses, ...enduringRockBonuses];
  if (bonuses.length === 0) return combatant;
  const attributeTotalMap = { ...combatant.attributes.attributeTotalMap };
  for (const { amount, attribute } of bonuses) attributeTotalMap[attribute] += amount;
  return {
    ...combatant,
    attributes: { ...combatant.attributes, attack: computeAttack(attributeTotalMap), attributeTotalMap },
  };
};
