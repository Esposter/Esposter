import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { takeOne } from "@esposter/shared";

export const CITLALI_CHARACTER_ID = 10_000_107;

// Her Nightsoul points hold 100 at most. Her burst gives 24, and her skill's press enters the Blessing for 20 seconds with
// Its points plus 24, as gcsim (MIT) citlali/burst.go and skill.go do
const NIGHTSOUL_MAXIMUM = 100;
const NIGHTSOUL_BURST_POINTS = 24;
const NIGHTSOUL_SKILL_POINTS = 24;
const NIGHTSOUL_BLESSING_SECONDS = 20;

// Ascension 4 gives four points on each Nightsoul burst that goes off on the team, and flat damage from Elemental Mastery:
// 12 on Ice Storm and 0.9 on each Frostfall Storm, as gcsim (MIT) citlali/asc.go's a4 and a4Dmg give them (lines 57 to 76)
const ASCENSION_4 = 4;
const ASCENSION_4_BURST_POINTS = 4;
const ICE_STORM_ELEMENTAL_MASTERY_SHARE = 12;
const FROSTFALL_STORM_ELEMENTAL_MASTERY_SHARE = 0.9;

// The Opal Fire takes effect in the Blessing at 50 points or more and drains 0.8 points every 6 frames, eight a second,
// until none is left, as gcsim (MIT) citlali/skill.go tryEnterOpalFireState and nightsoulPointReduceTask do. Itzpapa's
// Frostfall Storm strikes every 59 frames from when it takes effect, as skill.go's itzpapaInterval and itzpapaHitTask do
const OPAL_FIRE_POINTS = 50;
const OPAL_FIRE_DRAIN_POINTS = 0.8;
const OPAL_FIRE_DRAIN_FRAMES = 6;
const FROSTFALL_STORM_FRAMES = 59;
export const OPAL_FIRE_FIELD_ID = "citlali-opal-fire";

// Ice Storm summons a Spirit Vessel skull on each of the first three enemies within 7 metres of Citlali, each giving her three
// Points as it lands, and each draws its delay as the press is made: 30 to 60 frames after the 57 its record holds, as gcsim
// (MIT) citlali/burst.go lines 27 to 29 and 79 to 88 do
const SPIRIT_VESSEL_TARGET_AREA: AttackArea = { angle: 2 * Math.PI, height: 2, radius: 7 };
const SPIRIT_VESSEL_TARGET_LIMIT = 3;
const SPIRIT_VESSEL_POINTS = 3;
const SPIRIT_VESSEL_RANDOM_MINIMUM_FRAMES = 30;
const SPIRIT_VESSEL_RANDOM_FRAMES = 31;

// The flat base damage a hit adds from a share of its striker's Elemental Mastery, from Ascension 4
const createElementalMasteryFlatDamage =
  (share: number) =>
  (combatant: Combatant): number =>
    combatant.ascension >= ASCENSION_4 ? elementalMasteryMultiplier(combatant, share) : 0;

// Citlali's behaviour: her skill's press enters the Nightsoul Blessing for 20 seconds with its points plus 24, and her burst
// Gives 24 points. Built: the Opal Fire, and Itzpapa's Frostfall Storm, which strikes every enemy in its circle every 59
// Frames while the Opal Fire is on, its Cryo gauge sharing the Frostfall group's cooldown and its damage landing on every hit,
// and the Spirit Vessel skulls her burst summons on the first three enemies within 7 metres. Not built: Ascension 1 and
// Constellations 1, 2, 4 and 6, among them Constellation 6, which lets the Opal Fire start below 50 points and outlast its points
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/citlali/burst.go
export const createCitlaliKitBehaviour = ({
  kit,
  readFrames,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  // The Frostfall Storm as its record holds it, the strike every enemy in its circle takes on each storm
  const frostfallStormHit = readHit("frostfallStorm", {
    additiveBaseDamageBonus: createElementalMasteryFlatDamage(FROSTFALL_STORM_ELEMENTAL_MASTERY_SHARE),
  });
  // The Opal Shield as her record holds it: its share of Elemental Mastery and its flat health, which gcsim's shieldEM and
  // ShieldFlat give at her talent level, its seconds, and the frames after the press it comes at
  const opalShieldElementalMasteryShare = readParameter("opalShieldElementalMasteryShare");
  const opalShieldFlatHealth = readParameter("opalShieldFlatHealth");
  const opalShieldSeconds = readParameter("opalShieldSeconds");
  const opalShieldStartSeconds = readSeconds("opalShield");
  // The Spirit Vessel skull as her record holds it, the strike each skull lands on the enemies in its circle, and the frames
  // Its summon takes after the Ice Storm's hitmark, which her burst's record holds
  const spiritVesselSkullHit = readHit("spiritVesselSkull");
  const spiritVesselSkullFrames = readFrames("spiritVesselSkull");
  const iceStormHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;

  // Strikes every living enemy within a hit's area round a body, as the circle or fan the hit reaches them in
  const strikeEnemiesInArea = (context: KitContext, combatant: Combatant, hit: KitHit, body: KitBody) => {
    for (const enemy of context.enemyMap.values())
      if (enemy.health > 0 && checkIsInAttackArea(hit.hitArea, body, enemy))
        queueKitPassiveHit(context, combatant, hit, enemy);
  };

  // Summons a skull on each of the first three living enemies within 7 metres of the body as the burst is cast, each drawing
  // Its delay now, as gcsim's burst does. A skull lands where its enemy stands then: it gives Citlali her points and strikes
  // Every living enemy within its circle, centred on the enemy, as gcsim reads the enemy's position when the task runs
  const summonSpiritVesselSkulls = (context: KitContext) => {
    const { activeCombatant, body, enemyMap, kitEffectState, random } = context;
    const { characterId } = activeCombatant;
    const enemies = [...enemyMap.values()]
      .filter((enemy) => enemy.health > 0 && checkIsInAttackArea(SPIRIT_VESSEL_TARGET_AREA, body, enemy))
      .slice(0, SPIRIT_VESSEL_TARGET_LIMIT);
    for (const enemy of enemies) {
      const drawnFrames = Math.floor(random() * SPIRIT_VESSEL_RANDOM_FRAMES);
      const delayFrames = spiritVesselSkullFrames + SPIRIT_VESSEL_RANDOM_MINIMUM_FRAMES + drawnFrames;
      scheduleKitTask(
        kitEffectState,
        characterId,
        iceStormHitmarkSeconds + toKitSeconds(delayFrames),
        (tickContext) => {
          generateKitNightsoulPoints(tickContext, SPIRIT_VESSEL_POINTS, NIGHTSOUL_MAXIMUM, characterId);
          const combatant = tickContext.characterIdCombatantMap.get(characterId);
          if (combatant === undefined) return;
          strikeEnemiesInArea(tickContext, combatant, spiritVesselSkullHit, {
            facing: 0,
            height: 0,
            position: enemy.position,
          });
        },
      );
    }
  };

  // Puts the Opal Fire on the team's effects once Citlali is in the Blessing with 50 points or more and it is not on already,
  // as gcsim's tryEnterOpalFireState does. It is a field ticking every frame, so its drain and its storms fall on the frames
  // gcsim queues them on, from the frame it takes effect
  const enterOpalFire = (context: KitContext) => {
    const { activeCombatant, kitEffectState } = context;
    const { characterId } = activeCombatant;
    if (!hasKitNightsoulBlessing(kitEffectState.effects, characterId)) return;
    if (countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) < OPAL_FIRE_POINTS) return;
    if (
      kitEffectState.effects.some(
        (effect) => effect.kind === "field" && effect.id === OPAL_FIRE_FIELD_ID && effect.characterId === characterId,
      )
    )
      return;
    const opalFire = castKitField(
      kitEffectState,
      characterId,
      { x: 0, z: 0 },
      {
        id: OPAL_FIRE_FIELD_ID,
        nextTickSeconds: toKitSeconds(1),
        onTick: (tickContext, tickIndex) => {
          // A step ticks each tick due after a removal too, so a field no longer on the team ticks no more. Its Blessing ends
          // With it in the step it runs out, since the step runs the seconds down before the fields tick, leaving it at none,
          // As gcsim's exitNightsoul ends the Opal Fire (citlali/skill.go lines 93 to 98), rather than at a later drain
          if (!tickContext.kitEffectState.effects.includes(opalFire)) return;
          const blessing = findKitStatus(tickContext.kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID);
          if (!blessing || blessing.secondsRemaining <= 0) {
            removeKitEffects(tickContext.kitEffectState, (effect) => effect === opalFire);
            return;
          }
          const frame = tickIndex + 1;
          if (frame % FROSTFALL_STORM_FRAMES === 0)
            strikeEnemiesInArea(tickContext, activeCombatant, frostfallStormHit, tickContext.body);
          if (frame % OPAL_FIRE_DRAIN_FRAMES !== 0) return;
          drainKitNightsoulPoints(tickContext.kitEffectState, characterId, OPAL_FIRE_DRAIN_POINTS);
          if (countKitResource(tickContext.kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) === 0)
            removeKitEffects(tickContext.kitEffectState, (effect) => effect === opalFire);
        },
        secondsRemaining: Number.POSITIVE_INFINITY,
        tickIntervalSeconds: toKitSeconds(1),
      },
    );
  };

  return {
    burst: {
      hits: [{ additiveBaseDamageBonus: createElementalMasteryFlatDamage(ICE_STORM_ELEMENTAL_MASTERY_SHARE) }],
      onStart: (context) => {
        generateKitNightsoulPoints(context, NIGHTSOUL_BURST_POINTS, NIGHTSOUL_MAXIMUM);
        enterOpalFire(context);
        summonSpiritVesselSkulls(context);
      },
    },
    // Ascension 4 gives points on each Nightsoul burst that goes off anywhere on the team, on the field or off it, as gcsim's
    // OnNightsoulBurst subscription does
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.NightsoulBurst && combatant.ascension >= ASCENSION_4)
        generateKitNightsoulPoints(context, ASCENSION_4_BURST_POINTS, NIGHTSOUL_MAXIMUM, combatant.characterId);
    },
    skill: {
      onStart: (context) => {
        const { activeCombatant, kitEffectState } = context;
        const { characterId } = activeCombatant;
        enterKitNightsoulBlessing(kitEffectState, characterId, {
          points: countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) + NIGHTSOUL_SKILL_POINTS,
          secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
        });
        enterOpalFire(context);
        // The Opal Shield comes from the press as gcsim's addShield does (skill.go line 72), with the Elemental Mastery Citlali
        // holds when it comes, as shield.go reads it then
        scheduleKitTask(kitEffectState, characterId, opalShieldStartSeconds, (tickContext) => {
          const combatant = tickContext.characterIdCombatantMap.get(characterId);
          if (combatant === undefined) return;
          castKitShield(tickContext.kitEffectState, characterId, {
            element: Element.Cryo,
            health: elementalMasteryMultiplier(combatant, opalShieldElementalMasteryShare) + opalShieldFlatHealth,
            secondsRemaining: opalShieldSeconds,
          });
        });
      },
    },
  };
};
