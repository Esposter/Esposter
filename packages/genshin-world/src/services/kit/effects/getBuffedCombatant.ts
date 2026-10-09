import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";

// The combatant as its hits are priced while the buffs on it are on: a flat ATK adds to its ATK and every other bonus to
// Its attribute total, so a hit reads the bonus where it reads the attribute
export const getBuffedCombatant = (combatant: Combatant, effects: readonly KitEffect[]): Combatant => {
  const buffs = effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.characterId === combatant.characterId,
  );
  const passiveBonuses = combatant.kit.getPassiveBonuses?.(combatant) ?? [];
  if (buffs.length === 0 && passiveBonuses.length === 0) return combatant;
  const attributeTotalMap = { ...combatant.attributes.attributeTotalMap };
  let { attack } = combatant.attributes;
  for (const { amount, attribute } of [...buffs, ...passiveBonuses])
    if (attribute === Attribute.Attack) attack += amount;
    else attributeTotalMap[attribute] += amount;
  return { ...combatant, attributes: { ...combatant.attributes, attack, attributeTotalMap } };
};
