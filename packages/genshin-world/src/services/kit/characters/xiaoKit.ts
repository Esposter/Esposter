import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInfusion } from "#src/models/kit/KitInfusion";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Xiao's proud skill groups, read at his talent level. The attack group holds the six strikes' hits at 0 to 7, the
// First and fourth strikes each of two, the charged attack at 8 and its stamina at 9, and the plunges' collision, low
// And high at 10, 11 and 12. The skill group holds Lemniscatic Wind Cycling's damage at 0 and its cooldown at 1. The
// Burst group holds Bane of All Evil's Normal, Charged and Plunging Attack DMG Bonus at 0, its drain of his current HP
// Each second at 1, its duration at 2, and the burst's cooldown and energy cost at 3 and 4
const XIAO_ATTACK_GROUP_ID = 2631;
const XIAO_SKILL_GROUP_ID = 2632;
const XIAO_BURST_GROUP_ID = 2639;

// Measured: gcsim v2.47.2 (MIT) xiao/attack.go, charge.go and plunge.go. Each strike is a fan of a circle centred ahead of
// Or behind the body, priced as its offset plus its radius at gcsim's angle, or a box spawned on its near edge at the
// Body, priced as the circle to its far corner, until an area holds an offset. Each reaches further under Bane of All
// Evil, the attacks it converts
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiao/attack.go
const createFanReach = (degrees: number, radius: number): AttackArea =>
  Object.freeze({ angle: (degrees * Math.PI) / 180, height: 2, radius });
const createBoxReach = (width: number, length: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(length, width / 2) });
// The charged attack's fan of 200 degrees round the body, of radius 3 and 3.2 converted, and the plunges' circles round
// The body, the collision's of radius 1, and the low and high plunges' of 3 and 5, 4 and 6 converted
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiao/plunge.go
const CHARGED_ATTACK_HIT_AREA = createFanReach(200, 3);
const CONVERTED_CHARGED_ATTACK_HIT_AREA = createFanReach(200, 3.2);
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1);
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 3);
const CONVERTED_LOW_PLUNGE_HIT_AREA = createFanReach(360, 4);
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 5);
const CONVERTED_HIGH_PLUNGE_HIT_AREA = createFanReach(360, 6);
// Provisional: gcsim v2.47.2 (MIT) xiao/skill.go lands the dash as a circle of radius 0.8 on the primary target, which an
// Area does not hold, so it reaches the 5 metres an attack targets within, as Xingqiu's sword rain does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiao/skill.go
const DASH_HIT_AREA = createFanReach(360, 5);
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) xiao/attack.go, each strike's hitmarks and the animation that ends it at 60 fps, with the
// Attack group's index of each hit and its reach and converted reach. Each hit's poise is the wiki's Whirlwind Thrust
// Advanced properties, and its converted poise the wiki's Bane of All Evil
const XIAO_STRIKES = [
  {
    frames: 26,
    hits: [
      {
        convertedHitArea: createFanReach(150, 2 - 0.1),
        convertedPoiseDamage: 37.62,
        groupIndex: 0,
        hitArea: createFanReach(150, 1.8 - 0.1),
        hitmarkFrames: 4,
        poiseDamage: 25.08,
      },
      {
        convertedHitArea: createBoxReach(1.6, 3),
        convertedPoiseDamage: 37.62,
        groupIndex: 1,
        hitArea: createBoxReach(1.4, 2.7),
        hitmarkFrames: 17,
        poiseDamage: 25.08,
      },
    ],
  },
  {
    frames: 27,
    hits: [
      {
        convertedHitArea: createFanReach(300, 1 + 1.8),
        convertedPoiseDamage: 77.64,
        groupIndex: 2,
        hitArea: createFanReach(300, 1 + 1.6),
        hitmarkFrames: 15,
        poiseDamage: 51.76,
      },
    ],
  },
  {
    frames: 38,
    hits: [
      {
        convertedHitArea: createFanReach(300, 1.1 + 1.8),
        convertedPoiseDamage: 93.48,
        groupIndex: 3,
        hitArea: createFanReach(300, 1.1 + 1.6),
        hitmarkFrames: 15,
        poiseDamage: 62.32,
      },
    ],
  },
  {
    frames: 42,
    hits: [
      {
        convertedHitArea: createFanReach(320, Math.hypot(0.1, 0.9) + 1.8),
        convertedPoiseDamage: 51.42,
        groupIndex: 4,
        hitArea: createFanReach(320, Math.hypot(0.1, 0.9) + 1.6),
        hitmarkFrames: 14,
        poiseDamage: 34.28,
      },
      {
        convertedHitArea: createFanReach(320, 0.8 + 2),
        convertedPoiseDamage: 51.42,
        groupIndex: 5,
        hitArea: createFanReach(320, 0.8 + 1.8),
        hitmarkFrames: 31,
        poiseDamage: 34.28,
      },
    ],
  },
  {
    frames: 30,
    hits: [
      {
        convertedHitArea: createBoxReach(1.7, 3.2),
        convertedPoiseDamage: 97.56,
        groupIndex: 6,
        hitArea: createBoxReach(1.5, 3),
        hitmarkFrames: 16,
        poiseDamage: 65.04,
      },
    ],
  },
  {
    frames: 79,
    hits: [
      {
        convertedHitArea: createFanReach(360, 1.1 + 2.4),
        convertedPoiseDamage: 130.68,
        groupIndex: 7,
        hitArea: createFanReach(360, 1.1 + 2),
        hitmarkFrames: 39,
        poiseDamage: 87.12,
      },
    ],
  },
];

// Measured: gcsim v2.47.2 (MIT) xiao/charge.go, the thrust at 16 frames and the animation's 45
const CHARGED_ATTACK_HITMARK_FRAMES = 16;
const CHARGED_ATTACK_FRAMES = 45;
// Measured: gcsim v2.47.2 (MIT) xiao/plunge.go, the low and high plunges' hit at 46 frames under Bane of All Evil, the
// Plunges gcsim models, ending at 62 and 66
const PLUNGE_HITMARK_FRAMES = 46;
const LOW_PLUNGE_FRAMES = 62;
const HIGH_PLUNGE_FRAMES = 66;
// Measured: gcsim v2.47.2 (MIT) xiao/skill.go, the dash's hit at 4 frames and the animation's 37
const DASH_HITMARK_FRAMES = 4;
const DASH_FRAMES = 37;
// Measured: gcsim v2.47.2 (MIT) xiao/burst.go, the animation's 82 frames, and Bane of All Evil standing for the group's
// Duration past its start at 57 frames, draining Xiao's HP each second from a second past that start
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiao/burst.go
const BURST_FRAMES = 82;
const BANE_OF_ALL_EVIL_START_FRAMES = 57;
const DRAIN_FIRST_TICK_FRAMES = BANE_OF_ALL_EVIL_START_FRAMES + 60;
const DRAIN_INTERVAL_FRAMES = 60;
// Conqueror of Evil: Tamer of Demons, from Ascension 1, raises all of Xiao's DMG by 5% while Bane of All Evil stands, and
// By 5% more every 3 seconds it stands, up to 25% at 12, as the wiki's passive page and gcsim v2.47.2 (MIT) xiao/asc.go
// Give it. All his damage is Anemo under the burst, so the bonus is to his Anemo DMG Bonus
// https://genshin-impact.fandom.com/wiki/Conqueror_of_Evil:_Tamer_of_Demons
const TAMER_OF_DEMONS_ASCENSION = 1;
const TAMER_OF_DEMONS_DAMAGE_BONUS = 0.05;
const TAMER_OF_DEMONS_INTERVAL_SECONDS = 3;
const TAMER_OF_DEMONS_MAX_STACKS = 5;
const TAMER_OF_DEMONS_SOURCE = "Conqueror of Evil: Tamer of Demons";
// Dissolution Eon: Heaven Fall, from Ascension 4, raises each dash's DMG by 15% for each dash within the 7 seconds before
// It, up to 3, a new one restarting them, as the wiki's passive page gives it. Measured: gcsim v2.47.2 (MIT) xiao/asc.go
// And skill.go, each stack gained 15 frames past its dash, for 420 frames
// https://genshin-impact.fandom.com/wiki/Dissolution_Eon:_Heaven_Fall
const HEAVEN_FALL_ASCENSION = 4;
const HEAVEN_FALL_DAMAGE_BONUS = 0.15;
const HEAVEN_FALL_MAX_STACKS = 3;
const HEAVEN_FALL_SECONDS = (15 + 420) / 60;

// Xiao's first kit, at talent level 1: six strikes, the first and fourth of two hits each, a charged attack, a collision
// And two plunges, Lemniscatic Wind Cycling's dash, and Bane of All Evil's converted Anemo attacks with their DMG Bonus
// And its drain of his HP. Its multipliers are read from his proud skill groups
export const createXiaoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const baneOfAllEvilDamageBonus = getTalentMultiplier(talentMultiplierMap, XIAO_BURST_GROUP_ID, TALENT_START_LEVEL, 0);
  const drainShare = getTalentMultiplier(talentMultiplierMap, XIAO_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  // Counted in frames, so the drains fall on whole frames as gcsim's do, each one before the burst ends
  const baneOfAllEvilFrames =
    getTalentMultiplier(talentMultiplierMap, XIAO_BURST_GROUP_ID, TALENT_START_LEVEL, 2) * 60 +
    BANE_OF_ALL_EVIL_START_FRAMES;
  const lastDrainFrames =
    DRAIN_FIRST_TICK_FRAMES +
    DRAIN_INTERVAL_FRAMES * (Math.ceil((baneOfAllEvilFrames - DRAIN_FIRST_TICK_FRAMES) / DRAIN_INTERVAL_FRAMES) - 1);
  // A spear's strikes are physical under the Normal Attack internal cooldown, until Bane of All Evil converts them
  const normalAttacks = XIAO_STRIKES.map(({ frames, hits }): KitAction => ({
    hits: hits.map(({ groupIndex, hitmarkFrames, ...hit }) => ({
      ...hit,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex),
    })),
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  // The wiki's Lemniscatic Wind Cycling gives the dash 1U of Anemo and 100 poise. Its internal cooldown of 0.1 seconds
  // Never holds a dash back, which comes at most every 37 frames, so it carries none
  const dashHit: KitHit = {
    element: Element.Anemo,
    gauge: 1,
    hitArea: DASH_HIT_AREA,
    hitmarkSeconds: DASH_HITMARK_FRAMES / 60,
    poiseDamage: 100,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIAO_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  // The dash at each count of Heaven Fall's stacks before it, from none up
  const dashHits = Array.from({ length: HEAVEN_FALL_MAX_STACKS + 1 }, (_value, stacks): KitHit =>
    stacks === 0 ? dashHit : { ...dashHit, damageBonus: HEAVEN_FALL_DAMAGE_BONUS * stacks },
  );
  // Whether an effect is the summon one of Xiao's dashes lands from
  const checkIsDash = (effect: KitEffect, characterId: number): effect is KitSummon =>
    effect.kind === "summon" &&
    effect.combatant.characterId === characterId &&
    effect.hits.some((hit) => dashHits.includes(hit));
  // The dash lands from a summon cast where Xiao stands, so its start can choose its bonus. From Ascension 4 that summon
  // Stands as long as its Heaven Fall stack, so a dash reads its stacks off those standing and restarts them
  const castDash = ({ body, combatant, kitEffectState }: KitStepContext): void => {
    if (combatant.ascension < HEAVEN_FALL_ASCENSION) {
      addKitEffect(kitEffectState, createKitSummon(body, combatant, [dashHit]));
      return;
    }
    const dashes = kitEffectState.effects.filter((effect) => checkIsDash(effect, combatant.characterId));
    for (const dash of dashes) dash.secondsRemaining = HEAVEN_FALL_SECONDS;
    const hit = takeOne(dashHits, Math.min(dashes.length, HEAVEN_FALL_MAX_STACKS));
    addKitEffect(kitEffectState, createKitSummon(body, combatant, [hit], HEAVEN_FALL_SECONDS));
  };
  // Bane of All Evil: an Anemo infusion converting Xiao's attacks, each carrying the group's DMG Bonus, until the burst
  // Ends. A field checks each step that he is on the field and ends the burst's effects once he is not, ahead of the
  // Fields that drain his current HP each second and give Tamer of Demons' bonus from Ascension 1, which each run only
  // While the infusion stands
  const castBaneOfAllEvil = ({ body: { position }, combatant, kitEffectState }: KitStepContext): void => {
    const { characterId } = combatant;
    const centre = { x: position.x, z: position.z };
    const infusion: KitInfusion = {
      characterId,
      damageBonus: baneOfAllEvilDamageBonus,
      element: Element.Anemo,
      isConverted: true,
      kind: "infusion",
      secondsRemaining: baneOfAllEvilFrames / 60,
    };
    const baneOfAllEvilEffects: KitEffect[] = [infusion];
    const exit: KitField = {
      centre,
      characterId,
      kind: "field",
      nextTickSeconds: 0,
      onTick: ({ activeCombatant, kitEffectState: tickKitEffectState }) => {
        if (activeCombatant.characterId === characterId) return;
        tickKitEffectState.effects = tickKitEffectState.effects.filter(
          (effect) =>
            !baneOfAllEvilEffects.includes(effect) &&
            !(effect.kind === "buff" && effect.characterId === characterId && effect.source === TAMER_OF_DEMONS_SOURCE),
        );
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: infusion.secondsRemaining,
      tickIndex: 0,
      tickIntervalSeconds: FIXED_STEP_SECONDS,
    };
    const drain: KitField = {
      centre,
      characterId,
      kind: "field",
      nextTickSeconds: DRAIN_FIRST_TICK_FRAMES / 60,
      onTick: ({ kitEffectState: tickKitEffectState, party }) => {
        if (!tickKitEffectState.effects.includes(infusion)) return;
        getPartyMember(party, characterId).healthShare *= 1 - drainShare;
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      // The field lives a tenth of a second past its last drain, so the step that runs it still has it
      secondsRemaining: lastDrainFrames / 60 + 0.1,
      tickIndex: 0,
      tickIntervalSeconds: DRAIN_INTERVAL_FRAMES / 60,
    };
    baneOfAllEvilEffects.push(exit, drain);
    if (combatant.ascension >= TAMER_OF_DEMONS_ASCENSION)
      baneOfAllEvilEffects.push({
        centre,
        characterId,
        kind: "field",
        nextTickSeconds: 0,
        onTick: ({ kitEffectState: tickKitEffectState, tickIndex }) => {
          if (!tickKitEffectState.effects.includes(infusion)) return;
          addKitEffect(tickKitEffectState, {
            amount: TAMER_OF_DEMONS_DAMAGE_BONUS * (tickIndex + 1),
            attribute: Attribute.AnemoDamageBonus,
            characterId,
            kind: "buff",
            secondsRemaining: infusion.secondsRemaining,
            source: TAMER_OF_DEMONS_SOURCE,
          });
        },
        radius: UNBOUNDED_FIELD_RADIUS,
        // The field lives a tenth of a second past its last tick, so the step that runs it still has it
        secondsRemaining: TAMER_OF_DEMONS_INTERVAL_SECONDS * (TAMER_OF_DEMONS_MAX_STACKS - 1) + 0.1,
        tickIndex: 0,
        tickIntervalSeconds: TAMER_OF_DEMONS_INTERVAL_SECONDS,
      });
    for (const effect of baneOfAllEvilEffects) addKitEffect(kitEffectState, effect);
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XIAO_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, XIAO_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    // The wiki's Whirlwind Thrust gives the thrust 120 poise, 180 converted, under the Charged Attack internal cooldown,
    // Whose 0.5 seconds never hold a thrust back, which follows a strike and plays 45 frames, so it carries none
    chargedAttack: {
      hits: [
        {
          convertedHitArea: CONVERTED_CHARGED_ATTACK_HIT_AREA,
          convertedPoiseDamage: 180,
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 120,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The table's, the wiki's and gcsim's 25 stamina, spent as the charged attack starts
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, XIAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
    elementalBurst: {
      hits: [],
      onStart: castBaneOfAllEvil,
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [], onStart: castDash, seconds: DASH_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    // The skill set's, the wiki's and gcsim v2.47.2 (MIT) xiao/xiao.go's 2 charges
    elementalSkillCharges: 2,
    // The wiki's Whirlwind Thrust gives the plunges 100 and 150 poise, 150 and 225 converted, both blunt
    highPlunge: {
      hits: [
        {
          convertedHitArea: CONVERTED_HIGH_PLUNGE_HIT_AREA,
          convertedPoiseDamage: 225,
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, 12),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          convertedHitArea: CONVERTED_LOW_PLUNGE_HIT_AREA,
          convertedPoiseDamage: 150,
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, 11),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 25, 37.5 converted, and it applies no gauge of its own, 0U, as the wiki's table
    // Gives
    plungeCollision: {
      convertedPoiseDamage: 37.5,
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, XIAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
    },
    // The group's, the wiki's and gcsim's 10 seconds
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, XIAO_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
};
