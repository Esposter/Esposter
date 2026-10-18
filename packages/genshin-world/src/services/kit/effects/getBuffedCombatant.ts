import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { computeStatTotal } from "#src/services/character/computeStatTotal";
import { DAMAGE_BONUS_ATTRIBUTES } from "#src/services/combat/damage/constants";
import { checkIsEnduringRock } from "#src/services/party/checkIsEnduringRock";
import { ENDURING_ROCK_DAMAGE_BONUS } from "#src/services/party/constants";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { getPartyMember } from "#src/services/party/getPartyMember";

// The combatant as its hits are priced while the buffs on it are on and its passives read its HP in the party: each bonus
// Adds to its attribute total, and its ATK and DEF are built from their totals again, so a percentage raises them too.
// Enduring Rock's DMG dealt raises every Element's DMG Bonus and the Physical DMG Bonus while a shield holds the team
export const getBuffedCombatant = (
  combatant: Combatant,
  effects: readonly KitEffect[],
  party: Party,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  position?: GroundPoint,
): Combatant => {
  const buffs = effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.characterId === combatant.characterId,
  );
  const passiveBonuses =
    combatant.kit.getPassiveBonuses?.(
      combatant,
      getPartyMember(party, combatant.characterId).healthShare,
      effects,
      getDeployedCombatants(party, characterIdCombatantMap),
    ) ?? [];
  const enduringRockBonuses = checkIsEnduringRock(combatant, effects, party.lunarCrystallize.moondrifts, position)
    ? DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: ENDURING_ROCK_DAMAGE_BONUS, attribute }))
    : [];
  const bonuses = [...buffs, ...passiveBonuses, ...enduringRockBonuses];
  if (bonuses.length === 0) return combatant;
  const attributeTotalMap = { ...combatant.attributes.attributeTotalMap };
  for (const { amount, attribute } of bonuses) attributeTotalMap[attribute] += amount;
  return {
    ...combatant,
    attributes: {
      ...combatant.attributes,
      attack: computeStatTotal(attributeTotalMap, Attribute.BaseAttack, Attribute.AttackPercent, Attribute.Attack),
      attributeTotalMap,
      defense: computeStatTotal(attributeTotalMap, Attribute.BaseDefense, Attribute.DefensePercent, Attribute.Defense),
    },
  };
};
