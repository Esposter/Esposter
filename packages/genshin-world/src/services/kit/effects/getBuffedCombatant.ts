import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { checkIsEnduringRock } from "#src/services/party/checkIsEnduringRock";
import { ENDURING_ROCK_DAMAGE_BONUS } from "#src/services/party/constants";

// The combatant as its hits are priced while the buffs on it are on: a flat ATK adds to its ATK and every other bonus
// To its attribute total, so a hit reads the bonus where it reads the attribute. Enduring Rock's DMG dealt raises every
// Element's DMG Bonus and the Physical DMG Bonus while a shield holds the team
export const getBuffedCombatant = (combatant: Combatant, effects: readonly KitEffect[]): Combatant => {
  const buffs = effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.characterId === combatant.characterId,
  );
  const passiveBonuses = combatant.kit.getPassiveBonuses?.(combatant) ?? [];
  const enduringRockBonuses = checkIsEnduringRock(combatant, effects)
    ? [...Object.values(ElementDamageBonusAttributeMap), Attribute.PhysicalDamageBonus].map((attribute) => ({
        amount: ENDURING_ROCK_DAMAGE_BONUS,
        attribute,
      }))
    : [];
  const bonuses = [...buffs, ...passiveBonuses, ...enduringRockBonuses];
  if (bonuses.length === 0) return combatant;
  const attributeTotalMap = { ...combatant.attributes.attributeTotalMap };
  let { attack } = combatant.attributes;
  for (const { amount, attribute } of bonuses)
    if (attribute === Attribute.Attack) attack += amount;
    else attributeTotalMap[attribute] += amount;
  return { ...combatant, attributes: { ...combatant.attributes, attack, attributeTotalMap } };
};
