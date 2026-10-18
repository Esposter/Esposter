import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";

export const CLORINDE_CHARACTER_ID = 10_000_098;

// Constellation 6, "And So Shall I Never Despair": for 12 seconds after Hunter's Vigil is used, her CRIT Rate rises by 10% and
// Her CRIT DMG by 70%, as the wiki's constellation page gives it
const CONSTELLATION_6 = 6;
const HUNTERS_VIGIL_CRIT_DAMAGE = 0.7;
const HUNTERS_VIGIL_CRIT_RATE = 0.1;
const HUNTERS_VIGIL_CRIT_SECONDS = 12;

// Clorinde's behaviour: Hunter's Vigil's Constellation 6 buff, and otherwise none of her own, since her strikes, charged
// Attack, plunges and Last Lightfall are her record's alone, and Hunter's Vigil's press plays its animation and starts
// Its cooldown with no hit of its own. Not built: the
// Night Vigil stance the press starts, with its Swift Hunt, Impale the Night and Surging Blade, and Last Lightfall's Bond
// Of Life. Her passives are not built either. Constellation 6's Glimbright Shade and its damage reduction need Night Vigil's state, which
// Is not built. Constellation 1 needs Night Vigil's Electro DMG on her normal attacks, Constellation 2 the Ascension talent
// Dark-Shattering Flame, and Constellation 4 Last Lightfall's Bond of Life percentage, none of which is built
export const createClorindeKitBehaviour = (): KitBehaviour => ({
  skill: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      if (combatant.constellationCount < CONSTELLATION_6) return;
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: HUNTERS_VIGIL_CRIT_RATE,
        attribute: Attribute.CriticalRate,
        secondsRemaining: HUNTERS_VIGIL_CRIT_SECONDS,
      });
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: HUNTERS_VIGIL_CRIT_DAMAGE,
        attribute: Attribute.CriticalDamage,
        secondsRemaining: HUNTERS_VIGIL_CRIT_SECONDS,
      });
    },
  },
});
