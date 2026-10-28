import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitbox } from "#src/models/kit/KitHitbox";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { Element } from "#src/models/Element";
import {
  getJahodaConstellationFourEnergy,
  getJahodaElementEffects,
  JAHODA_ASCENSION_4,
  JAHODA_ASCENSION_4_ELEMENTAL_MASTERY,
  JAHODA_ASCENSION_4_SECONDS,
  JAHODA_ASCENSION_4_SOURCE,
  JAHODA_CONSTELLATION_6_SOURCE,
} from "#src/services/kit/characters/jahodaAscension";
import { startJahodaRobots } from "#src/services/kit/characters/jahodaRobots";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { schedulePeriodicKitTask } from "#src/services/kit/effects/schedulePeriodicKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { getNearestLivingEnemies } from "#src/services/kit/getNearestLivingEnemies";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Savvy Strategy's flask fills to 100 over the pursuit, as gcsim (MIT, v2.47.2) jahoda/skill.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jahoda/skill.go
const FLASK_GAUGE_MAXIMUM = 100;
export const PURSUIT_FIELD_ID = "jahoda-pursuit";
// The share of her health above which Hidden Aces also heals the member with the lowest share of health
const BURST_ADDITIONAL_HEAL_HEALTH_SHARE = 0.7;
// Hidden Aces has two robots, and each strikes the three nearest enemies, as gcsim gives them (burst.go, attack queue)
const JAHODA_ROBOT_COUNT = 2;
const ROBOT_STRIKE_TARGET_COUNT = 3;
const DRAIN_FIELD_ID = "jahoda-drain";
const FLASK_GAUGE_STATUS_ID = "jahoda-flask-gauge";
const FLASK_ABSORBED_STATUS_PREFIX = "jahoda-flask-absorbed-";
// The drain timer outlives its one tick, so it ticks as the pursuit runs out
const PURSUIT_TICK_EXTRA_SECONDS = 0.1;
// Measured: gcsim (MIT, v2.47.2) jahoda/cons.go, Constellation 6: a full flask's drain at Ascendant Gleam gives each Moonsign
// Character 5% Crit Rate and 40% Crit DMG for 20 seconds, the buff a source names restarting only itself
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jahoda/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_CRITICAL_RATE = 0.05;
const CONSTELLATION_6_CRITICAL_DAMAGE = 0.4;
const CONSTELLATION_6_SECONDS = 20;
const MEOWBALL_FIELD_ID = "jahoda-meowball";
const MEOWBALL_ENERGY_ICD_STATUS_ID = "jahoda-meowball-energy-icd";
// A full flask's drain gives ten Meowballs, one for each tenth of its gauge, as gcsim (MIT, v2.47.2) jahoda/skill.go does
const MEOWBALL_COUNT = FLASK_GAUGE_MAXIMUM / 10;
// A Meowball gives her 2 energy on each enemy it strikes, at most once per 3.5 seconds, as gcsim's energy callback does
const MEOWBALL_ENERGY = 2;
const MEOWBALL_ENERGY_ICD_SECONDS = 3.5;

export const JAHODA_CHARACTER_ID = 10_000_124;

const readFlaskGauge = (kitEffectState: KitEffectState, characterId: number): number =>
  kitEffectState.effects.reduce(
    (gauge, effect) =>
      effect.kind === "status" && effect.characterId === characterId && effect.id === FLASK_GAUGE_STATUS_ID
        ? (effect.stacks ?? 0)
        : gauge,
    0,
  );
const readFlaskElement = (kitEffectState: KitEffectState, characterId: number): Element | undefined =>
  Object.values(Element).find((element) =>
    kitEffectState.effects.some(
      (effect) =>
        effect.kind === "status" &&
        effect.characterId === characterId &&
        effect.id === `${FLASK_ABSORBED_STATUS_PREFIX}${element}`,
    ),
  );

// Ends the Meowballs still running, as gcsim's Skill and drain end their ticks
const removeMeowballs = (kitEffectState: KitEffectState): void => {
  removeKitEffects(kitEffectState, (effect) => effect.kind === "field" && effect.id === MEOWBALL_FIELD_ID);
};

// The deployed member with the lowest share of its health that still stands, as gcsim's lowest-HP pick finds it
const findLowestHealthCharacterId = (party: Party): number | undefined => {
  let lowest: undefined | { characterId: number; healthShare: number };
  for (const characterId of getDeployedCharacterIds(party)) {
    const { healthShare } = getPartyMember(party, characterId);
    if (healthShare > 0 && (lowest === undefined || healthShare < lowest.healthShare))
      lowest = { characterId, healthShare };
  }
  return lowest?.characterId;
};

// Jahoda's behaviour: Savvy Strategy's press starts the pursuit, which follows the body and on each tick fills the
// Flask from the enemies its circle holds an aura of, draining it once the gauge is full or the pursuit runs out, and
// Its second press drains it at once. Each drain lands the flask's filled or unfilled hit as a summon where it drains.
// Her burst's heals are built: every 87 frames from its 12th, the active character is healed, and while she is above
// 70% health the member with the lowest share of health is healed as well. Her burst's two robots are built at
// Ascendant Gleam: each absorbs the aura its circle holds first, then strikes the three nearest enemies with it, under
// The internal cooldown gcsim gives their strikes. Ascension 1 and Constellation 2 adjust them and her heals, and
// Ascension 4 gives her Elemental Mastery on each heal above 70% health, from jahodaAscension. Her Meowball is built
// From her hit fields, frames and areas, and Constellation 1 is not built yet. Her Moonsign Benediction, Rooftop Dash
// (TextMap 801500603), raises the party's Moonsign a level and names no lunar reaction, so its record carries no lunar
// Reaction types. Constellation 6 is built: a full flask's drain at Ascendant Gleam buffs each Moonsign member
export const createJahodaKitBehaviour = ({
  readArea,
  readHitFields,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const circle = readArea("pursuitCircle");
  const filledDrainHitFields = readHitFields("flaskDrainFilled", ["hitmarkSeconds"]);
  const unfilledDrainHitFields = readHitFields("flaskDrainUnfilled", ["hitmarkSeconds"]);
  const flaskFillValue = readParameter("flaskFillValue");
  // A flask that has absorbed an element fills by its full value from that element and by half from another
  const flaskWeakFillValue = flaskFillValue / 2;
  const pursuitSeconds = readSeconds("pursuit");
  const pursuitFirstFillSeconds = readSeconds("pursuitFirstFill");
  const fillIntervalSeconds = readSeconds("fillInterval");
  const burstSeconds = readSeconds("burstDuration");
  const firstHealSeconds = readSeconds("firstHealTick");
  const healIntervalSeconds = readSeconds("healInterval");
  const burstFlatHeal = readParameter("burstFlatHeal");
  const burstAttackHealShare = readParameter("burstAttackHealShare");
  const burstAdditionalFlatHeal = readParameter("burstAdditionalFlatHeal");
  const burstAdditionalAttackHealShare = readParameter("burstAdditionalAttackHealShare");
  const robotAbsorbArea = readArea("robotAbsorbCircle");
  const robotAbsorbFirstSeconds = readSeconds("robotAbsorbFirst");
  const robotAbsorbSpacingSeconds = readSeconds("robotAbsorbSpacing");
  const robotAbsorbIntervalSeconds = readSeconds("robotAbsorbInterval");
  const robotFirstStrikeSeconds = readSeconds("robotFirstStrike");
  const robotStrikeIntervalSeconds = readSeconds("robotStrikeInterval");
  const robotStrikeHitFields = readHitFields("robotStrike", ["hitmarkSeconds"]);
  const meowballArea = readArea("meowballCircle");
  // Named as gcsim names its constants, so the builder reads each from its declaration in skill.go
  const meowballFirstSeconds = readSeconds("firstMeowballFirstHitmark");
  const meowballIntervalSeconds = readSeconds("meowballHitmarkInterval");
  const meowballHitFields = readHitFields("meowball", ["hitArea", "hitmarkSeconds"]);
  // Each Meowball reaches the enemies within its circle about the enemy it strikes, as gcsim's circle on the primary target does
  const meowballHitbox: KitHitbox = { offset: { x: 0, z: 0 }, shape: { kind: "circle", radius: meowballArea.radius } };
  // A Meowball's hit gives her energy on each enemy it strikes, at most once per 3.5 seconds, as gcsim's energy callback does
  const meowballHit: KitHit = {
    ...meowballHitFields,
    // The circle the hitbox above gives, as the record holds no area for the hit
    hitArea: meowballArea,
    hitmarkSeconds: 0,
    onStrike: ({ kitEffectState, party }, { combatant }) => {
      if (
        startKitCooldown(
          kitEffectState,
          combatant.characterId,
          MEOWBALL_ENERGY_ICD_STATUS_ID,
          MEOWBALL_ENERGY_ICD_SECONDS,
        )
      )
        gainPartyMemberEnergy(party, combatant, MEOWBALL_ENERGY);
    },
  };
  // The filled flask's hit lands sooner from a press, or the pursuit running out, than from the fill that fills it, and the
  // Unfilled flask's hit the same from each
  const filledDrainHit: KitHit = { ...filledDrainHitFields, hitmarkSeconds: readSeconds("filledDrainHit") };
  const filledPressHit: KitHit = { ...filledDrainHitFields, hitmarkSeconds: readSeconds("filledPressHit") };
  const unfilledHit: KitHit = { ...unfilledDrainHitFields, hitmarkSeconds: readSeconds("unfilledHit") };

  // Each Meowball strikes the living enemy nearest her body, which the kit takes as the primary target, since it reads no
  // Default target as gcsim does
  const strikeMeowball = (context: KitContext, combatant: Combatant, element: Element): void => {
    const [primary] = getNearestLivingEnemies(context.enemyMap.values(), context.body.position, 1);
    if (primary !== undefined)
      queueKitPassiveHit(context, combatant, { ...meowballHit, element }, primary, meowballHitbox);
  };

  // A full flask's drain starts ten Meowballs, the first after its first seconds and each after the interval, replacing
  // Those an earlier drain started and still run, as gcsim's drain stops them
  const startMeowballs = (context: KitContext, combatant: Combatant, element: Element): void => {
    const { body, kitEffectState } = context;
    removeMeowballs(kitEffectState);
    castKitField(kitEffectState, combatant.characterId, body.position, {
      id: MEOWBALL_FIELD_ID,
      nextTickSeconds: meowballFirstSeconds,
      onTick: (tickContext, tickIndex) => {
        if (tickIndex < MEOWBALL_COUNT) strikeMeowball(tickContext, combatant, element);
      },
      secondsRemaining: meowballFirstSeconds + (MEOWBALL_COUNT - 1) * meowballIntervalSeconds + SUMMON_LINGER_SECONDS,
      tickIntervalSeconds: meowballIntervalSeconds,
    });
  };

  // Drains the flask as gcsim's drainFlask does: its unfilled hit, or the filled hit given, then the pursuit and its drain
  // Timer end, the gauge and the absorbed element with them. The hit is a summon cast where the drain is. A full flask's
  // Drain at Ascendant Gleam buffs each Moonsign member, as Constellation 6 gives
  const drainFlask = (context: KitContext, body: KitBody, combatant: Combatant, filledHit: KitHit): void => {
    const { characterIdCombatantMap, kitEffectState, party } = context;
    const isFilled = readFlaskGauge(kitEffectState, combatant.characterId) >= FLASK_GAUGE_MAXIMUM;
    const isAscendantGleam = getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
    // The absorbed element is read before the drain clears it, for the Meowballs a full flask starts
    const absorbedElement = readFlaskElement(kitEffectState, combatant.characterId);
    removeKitEffects(
      kitEffectState,
      (effect) =>
        (effect.kind === "field" && (effect.id === PURSUIT_FIELD_ID || effect.id === DRAIN_FIELD_ID)) ||
        (effect.kind === "status" &&
          (effect.id === FLASK_GAUGE_STATUS_ID || effect.id.startsWith(FLASK_ABSORBED_STATUS_PREFIX))),
    );
    if (isFilled && combatant.constellationCount >= CONSTELLATION_6 && isAscendantGleam)
      for (const characterId of getDeployedCharacterIds(party))
        if (characterIdCombatantMap.get(characterId)?.kit.moonsignBenediction !== undefined) {
          buffKitMember(kitEffectState, characterId, {
            amount: CONSTELLATION_6_CRITICAL_RATE,
            attribute: Attribute.CriticalRate,
            secondsRemaining: CONSTELLATION_6_SECONDS,
            source: JAHODA_CONSTELLATION_6_SOURCE,
          });
          buffKitMember(kitEffectState, characterId, {
            amount: CONSTELLATION_6_CRITICAL_DAMAGE,
            attribute: Attribute.CriticalDamage,
            secondsRemaining: CONSTELLATION_6_SECONDS,
            source: JAHODA_CONSTELLATION_6_SOURCE,
          });
        }
    castKitSummon(kitEffectState, body, combatant, [isFilled ? filledHit : unfilledHit], {
      attackTag: AttackTag.ElementalSkill,
    });
    if (isFilled && isAscendantGleam && absorbedElement !== undefined)
      startMeowballs(context, combatant, absorbedElement);
  };

  const startPursuit = ({
    activeCombatant: combatant,
    body: { facing, height, position },
    kitEffectState,
  }: KitContext): void => {
    const { characterId } = combatant;
    // A press starts a new pursuit, which ends the Meowballs still running, as gcsim's Skill zeroes the flask and stops their ticks
    removeMeowballs(kitEffectState);
    const pursuit = castKitField(kitEffectState, characterId, position, {
      id: PURSUIT_FIELD_ID,
      isFollowing: true,
      nextTickSeconds: pursuitFirstFillSeconds,
      onTick: (tickContext) => {
        const { enemyMap, kitEffectState: tickState } = tickContext;
        const absorbed = findAbsorbedElement(
          [...enemyMap.values()].filter((enemy) => checkIsInAttackArea(circle, createKitBody(pursuit.centre), enemy)),
        );
        if (absorbed === undefined) return;
        const flaskElement = readFlaskElement(tickState, characterId);
        if (flaskElement === undefined)
          addKitStatus(tickState, characterId, {
            id: `${FLASK_ABSORBED_STATUS_PREFIX}${absorbed}`,
            secondsRemaining: pursuitSeconds,
          });
        const amount = flaskElement === undefined || flaskElement === absorbed ? flaskFillValue : flaskWeakFillValue;
        const gauge = Math.min(readFlaskGauge(tickState, characterId) + amount, FLASK_GAUGE_MAXIMUM);
        addKitStatus(tickState, characterId, {
          id: FLASK_GAUGE_STATUS_ID,
          secondsRemaining: pursuitSeconds,
          stacks: gauge,
        });
        if (gauge >= FLASK_GAUGE_MAXIMUM)
          drainFlask(tickContext, createKitBody(pursuit.centre), combatant, filledDrainHit);
      },
      radius: circle.radius,
      secondsRemaining: pursuitSeconds,
      tickIntervalSeconds: fillIntervalSeconds,
    });
    addKitStatus(kitEffectState, characterId, {
      id: FLASK_GAUGE_STATUS_ID,
      secondsRemaining: pursuitSeconds,
      stacks: 0,
    });
    // The drain timer ticks once, when the pursuit's frames run out, on no circle, so it drains wherever the body stands
    castKitField(kitEffectState, characterId, position, {
      id: DRAIN_FIELD_ID,
      nextTickSeconds: pursuitSeconds,
      onTick: (tickContext) => {
        drainFlask(tickContext, { facing, height, position }, combatant, filledPressHit);
      },
      secondsRemaining: pursuitSeconds + PURSUIT_TICK_EXTRA_SECONDS,
      tickIntervalSeconds: pursuitSeconds,
    });
  };

  // A heal tick of Hidden Aces, as gcsim runs it: while the active character is above 70% of her health, the member
  // With the lowest share of health is healed first, then the active character, each by a flat amount and a share of
  // The healer's ATK as it stood at the cast
  const healBurst =
    (healer: Combatant, healMultiplier: number) =>
    (context: KitContext): void => {
      const { activeCombatant, kitEffectState, party } = context;
      if (getPartyMember(party, activeCombatant.characterId).healthShare > BURST_ADDITIONAL_HEAL_HEALTH_SHARE) {
        // Ascension 4 gives the active character Elemental Mastery on each of these heals, restarting its buff
        if (healer.ascension >= JAHODA_ASCENSION_4)
          buffKitMember(kitEffectState, activeCombatant.characterId, {
            amount: JAHODA_ASCENSION_4_ELEMENTAL_MASTERY,
            attribute: Attribute.ElementalMastery,
            secondsRemaining: JAHODA_ASCENSION_4_SECONDS,
            source: JAHODA_ASCENSION_4_SOURCE,
          });
        const lowestCharacterId = findLowestHealthCharacterId(party);
        if (lowestCharacterId !== undefined)
          changeKitMemberHealth(
            context,
            healer,
            lowestCharacterId,
            (burstAdditionalFlatHeal + burstAdditionalAttackHealShare * healer.attributes.attack) * healMultiplier,
          );
      }
      changeKitMemberHealth(
        context,
        healer,
        activeCombatant.characterId,
        (burstFlatHeal + burstAttackHealShare * healer.attributes.attack) * healMultiplier,
      );
    };

  return {
    burst: {
      onStart: (context) => {
        const { activeCombatant, characterIdCombatantMap, kitEffectState, party } = context;
        const isAscendantGleam = getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
        const elementEffects = getJahodaElementEffects(
          activeCombatant.ascension,
          activeCombatant.constellationCount,
          isAscendantGleam,
          getDeployedCharacterIds(party).map((characterId) => characterIdCombatantMap.get(characterId)?.element),
        );
        schedulePeriodicKitTask(
          kitEffectState,
          activeCombatant.characterId,
          { firstSeconds: firstHealSeconds, intervalSeconds: healIntervalSeconds, untilSeconds: burstSeconds },
          healBurst(activeCombatant, elementEffects.healMultiplier),
        );
        // The robots are cast only at Ascendant Gleam, as gcsim reads the Moonsign level when she casts
        if (isAscendantGleam)
          startJahodaRobots(context, activeCombatant, burstSeconds, {
            absorbArea: robotAbsorbArea,
            absorbEnergy: getJahodaConstellationFourEnergy(activeCombatant.constellationCount),
            absorbFirstSeconds: robotAbsorbFirstSeconds,
            absorbIntervalSeconds: robotAbsorbIntervalSeconds * elementEffects.intervalMultiplier,
            absorbSpacingSeconds: robotAbsorbSpacingSeconds,
            robotCount: JAHODA_ROBOT_COUNT + elementEffects.extraRobots,
            strikeFirstSeconds: robotFirstStrikeSeconds,
            strikeHit: {
              ...robotStrikeHitFields,
              hitmarkSeconds: 0,
              internalCooldownTag: InternalCooldownTag.JahodaRobotStrike,
              talentMultiplier: robotStrikeHitFields.talentMultiplier * elementEffects.damageMultiplier,
            },
            strikeIntervalSeconds: robotStrikeIntervalSeconds * elementEffects.intervalMultiplier,
            strikeTargetCount: ROBOT_STRIKE_TARGET_COUNT,
          });
      },
    },
    skill: { onStart: startPursuit },
    // The second press drains the flask at once, its hit a summon cast where the body stands, since the hit depends on the
    // Gauge
    skillChain: [
      {
        onStart: (context) => {
          drainFlask(context, context.body, context.activeCombatant, filledPressHit);
        },
      },
    ],
  };
};
