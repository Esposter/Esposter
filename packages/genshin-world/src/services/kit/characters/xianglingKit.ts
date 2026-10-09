import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Xiangling's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the third
// Of two hits and the fourth of four at their one value, the charged attack at 5 and its stamina at 6, and the plunges'
// Collision, low and high at 7, 8 and 9. The skill group holds Guoba's flame at 0 and the skill's cooldown at 1. The
// Burst group holds the three swings at 0 to 2, the Pyronado at 3, its seconds at 4, and the burst's cooldown and energy
// Cost at 5 and 6
const XIANGLING_ATTACK_GROUP_ID = 2331;
const XIANGLING_SKILL_GROUP_ID = 2332;
const XIANGLING_BURST_GROUP_ID = 2339;

// Measured: gcsim v2.47.2 (MIT) xiangling/attack.go, each strike's box from the body, 1.2 wide and 3 long for the first
// And 1.6 or 1.2 wide and 3.3 long for the rest, which gcsim spawns on its near edge, so each is priced as the circle to
// Its far corner until an area holds a box
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiangling/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(3, 1.2 / 2),
});
const WIDE_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(3.3, 1.6 / 2),
});
const NARROW_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(3.3, 1.2 / 2),
});
// Measured: gcsim v2.47.2 (MIT) xiangling/plunge.go, the collision's circle of radius 1 and the low and high plunges' of 3
// And 5, each centred a metre ahead, so each reach is its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiangling/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 5 });
// Measured: gcsim v2.47.2 (MIT) xiangling/guoba.go, Guoba placed 1.3 metres ahead of the body, breathing a 60 degree fan
// Of radius 5, which Crossfire widens by 20%. gcsim turns Guoba to its closest enemy before each breath, which a summon
// Cannot, so the fan is priced as its whole circle round Guoba
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiangling/guoba.go
const GUOBA_OFFSET = 1.3;
const GUOBA_FLAME_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
const CROSSFIRE_GUOBA_FLAME_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.2 * 5 });
// Measured: gcsim v2.47.2 (MIT) xiangling/burst.go, the swings' circles of radius 2.5, 2.5 and 3 round the body, and the
// Pyronado's of 2.5 round the body on the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiangling/burst.go
const SWING_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.5 });
const THIRD_SWING_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const PYRONADO_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.5 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) xiangling/attack.go, each strike's hitmarks and the animation that ends it at 60 fps.
// Each hit's poise is the wiki's Dough-Fu advanced properties
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiangling/attack.go
const FIFTH_STRIKE_HITMARK_FRAMES = 21;
const XIANGLING_STRIKES = [
  { frames: 20, hits: [{ hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 12, poiseDamage: 16 }] },
  { frames: 17, hits: [{ hitArea: WIDE_STRIKE_HIT_AREA, hitmarkFrames: 8, poiseDamage: 19.2 }] },
  {
    frames: 28,
    hits: [
      { hitArea: WIDE_STRIKE_HIT_AREA, hitmarkFrames: 11, poiseDamage: 19.2 },
      { hitArea: NARROW_STRIKE_HIT_AREA, hitmarkFrames: 18, poiseDamage: 20 },
    ],
  },
  {
    frames: 37,
    hits: [
      { hitArea: NARROW_STRIKE_HIT_AREA, hitmarkFrames: 5, poiseDamage: 19.2 },
      { hitArea: NARROW_STRIKE_HIT_AREA, hitmarkFrames: 15, poiseDamage: 19.2 },
      { hitArea: NARROW_STRIKE_HIT_AREA, hitmarkFrames: 24, poiseDamage: 19.2 },
      { hitArea: NARROW_STRIKE_HIT_AREA, hitmarkFrames: 29, poiseDamage: 12.8 },
    ],
  },
  {
    frames: 70,
    hits: [{ hitArea: WIDE_STRIKE_HIT_AREA, hitmarkFrames: FIFTH_STRIKE_HITMARK_FRAMES, poiseDamage: 71.2 }],
  },
];

// Measured: gcsim v2.47.2 (MIT) xiangling/skill.go and guoba.go, Guoba spawning 13 frames into the 39 of the skill's
// Animation and standing 438 frames from then, breathing four times every 100 frames from 126 frames past the cast
const SKILL_FRAMES = 39;
const GUOBA_FRAMES = 13 + 438;
const GUOBA_FIRST_BREATH_FRAMES = 126;
const GUOBA_BREATH_INTERVAL_FRAMES = 100;
const GUOBA_BREATH_COUNT = 4;
// Crossfire, from Ascension 1, widens Guoba's flame by 20%, as the wiki's passive page and gcsim v2.47.2 (MIT)
// Xiangling/asc.go give it
// https://genshin-impact.fandom.com/wiki/Crossfire
const CROSSFIRE_ASCENSION = 1;
// Beware, It's Super Hot!, from Ascension 4, leaves a chili pepper where Guoba disappears for 10 seconds, and the character
// Who picks it up gains 10% ATK for 10 seconds, as the wiki's passive page gives it. Provisional: no source gives the
// Pepper's pickup reach, so the body on the field picks it up within a metre of it
// https://genshin-impact.fandom.com/wiki/Beware,_It%27s_Super_Hot!
const BEWARE_ITS_SUPER_HOT_ASCENSION = 4;
const CHILI_PEPPER_SECONDS = 10;
const CHILI_PEPPER_PICKUP_RADIUS = 1;
const CHILI_PEPPER_ATTACK_SHARE = 0.1;
const CHILI_PEPPER_BUFF_SECONDS = 10;
const CHILI_PEPPER_SOURCE = "Chili Pepper";
// Crispy Outside, Tender Inside, from one constellation, takes 15% off the Pyro RES of each enemy Guoba strikes for 6
// Seconds, as the wiki's constellation page and gcsim v2.47.2 (MIT) xiangling/cons.go give it
// https://genshin-impact.fandom.com/wiki/Crispy_Outside,_Tender_Inside
const CRISPY_OUTSIDE_TENDER_INSIDE_CONSTELLATION = 1;
const CRISPY_OUTSIDE_TENDER_INSIDE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "xiangling-crispy-outside-tender-inside",
  resistanceReduction: { [Element.Pyro]: 0.15 },
  secondsRemaining: 6,
};
// Oil Meets Fire, from two constellations, explodes 2 seconds after the fifth strike's hit for 75% of Xiangling's ATK as
// 1U of Pyro with no internal cooldown and 8.8 poise, as the wiki's constellation page gives it, and gcsim v2.47.2 (MIT)
// Xiangling/cons.go lands it 120 frames past the hit, on a circle of radius 2 round the enemy struck, which an area does
// Not hold, so it reaches what the fifth strike reaches
// https://genshin-impact.fandom.com/wiki/Oil_Meets_Fire
const OIL_MEETS_FIRE_CONSTELLATION = 2;
const IMPLODE_HIT: KitHit = {
  element: Element.Pyro,
  gauge: 1,
  hitArea: WIDE_STRIKE_HIT_AREA,
  hitmarkSeconds: (FIFTH_STRIKE_HITMARK_FRAMES + 120) / 60,
  poiseDamage: 8.8,
  talentMultiplier: 0.75,
};
// Measured: gcsim v2.47.2 (MIT) xiangling/burst.go, the three swings at 18, 33 and 57 frames, the Pyronado's ticks every 73
// Frames from 56 for its seconds, and the animation's 80
const SWING_HITMARK_FRAMES = [18, 33, 57];
const PYRONADO_START_FRAMES = 56;
const PYRONADO_TICK_INTERVAL_FRAMES = 73;
const BURST_FRAMES = 80;
// Slowbake, from four constellations, lengthens the Pyronado by 40%, as the wiki's constellation page and gcsim v2.47.2
// (MIT) xiangling/burst.go give it
// https://genshin-impact.fandom.com/wiki/Slowbake
const SLOWBAKE_CONSTELLATION = 4;
const SLOWBAKE_DURATION_MULTIPLIER = 1.4;
// Condensed Pyronado, from six constellations, gives every party member a 15% Pyro DMG Bonus for the Pyronado's seconds,
// From its start, as the wiki's constellation page and gcsim v2.47.2 (MIT) xiangling/cons.go give it
// https://genshin-impact.fandom.com/wiki/Condensed_Pyronado
const CONDENSED_PYRONADO_CONSTELLATION = 6;
const CONDENSED_PYRONADO_PYRO_DAMAGE_BONUS = 0.15;
const CONDENSED_PYRONADO_SOURCE = "Condensed Pyronado";

// Guoba's chili pepper, left where Guoba disappears for its seconds, which the body on the field picks up by standing
// Within its reach: the character on the field gains its ATK, as a flat share of its base ATK, and the pepper is gone
const createChiliPepper = (owner: Combatant, centre: GroundPoint): KitField => {
  const chiliPepper: KitField = {
    centre,
    characterId: owner.characterId,
    kind: "field",
    nextTickSeconds: GUOBA_FRAMES / 60,
    onTick: ({ activeCombatant, kitEffectState }) => {
      addKitEffect(kitEffectState, {
        amount: CHILI_PEPPER_ATTACK_SHARE * activeCombatant.attributes.attributeTotalMap[Attribute.BaseAttack],
        attribute: Attribute.Attack,
        characterId: activeCombatant.characterId,
        kind: "buff",
        secondsRemaining: CHILI_PEPPER_BUFF_SECONDS,
        source: CHILI_PEPPER_SOURCE,
      });
      kitEffectState.effects = kitEffectState.effects.filter((effect) => effect !== chiliPepper);
    },
    radius: CHILI_PEPPER_PICKUP_RADIUS,
    secondsRemaining: GUOBA_FRAMES / 60 + CHILI_PEPPER_SECONDS,
    tickIndex: 0,
    tickIntervalSeconds: FIXED_STEP_SECONDS,
  };
  return chiliPepper;
};

// Xiangling's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Guoba Attack's
// Guoba, and Pyronado's swings and the Pyronado. Its multipliers are read from her proud skill groups
export const createXianglingKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const pyronadoSeconds = getTalentMultiplier(talentMultiplierMap, XIANGLING_BURST_GROUP_ID, TALENT_START_LEVEL, 4);
  // A polearm's strikes are physical under the Normal Attack internal cooldown. From two constellations, the fifth casts
  // Oil Meets Fire's Implode as it starts, a summon where Xiangling stands landing 2 seconds past the strike's hit
  const normalAttacks = XIANGLING_STRIKES.map(({ frames, hits }, index): KitAction => {
    const talentMultiplier = getTalentMultiplier(
      talentMultiplierMap,
      XIANGLING_ATTACK_GROUP_ID,
      TALENT_START_LEVEL,
      index,
    );
    return {
      hits: hits.map(({ hitArea, hitmarkFrames, poiseDamage }) => ({
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage,
        talentMultiplier,
      })),
      onStart: ({ body: { facing, height, position }, combatant, kitEffectState }) => {
        if (index < XIANGLING_STRIKES.length - 1 || combatant.constellationCount < OIL_MEETS_FIRE_CONSTELLATION) return;
        addKitEffect(kitEffectState, {
          body: { facing, height, position: { x: position.x, z: position.z } },
          combatant,
          elapsedSeconds: 0,
          hits: [IMPLODE_HIT],
          kind: "summon",
          // The summon lives a tenth of a second past its hit, so the step that lands it still has it
          secondsRemaining: IMPLODE_HIT.hitmarkSeconds + 0.1,
        });
      },
      seconds: frames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    };
  });
  // The wiki's Guoba Attack gives each breath 1U of Pyro with no internal cooldown and 32 poise, and from one
  // Constellation each takes Crispy Outside, Tender Inside's Pyro RES
  const guobaFlameMultiplier = getTalentMultiplier(
    talentMultiplierMap,
    XIANGLING_SKILL_GROUP_ID,
    TALENT_START_LEVEL,
    0,
  );
  const createGuobaBreaths = (hitArea: AttackArea): KitHit[] =>
    Array.from({ length: GUOBA_BREATH_COUNT }, (_value, index): KitHit => ({
      element: Element.Pyro,
      enemyStatus: (combatant) =>
        combatant.constellationCount >= CRISPY_OUTSIDE_TENDER_INSIDE_CONSTELLATION
          ? CRISPY_OUTSIDE_TENDER_INSIDE_STATUS
          : undefined,
      gauge: 1,
      hitArea,
      hitmarkSeconds: (GUOBA_FIRST_BREATH_FRAMES + GUOBA_BREATH_INTERVAL_FRAMES * index) / 60,
      poiseDamage: 32,
      talentMultiplier: guobaFlameMultiplier,
    }));
  const guobaBreaths = createGuobaBreaths(GUOBA_FLAME_HIT_AREA);
  const crossfireGuobaBreaths = createGuobaBreaths(CROSSFIRE_GUOBA_FLAME_HIT_AREA);
  // The wiki's Pyronado gives each tick 1U of Pyro with no internal cooldown and 30 poise, ticking for its seconds
  const pyronadoMultiplier = getTalentMultiplier(talentMultiplierMap, XIANGLING_BURST_GROUP_ID, TALENT_START_LEVEL, 3);
  const createPyronadoTicks = (seconds: number): KitHit[] =>
    Array.from({ length: Math.floor((seconds * 60) / PYRONADO_TICK_INTERVAL_FRAMES) + 1 }, (_value, index): KitHit => ({
      element: Element.Pyro,
      gauge: 1,
      hitArea: PYRONADO_HIT_AREA,
      hitmarkSeconds: (PYRONADO_START_FRAMES + PYRONADO_TICK_INTERVAL_FRAMES * index) / 60,
      poiseDamage: 30,
      talentMultiplier: pyronadoMultiplier,
    }));
  const pyronadoTicks = createPyronadoTicks(pyronadoSeconds);
  const slowbakePyronadoTicks = createPyronadoTicks(SLOWBAKE_DURATION_MULTIPLIER * pyronadoSeconds);
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XIANGLING_BURST_GROUP_ID, TALENT_START_LEVEL, 5),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, XIANGLING_BURST_GROUP_ID, TALENT_START_LEVEL, 6),
    // Measured: gcsim v2.47.2 (MIT) xiangling/charge.go, the lunge's hit at 24 frames after a strike and its animation's
    // 69. gcsim centres its circle of radius 0.8 on the primary target, which an area does not hold, so it reaches as far
    // As the strikes' widest box. The wiki's Dough-Fu gives it 120 poise under the Charged Attack internal cooldown
    chargedAttack: {
      hits: [
        {
          hitArea: WIDE_STRIKE_HIT_AREA,
          hitmarkSeconds: 24 / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: 120,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIANGLING_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
        },
      ],
      seconds: 69 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The table's 25 stamina for the lunge, spent as it starts
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, XIANGLING_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    // The wiki's Pyronado gives the swings 1U of Pyro under the Elemental Burst internal cooldown and 30 poise. The
    // Pyronado is a summon that follows the body on the field, whoever it is, for its seconds, which Slowbake lengthens
    // From four constellations. From six, a field with no edge ticks once as the Pyronado starts, giving every member of
    // The team Condensed Pyronado's Pyro DMG Bonus for its seconds
    elementalBurst: {
      hits: SWING_HITMARK_FRAMES.map((hitmarkFrames, index): KitHit => ({
        element: Element.Pyro,
        gauge: 1,
        hitArea: index === SWING_HITMARK_FRAMES.length - 1 ? THIRD_SWING_HIT_AREA : SWING_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: 30,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIANGLING_BURST_GROUP_ID, TALENT_START_LEVEL, index),
      })),
      onStart: ({ body: { facing, height, position }, combatant, kitEffectState }) => {
        const isSlowbake = combatant.constellationCount >= SLOWBAKE_CONSTELLATION;
        const seconds = isSlowbake ? SLOWBAKE_DURATION_MULTIPLIER * pyronadoSeconds : pyronadoSeconds;
        addKitEffect(kitEffectState, {
          body: { facing, height, position: { x: position.x, z: position.z } },
          combatant,
          elapsedSeconds: 0,
          hits: isSlowbake ? slowbakePyronadoTicks : pyronadoTicks,
          isFollowing: true,
          kind: "summon",
          secondsRemaining: PYRONADO_START_FRAMES / 60 + seconds,
        });
        if (combatant.constellationCount < CONDENSED_PYRONADO_CONSTELLATION) return;
        addKitEffect(kitEffectState, {
          centre: { x: position.x, z: position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: PYRONADO_START_FRAMES / 60,
          onTick: ({ kitEffectState: tickKitEffectState, party }) => {
            for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
              addKitEffect(tickKitEffectState, {
                amount: CONDENSED_PYRONADO_PYRO_DAMAGE_BONUS,
                attribute: Attribute.PyroDamageBonus,
                characterId,
                kind: "buff",
                secondsRemaining: seconds,
                source: CONDENSED_PYRONADO_SOURCE,
              });
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          // The field lives a tenth of a second past its tick, so the step that runs it still has it
          secondsRemaining: PYRONADO_START_FRAMES / 60 + 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Guoba is a summon cast 1.3 metres ahead of where Xiangling faces, breathing from there, its flame widened from
    // Ascension 1. From Ascension 4, it leaves its chili pepper where it stood as its seconds end
    elementalSkill: {
      hits: [],
      onStart: ({ body: { facing, height, position }, combatant, kitEffectState }) => {
        // Ahead of a body at its facing lies the bearing -sin and -cos of that facing, as computeFacingAngle reads it
        const guobaPosition = {
          x: position.x - Math.sin(facing) * GUOBA_OFFSET,
          z: position.z - Math.cos(facing) * GUOBA_OFFSET,
        };
        addKitEffect(kitEffectState, {
          body: { facing, height, position: guobaPosition },
          combatant,
          elapsedSeconds: 0,
          hits: combatant.ascension >= CROSSFIRE_ASCENSION ? crossfireGuobaBreaths : guobaBreaths,
          kind: "summon",
          secondsRemaining: GUOBA_FRAMES / 60,
        });
        if (combatant.ascension < BEWARE_ITS_SUPER_HOT_ASCENSION) return;
        addKitEffect(kitEffectState, createChiliPepper(combatant, { x: guobaPosition.x, z: guobaPosition.z }));
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) xiangling/plunge.go, the low plunge at 45 frames and the high at 46, both ending at
    // 77. The wiki's Dough-Fu gives them 100 and 150 poise, both blunt
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 46 / 60,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIANGLING_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 77 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 45 / 60,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIANGLING_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: 77 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 25, and it applies no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIANGLING_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    },
    // The group's, the wiki's and gcsim's 12 seconds
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XIANGLING_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
};
