import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";

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

// The flat base damage a hit adds from a share of its striker's Elemental Mastery, from Ascension 4
const createElementalMasteryFlatDamage =
  (share: number) =>
  ({ ascension, attributes }: Combatant): number =>
    ascension >= ASCENSION_4 ? share * attributes.attributeTotalMap[Attribute.ElementalMastery] : 0;

// Citlali's behaviour: her skill's press enters the Nightsoul Blessing for 20 seconds with its points plus 24, and her burst
// Gives 24 points. Built: the Opal Fire, and Itzpapa's Frostfall Storm, which strikes every enemy in its circle every 59
// Frames while the Opal Fire is on, its Cryo gauge sharing the Frostfall group's cooldown and its damage landing on every hit
// Not built: Ascension 1 and Constellations 1, 2, 4 and 6, among them Constellation 6, which lets the Opal Fire start below
// 50 points and outlast its points, Itzpapa's Opal Shield, and the skulls her burst summons on enemies within 7 metres,
// Which the burst's start cannot place since it reads no enemies but its target
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/citlali/burst.go
export const createCitlaliKitBehaviour = ({ readHit }: KitRecordReader): KitBehaviour => {
  // The Frostfall Storm as its record holds it, the strike every enemy in its circle takes on each storm
  const frostfallStormHit = readHit("frostfallStorm", {
    additiveBaseDamageBonus: createElementalMasteryFlatDamage(FROSTFALL_STORM_ELEMENTAL_MASTERY_SHARE),
  });

  // Strikes every living enemy in the Frostfall Storm's circle round the body, the circle gcsim centres on the player
  const strikeFrostfallStorm = (context: KitContext, combatant: Combatant) => {
    const { body, enemyMap } = context;
    for (const enemy of enemyMap.values())
      if (enemy.health > 0 && checkIsInAttackArea(frostfallStormHit.hitArea, body, enemy))
        queueKitPassiveHit(context, combatant, frostfallStormHit, enemy);
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
          if (frame % FROSTFALL_STORM_FRAMES === 0) strikeFrostfallStorm(tickContext, activeCombatant);
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
      },
    },
  };
};
