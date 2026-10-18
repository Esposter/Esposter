import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsAmountReached } from "#src/services/checkIsAmountReached";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { schedulePeriodicKitTask } from "#src/services/kit/effects/schedulePeriodicKitTask";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

export const IANSAN_CHARACTER_ID = 10_000_110;
// The status a Nightsoul burst by a nearby party member gives Iansan at Ascension 4, which her restore's heal reads
export const IANSAN_WARMING_UP_ID = "iansan-warming-up";

// Her Nightsoul points are set to 54 as her blessing is entered, which lasts 16 seconds, as gcsim (MIT) iansan/skill.go and
// Iansan.go set them, and her blessing drains 0.6 points every six frames, six a second (nightsoulPointReduceTask)
const NIGHTSOUL_POINTS = 54;
const NIGHTSOUL_BLESSING_SECONDS = 16;
const NIGHTSOUL_DRAIN_PER_SECOND = 6;
const NIGHTSOUL_RATE = { maximum: NIGHTSOUL_POINTS, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND };

// Her burst's points, as gcsim (MIT) iansan/burst.go gives them: 15 land 40 frames after the press, entering a blessing
// If she is in none, and her restore gives a point a second for the 12 seconds the burst lasts
const BURST_POINTS = 15;
const BURST_POINTS_FRAMES = 40;
const BURST_RESTORE_SECONDS = 12;

// The Kinetic Energy Scale the burst starts, which logs the movement of the field character, a point for each two metres
// It moves in a second, as the wiki gives it. Constellation 6 lengthens the Scale and the restore three seconds, and an
// Overflowing restore gives the field character Extreme Force, 25% DMG for three seconds, as gcsim (MIT) iansan/cons.go gives them
const KINETIC_ENERGY_SCALE_ID = "iansan-kinetic-energy-scale";
const METRES_PER_MOVEMENT_POINT = 2;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_SCALE_SECONDS = 3;
const EXTREME_FORCE_DAMAGE_BONUS = 0.25;
const EXTREME_FORCE_SECONDS = 3;

// The points the movement the Kinetic Energy Scale logged gives over the last second, which the Scale then forgets
const takeKitScaleMovementPoints = (kitEffectState: KitEffectState, characterId: number): number => {
  const scale = findKitStatus(kitEffectState.effects, characterId, KINETIC_ENERGY_SCALE_ID);
  if (!scale) return 0;
  const movement = scale.stacks ?? 0;
  scale.stacks = 0;
  return movement / METRES_PER_MOVEMENT_POINT;
};

// Constellation 1's energy, as gcsim (MIT) iansan/cons.go c1 gives it: each 6 points her blessing consumes restore her 15
// Energy, then her cooldown of 18 seconds starts, and points consumed while it runs are not counted
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_COOLDOWN_ID = "iansan-constellation-1-cooldown";
const CONSTELLATION_1_COOLDOWN_SECONDS = 18;
const CONSTELLATION_1_ENERGY = 15;
const CONSTELLATION_1_POINTS = 6;
const CONSTELLATION_1_POINTS_ID = "iansan-constellation-1-points";

// Ascension 1's Precise Movement, as gcsim (MIT) iansan/asc.go gives it: the Stormflight's first strike on an enemy gives
// Her 20% ATK for 15 seconds. Every strike of the Stormflight lands at its one hitmark, so giving it on each strike is the
// Same as on the first, and a strike restarts the status rather than stacking it
const ASCENSION_1 = 1;
const PRECISE_MOVEMENT_ID = "iansan-precise-movement";
const PRECISE_MOVEMENT_ATTACK_PERCENT = 0.2;
const PRECISE_MOVEMENT_SECONDS = 15;

// Ascension 1's points, as gcsim (MIT) iansan/asc.go gives them: while Precise Movement lasts, each second's restore gives
// A point, or 4 once after she gains or consumes points on the field, which she can do again 2.8 seconds on
const PRECISE_MOVEMENT_POINTS = 1;
const PRECISE_MOVEMENT_ARMED_ID = "iansan-precise-movement-armed";
const PRECISE_MOVEMENT_ARMED_POINTS = 4;
const PRECISE_MOVEMENT_ARMING_COOLDOWN_ID = "iansan-precise-movement-arming-cooldown";
const PRECISE_MOVEMENT_ARMING_COOLDOWN_SECONDS = 2.8;

// Ascension 4's Warming Up, as gcsim (MIT) iansan/asc.go gives it: a Nightsoul burst gives Iansan the status for 10 seconds,
// And while it lasts a restore of at least one point heals the active character for 60% of her ATK, once every 2.8 seconds.
// Her ATK is her current one, with her buffs in it
const ASCENSION_4 = 4;
const WARMING_UP_SECONDS = 10;
const WARMING_UP_HEAL_ATTACK_PERCENT = 0.6;
const WARMING_UP_ICD_ID = "iansan-warming-up-icd";
const WARMING_UP_ICD_SECONDS = 2.8;

// The heal a restore of points gives the active character, as gcsim's a4Heal gives it, once the status is up and its cooldown
// Is not, which the cooldown then starts
const healWarmingUp = (context: KitContext, characterId: number): void => {
  const { activeCombatant, characterIdCombatantMap, kitEffectState, party } = context;
  const { effects } = kitEffectState;
  if (
    !checkIsKitStatusActive(effects, characterId, IANSAN_WARMING_UP_ID) ||
    checkIsKitStatusActive(effects, characterId, WARMING_UP_ICD_ID)
  )
    return;
  const iansan = characterIdCombatantMap.get(characterId);
  if (!iansan) return;
  const { attack } = getBuffedCombatant(iansan, effects, party, characterIdCombatantMap).attributes;
  changeKitMemberHealth(context, iansan, activeCombatant.characterId, attack * WARMING_UP_HEAL_ATTACK_PERCENT);
  addKitStatus(kitEffectState, characterId, { id: WARMING_UP_ICD_ID, secondsRemaining: WARMING_UP_ICD_SECONDS });
};

// The points a second's restore gives her, as gcsim's a1Points reads them: the armed four once, else one a second
const restorePreciseMovementPoints = (kitEffectState: KitEffectState, characterId: number): number => {
  if (!checkIsKitStatusActive(kitEffectState.effects, characterId, PRECISE_MOVEMENT_ID)) return 0;
  if (!checkIsKitStatusActive(kitEffectState.effects, characterId, PRECISE_MOVEMENT_ARMED_ID))
    return PRECISE_MOVEMENT_POINTS;
  removeKitEffects(
    kitEffectState,
    (effect) =>
      effect.kind === "status" && effect.characterId === characterId && effect.id === PRECISE_MOVEMENT_ARMED_ID,
  );
  return PRECISE_MOVEMENT_ARMED_POINTS;
};

// Iansan's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain six a second for the 16
// Seconds it lasts. gcsim ends the blessing when the points fall to 0.2, and the kit ends it when they reach none, a gap of
// A thirtieth of a second. Her burst's 15 points land 40 frames after the press, and a second after it lands her restore
// Starts, running for the burst's 12 seconds while the blessing lasts, as gcsim's restore task does. Not built: the
// Burst's Party ATK bonus and its conversion of the points into ATK, and the points Constellations 2 and 4 add. Her
// Strikes and plunges are her record's alone
// Constellation 1's energy from each 6 Nightsoul points consumed is built
// Ascension 1's Precise Movement is built on the Stormflight's strikes, and gives its points on the burst's restore
// Ascension 4's Warming Up is built: a nearby Nightsoul burst gives it, and the restore's points heal the active character on it
// Constellation 2 needs Precise Movement on the burst, which the kit does not build
// Constellation 4 needs the Surging Force stacks after another character's burst, which the kit does not read
// Constellation 6's Kinetic Energy Scale lasts three seconds longer, and an overflowing restore gives Extreme Force
export const createIansanKitBehaviour = (): KitBehaviour => ({
  // The Electro Swift Stormflight plays in place of her charged attack while her blessing lasts
  chargedAttackVariant: {
    checkIsActive: ({ activeCombatant, kitEffectState }) =>
      hasKitNightsoulBlessing(kitEffectState.effects, activeCombatant.characterId),
    hits: [
      {
        onStrike: ({ activeCombatant, kitEffectState }) => {
          if (activeCombatant.ascension >= ASCENSION_1)
            addKitStatus(kitEffectState, activeCombatant.characterId, {
              id: PRECISE_MOVEMENT_ID,
              secondsRemaining: PRECISE_MOVEMENT_SECONDS,
            });
        },
      },
    ],
  },
  getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) =>
    checkIsKitStatusActive(effects, combatant.characterId, PRECISE_MOVEMENT_ID)
      ? [{ amount: PRECISE_MOVEMENT_ATTACK_PERCENT, attribute: Attribute.AttackPercent }]
      : [],
  onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
    const { characterId, constellationCount } = combatant;
    // Warming Up is given by a Nightsoul burst that goes off anywhere in the team, on the field or off it, as gcsim subscribes
    if (event.kind === KitEventKind.NightsoulBurst && combatant.ascension >= ASCENSION_4)
      addKitStatus(kitEffectState, characterId, { id: IANSAN_WARMING_UP_ID, secondsRemaining: WARMING_UP_SECONDS });
    // Ascension 1 arms its four points on a gain or consumption of her points while she is on the field, as gcsim's
    // Nightsoul generate and consume callbacks do, and holds the arming for 2.8 seconds once it has
    if (
      (event.kind === KitEventKind.NightsoulPointsGained || event.kind === KitEventKind.NightsoulPointsConsumed) &&
      event.characterId === characterId &&
      activeCombatant.characterId === characterId &&
      checkIsKitStatusActive(kitEffectState.effects, characterId, PRECISE_MOVEMENT_ID) &&
      !checkIsKitStatusActive(kitEffectState.effects, characterId, PRECISE_MOVEMENT_ARMING_COOLDOWN_ID)
    ) {
      addKitStatus(kitEffectState, characterId, {
        id: PRECISE_MOVEMENT_ARMING_COOLDOWN_ID,
        secondsRemaining: PRECISE_MOVEMENT_ARMING_COOLDOWN_SECONDS,
      });
      addKitStatus(kitEffectState, characterId, {
        id: PRECISE_MOVEMENT_ARMED_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
      });
    }
    if (
      event.kind !== KitEventKind.NightsoulPointsConsumed ||
      event.characterId !== characterId ||
      constellationCount < CONSTELLATION_1 ||
      checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_1_COOLDOWN_ID)
    )
      return;

    const points =
      (findKitStatus(kitEffectState.effects, characterId, CONSTELLATION_1_POINTS_ID)?.stacks ?? 0) + event.points;
    if (!checkIsAmountReached(points, CONSTELLATION_1_POINTS)) {
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_1_POINTS_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: points,
      });
      return;
    }

    // The count starts again from none, and the energy and the cooldown come with it
    addKitStatus(kitEffectState, characterId, {
      id: CONSTELLATION_1_POINTS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
      stacks: 0,
    });
    startKitCooldown(kitEffectState, characterId, CONSTELLATION_1_COOLDOWN_ID, CONSTELLATION_1_COOLDOWN_SECONDS);
    gainPartyMemberEnergy(party, combatant, CONSTELLATION_1_ENERGY);
  },
  // Gcsim's OnMovement does for her burst's restore: the field character's movement is logged on the Kinetic Energy Scale
  // While it is up, but none of Iansan's own, as she is not the active character then
  onStep: ({ kitEffectState }, { characterId }, _stepSeconds, movement) => {
    if (movement <= 0 || kitEffectState.fieldCharacterId === characterId) return;
    const scale = findKitStatus(kitEffectState.effects, characterId, KINETIC_ENERGY_SCALE_ID);
    if (scale && scale.secondsRemaining > 0) scale.stacks = (scale.stacks ?? 0) + movement;
  },
  burst: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId, constellationCount } = activeCombatant;
      const isConstellation6 = constellationCount >= CONSTELLATION_6;
      const restoreSeconds = BURST_RESTORE_SECONDS + (isConstellation6 ? CONSTELLATION_6_SCALE_SECONDS : 0);
      addKitStatus(kitEffectState, characterId, {
        id: KINETIC_ENERGY_SCALE_ID,
        secondsRemaining: restoreSeconds,
        stacks: 0,
      });
      scheduleKitTask(kitEffectState, characterId, toKitSeconds(BURST_POINTS_FRAMES), (context) => {
        if (hasKitNightsoulBlessing(context.kitEffectState.effects, characterId))
          generateKitNightsoulPoints(context, BURST_POINTS, NIGHTSOUL_POINTS, characterId);
        else
          enterKitNightsoulBlessing(context.kitEffectState, characterId, {
            nightsoulRate: NIGHTSOUL_RATE,
            points: BURST_POINTS,
            secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
          });
      });
      schedulePeriodicKitTask(
        kitEffectState,
        characterId,
        { firstSeconds: 1, intervalSeconds: 1, untilSeconds: restoreSeconds },
        (context) => {
          // The restore stops once the blessing it lands in ends, as gcsim's does when the blessing exits
          if (!hasKitNightsoulBlessing(context.kitEffectState.effects, characterId)) return;
          const points =
            restorePreciseMovementPoints(context.kitEffectState, characterId) +
            takeKitScaleMovementPoints(context.kitEffectState, characterId);
          if (points <= 0) return;
          const gained = generateKitNightsoulPoints(context, points, NIGHTSOUL_POINTS, characterId);
          // The points the restore could not hold overflow, and give the field character Extreme Force at Constellation 6
          const { fieldCharacterId } = context.kitEffectState;
          if (isConstellation6 && points > gained && fieldCharacterId !== undefined)
            buffKitMember(context.kitEffectState, fieldCharacterId, {
              amount: EXTREME_FORCE_DAMAGE_BONUS,
              attribute: Attribute.AllDamageBonus,
              secondsRemaining: EXTREME_FORCE_SECONDS,
            });
          if (points >= 1) healWarmingUp(context, characterId);
        },
      );
    },
  },
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) =>
      enterKitNightsoulBlessing(kitEffectState, activeCombatant.characterId, {
        nightsoulRate: NIGHTSOUL_RATE,
        points: NIGHTSOUL_POINTS,
        secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
      }),
  },
});
