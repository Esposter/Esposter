import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Klee's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack at 3 and its stamina at 4, and the plunges' collision, low and high at 5, 6 and 7. The skill group holds Jumpy
// Dumpty's three bounces at 0 to 2, a mine at 3, the mines' 15 seconds at 4, which nothing reads, and the skill's
// Cooldown at 5. The burst group holds a spark at 0, the burst's cooldown and energy cost at 1 and 2, Chained Reactions'
// Spark at 3, which nothing reads, and the burst's 10 seconds at 4
const KLEE_ATTACK_GROUP_ID = 2931;
const KLEE_SKILL_GROUP_ID = 2932;
const KLEE_BURST_GROUP_ID = 2939;

// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });
// Measured: gcsim v2.47.2 (MIT) klee/charge.go, skill.go and burst.go. The charged attack's bomb is a circle on the primary
// Target of radius 3, a bounce one of 4, a mine one of 2 and a spark one of 1.5
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/klee/skill.go
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 3);
const BOUNCE_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 4);
const MINE_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 2);
const SPARK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 1.5);
// Measured: gcsim v2.47.2 (MIT) klee/plunge.go and burst.go, circles round the body of radius 1.5 for the collision, 3
// For the low plunge, 3.5 for the high and 5 for Sparkly Explosion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/klee/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
const SPARKLY_EXPLOSION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });

// Measured: gcsim v2.47.2 (MIT) klee/attack.go, each strike's bomb thrown at 16, 23 and 37 frames and landing past
// Gcsim's default travel of 10, in animations of 34, 41 and 77, as circles on the primary target of radius 1, 1 and 1.5.
// The poise is the wiki's Kaboom! and gcsim's
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/klee/attack.go
const BOMB_TRAVEL_FRAMES = 10;
const KLEE_STRIKES = [
  { frames: 34, hitmarkFrames: 16, poiseDamage: 65, radius: 1 },
  { frames: 41, hitmarkFrames: 23, poiseDamage: 65, radius: 1 },
  { frames: 77, hitmarkFrames: 37, poiseDamage: 130, radius: 1.5 },
];
// Measured: gcsim v2.47.2 (MIT) klee/charge.go, the charge after a first or second strike, which skips 14 frames of its
// Windup there: its bomb landing at 76 frames past the travel, and its animation's 113
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/klee/charge.go
const CHARGED_ATTACK_WINDUP_FRAMES = 14;
const CHARGED_ATTACK_HITMARK_FRAMES = 76;
const CHARGED_ATTACK_FRAMES = 113;
// Measured: gcsim v2.47.2 (MIT) klee/skill.go, the bounces at 71, 111 and 140 frames and the animation's 75
const BOUNCE_HITMARK_FRAMES = [71, 111, 140];
const SKILL_FRAMES = 75;
// Provisional: gcsim v2.47.2 (MIT) klee/skill.go's defaults for the mines one enemy takes, 2 of the wiki's 8 at 240
// Frames, which stand in for the contact that sets a mine off
const MINE_HIT_COUNT = 2;
const MINE_HITMARK_FRAMES = 240;
// Measured: gcsim v2.47.2 (MIT) klee/burst.go, the burst standing from 146 frames, its six waves at 186 to 718 frames,
// Each a spark and two more 12 and 24 frames on, and the animation's 139
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/klee/burst.go
const BURST_START_FRAMES = 146;
const WAVE_HITMARK_FRAMES = [186, 294, 401, 503, 610, 718];
const WAVE_SPARK_OFFSET_FRAMES = [0, 12, 24];
const BURST_FRAMES = 139;
// Jumpy Dumpty holds 2 charges, as the skill set, the wiki's skill page and gcsim v2.47.2 (MIT) klee/klee.go give it
// https://genshin-impact.fandom.com/wiki/Jumpy_Dumpty
const JUMPY_DUMPTY_CHARGES = 2;
// Sparkly Explosion, from four constellations, deals 555% of Klee's ATK as she leaves the field while Sparks 'n' Splash
// Stands, as the wiki's constellation page and gcsim v2.47.2 (MIT) klee/burst.go give it
// https://genshin-impact.fandom.com/wiki/Sparkly_Explosion
const SPARKLY_EXPLOSION_CONSTELLATION = 4;
const SPARKLY_EXPLOSION_MULTIPLIER = 5.55;
// Blazing Delight, from six constellations, gives every party member 10% Pyro DMG Bonus for 25 seconds as Sparks 'n'
// Splash is used, as the wiki's constellation page and gcsim v2.47.2 (MIT) klee/burst.go give it
// https://genshin-impact.fandom.com/wiki/Blazing_Delight
const BLAZING_DELIGHT_CONSTELLATION = 6;
const BLAZING_DELIGHT_PYRO_DAMAGE_BONUS = 0.1;
const BLAZING_DELIGHT_SECONDS = 25;
const BLAZING_DELIGHT_SOURCE = "Blazing Delight";

// Klee's first kit, at talent level 1: three strikes, a charged attack, a collision and two plunges, Jumpy Dumpty's
// Bounces and mines on its two charges, and Sparks 'n' Splash's sparks while she stays on the field, with Sparkly
// Explosion and Blazing Delight's Pyro DMG Bonus. Its multipliers are read from her proud skill groups
export const createKleeKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  // The wiki's Kaboom! gives each strike's bomb 1U of Pyro under the Klee Pyro DMG internal cooldown, blunt. A bomb lands
  // From a summon cast where Klee stands as the strike starts, as gcsim throws it whatever cancels the strike
  const normalAttacks = KLEE_STRIKES.map(({ frames, hitmarkFrames, poiseDamage, radius }, index): KitAction => {
    const bomb: KitHit = {
      element: Element.Pyro,
      gauge: 1,
      hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, radius),
      hitmarkSeconds: (hitmarkFrames + BOMB_TRAVEL_FRAMES) / 60,
      internalCooldownTag: InternalCooldownTag.KleePyroDamage,
      isBlunt: true,
      poiseDamage,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
    };
    return {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [bomb])),
      seconds: frames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    };
  });
  // The wiki's Kaboom! gives the charged attack's bomb 1U of Pyro with no internal cooldown, 180 poise and blunt
  const chargedAttackBomb: KitHit = {
    element: Element.Pyro,
    gauge: 1,
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: (CHARGED_ATTACK_HITMARK_FRAMES - CHARGED_ATTACK_WINDUP_FRAMES + BOMB_TRAVEL_FRAMES) / 60,
    isBlunt: true,
    poiseDamage: 180,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
  };
  // The wiki's Jumpy Dumpty and Elemental Gauge Theory give each bounce 1U of Pyro and the third, the bomb's explosion,
  // 2U, as gcsim does, and each mine 1U, all under the Klee Pyro DMG internal cooldown with 40 poise, the bounces blunt
  const mine: KitHit = {
    element: Element.Pyro,
    gauge: 1,
    hitArea: MINE_HIT_AREA,
    hitmarkSeconds: MINE_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.KleePyroDamage,
    poiseDamage: 40,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
  };
  const jumpyDumptyHits: KitHit[] = [
    ...BOUNCE_HITMARK_FRAMES.map((hitmarkFrames, index): KitHit => ({
      element: Element.Pyro,
      gauge: index === BOUNCE_HITMARK_FRAMES.length - 1 ? 2 : 1,
      hitArea: BOUNCE_HIT_AREA,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.KleePyroDamage,
      isBlunt: true,
      poiseDamage: 40,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_SKILL_GROUP_ID, TALENT_START_LEVEL, index),
    })),
    ...Array.from({ length: MINE_HIT_COUNT }, () => mine),
  ];
  // The wiki's Sparks 'n' Splash gives each spark 1U of Pyro under the Elemental Burst internal cooldown with 25 poise
  const sparkHits = WAVE_HITMARK_FRAMES.flatMap((waveHitmarkFrames) =>
    WAVE_SPARK_OFFSET_FRAMES.map((offsetFrames): KitHit => ({
      element: Element.Pyro,
      gauge: 1,
      hitArea: SPARK_HIT_AREA,
      hitmarkSeconds: (waveHitmarkFrames + offsetFrames) / 60,
      internalCooldownTag: InternalCooldownTag.ElementalBurst,
      poiseDamage: 25,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
    })),
  );
  const burstSeconds =
    BURST_START_FRAMES / 60 + getTalentMultiplier(talentMultiplierMap, KLEE_BURST_GROUP_ID, TALENT_START_LEVEL, 4);
  // The wiki's Sparkly Explosion gives it 2U of Pyro with no internal cooldown and 120 poise, landing a frame past Klee's
  // Leaving, so the step that casts it lands it
  const sparklyExplosion: KitHit = {
    element: Element.Pyro,
    gauge: 2,
    hitArea: SPARKLY_EXPLOSION_HIT_AREA,
    hitmarkSeconds: 1 / 60,
    poiseDamage: 120,
    talentMultiplier: SPARKLY_EXPLOSION_MULTIPLIER,
  };
  // Sparks 'n' Splash's sparks land from a summon that follows the body on the field, and a field ticking every step ends
  // Them once another character is on the field, as gcsim ends the burst on a swap. From four constellations that end
  // Sets off Sparkly Explosion where Klee left, priced as she cast the burst, and from six a field with no edge ticks once
  // And gives each member of the deployed team Blazing Delight's bonus
  const castSparksNSplash = ({ body, combatant, kitEffectState }: KitStepContext): void => {
    const { characterId, constellationCount } = combatant;
    const centre = { x: body.position.x, z: body.position.z };
    const sparks: KitSummon = { ...createKitSummon(body, combatant, sparkHits, burstSeconds), isFollowing: true };
    const exit: KitField = {
      centre,
      characterId,
      kind: "field",
      nextTickSeconds: 0,
      onTick: ({ activeCombatant, kitEffectState: tickKitEffectState }) => {
        if (activeCombatant.characterId === characterId || !tickKitEffectState.effects.includes(sparks)) return;
        tickKitEffectState.effects = tickKitEffectState.effects.filter(
          (effect) => effect !== sparks && effect !== exit,
        );
        if (constellationCount >= SPARKLY_EXPLOSION_CONSTELLATION)
          addKitEffect(tickKitEffectState, createKitSummon(sparks.body, combatant, [sparklyExplosion]));
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: burstSeconds,
      tickIndex: 0,
      tickIntervalSeconds: FIXED_STEP_SECONDS,
    };
    addKitEffect(kitEffectState, sparks);
    addKitEffect(kitEffectState, exit);
    if (constellationCount < BLAZING_DELIGHT_CONSTELLATION) return;
    addKitEffect(kitEffectState, {
      centre,
      characterId,
      kind: "field",
      nextTickSeconds: 0,
      onTick: ({ kitEffectState: tickKitEffectState, party }) => {
        for (const memberCharacterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
          addKitEffect(tickKitEffectState, {
            amount: BLAZING_DELIGHT_PYRO_DAMAGE_BONUS,
            attribute: Attribute.PyroDamageBonus,
            characterId: memberCharacterId,
            kind: "buff",
            secondsRemaining: BLAZING_DELIGHT_SECONDS,
            source: BLAZING_DELIGHT_SOURCE,
          });
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      // The field lives a tenth of a second past its tick, so the step that runs it still has it
      secondsRemaining: 0.1,
      tickIndex: 0,
      tickIntervalSeconds: Number.POSITIVE_INFINITY,
    });
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, KLEE_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, KLEE_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    chargedAttack: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [chargedAttackBomb])),
      seconds: (CHARGED_ATTACK_FRAMES - CHARGED_ATTACK_WINDUP_FRAMES) / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The table's, the wiki's and gcsim's 50 stamina, spent as the charged attack starts
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, KLEE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
    elementalBurst: {
      hits: [],
      onStart: castSparksNSplash,
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The bounces and mines land from a summon cast where Klee stands as the skill starts
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, createKitSummon(body, combatant, jumpyDumptyHits)),
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillCharges: JUMPY_DUMPTY_CHARGES,
    // Measured: gcsim v2.47.2 (MIT) klee/plunge.go, the low plunge at 47 frames and the high at 48, ending at 67 and 71.
    // The wiki's Kaboom! gives each 1U of Pyro with no internal cooldown, and 50 and 100 poise
    highPlunge: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 1,
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 48 / 60,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
        },
      ],
      seconds: 71 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 1,
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 47 / 60,
          poiseDamage: 50,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
        },
      ],
      seconds: 67 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 5, and it deals Pyro with no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      element: Element.Pyro,
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 5,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, KLEE_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
    },
    // The group's, the wiki's and gcsim's 20 seconds, each charge's
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, KLEE_SKILL_GROUP_ID, TALENT_START_LEVEL, 5),
  };
};
