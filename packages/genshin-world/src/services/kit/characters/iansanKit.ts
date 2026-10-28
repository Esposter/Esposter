import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsAmountReached } from "#src/services/checkIsAmountReached";
import { DAMAGE_BONUS_ATTRIBUTES } from "#src/services/combat/damage/constants";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { endKitStatus } from "#src/services/kit/effects/endKitStatus";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { schedulePeriodicKitTask } from "#src/services/kit/effects/schedulePeriodicKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";

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
const BURST_RESTORE_ID = "iansan-burst-restore";

// Constellation 1's energy, as gcsim (MIT) iansan/cons.go c1 gives it: each 6 points her blessing consumes restore her 15
// Energy, then her cooldown of 18 seconds starts, and points consumed while it runs are not counted
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_COOLDOWN_ID = "iansan-constellation-1-cooldown";
const CONSTELLATION_1_COOLDOWN_SECONDS = 18;
const CONSTELLATION_1_ENERGY = 15;
const CONSTELLATION_1_POINTS = 6;
const CONSTELLATION_1_POINTS_ID = "iansan-constellation-1-points";

// Constellation 2's party ATK, as gcsim (MIT) iansan/cons.go c2Init gives it: every other member gets 30% ATK while Precise
// Movement lasts, and the burst gives Precise Movement too, as c2OnBurst does
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ATTACK_PERCENT = 0.3;
const CONSTELLATION_2_SOURCE = "iansan-constellation-2";

// Constellation 4's Surging Force, as gcsim (MIT) iansan/cons.go c4Init and c4Points give it: another member's burst, while
// Her restore runs and she is off the field, gives her two stacks once per burst of hers, and each stack adds 4 points to a
// Restore tick. Half the overflow of the last tick joins the points too, held as a status for the next tick to read
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_GENERATED_ID = "iansan-constellation-4-generated";
const CONSTELLATION_4_OVERFLOW_ID = "iansan-constellation-4-overflow";
const CONSTELLATION_4_OVERFLOW_RATIO = 0.5;
const CONSTELLATION_4_STACK_POINTS = 4;
const CONSTELLATION_4_STACKS = 2;
const CONSTELLATION_4_STACKS_ID = "iansan-constellation-4-stacks";

// Constellation 6's Kinetic Energy Scale and Extreme Force, as gcsim (MIT) iansan/cons.go c6BurstBonusDur and c6OnOverflow
// Give: the burst's restore runs 3 seconds longer, and points that overflow her maximum give the active character 25% DMG
// Bonus for 3 seconds
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_BURST_BONUS_SECONDS = 3;
const CONSTELLATION_6_DAMAGE_BONUS = 0.25;
const CONSTELLATION_6_SECONDS = 3;
const CONSTELLATION_6_SOURCE = "iansan-constellation-6";

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

// Precise Movement's status and, from Constellation 2, the ATK it gives each other member while it lasts, as gcsim's c2Init
// Gates its mod on the status. The party buff runs on the same seconds, and the blessing's exit ends it with the status
const addPreciseMovement = (
  kitEffectState: KitEffectState,
  party: Party,
  characterId: number,
  constellationCount: number,
): void => {
  addKitStatus(kitEffectState, characterId, { id: PRECISE_MOVEMENT_ID, secondsRemaining: PRECISE_MOVEMENT_SECONDS });
  if (constellationCount < CONSTELLATION_2) return;
  for (const memberId of getDeployedCharacterIds(party))
    if (memberId !== characterId)
      buffKitMember(kitEffectState, memberId, {
        amount: CONSTELLATION_2_ATTACK_PERCENT,
        attribute: Attribute.AttackPercent,
        secondsRemaining: PRECISE_MOVEMENT_SECONDS,
        source: CONSTELLATION_2_SOURCE,
      });
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

// The points Constellation 4 adds to a restore tick, as gcsim's c4Points gives them: half the overflow the last tick had,
// And 4 for each Surging Force stack, one of which a tick spends
const restoreConstellationFourPoints = (
  kitEffectState: KitEffectState,
  characterId: number,
  constellationCount: number,
): number => {
  if (constellationCount < CONSTELLATION_4) return 0;
  const stacks = countKitStatusStacks(kitEffectState.effects, characterId, CONSTELLATION_4_STACKS_ID);
  if (stacks > 0)
    addKitStatus(kitEffectState, characterId, {
      id: CONSTELLATION_4_STACKS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
      stacks: stacks - 1,
    });
  const overflow = countKitStatusStacks(kitEffectState.effects, characterId, CONSTELLATION_4_OVERFLOW_ID);
  return overflow * CONSTELLATION_4_OVERFLOW_RATIO + (stacks > 0 ? CONSTELLATION_4_STACK_POINTS : 0);
};

// Constellation 6's Extreme Force, as gcsim's c6OnOverflow gives it: the active character takes 25% DMG Bonus on every element
// And the Physical DMG Bonus for 3 seconds, the overflow that set it off on the restore tick
const addExtremeForce = (kitEffectState: KitEffectState, activeCharacterId: number): void => {
  for (const attribute of DAMAGE_BONUS_ATTRIBUTES)
    buffKitMember(kitEffectState, activeCharacterId, {
      amount: CONSTELLATION_6_DAMAGE_BONUS,
      attribute,
      secondsRemaining: CONSTELLATION_6_SECONDS,
      source: CONSTELLATION_6_SOURCE,
    });
};

// Iansan's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain six a second for the 16
// Seconds it lasts. gcsim ends the blessing when the points fall to 0.2, and the kit ends it when they reach none, a gap of
// A thirtieth of a second. Her burst's 15 points land 40 frames after the press, and her restore's first tick falls
// A second after the press, for 12 seconds while the blessing lasts, as gcsim's restore task does. Not built: the
// Burst's Party ATK bonus and its conversion of the points into ATK, and the restore's share of the movement of the other
// Members on the field, which no kit event carries, so Warming Up does not heal on those points. Her strikes and plunges are
// Her record's alone
// Constellation 1's energy from each 6 Nightsoul points consumed is built
// Constellation 2's party ATK and the Precise Movement on the burst are built, from Ascension 1
// Constellation 4's Surging Force and the overflow it reads are built
// Constellation 6's longer restore and Extreme Force on overflow are built
// Ascension 1's Precise Movement is built on the Stormflight's strikes, and gives its points on the burst's restore
// Ascension 4's Warming Up is built: a nearby Nightsoul burst gives it, and the restore's points heal the active character on it
export const createIansanKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant, kitEffectState, party }) => {
      const { ascension, characterId, constellationCount } = activeCombatant;
      if (ascension >= ASCENSION_1 && constellationCount >= CONSTELLATION_2)
        addPreciseMovement(kitEffectState, party, characterId, constellationCount);
      endKitStatus(kitEffectState, characterId, CONSTELLATION_4_GENERATED_ID);
      endKitStatus(kitEffectState, characterId, CONSTELLATION_4_STACKS_ID);
      const restoreSeconds =
        BURST_RESTORE_SECONDS + (constellationCount >= CONSTELLATION_6 ? CONSTELLATION_6_BURST_BONUS_SECONDS : 0);
      scheduleKitTask(kitEffectState, characterId, toKitSeconds(BURST_POINTS_FRAMES), (context) => {
        if (checkHasKitStatus(context.kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID))
          generateKitNightsoulPoints(context, BURST_POINTS, NIGHTSOUL_POINTS, characterId);
        else
          enterKitNightsoulBlessing(context.kitEffectState, characterId, {
            nightsoulRate: NIGHTSOUL_RATE,
            points: BURST_POINTS,
            secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
          });
      });
      addKitStatus(kitEffectState, characterId, { id: BURST_RESTORE_ID, secondsRemaining: restoreSeconds });
      schedulePeriodicKitTask(
        kitEffectState,
        characterId,
        { firstSeconds: 1, intervalSeconds: 1, untilSeconds: restoreSeconds },
        (context) => {
          // The restore stops once the blessing it lands in exits, which ends its status, as gcsim's does with burstSrc
          if (!checkIsKitStatusActive(context.kitEffectState.effects, characterId, BURST_RESTORE_ID)) return;
          const points =
            restorePreciseMovementPoints(context.kitEffectState, characterId) +
            restoreConstellationFourPoints(context.kitEffectState, characterId, constellationCount);
          if (points <= 0) return;
          const overflow = generateKitNightsoulPoints(context, points, NIGHTSOUL_POINTS, characterId);
          if (constellationCount >= CONSTELLATION_4)
            addKitStatus(context.kitEffectState, characterId, {
              id: CONSTELLATION_4_OVERFLOW_ID,
              secondsRemaining: Number.POSITIVE_INFINITY,
              stacks: overflow,
            });
          if (overflow > 0 && constellationCount >= CONSTELLATION_6)
            addExtremeForce(context.kitEffectState, context.activeCombatant.characterId);
          if (points >= 1) healWarmingUp(context, characterId);
        },
      );
    },
  },
  // The Electro Swift Stormflight plays in place of her charged attack while her blessing lasts
  chargedAttackVariant: {
    checkIsActive: ({ activeCombatant, kitEffectState }) =>
      checkHasKitStatus(kitEffectState.effects, activeCombatant.characterId, NIGHTSOUL_BLESSING_STATUS_ID),
    hits: [
      {
        onStrike: ({ activeCombatant, kitEffectState, party }) => {
          if (activeCombatant.ascension >= ASCENSION_1)
            addPreciseMovement(kitEffectState, party, activeCombatant.characterId, activeCombatant.constellationCount);
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
    // Another member's burst, while her restore runs and she is off the field, gives her Surging Force once per burst of hers,
    // As gcsim's OnBurst subscription does
    if (
      event.kind === KitEventKind.BurstUsed &&
      constellationCount >= CONSTELLATION_4 &&
      activeCombatant.characterId !== characterId &&
      checkIsKitStatusActive(kitEffectState.effects, characterId, BURST_RESTORE_ID) &&
      !checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_4_GENERATED_ID)
    ) {
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_4_STACKS_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: CONSTELLATION_4_STACKS,
      });
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_4_GENERATED_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
      });
    }
    // The blessing's exit, by its seconds or by its points, ends Precise Movement and the burst's restore, as gcsim's
    // ExitNightsoul deletes a1Key and resets burstSrc, so a blessing she enters again resumes neither. The party ATK that
    // Constellation 2 gave runs on Precise Movement, so it ends with it
    if (
      event.kind === KitEventKind.EffectExpired &&
      event.effect.kind === "status" &&
      event.effect.characterId === characterId &&
      event.effect.id === NIGHTSOUL_BLESSING_STATUS_ID
    ) {
      endKitStatus(kitEffectState, characterId, PRECISE_MOVEMENT_ID);
      endKitStatus(kitEffectState, characterId, BURST_RESTORE_ID);
      removeKitEffects(kitEffectState, (effect) => effect.kind === "buff" && effect.source === CONSTELLATION_2_SOURCE);
    }
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
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      enterKitNightsoulBlessing(kitEffectState, activeCombatant.characterId, {
        nightsoulRate: NIGHTSOUL_RATE,
        points: NIGHTSOUL_POINTS,
        secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
      });
    },
  },
});
