import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { DAMAGE_BONUS_ATTRIBUTES } from "#src/services/combat/damage/constants";
import { applyCombatantBonuses } from "#src/services/kit/effects/applyCombatantBonuses";
import { checkIsEnduringRock } from "#src/services/party/checkIsEnduringRock";
import { ENDURING_ROCK_DAMAGE_BONUS } from "#src/services/party/constants";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { getPartyMember } from "#src/services/party/getPartyMember";

// The combatant as its hits are priced while the buffs on it are on and its passives read its HP in the party: each
// Bonus adds to its attribute total, and its Max HP, ATK and DEF are built from their totals again, so a percentage
// Raises them too. Enduring Rock's DMG dealt raises every Element's DMG Bonus and the Physical DMG Bonus while a shield
// Holds the team. A stat converted from Max HP is then added as a second phase, from the Max HP the ordinary bonuses
// Left it at, so a conversion reads no other conversion's output
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
      getDeployedCombatants(party, characterIdCombatantMap),
      effects,
    ) ?? [];
  const enduringRockBonuses = checkIsEnduringRock(combatant, effects, party.lunarCrystallize.moondrifts, position)
    ? DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: ENDURING_ROCK_DAMAGE_BONUS, attribute }))
    : [];
  const buffed = applyCombatantBonuses(combatant, [...buffs, ...passiveBonuses, ...enduringRockBonuses]);
  const conversionBonuses =
    combatant.kit.getConversionBonuses?.(buffed, getPartyMember(party, combatant.characterId).healthShare) ?? [];
  return applyCombatantBonuses(buffed, conversionBonuses);
};
