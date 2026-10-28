import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeRandom } from "@esposter/shared";

// Measured: gcsim (MIT) kinich/burst.go, the Ajaw's Dragon Breath is six lasers
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kinich/burst.go
const DRAGON_BREATH_COUNT = 6;

export const KINICH_CHARACTER_ID = 10_000_101;

// The Nightsoul points his blessing holds at most, and the frames it lasts, ten seconds and ten frames, as gcsim (MIT)
// Kinich/kinich.go and skill.go set them
const NIGHTSOUL_MAXIMUM = 20;
const NIGHTSOUL_BLESSING_SECONDS = toKitSeconds(10 * 60 + 10);
// One point every thirty frames while the blessing lasts, two a second, as gcsim skill.go timePassGenerateNSPoints does
const NIGHTSOUL_POINTS_PER_SECOND = 2;
// Each Loop Shot gains three points as it starts, as gcsim (MIT) kinich/skill.go loopShotGenerateNSPoints does (line 176)
const LOOP_SHOT_POINTS = 3;
// The blind spot appears thirty frames after the press, as gcsim kinich/skill.go blindSpotAppearanceDelays does (line 32),
// And Kinich standing in it gives four points, as attack.go does (line 153). Its window is thirty-five degrees either side
// Of its centre, as attack.go's blindSpotBoundary has it (line 38)
const BLIND_SPOT_APPEARANCE_FRAMES = 30;
const BLIND_SPOT_POINTS = 4;
const BLIND_SPOT_HALF_ANGLE = (35 * Math.PI) / 180;

// The blind spot lies a quarter turn either side of Kinich's bearing from the enemy his press turns to, on the side the
// Random source draws, as gcsim's createBlindSpot does, at the distance he stands from it. Its circle is the chord of its
// Window, which Kinich's body must stand within on the frame the blind spot is due, or any frame after it until it is filled
const castBlindSpot = (context: KitContext, target: Enemy) => {
  const {
    activeCombatant: { characterId },
    body,
    kitEffectState,
    random,
  } = context;
  const { x, z } = target.position;
  const distance = Math.hypot(body.position.x - x, body.position.z - z);
  const bearing = Math.atan2(body.position.x - x, body.position.z - z);
  const side = Math.floor(random() * 2) * 2 - 1;
  const centreAngle = bearing + (side * Math.PI) / 2;
  const blindSpot = castKitField(
    kitEffectState,
    characterId,
    { x: x + distance * Math.sin(centreAngle), z: z + distance * Math.cos(centreAngle) },
    {
      nextTickSeconds: toKitSeconds(BLIND_SPOT_APPEARANCE_FRAMES),
      onTick: (tickContext) => {
        // A field no longer on the team gives nothing, and neither does a body that is not Kinich's standing in it
        if (
          !tickContext.kitEffectState.effects.includes(blindSpot) ||
          tickContext.activeCombatant.characterId !== characterId
        )
          return;
        generateKitNightsoulPoints(tickContext, BLIND_SPOT_POINTS, NIGHTSOUL_MAXIMUM, characterId);
        removeKitEffects(tickContext.kitEffectState, (effect) => effect === blindSpot);
      },
      radius: 2 * distance * Math.sin(BLIND_SPOT_HALF_ANGLE / 2),
      secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
      tickIntervalSeconds: toKitSeconds(1),
    },
  );
};

const gainLoopShotPoints = (context: KitContext) => {
  generateKitNightsoulPoints(context, LOOP_SHOT_POINTS, NIGHTSOUL_MAXIMUM);
};

// Kinich's behaviour: the burst calls the Ajaw as it is cast, a summon at the body whose lasers' intervals are drawn from
// The world's seeded random source then, as gcsim draws each as the laser before it fires. Its schedule is counted in
// Frames, as gcsim counts it. His skill's press enters the Nightsoul Blessing with no points, which gain two a second up
// To twenty while it lasts, and his Loop Shots replace his normal attacks in it, each gaining three points as it starts.
// The press also places the blind spot on the enemy it turns to, which Kinich standing in gives four points to.
// Not built: the press inside the blessing, the Scalespiker Cannon, which spends the points and deals the blessing's hits,
// And waits on the cooldown bypass and the points gate. Constellation 1 needs Movement SPD after a mid-air swing, which no
// Attribute carries, and Cannon CRIT DMG. Constellation 2 needs the Dendro RES cut on his skill's hits, and the first
// Scalespiker shot after the blessing. Constellation 4 needs the Nightsoul's Blessing, its Loop Shots and Scalespiker's
// Energy, which wait on it. Constellation 6 needs its bounce hit, which the kit does not build
export const createKinichKitBehaviour = ({
  readFramesList,
  readHitFields,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const dragonBreathFields = readHitFields("dragonBreath", []);
  const dragonBreathIntervalFramesList = readFramesList("dragonBreathInterval");
  // The Ajaw's lasers, the first at the record's hitmark and each after it by the interval drawn for it
  const createDragonBreathHits = (random: () => number): KitHit[] => {
    let intervalFrames = 0;
    return Array.from({ length: DRAGON_BREATH_COUNT }, (_value, index) => {
      if (index > 0) intervalFrames += takeRandom(dragonBreathIntervalFramesList, random);
      const hitmarkSeconds = dragonBreathFields.hitmarkSeconds + toKitSeconds(intervalFrames);
      return { ...dragonBreathFields, hitmarkSeconds };
    });
  };
  // The blessing's two Loop Shots, which take the place of his normal attacks while it lasts
  const blessingStance = readStance("blessing", {
    normalAttacks: [{ onStart: gainLoopShotPoints }, { onStart: gainLoopShotPoints }],
  });
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, random }) => {
        castKitSummon(kitEffectState, body, combatant, createDragonBreathHits(random), {
          attackTag: AttackTag.ElementalBurst,
        });
      },
    },
    skill: {
      // In the blessing the press is the Scalespiker Cannon, not built, so it does nothing there
      onStart: (context, target) => {
        const { activeCombatant: combatant, kitEffectState } = context;
        if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, NIGHTSOUL_BLESSING_STATUS_ID)) return;
        enterKitNightsoulBlessing(kitEffectState, combatant.characterId, {
          nightsoulRate: { maximum: NIGHTSOUL_MAXIMUM, perSecond: NIGHTSOUL_POINTS_PER_SECOND },
          points: 0,
          secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
        });
        enterKitStance(kitEffectState, combatant, blessingStance, NIGHTSOUL_BLESSING_SECONDS, { isEndedOnSwap: true });
        if (target) castBlindSpot(context, target);
      },
    },
  };
};
