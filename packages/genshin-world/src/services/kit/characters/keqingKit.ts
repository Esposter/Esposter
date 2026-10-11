import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Keqing's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack's two slashes at 5 and 6 and its stamina a second at 8, and the plunges' collision, low and high at 9, 10 and 11.
// The skill group holds Stellar Restoration's damage at 0, the recast's at 1 and its cooldown at 3. The burst group holds
// Starward Sword's initial damage at 0, its slashes' at 1, its final at 2, its cooldown at 3 and its energy cost at 4
const KEQING_ATTACK_GROUP_ID = 4231;
const KEQING_SKILL_GROUP_ID = 4232;
const KEQING_BURST_GROUP_ID = 4239;

// Measured: gcsim v2.47.2 (MIT) keqing/attack.go, each strike's circle or box as priced from the body: a circle is its
// Offset plus its radius, and a box is priced to its far corner. The fifth strike is a bullet on the primary target, which
// An area does not hold, so it is provisional at the reach the targeting reads
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/attack.go
const createCircleReach = (offset: number, radius: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: offset + radius });
const createBoxReach = (offset: number, width: number, length: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(offset + length, width / 2) });
const FIRST_STRIKE_HIT_AREA = createBoxReach(0, 1.5, 2.2);
const SECOND_STRIKE_HIT_AREA = createCircleReach(0.5, 1.5);
const THIRD_STRIKE_HIT_AREA = createCircleReach(1, 1.8);
const FOURTH_STRIKE_HIT_AREA = createCircleReach(0.6, 1.5);
// Provisional: the reach the targeting reads for a strike on the primary target, as the other kits' are
const FIFTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Provisional: the plunges' reaches are the collision, low and high plunges' of 1, 3 and 5 metres ahead, as gcsim gives
// Them for Chongyun, each priced as its offset plus its radius, until the Mac measures Keqing's
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 5 });
// Provisional: the charged attack's two slashes reach the 5 metres an attack targets within, as Chongyun's charged attack
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) keqing/skill.go, Stellar Restoration's and its recast's circles of radius 1.6 and 3 on the
// Primary target. A circle on a target does not hold in an area, so both are provisional at the targeting's reach
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/skill.go
const SKILL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) keqing/burst.go, Starward Sword's circle of radius 8 round the body, which all ten of its
// Hits reach
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/burst.go
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 8 });

// Measured: gcsim v2.47.2 (MIT) keqing/attack.go, each strike's hitmarks and animation at 60 fps. The fourth strike is two
// Hits, at 11 and 21 frames, both of its talent index
const KEQING_STRIKES = [
  { animationFrames: 19, hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: [10], index: 0 },
  { animationFrames: 24, hitArea: SECOND_STRIKE_HIT_AREA, hitmarkFrames: [10], index: 1 },
  { animationFrames: 36, hitArea: THIRD_STRIKE_HIT_AREA, hitmarkFrames: [14], index: 2 },
  { animationFrames: 58, hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: [11, 21], index: 3 },
  { animationFrames: 66, hitArea: FIFTH_STRIKE_HIT_AREA, hitmarkFrames: [22], index: 4 },
];

// Measured: gcsim v2.47.2 (MIT) keqing/skill.go, Stellar Restoration's hit at 25 frames with an animation of 37, and the
// Recast's slash at 16 frames with an animation of 43. The Lightning Stiletto lasts 5 seconds and 20 frames, and the
// Skill's cooldown is the table's 7.5 seconds, the 450 frames gcsim gives
const SKILL_HITMARK_FRAMES = 25;
const SKILL_ANIMATION_FRAMES = 37;
const RECAST_HITMARK_FRAMES = 16;
const RECAST_ANIMATION_FRAMES = 43;
const STILETTO_SECONDS = (5 * 60 + 20) / 60;
// Provisional: gcsim gives the skill's gauge in none of the fetched summaries, so each Electro hit of it reads 2U, as the
// Other Electro skills here do, until the Mac measures it. The Electro infusion the recast gives lasts 6 seconds from the
// Recast, which the Mac measures from the game's text since gcsim gives its seconds outside the file fetched
const SKILL_GAUGE = 2;
const ELECTRO_INFUSION_SECONDS = 6;

// Measured: gcsim v2.47.2 (MIT) keqing/burst.go, the initial hit at 56 frames, the eight slashes from 82 frames every 11,
// The final at 197, and the animation's 124. The burst's cooldown is the table's 12 seconds, the 720 frames gcsim gives
const BURST_INITIAL_HITMARK_FRAMES = 56;
const BURST_SLASH_FIRST_HITMARK_FRAMES = 82;
const BURST_SLASH_COUNT = 8;
const BURST_SLASH_INTERVAL_FRAMES = 11;
const BURST_FINAL_HITMARK_FRAMES = 197;
const BURST_ANIMATION_FRAMES = 124;

// Provisional: gcsim gives the charged attack's frames outside the file summarised, so its slashes land at half a second and
// A second and it ends at 1.2 seconds, as Chongyun's cyclic and final slashes do, until the Mac measures them. The plunges
// Are provisional too, as their frames are not in the summary fetched
const CHARGED_CYCLIC_HITMARK_SECONDS = 0.5;
const CHARGED_FINAL_HITMARK_SECONDS = 1;
const CHARGED_ATTACK_SECONDS = 1.2;
const PLUNGE_HITMARK_SECONDS = 0.5;
const PLUNGE_SECONDS = 1;

// Keqing's first kit, at talent level 1: five strikes, a charged attack of two slashes, a collision and two plunges,
// Stellar Restoration with its Lightning Stiletto's recast and the Electro infusion the recast gives, and Starward Sword's
// Slashes and final strike. Its multipliers are read from her proud skill groups. Her passives and constellations are not
// Built, as no kit event reaches a value the fetched sources give
export const createKeqingKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KEQING_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KEQING_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KEQING_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // Keqing's strikes are slashes, so none is blunt, and each deals its own hit at each of its hitmarks
  const normalAttacks: KitAction[] = KEQING_STRIKES.map(
    ({ animationFrames, hitArea, hitmarkFrames, index }): KitAction => ({
      hits: hitmarkFrames.map((frames): KitHit => ({
        hitArea,
        hitmarkSeconds: frames / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(index),
      })),
      seconds: animationFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  // The Lightning Stiletto's recast is a second press within its window, which strikes with the slash and infuses Keqing's
  // Attacks with Electro for the infusion's seconds as it lands
  const recastAction: KitAction = {
    hits: [
      {
        element: Element.Electro,
        gauge: SKILL_GAUGE,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: RECAST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillTalentMultiplier(1),
      },
    ],
    onStart: ({ combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Electro,
        kind: "infusion",
        secondsRemaining: ELECTRO_INFUSION_SECONDS,
      }),
    seconds: RECAST_ANIMATION_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Starward Sword's eight slashes, each Electro under the burst's internal cooldown, then its final strike
  const slashHits: KitHit[] = Array.from({ length: BURST_SLASH_COUNT }, (_slash, index) => ({
    element: Element.Electro,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: (BURST_SLASH_FIRST_HITMARK_FRAMES + index * BURST_SLASH_INTERVAL_FRAMES) / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 0,
    talentMultiplier: burstTalentMultiplier(1),
  }));

  return {
    burstCooldownSeconds: burstTalentMultiplier(3),
    burstEnergyCost: burstTalentMultiplier(4),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_HIT_AREA,
          hitmarkSeconds: CHARGED_CYCLIC_HITMARK_SECONDS,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(5),
        },
        {
          hitArea: CHARGED_HIT_AREA,
          hitmarkSeconds: CHARGED_FINAL_HITMARK_SECONDS,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_SECONDS,
      staminaPerSecond: attackTalentMultiplier(8),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_INITIAL_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalBurst,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
        ...slashHits,
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_FINAL_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalBurst,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(2),
        },
      ],
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          element: Element.Electro,
          gauge: SKILL_GAUGE,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: skillTalentMultiplier(0),
        },
      ],
      seconds: SKILL_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Stellar Restoration summons the Lightning Stiletto, whose window is where the recast may come
    elementalSkillChain: { followUps: [recastAction], windowSeconds: STILETTO_SECONDS },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: PLUNGE_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(11),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: PLUNGE_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(9),
    },
    skillCooldownSeconds: skillTalentMultiplier(3),
  };
};
