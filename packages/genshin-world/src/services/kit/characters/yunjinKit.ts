import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { takeOne } from "@esposter/shared";

export const YUNJIN_CHARACTER_ID = 10_000_064;

// Yun Jin's behaviour: Opening Flourish's tap and each of its two charge levels set a shield of her Max HP as they start.
// Cliffbreaker's Banner's DEF-scaled DMG Increase on each of the party's normal attacks, which the kit prices from the
// Striker's stats alone, is not built, nor her passives or constellations
// Constellation 1 needs the Opening Flourish cooldown cut, which the kit does not build
// Constellation 2 needs the Cliffbreaker's Banner's Normal Attack DMG bonus for the party, not built
// Constellation 6 needs a Normal Attack SPD bonus, which no attribute carries
export const createYunjinKitBehaviour = ({ kit, readParameter }: KitRecordReader): KitBehaviour => {
  const shieldShare = readParameter("shieldShare");
  const shieldFlat = readParameter("shieldFlatHealth");
  // Opening Flourish's shield is set as the skill starts, from Yun Jin's Max HP and the table's share and flat HP, until its
  // Hit lands, as gcsim expires it at that frame
  const createShieldOnStart = ({ hits }: KitAction): KitAction["onStart"] => {
    const shieldSeconds = takeOne(hits).hitmarkSeconds;
    return ({ activeCombatant: combatant, kitEffectState }) =>
      castKitShield(kitEffectState, combatant.characterId, {
        element: Element.Geo,
        health: shieldShare * combatant.attributes.maxHealth + shieldFlat,
        secondsRemaining: shieldSeconds,
      });
  };
  return {
    skill: { onStart: createShieldOnStart(kit.elementalSkill) },
    skillHolds: (kit.elementalSkillHolds ?? []).map(({ action }) => ({ onStart: createShieldOnStart(action) })),
  };
};
