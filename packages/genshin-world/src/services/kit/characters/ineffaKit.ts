import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import {
  PLUNGE_HIT_AREAS,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  SUMMON_LINGER_SECONDS,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createPeriodicKitHits } from "#src/services/kit/createPeriodicKitHits";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Ineffa's proud skill groups, read at her talent level. The attack group holds her four strikes at 0 to 4, the charged
// Attack at 5 and its stamina at 6, and the plunges' collision, low and high at 7, 8 and 9. The skill group holds Cleaning
// Mode's DMG at 0, the shield's share of ATK at 1 and its flat HP at 2, Birgitta's DMG at 3, the shield's and Birgitta's
// Seconds at 4 and 5, and its cooldown at 6. The burst group holds Cyclonic Exterminator's DMG at 0, its cooldown at 1 and
// Its energy cost at 2
const INEFFA_ATTACK_GROUP_ID = 11631;
const INEFFA_SKILL_GROUP_ID = 11632;
const INEFFA_BURST_GROUP_ID = 11639;
const ATTACK_INDEX_CHARGED_ATTACK = 5;
const ATTACK_INDEX_CHARGED_ATTACK_STAMINA = 6;
const ATTACK_INDEX_COLLISION = 7;
const ATTACK_INDEX_LOW_PLUNGE = 8;
const ATTACK_INDEX_HIGH_PLUNGE = 9;
const SKILL_INDEX_DAMAGE = 0;
const SKILL_INDEX_SHIELD_ATK_SHARE = 1;
const SKILL_INDEX_SHIELD_FLAT = 2;
const SKILL_INDEX_BIRGITTA_DAMAGE = 3;
const SKILL_INDEX_SHIELD_SECONDS = 4;
const SKILL_INDEX_COOLDOWN = 6;
const BURST_INDEX_DAMAGE = 0;
const BURST_INDEX_COOLDOWN = 1;
const BURST_INDEX_ENERGY_COST = 2;

export const INEFFA_CHARACTER_ID = 10_000_116;

// Measured: gcsim (MIT, main) ineffa/attack.go, each strike's hitmarks, the frame its action cancels at by default and its
// Reach: the first two circles, the third and fourth boxes, the third as two of them. gcsim gives no poise to a strike
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/attack.go
const NORMAL_ATTACKS: {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 35, hits: [{ hitArea: createCircleReach(0.3, 1.6), hitmarkFrames: 9, index: 0 }] },
  { cancelFrames: 46, hits: [{ hitArea: createCircleReach(0.5, 1.6), hitmarkFrames: 17, index: 1 }] },
  {
    cancelFrames: 48,
    hits: [
      { hitArea: createBoxReach(0.2, 2.8, 2), hitmarkFrames: 10, index: 2 },
      { hitArea: createBoxReach(-0.2, 2.8, 2), hitmarkFrames: 21, index: 3 },
    ],
  },
  { cancelFrames: 55, hits: [{ hitArea: createBoxReach(0.5, 2.4, 4), hitmarkFrames: 27, index: 4 }] },
];

// Measured: gcsim (MIT, main) ineffa/charge.go, the charged attack's hit at 23 frames on a circle of 2.35 metres 0.5 metres
// Ahead of the body, in an animation of 60 frames. gcsim gives no poise to it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/charge.go
const CHARGED_ATTACK_FRAMES = 60;
const CHARGED_ATTACK_HITMARK_FRAMES = 23;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.5, 2.35);

// Measured: gcsim (MIT, main) ineffa/skill.go, Cleaning Mode's hit at 26 frames on a circle of 3.5 metres round the body, in
// An animation of 32 frames, its shield 4 frames in, and Birgitta summoned 42 frames after the hit, at 68. Birgitta's
// Discharges land 42 frames after she is summoned and every 119 after, while she stands for 1,200 frames. Her Electro
// Particles, which gcsim gives on an internal cooldown, wait on the particle hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/skill.go
const SKILL_FRAMES = 32;
const SKILL_HITMARK_FRAMES = 26;
const SKILL_HIT_AREA = createCircleReach(0, 3.5);
const SKILL_SHIELD_FRAMES = 4;
const SKILL_BIRGITTA_SPAWN_FRAMES = SKILL_HITMARK_FRAMES + 42;
const BIRGITTA_FRAMES = 1200;
const BIRGITTA_FIRST_DISCHARGE_FRAMES = 42;
const BIRGITTA_DISCHARGE_INTERVAL_FRAMES = 119;
const BIRGITTA_DISCHARGE_COUNT = 10;
const BIRGITTA_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 4);
const BIRGITTA_ID = "birgitta";

// Measured: gcsim (MIT, main) ineffa/burst.go, Cyclonic Exterminator's hit at 111 frames on a circle of 6 metres round the
// Body, in an animation of 130 frames, which summons Birgitta at the same frame. gcsim gives no poise to the burst
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/burst.go
const BURST_FRAMES = 130;
const BURST_HITMARK_FRAMES = 111;
const BURST_HIT_AREA = createCircleReach(0, 6);

// Provisional: gcsim has no plunge file for Ineffa, so her plunges' reach is the kit constants' borrowed one, each hits as
// Its action starts, and its seconds are the standard the other plunges borrow, as Mizuki's are
const PLUNGE_SECONDS = 0.4;

// Measured: gcsim (MIT, main) ineffa/asc.go, her Moonsign Benediction turns the party's Electro-Charged into
// Lunar-Charged and adds 0.7% Base DMG Bonus to its Lunar-Charged for each 100 of her ATK, at most 14%
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/asc.go
const BENEDICTION_BASE_DAMAGE_BONUS_PER_ATTACK = 0.007 / 100;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.14;

// Ineffa's first kit, at talent level 1: her four strikes, a charged attack, a collision and two plunges, the skill with its
// Shield and Birgitta, the burst, which summons Birgitta again, and her Moonsign Benediction. Her multipliers are read from
// Her proud skill groups
export const createIneffaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, INEFFA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, INEFFA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, INEFFA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const skillCooldownSeconds = skillMultiplier(SKILL_INDEX_COOLDOWN);
  const shieldSeconds = skillMultiplier(SKILL_INDEX_SHIELD_SECONDS);

  // Birgitta is cast at the start of the action and appears on the field at her spawn frame. Her discharges count from her
  // Cast, each landing the gcsim frames after her spawn, on the schedule gcsim gives her
  const createBirgittaHits = (spawnFrames: number): KitHit[] =>
    createPeriodicKitHits(
      { hitArea: BIRGITTA_HIT_AREA, poiseDamage: 0, talentMultiplier: skillMultiplier(SKILL_INDEX_BIRGITTA_DAMAGE) },
      BIRGITTA_DISCHARGE_COUNT,
      spawnFrames + BIRGITTA_FIRST_DISCHARGE_FRAMES,
      BIRGITTA_DISCHARGE_INTERVAL_FRAMES,
    );
  // Recasting Birgitta ends the one on the field, as gcsim starts a new discharge chain and cancels the old one's
  const summonBirgitta = (
    kitEffectState: KitEffectState,
    body: KitBody,
    combatant: Combatant,
    spawnFrames: number,
  ): void => {
    for (const effect of kitEffectState.effects)
      if (effect.kind === "summon" && effect.id === BIRGITTA_ID) effect.secondsRemaining = 0;
    castKitSummon(kitEffectState, body, combatant, createBirgittaHits(spawnFrames), {
      id: BIRGITTA_ID,
      secondsRemaining: (spawnFrames + BIRGITTA_FRAMES) / 60,
      spawnSeconds: spawnFrames / 60,
    });
  };

  const normalAttacks = NORMAL_ATTACKS.map(({ cancelFrames, hits }): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }) => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  // Provisional: each plunge hits as its action starts, its seconds and poise the standard, not measured for Ineffa
  const createPlunge = (hitArea: AttackArea, poiseDamage: number, index: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, poiseDamage, talentMultiplier: attackMultiplier(index) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  return {
    burstCooldownSeconds: burstMultiplier(BURST_INDEX_COOLDOWN),
    burstEnergyCost: burstMultiplier(BURST_INDEX_ENERGY_COST),
    chargedAttack: {
      hits: [
        {
          gauge: 1,
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(ATTACK_INDEX_CHARGED_ATTACK),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(ATTACK_INDEX_CHARGED_ATTACK_STAMINA),
    elementalBurst: {
      hits: [
        {
          gauge: 1,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstMultiplier(BURST_INDEX_DAMAGE),
        },
      ],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        summonBirgitta(kitEffectState, body, combatant, BURST_HITMARK_FRAMES),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          gauge: 1,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(SKILL_INDEX_DAMAGE),
        },
      ],
      // The shield is a field that places it once, 4 frames in, and reads the caster's ATK as it stands then. Its element is
      // Electro, and it lasts the seconds gcsim gives it from its placement
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        addKitEffect(kitEffectState, {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: SKILL_SHIELD_FRAMES / 60,
          onTick: ({ kitEffectState: tickState }) =>
            addKitEffect(tickState, {
              characterId: combatant.characterId,
              element: Element.Electro,
              health:
                skillMultiplier(SKILL_INDEX_SHIELD_ATK_SHARE) * combatant.attributes.attack +
                skillMultiplier(SKILL_INDEX_SHIELD_FLAT),
              kind: "shield",
              secondsRemaining: shieldSeconds,
            }),
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining: SKILL_SHIELD_FRAMES / 60 + SUMMON_LINGER_SECONDS,
          tickIndex: 0,
          tickIntervalSeconds: 1,
        });
        summonBirgitta(kitEffectState, body, combatant, SKILL_BIRGITTA_SPAWN_FRAMES);
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, 150, ATTACK_INDEX_HIGH_PLUNGE),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, 100, ATTACK_INDEX_LOW_PLUNGE),
    moonsignBenediction: {
      getBaseDamageBonus: ({ attributes }) =>
        Math.min(attributes.attack * BENEDICTION_BASE_DAMAGE_BONUS_PER_ATTACK, BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS),
      lunarReactionTypes: [LunarReactionType.LunarCharged],
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: attackMultiplier(ATTACK_INDEX_COLLISION),
    },
    skillCooldownSeconds,
  };
};
