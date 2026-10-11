import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
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
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Nilou's proud skill groups, read at her talent level. The attack group holds her three strikes at 0 to 2, the charged
// Attack's two hits at 3 and 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group
// Holds Dance of Haftkarsvar's share of Max HP at 0, the first Whirling Steps' hit at 1, the Luminous Illusion at 3, the Water
// Wheel at 4, the Sword Dance's first and second hits at 5 and 6, its cooldown at 8, Lunar Prayer's seconds at 9 and
// Pirouette's at 10. The burst group holds Dance of Abzendegi's share of Max HP at 0, its cooldown at 2 and its energy cost at 3
const NILOU_ATTACK_GROUP_ID = 7031;
const NILOU_SKILL_GROUP_ID = 7032;
const NILOU_BURST_GROUP_ID = 7039;

export const NILOU_CHARACTER_ID = 10_000_070;

// Measured: gcsim (MIT) nilou/attack.go, each strike's hitmark and the frame its action cancels at by default, and its reach.
// The first strike is a box 1.5 metres wide and 2.2 long on the body, the second and third circles of radius 1.5 and 2.1
// Centred 0.5 metres ahead, each priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/nilou
const NORMAL_ATTACKS = [
  { cancelFrames: 24, hitArea: createBoxReach(0, 1.5, 2.2), hitmarkFrames: 12, index: 0 },
  { cancelFrames: 27, hitArea: createCircleReach(0.5, 1.5), hitmarkFrames: 9, index: 1 },
  { cancelFrames: 58, hitArea: createCircleReach(0.5, 2.1), hitmarkFrames: 17, index: 2 },
];

// Measured: gcsim (MIT) nilou/charge.go, the charged attack's two slashes at 26 and 27 frames, each a circle of radius 2.3
// Centred 0.5 metres ahead, and its animation at 43 frames
const CHARGED_ATTACK_FRAMES = 43;
const CHARGED_ATTACK_HITMARK_FRAMES = [26, 27];
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.5, 2.3);

// Provisional: gcsim has no plunge file for Nilou, so the plunges' reach is the shared borrowed one, and each hits as its
// Action starts, as Zhongli's do. Their poise of 100 and 150 is Zhongli's too, until a recording of Nilou's plunges measures them
const PLUNGE_SECONDS = 0.4;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const COLLISION_POISE_DAMAGE = 25;

// Measured: gcsim (MIT) nilou/skill.go, Dance of Haftkarsvar's animation at 22 frames and its hit at 16, a circle of radius 2.5
// Round the body, which strikes for its share of Max HP. Its Pirouette lasts ten seconds from the cast. A third sword dance
// Sets off Lunar Prayer 30 frames on, which lasts eight seconds
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/nilou
const SKILL_FRAMES = 22;
const SKILL_HITMARK_FRAMES = 16;
const SKILL_HIT_AREA = createCircleReach(0, 2.5);
const PIROUETTE_SECONDS = 10;
const LUNAR_PRAYER_SECONDS = 8;
const LUNAR_PRAYER_DELAY_FRAMES = 30;
const PIROUETTE_END_FIELD_ID = "nilou-pirouette-end";

// Measured: gcsim (MIT) nilou/skill.go, the Sword Dance's three steps: a box 1.75 metres wide and 2.2 long on the body at 14
// Frames, a circle of radius 1.8 centred 0.5 metres ahead at 12, and the Luminous Illusion, a circle of radius 2 round the
// Primary target at 35. Their animations end at 20, 23 and 60 frames
const SWORD_DANCE_STEPS = [
  { cancelFrames: 20, hitArea: createBoxReach(0, 1.75, 2.2), hitmarkFrames: 14, index: 5 },
  { cancelFrames: 23, hitArea: createCircleReach(0.5, 1.8), hitmarkFrames: 12, index: 6 },
  { cancelFrames: 60, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 2), hitmarkFrames: 35, index: 3 },
];
const LUMINOUS_ILLUSION_STEP = 2;

// Measured: gcsim (MIT) nilou/skill.go, the first Whirling Steps' circle of radius 2.7 centred 0.3 metres ahead at 21 frames,
// And its animation at 33. The Pirouette's later steps are not built, as a stance holds neither a skill chain nor the
// Shared step count gcsim keeps across its dance and its steps
const WHIRLING_STEPS_FRAMES = 33;
const WHIRLING_STEPS_HITMARK_FRAMES = 21;
const WHIRLING_STEPS_HIT_AREA = createCircleReach(0.3, 2.7);

// Measured: gcsim (MIT) nilou/burst.go, Dance of Abzendegi's animation at 110 frames and its hit at 91, a circle of radius 3
// Round the body, which strikes for its share of Max HP. Its Lingering Aeon is not built, as it lands on the enemy the first
// Hit struck, and no hook gives that enemy to a later hit
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/nilou
const BURST_FRAMES = 110;
const BURST_HITMARK_FRAMES = 91;
const BURST_HIT_AREA = createCircleReach(0, 3);

// Measured: gcsim (MIT) nilou/cons.go, Constellation 1 raises Luminous Illusion's DMG by 65%, and Constellation 6 gives 0.6%
// CRIT Rate and 1.2% CRIT DMG for each 1,000 Max HP, capped at 30% and 60%
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ILLUSION_DAMAGE_BONUS = 0.65;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_CRIT_RATE_PER_MAX_HEALTH = 0.006 / 1000;
const CONSTELLATION_6_CRIT_RATE_MAX = 0.3;
const CONSTELLATION_6_CRIT_DAMAGE_PER_MAX_HEALTH = 0.012 / 1000;
const CONSTELLATION_6_CRIT_DAMAGE_MAX = 0.6;

const getPassiveBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
  combatant.constellationCount < CONSTELLATION_6
    ? []
    : [
        {
          amount: Math.min(
            CONSTELLATION_6_CRIT_RATE_MAX,
            combatant.attributes.maxHealth * CONSTELLATION_6_CRIT_RATE_PER_MAX_HEALTH,
          ),
          attribute: Attribute.CriticalRate,
        },
        {
          amount: Math.min(
            CONSTELLATION_6_CRIT_DAMAGE_MAX,
            combatant.attributes.maxHealth * CONSTELLATION_6_CRIT_DAMAGE_PER_MAX_HEALTH,
          ),
          attribute: Attribute.CriticalDamage,
        },
      ];

// Nilou's first kit, at talent level 1: three strikes, a charged attack, a collision and two plunges, Dance of Haftkarsvar
// With its Pirouette and Lunar Prayer, and Dance of Abzendegi's hit. Constellations 1 and 6 are built. Ascension 1 and 4,
// Constellations 2 and 4 and the Pirouette's later steps are not, and Constellations 3 and 5 raise talent levels, which no kit
// Reads yet
export const createNilouKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NILOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NILOU_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NILOU_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames, index }): KitAction => ({
      hits: [
        { hitArea, hitmarkSeconds: hitmarkFrames / 60, poiseDamage: 0, talentMultiplier: attackMultiplier(index) },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const chargedAttack: KitAction = {
    hits: CHARGED_ATTACK_HITMARK_FRAMES.map((frames, index) => ({
      hitArea: CHARGED_ATTACK_HIT_AREA,
      hitmarkSeconds: frames / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(index + 3),
    })),
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createPlunge = (hitArea: KitHit["hitArea"], poiseDamage: number, index: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, isBlunt: true, poiseDamage, talentMultiplier: attackMultiplier(index) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  // The sword dance's three steps, each hit kept whole so Constellation 1 finds the Luminous Illusion among the strikes
  const swordDanceSteps = SWORD_DANCE_STEPS.map(({ cancelFrames, hitArea, hitmarkFrames, index }) => ({
    cancelSeconds: cancelFrames / 60,
    hit: {
      element: Element.Hydro,
      gauge: 1,
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: skillMultiplier(index),
    } satisfies KitHit,
  }));
  const luminousIllusionHit = swordDanceSteps[LUMINOUS_ILLUSION_STEP]?.hit;
  const createSwordDanceActions = (onIllusionStart?: KitAction["onStart"]): KitAction[] =>
    swordDanceSteps.map(({ cancelSeconds, hit }, index): KitAction => ({
      hits: [hit],
      seconds: cancelSeconds,
      targetingArea: STRIKE_TARGETING_AREA,
      onStart: index === LUMINOUS_ILLUSION_STEP ? onIllusionStart : undefined,
    }));

  const whirlingSteps: KitAction = {
    hits: [
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: WHIRLING_STEPS_HIT_AREA,
        hitmarkSeconds: WHIRLING_STEPS_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(1),
      },
    ],
    seconds: WHIRLING_STEPS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const elementalBurst: KitAction = {
    hits: [
      {
        additiveBaseDamageBonus: createMaxHealthScaledBonus(burstMultiplier(0)),
        element: Element.Hydro,
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: 0,
      },
    ],
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const createNilouStance = (
    characterId: number,
    normalAttacksOfStance: KitAction[],
    elementalSkill: KitAction,
    secondsRemaining: number,
  ): KitStance => ({
    actions: {
      chargedAttack,
      chargedAttackStamina: attackMultiplier(5),
      elementalBurst,
      elementalSkill,
      normalAttacks: normalAttacksOfStance,
    },
    // The sword dance's steps and Luminous Illusion, and the Whirling Steps, are Elemental Skill DMG, gcsim's AttackTagElementalArt
    // In nilou/skill.go's SwordDance and WhirlingSteps
    attackTags: {
      chargedAttack: AttackTag.ChargedAttack,
      elementalBurst: AttackTag.ElementalBurst,
      elementalSkill: AttackTag.ElementalSkill,
      normalAttacks: AttackTag.ElementalSkill,
    },
    characterId,
    elapsedSeconds: 0,
    kind: "stance",
    secondsRemaining,
  });

  // Lunar Prayer replaces the sword dance's normal attacks for eight seconds, and the dance is cast again as the skill
  const createLunarPrayerStance = (characterId: number, dance: KitAction): KitStance =>
    createNilouStance(characterId, createSwordDanceActions(), dance, LUNAR_PRAYER_SECONDS);

  // The field that ends Pirouette once its third sword dance has landed, handing the team Lunar Prayer as it ticks
  const createPirouetteEndField = (body: KitBody, characterId: number, dance: KitAction): KitField => ({
    centre: { x: body.position.x, z: body.position.z },
    characterId,
    id: PIROUETTE_END_FIELD_ID,
    kind: "field",
    nextTickSeconds: LUNAR_PRAYER_DELAY_FRAMES / 60,
    onTick: ({ kitEffectState }) => addKitEffect(kitEffectState, createLunarPrayerStance(characterId, dance)),
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: LUNAR_PRAYER_DELAY_FRAMES / 60 + SUMMON_LINGER_SECONDS,
    tickIndex: 0,
    tickIntervalSeconds: 1,
  });

  // Pirouette replaces the string with the sword dance and the skill with the first Whirling Steps, and its third dance
  // Sets off Lunar Prayer. A press of the skill within it is blocked by the cooldown the cast set, as a stance's skill press
  // Is not exempted from one, so the Whirling Steps are reachable only once it has run out
  const createPirouetteStance = (characterId: number, dance: KitAction): KitStance =>
    createNilouStance(
      characterId,
      createSwordDanceActions(({ body, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, createPirouetteEndField(body, combatant.characterId, dance)),
      ),
      whirlingSteps,
      PIROUETTE_SECONDS,
    );

  const elementalSkill: KitAction = {
    hits: [
      {
        additiveBaseDamageBonus: createMaxHealthScaledBonus(skillMultiplier(0)),
        element: Element.Hydro,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: 0,
      },
    ],
    onStart: ({ combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, createPirouetteStance(combatant.characterId, elementalSkill)),
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(5),
    elementalBurst,
    elementalSkill,
    getPassiveBonuses,
    // Constellation 1 raises Luminous Illusion's DMG, the one hit of the sword dance it is set on
    getStrikeDamageBonus: (strike: KitStrike) =>
      strike.combatant.constellationCount >= CONSTELLATION_1 && strike.hit === luminousIllusionHit
        ? CONSTELLATION_1_ILLUSION_DAMAGE_BONUS
        : 0,
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, HIGH_PLUNGE_POISE_DAMAGE, 8),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, LOW_PLUNGE_POISE_DAMAGE, 7),
    normalAttacks,
    // Leaving the field ends Pirouette and Lunar Prayer, and the field that would have handed the team Lunar Prayer
    onKitEvent: (event, { combatant, kitEffectState }) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      for (const effect of kitEffectState.effects) {
        if (effect.kind === "stance" && effect.characterId === combatant.characterId) effect.secondsRemaining = 0;
        if (effect.kind === "field" && effect.id === PIROUETTE_END_FIELD_ID) effect.secondsRemaining = 0;
      }
    },
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: COLLISION_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(8),
  };
};
