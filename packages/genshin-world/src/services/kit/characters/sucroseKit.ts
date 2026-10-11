import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Sucrose's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds
// Astable Anemohypostasis Creation-6308's hit at 0 and its cooldown at 1. The burst group holds Forbidden Creation's
// Anemo tick at 0, its absorbed hit at 1, its seconds at 2, its cooldown at 3 and its energy cost at 4
const SUCROSE_ATTACK_GROUP_ID = 4331;
const SUCROSE_SKILL_GROUP_ID = 4332;
const SUCROSE_BURST_GROUP_ID = 4339;

// Measured: gcsim v2.47.2 (MIT) sucrose/attack.go, each strike's hitmark, its cancel frame and its circle's radius.
// The circle is round the body and priced as the far one of the reach.
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/attack.go
const NORMAL_ATTACK_STRIKES: { cancelFrames: number; hitArea: AttackArea; hitmarkFrames: number }[] = [
  { cancelFrames: 28, hitArea: createFanReach(360, 1), hitmarkFrames: 17 },
  { cancelFrames: 38, hitArea: createFanReach(360, 1), hitmarkFrames: 18 },
  { cancelFrames: 46, hitArea: createFanReach(360, 1), hitmarkFrames: 28 },
  { cancelFrames: 65, hitArea: createFanReach(360, 2), hitmarkFrames: 28 },
];

// Measured: gcsim v2.47.2 (MIT) sucrose/charge.go, the charged attack's box at 54 frames in an animation of 71
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/charge.go
const CHARGED_ATTACK_FRAMES = 71;
const CHARGED_ATTACK_HITMARK_FRAMES = 54;
const CHARGED_ATTACK_HIT_AREA = createBoxReach(-0.2, 3.2, 7.5);

// Measured: gcsim v2.47.2 (MIT) sucrose/plunge.go, the plunges' circles of radius 3 and 3.5 and the collision's of 1.5
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/plunge.go
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1.5);
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 3);
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 3.5);

// Measured: gcsim v2.47.2 (MIT) sucrose/skill.go, Astable Anemohypostasis Creation-6308's circle of radius 6 five metres
// Ahead of the body at 42 frames in an animation of 68, and its cooldown of 900 frames. The circle lands on the primary
// Target, so it is priced as the targeting area's reach plus its own radius, as the kit prices such a circle
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/skill.go
const SKILL_FRAMES = 68;
const SKILL_HITMARK_FRAMES = 42;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6);

// Measured: gcsim v2.47.2 (MIT) sucrose/burst.go, Forbidden Creation's animation of 65 frames, its field five metres ahead
// Of the body, whose Anemo tick lands at 137 frames and then every 113 frames while it lasts, and whose absorbed hit lands
// On each tick once an enemy's aura is taken. The field lasts the table's seconds, plus 2 from Constellation 2, and its
// Last tick falls at 5 frames past it. Its absorb check runs from 136 frames every 18 frames, the absorbing enemy's aura
// Taken from the first aura of Pyro, Hydro, Electro or Cryo an enemy within its reach carries
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/burst.go
const BURST_FRAMES = 65;
const BURST_OFFSET_METRES = 5;
const BURST_FIRST_TICK_FRAMES = 137;
const BURST_TICK_INTERVAL_FRAMES = 113;
const BURST_LAST_TICK_MARGIN_FRAMES = 5;
const BURST_TICK_HIT_AREA = createFanReach(360, 8);
const ABSORB_CHECK_OFFSET_METRES = 4;
const ABSORB_CHECK_FIRST_FRAMES = 136;
const ABSORB_CHECK_INTERVAL_FRAMES = 18;
// The absorb check's box is 2.5 metres square, priced as the circle round its centre that reaches its far corner
const ABSORB_CHECK_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(1.25, 1.25) });
// A summon's hit lands a frame after the summon is cast, as its hits fall after its cast and a step's tick is its first
const SUMMON_HIT_SECONDS = 1 / 60;
// The field lives a tenth of a second past its last tick, so the step that runs it still has it
const FIELD_LINGER_SECONDS = 0.1;
// Provisional: gcsim gives Sucrose's hits, plunges and field no poise, so these stand in until a source gives them
const STRIKE_POISE_DAMAGE = 0;
const CHARGED_ATTACK_POISE_DAMAGE = 0;
const SKILL_POISE_DAMAGE = 0;
const BURST_POISE_DAMAGE = 0;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;

// Sucrose's passives and constellations, as gcsim v2.47.2 (MIT) gives them. A1 raises the Elemental Mastery of the members
// Of the swirled element by 50 for 8 seconds on a Swirl she triggers, and A4 gives the rest of the team 20% of her
// Elemental Mastery for 8 seconds on each skill and burst hit. Constellation 2 lengthens the burst by 2 seconds, and
// Constellation 6 gives the team 20% DMG Bonus of the absorbed element for 10 seconds when the field absorbs one
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/asc.go
const SWIRL_ASCENSION = 1;
const SWIRL_ELEMENTAL_MASTERY_BONUS = 50;
const SWIRL_SECONDS = 8;
const SWIRL_SOURCE = "sucrose-swirl";
const SKILL_BURST_ASCENSION = 4;
const SKILL_BURST_ELEMENTAL_MASTERY_SHARE = 0.2;
const SKILL_BURST_SECONDS = 8;
const SKILL_BURST_SOURCE = "sucrose-skill-burst";
const FORBIDDEN_CREATION_CONSTELLATION = 2;
const FORBIDDEN_CREATION_EXTRA_SECONDS = 2;
const ABSORBED_ELEMENT_CONSTELLATION = 6;
const ABSORBED_ELEMENT_DAMAGE_BONUS = 0.2;
const ABSORBED_ELEMENT_SECONDS = 10;
const ABSORBED_ELEMENT_SOURCE = "sucrose-absorbed-element";

export const SUCROSE_CHARACTER_ID = 10_000_043;

// Sucrose's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Astable Anemohypostasis
// Creation-6308 with its Swirl, and Forbidden Creation-Isomer 75 / Type II with its field and absorbed hits. Her multipliers
// Are read from her proud skill groups. Her passives and Constellation 2 and 6 are built. The skill's pull is not, as no
// Enemy moves on a kit's terms, and Constellation 4 is not, as the kit has no cooldown to shorten. Her Hexerei team bonus
// Is not built, as the party does not count the Hexerei it needs
export const createSucroseKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const skillHit: KitHit = {
    element: Element.Anemo,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: SKILL_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, SUCROSE_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const burstTickHit: KitHit = {
    element: Element.Anemo,
    gauge: 1,
    hitArea: BURST_TICK_HIT_AREA,
    hitmarkSeconds: SUMMON_HIT_SECONDS,
    poiseDamage: BURST_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, SUCROSE_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const createAbsorbedHit = (element: Element): KitHit => ({
    ...burstTickHit,
    element,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, SUCROSE_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
  });

  const createNormalAttack = (
    { cancelFrames, hitArea, hitmarkFrames }: (typeof NORMAL_ATTACK_STRIKES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        element: Element.Anemo,
        gauge: 1,
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: STRIKE_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, SUCROSE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const plungeAction = (hitArea: AttackArea, poiseDamage: number, index: number): KitAction => ({
    hits: [
      {
        element: Element.Anemo,
        hitArea,
        hitmarkSeconds: 0,
        poiseDamage,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, SUCROSE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: 0.4,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, SUCROSE_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, SUCROSE_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    chargedAttack: {
      hits: [
        {
          element: Element.Anemo,
          gauge: 1,
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, SUCROSE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, SUCROSE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
    // The burst's two fields are set as it is cast: the Anemo tick's, and the absorb check's, which lands the absorbed
    // Element's hit on every tick once an enemy's aura is taken, and which takes one only once
    elementalBurst: {
      hits: [],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const centreBody = createAheadBody(body, BURST_OFFSET_METRES);
        const absorbBody = createAheadBody(body, ABSORB_CHECK_OFFSET_METRES);
        const isConstellation2 = combatant.constellationCount >= FORBIDDEN_CREATION_CONSTELLATION;
        const durationSeconds =
          getTalentMultiplier(talentMultiplierMap, SUCROSE_BURST_GROUP_ID, TALENT_START_LEVEL, 2) +
          (isConstellation2 ? FORBIDDEN_CREATION_EXTRA_SECONDS : 0);
        const secondsRemaining = durationSeconds + BURST_LAST_TICK_MARGIN_FRAMES / 60 + FIELD_LINGER_SECONDS;
        let absorbedElement: Element | undefined;
        const centre = { x: centreBody.position.x, z: centreBody.position.z };
        const tickField: KitField = {
          centre,
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: BURST_FIRST_TICK_FRAMES / 60,
          onTick: ({ kitEffectState: tickState }) => {
            addKitEffect(tickState, createKitSummon(centreBody, combatant, [burstTickHit]));
            if (absorbedElement !== undefined)
              addKitEffect(tickState, createKitSummon(centreBody, combatant, [createAbsorbedHit(absorbedElement)]));
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining,
          tickIndex: 0,
          tickIntervalSeconds: BURST_TICK_INTERVAL_FRAMES / 60,
        };
        const absorbField: KitField = {
          centre,
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: ABSORB_CHECK_FIRST_FRAMES / 60,
          onTick: ({ enemyMap, kitEffectState: tickState, party }) => {
            if (absorbedElement !== undefined) return;
            absorbedElement = findAbsorbedElement(
              [...enemyMap.values()].filter((enemy) => checkIsInAttackArea(ABSORB_CHECK_AREA, absorbBody, enemy)),
            );
            if (absorbedElement === undefined || combatant.constellationCount < ABSORBED_ELEMENT_CONSTELLATION) return;
            for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
              addKitEffect(tickState, {
                amount: ABSORBED_ELEMENT_DAMAGE_BONUS,
                attribute: ElementDamageBonusAttributeMap[absorbedElement],
                characterId,
                kind: "buff",
                secondsRemaining: ABSORBED_ELEMENT_SECONDS,
                source: ABSORBED_ELEMENT_SOURCE,
              });
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining,
          tickIndex: 0,
          tickIntervalSeconds: ABSORB_CHECK_INTERVAL_FRAMES / 60,
        };
        addKitEffect(kitEffectState, tickField);
        addKitEffect(kitEffectState, absorbField);
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [skillHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: plungeAction(HIGH_PLUNGE_HIT_AREA, HIGH_PLUNGE_POISE_DAMAGE, 8),
    lowPlunge: plungeAction(LOW_PLUNGE_HIT_AREA, LOW_PLUNGE_POISE_DAMAGE, 7),
    normalAttacks: NORMAL_ATTACK_STRIKES.map((strike, index) => createNormalAttack(strike, index)),
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      const members = party.teams[party.deployedTeamIndex]?.characterIds ?? [];
      if (event.kind === KitEventKind.ReactionTriggered) {
        if (combatant.ascension < SWIRL_ASCENSION || event.striker.characterId !== combatant.characterId) return;
        for (const reaction of event.reactions) {
          if (reaction.reactionType !== ReactionType.Swirl || reaction.element === undefined) continue;
          for (const characterId of members)
            if (characterIdCombatantMap.get(characterId)?.element === reaction.element)
              addKitEffect(kitEffectState, {
                amount: SWIRL_ELEMENTAL_MASTERY_BONUS,
                attribute: Attribute.ElementalMastery,
                characterId,
                kind: "buff",
                secondsRemaining: SWIRL_SECONDS,
                source: SWIRL_SOURCE,
              });
        }
      } else if (event.kind === KitEventKind.DamageTaken) {
        if (
          combatant.ascension < SKILL_BURST_ASCENSION ||
          event.striker.characterId !== combatant.characterId ||
          (event.hit !== skillHit && event.hit !== burstTickHit)
        )
          return;
        const amount =
          SKILL_BURST_ELEMENTAL_MASTERY_SHARE * event.striker.attributes.attributeTotalMap[Attribute.ElementalMastery];
        for (const characterId of members)
          if (characterId !== combatant.characterId)
            addKitEffect(kitEffectState, {
              amount,
              attribute: Attribute.ElementalMastery,
              characterId,
              kind: "buff",
              secondsRemaining: SKILL_BURST_SECONDS,
              source: SKILL_BURST_SOURCE,
            });
      }
    },
    plungeCollision: {
      element: Element.Anemo,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, SUCROSE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, SUCROSE_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
};
