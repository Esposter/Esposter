import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// Measured: gcsim (MIT) layla/burst.go, Starlight Slug's field holds a circle of radius 12 round the body. Each tick strikes
// The closest enemy in the circle, which the kit cannot pick, so each tick reaches every enemy in its reach, which
// Overstates a tick against several enemies
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/layla
const STARLIGHT_SLUG_RADIUS = 12;

export const LAYLA_CHARACTER_ID = 10_000_074;

// Layla's behaviour: Nights of Formal Focus sets her Cryo shield, its health its flat HP plus its share of her Max HP, as
// It is cast. Starlight Slug casts its field where she stands, each tick striking from there with a flat damage of its share
// Of her Max HP as the burst was cast, which its talent multiplier does not scale. The Night Stars her shield and burst
// Strikes add, and her Ascension and Constellation passives, are not built
export const createLaylaKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const shieldFlatHealth = readParameter("nightsOfFormalFocusShieldFlatHealth");
  const shieldMaxHealthShare = readParameter("nightsOfFormalFocusShieldMaxHealthShare");
  const shieldSeconds = readParameter("nightsOfFormalFocusShieldSeconds");
  // The strike as its record holds it, before its share of her Max HP is priced in
  const starlightSlugBaseStrike = readHit("starlightSlugStrike");
  const starlightSlugMaxHealthShare = readParameter("starlightSlugMaxHealthShare");
  const starlightSlugStartSeconds = readSeconds("starlightSlugStart");
  const starlightSlugSeconds = readSeconds("starlightSlugDuration");
  const starlightSlugTickIntervalSeconds = readSeconds("starlightSlugTickInterval");
  const createStarlightSlugStrike = ({ attributes: { maxHealth } }: Combatant): KitHit => ({
    ...starlightSlugBaseStrike,
    additiveBaseDamageBonus: () => starlightSlugMaxHealthShare * maxHealth,
  });
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const starlightSlugStrike = createStarlightSlugStrike(combatant);
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: starlightSlugStartSeconds,
          onTick: ({ kitEffectState: tickEffectState }) =>
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [
              starlightSlugStrike,
            ]),
          radius: STARLIGHT_SLUG_RADIUS,
          secondsRemaining: starlightSlugSeconds,
          tickIntervalSeconds: starlightSlugTickIntervalSeconds,
        });
      },
    },
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        castKitShield(kitEffectState, combatant.characterId, {
          element: Element.Cryo,
          health: shieldFlatHealth + shieldMaxHealthShare * combatant.attributes.maxHealth,
          secondsRemaining: shieldSeconds,
        }),
    },
  };
};
