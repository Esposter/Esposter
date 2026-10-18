import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";

export const DAHLIA_CHARACTER_ID = 10_000_115;

// Constellation 4, Collect of the Assembly: the Favonian Favor lasts 3 seconds longer, as the wiki's constellation page gives it
const CONSTELLATION_4 = 4;
const FAVONIAN_FAVOR_EXTENSION_SECONDS = 3;

// Dahlia's behaviour: Radiant Psalter places her Hydro shield for the seconds its Favonian Favor holds. Immersive
// Ordinance's Hydro particles, which gcsim gives on an internal cooldown, wait on the particle hook, and the Benison
// Stacks that regenerate the shield wait on the Benison hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/dahlia/burst.go
// Constellation 1 needs the 2.5 Energy each Benison stack gain returns, which waits on the Benison hook
// Constellation 2 needs the 25% Shield Strength a consumed Benison stack adds, which waits on the Benison hook
// Constellation 6 needs the ATK SPD of the active member under Favonian Favor, which no own-kit hook reads
export const createDahliaKitBehaviour = ({ readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const shieldSeconds = readSeconds("radiantPsalterShield");
  const burstShieldFlat = readParameter("radiantPsalterShieldFlatHealth");
  const burstShieldShare = readParameter("radiantPsalterShieldMaxHealthShare");
  const favonianFavorSeconds = readParameter("favonianFavorSeconds");
  return {
    burst: {
      // Radiant Psalter's shield comes its frames in and holds the Favonian Favor's seconds. It is a task, since a shield
      // Is placed when the task runs, and the shield then reads the caster's Max HP as it stands then
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        scheduleKitTask(kitEffectState, combatant.characterId, shieldSeconds, ({ kitEffectState: tickState }) =>
          castKitShield(tickState, combatant.characterId, {
            element: Element.Hydro,
            health: burstShieldShare * combatant.attributes.maxHealth + burstShieldFlat,
            secondsRemaining:
              favonianFavorSeconds +
              (combatant.constellationCount >= CONSTELLATION_4 ? FAVONIAN_FAVOR_EXTENSION_SECONDS : 0),
          }),
        ),
    },
  };
};
