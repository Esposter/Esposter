import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

export const COLLEI_CHARACTER_ID = 10_000_067;

// Collei's behaviour: Trump-Card Kitty's leap, a field cast where the kitty was cast, which lands each leap's hit from
// There for the kitty's seconds past its explosion. Her passives and constellations are not built yet: Sprout and The
// Zone's extension wait on a reaction a party member's hit causes, and the rest wait on a passive's hook
export const createColleiKitBehaviour = ({ kit, readHit, readSeconds }: KitRecordReader): KitBehaviour => {
  const explosionHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const leap = readHit("leap");
  const leapFirstTickSeconds = readSeconds("leapFirstTick");
  const leapTickIntervalSeconds = readSeconds("leapTickInterval");
  const trumpCardKittySeconds = readSeconds("trumpCardKitty");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        // The leap's field ticks from the kitty's first leap while its status lasts, and each tick's hit is cast where the
        // Kitty was cast, so it lands from there whatever the body does after
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: leapFirstTickSeconds,
          onTick: ({ kitEffectState: tickEffectState }) => {
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [leap]);
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining: explosionHitmarkSeconds + trumpCardKittySeconds,
          tickIntervalSeconds: leapTickIntervalSeconds,
        });
      },
    },
  };
};
