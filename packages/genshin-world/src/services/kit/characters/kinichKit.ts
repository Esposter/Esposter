import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KIT_FRAMES_PER_SECOND } from "#src/services/kit/constants";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

// Measured: gcsim (MIT) kinich/burst.go, the Ajaw's Dragon Breath is six lasers, the first 253 frames after the burst is
// Cast
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kinich/burst.go
const DRAGON_BREATH_FIRST_HITMARK_FRAMES = 253;
const DRAGON_BREATH_COUNT = 6;

export const KINICH_CHARACTER_ID = 10_000_101;

// Kinich's behaviour: the burst calls the Ajaw as it is cast, a summon at the body whose lasers' intervals are drawn from
// The world's seeded random source then, as gcsim draws each as the laser before it fires. Its schedule is counted in
// Frames, as gcsim counts it. Not built: the Nightsoul Blessing the press enters, with its Scalespiker Cannon and Loop
// Shots and its Nightsoul Points. The blessing is a stance that runs on those points, which wait on the Nightsoul hook, so
// The press deals nothing until then
export const createKinichKitBehaviour = ({ readHitFields, readSecondsList }: KitRecordReader): KitBehaviour => {
  // The record's fields hold each laser's reach, element, gauge, internal cooldown, poise and multiplier, which their
  // Partial type cannot show
  const dragonBreathFields = readHitFields("dragonBreath");
  const dragonBreathIntervalFramesList = readSecondsList("dragonBreathInterval").map(
    (seconds) => seconds * KIT_FRAMES_PER_SECOND,
  );
  // The Ajaw's lasers, each landing the interval drawn for it after the one before
  const createDragonBreathHits = (random: () => number): KitHit[] => {
    let hitmarkFrames = DRAGON_BREATH_FIRST_HITMARK_FRAMES;
    return Array.from({ length: DRAGON_BREATH_COUNT }, (_value, index) => {
      if (index > 0)
        hitmarkFrames += takeOne(
          dragonBreathIntervalFramesList,
          Math.floor(random() * dragonBreathIntervalFramesList.length),
        );
      return { ...dragonBreathFields, hitmarkSeconds: hitmarkFrames / KIT_FRAMES_PER_SECOND } as KitHit;
    });
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, random }) =>
        castKitSummon(kitEffectState, body, combatant, createDragonBreathHits(random), {
          attackTag: AttackTag.ElementalBurst,
        }),
    },
  };
};
