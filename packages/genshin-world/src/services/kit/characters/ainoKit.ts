import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";

// Measured: gcsim (MIT) aino/burst.go, Cool Your Jets Ducky's Water Balls fall for 14.2 seconds from the first, each on a
// Random enemy within 10 metres of the body. Ascension 1's faster and wider balls at Ascendant Gleam are read as the burst
// Is cast
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/aino
const ASCENSION_4 = 4;
// Ascension 1 at Ascendant Gleam, as gcsim's aino/asc.go gives the balls: one every 0.7 seconds, each landing with a radius
// Of 4 metres where the base ball's is 1
const ASCENSION_1 = 1;
const ASCENSION_1_WATER_BALL_INTERVAL_SECONDS = 0.7;
const ASCENSION_1_WATER_BALL_RADIUS = 4;

export const AINO_CHARACTER_ID = 10_000_121;

// Aino's behaviour: Cool Your Jets Ducky casts a field following the body, which drops a Water Ball every interval from
// Its first tick to its last, and Ascension 4 adds half her Elemental Mastery to each ball's damage. Ascension 1 at Ascendant
// Gleam drops the balls faster and wider, read as the burst is cast. Not built yet: the internal cooldown gcsim gives those
// Moonsign hits, which the kit has no tag for, and Constellation 6's Lunar DMG bonus, which waits on the Lunar hook;
// Constellation 2's ball on each enemy another member hits while the burst lasts, which waits on a hook that reads another
// Member's hits; Constellation 1's Elemental Mastery on the active member and Constellation 4's energy on the skill's hits,
// Which the kit does not hold yet.
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
  // The ball Ascension 1 drops at Ascendant Gleam, whose reach is the burst's search radius with its own landing radius
  const ascendantWaterBall: KitHit = {
    ...waterBall,
    hitArea: { ...waterBall.hitArea, radius: burstRadius + ASCENSION_1_WATER_BALL_RADIUS },
  };
  return {
    burst: {
      onStart: ({
        activeCombatant: combatant,
        body: { facing, height, position },
        characterIdCombatantMap,
        kitEffectState,
        party,
      }) => {
        const isAscendantBurst =
          combatant.ascension >= ASCENSION_1 &&
          getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
        const burstField = castKitField(kitEffectState, combatant.characterId, position, {
          isFollowing: true,
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ kitEffectState: tickKitEffectState }) =>
            castKitSummon(tickKitEffectState, { facing, height, position: burstField.centre }, combatant, [
              isAscendantBurst ? ascendantWaterBall : waterBall,
            ]),
          radius: burstRadius,
          secondsRemaining: burstFirstTickSeconds + burstSeconds,
          tickIntervalSeconds: isAscendantBurst ? ASCENSION_1_WATER_BALL_INTERVAL_SECONDS : burstTickIntervalSeconds,
        });
      },
    },
  };
};
