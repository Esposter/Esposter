import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { takeOne } from "@esposter/shared";

// Measured: gcsim (MIT) kinich/burst.go, the Ajaw's Dragon Breath is six lasers
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kinich/burst.go
const DRAGON_BREATH_COUNT = 6;

export const KINICH_CHARACTER_ID = 10_000_101;

// The Nightsoul points his blessing holds at most, and the seconds it lasts, ten and a sixth, as gcsim (MIT)
// Kinich/kinich.go and skill.go set them
const NIGHTSOUL_MAXIMUM = 20;
const NIGHTSOUL_BLESSING_SECONDS = (10 * 60 + 10) / 60;
// One point every thirty frames while the blessing lasts, two a second, as gcsim skill.go timePassGenerateNSPoints does
const NIGHTSOUL_POINTS_PER_SECOND = 2;

// Kinich's behaviour: the burst calls the Ajaw as it is cast, a summon at the body whose lasers' intervals are drawn from
// The world's seeded random source then, as gcsim draws each as the laser before it fires. Its schedule is counted in
// Frames, as gcsim counts it. His skill's press enters the Nightsoul Blessing with no points, which gain two a second up
// To twenty while it lasts. Not built: the press inside the blessing, the Scalespiker Cannon, which spends the points and
// Deals the blessing's hits, and the Loop Shots that add to the points, all of which wait on the Nightsoul hook
export const createKinichKitBehaviour = ({
  readFrames,
  readFramesList,
  readHitFields,
}: KitRecordReader): KitBehaviour => {
  const dragonBreathFields = readHitFields("dragonBreath", ["hitmarkSeconds"]);
  const dragonBreathFirstHitmarkFrames = readFrames("dragonBreathFirstHitmark");
  const dragonBreathIntervalFramesList = readFramesList("dragonBreathInterval");
  // The Ajaw's lasers, each landing the interval drawn for it after the one before
  const createDragonBreathHits = (random: () => number): KitHit[] => {
    let hitmarkFrames = dragonBreathFirstHitmarkFrames;
    return Array.from({ length: DRAGON_BREATH_COUNT }, (_value, index) => {
      if (index > 0)
        hitmarkFrames += takeOne(
          dragonBreathIntervalFramesList,
          Math.floor(random() * dragonBreathIntervalFramesList.length),
        );
      return { ...dragonBreathFields, hitmarkSeconds: toKitSeconds(hitmarkFrames) };
    });
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, random }) =>
        castKitSummon(kitEffectState, body, combatant, createDragonBreathHits(random), {
          attackTag: AttackTag.ElementalBurst,
        }),
    },
    skill: {
      // In the blessing the press is the Scalespiker Cannon, not built, so it does nothing there
      onStart: ({ activeCombatant: { characterId }, kitEffectState }) => {
        if (!hasKitNightsoulBlessing(kitEffectState.effects, characterId))
          enterKitNightsoulBlessing(kitEffectState, characterId, {
            nightsoulRate: { maximum: NIGHTSOUL_MAXIMUM, perSecond: NIGHTSOUL_POINTS_PER_SECOND },
            points: 0,
            secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
          });
      },
    },
  };
};
