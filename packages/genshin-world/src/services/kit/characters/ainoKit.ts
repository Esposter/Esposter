import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// Measured: gcsim (MIT) aino/burst.go, Cool Your Jets Ducky's Water Balls fall for 14.2 seconds from the first, each on a
// Random enemy within 10 metres of the body. Ascension 1's faster and wider balls wait on the Moonsign, which the kit
// Does not hold yet
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/aino
const ASCENSION_4 = 4;

export const AINO_CHARACTER_ID = 10_000_121;

// Aino's behaviour: Cool Your Jets Ducky casts a field following the body, which drops a Water Ball every interval from
// Its first tick to its last, and Ascension 4 adds half her Elemental Mastery to each ball's damage. Not built yet:
// Aino's Ascension 1 at a Moonsign of 2, which shortens the balls' interval and widens them, and Constellation 6's Lunar
// DMG bonus, both wait on the Lunar and Moonsign hook; Constellation 2's ball on each enemy another member hits while the
// Burst lasts, which waits on a hook that reads another member's hits; Constellation 1's Elemental Mastery on the active
// Member and Constellation 4's energy on the skill's hits, which the kit does not hold yet.
// Musecatcher's hold is not built, as gcsim does not implement it either
export const createAinoKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const masteryShare = readParameter("ascension4MasteryShare");
  const waterBall = readHit("waterBall", {
    additiveBaseDamageBonus: (combatant) =>
      combatant.ascension >= ASCENSION_4
        ? combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * masteryShare
        : 0,
  });
  const burstFirstTickSeconds = readSeconds("burstStart");
  const burstTickIntervalSeconds = readSeconds("waterBallInterval");
  const burstSeconds = readSeconds("burstDuration");
  const burstRadius = readParameter("burstRadius");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const burstField = castKitField(kitEffectState, combatant.characterId, position, {
          isFollowing: true,
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ kitEffectState: tickKitEffectState }) =>
            castKitSummon(tickKitEffectState, { facing, height, position: burstField.centre }, combatant, [waterBall]),
          radius: burstRadius,
          secondsRemaining: burstFirstTickSeconds + burstSeconds,
          tickIntervalSeconds: burstTickIntervalSeconds,
        });
      },
    },
  };
};
