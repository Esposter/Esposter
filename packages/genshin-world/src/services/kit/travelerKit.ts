import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";

// The Anemo set's constellations, which apply only while her statue is Anemo. The Traveler's kit is also the kit of every
// Character without a module of its own, so each reads her id as well
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ENERGY_RECHARGE = 0.16;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_ANEMO_RESISTANCE_REDUCTION = 0.2;
const CONSTELLATION_6_SECONDS = 10;
const CONSTELLATION_6_STATUS_ID = "traveler-constellation-6-anemo-resistance";

const isAnemoTraveler = (combatant: Combatant, constellation: number): boolean =>
  combatant.characterId === TRAVELER_CHARACTER_ID &&
  combatant.element === Element.Anemo &&
  combatant.constellationCount >= constellation;

// The Traveler's behaviour: her skill's hit deals the element of the statue she resonated with last, not the Anemo her
// Record names, and her burst's hit already deals her wielder's, since it names none. Her strikes, charged attack and
// Plunges are her record's alone. The kit of every character without a module of its own
// The Anemo set's Constellation 2 raises her Energy Recharge by 16%, and its Constellation 6 lowers the Anemo RES of an
// Enemy her burst strikes by 20% for 10 seconds. Its Constellation 6 lowers the RES of the element an Elemental Absorption
// Took too, which is not built: a hit's status hook is given no enemy or reaction to read that element from
// Not built: the Anemo set's Constellation 1, a pull of opponents, and its Constellation 4, the DMG she takes reduced while
// She casts Palm Vortex, which no hook reads. The other sets' constellations need the element-specific skills and bursts
// The record does not model
export const createTravelerKitBehaviour = (): KitBehaviour => ({
  burst: {
    hits: [
      {
        enemyStatus: (combatant) =>
          isAnemoTraveler(combatant, CONSTELLATION_6)
            ? {
                damageTakenBonus: 0,
                id: CONSTELLATION_6_STATUS_ID,
                resistanceReduction: { [Element.Anemo]: CONSTELLATION_6_ANEMO_RESISTANCE_REDUCTION },
                secondsRemaining: CONSTELLATION_6_SECONDS,
              }
            : undefined,
      },
    ],
  },
  getPassiveBonuses: (combatant) =>
    isAnemoTraveler(combatant, CONSTELLATION_2)
      ? [{ amount: CONSTELLATION_2_ENERGY_RECHARGE, attribute: Attribute.EnergyRecharge }]
      : [],
  skill: { hits: [{ takesWielderElement: true }] },
});
