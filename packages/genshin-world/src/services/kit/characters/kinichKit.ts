import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { takeOne } from "@esposter/shared";

// Measured: gcsim (MIT) kinich/burst.go, the Ajaw's Dragon Breath is six lasers
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kinich/burst.go
const DRAGON_BREATH_COUNT = 6;

export const KINICH_CHARACTER_ID = 10_000_101;

// Kinich's behaviour: the burst calls the Ajaw as it is cast, a summon at the body whose lasers' intervals are drawn from
// The world's seeded random source then, as gcsim draws each as the laser before it fires. Its schedule is counted in
// Frames, as gcsim counts it. Not built: the Nightsoul Blessing the press enters, with its Scalespiker Cannon and Loop
// Shots and its Nightsoul Points. The blessing is a stance that runs on those points, which wait on the Nightsoul hook, so
// The press deals nothing until then
// Constellation 1 needs Movement SPD after a mid-air swing, which no attribute carries, and Cannon CRIT DMG
// Constellation 2 needs the Dendro RES cut on his skill's hits, and the first Scalespiker shot after the blessing
// Constellation 4 needs the Nightsoul's Blessing, its Loop Shots and Scalespiker's energy, which wait on it
// Constellation 6 needs its bounce hit, which the kit does not build
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
  };
};
