import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitStance } from "#src/models/kit/KitStance";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Kaveh's proud skill groups, read at his talent level. The attack group holds his four strikes at 0 to 3, the charged
// Attack's spin at 4 and its final hit at 5, its stamina per second at 6 and its maximum duration at 7, and the plunges'
// Collision, low and high at 8, 9 and 10. The skill group holds Artistic Ingenuity's damage at 0 and its cooldown at 1. The
// Burst group holds Painted Dome's damage at 0, its duration at 1, its Dendro Core Burst DMG Bonus at 2, its cooldown at 3 and
// Its energy cost at 4
const KAVEH_ATTACK_GROUP_ID = 8131;
const KAVEH_SKILL_GROUP_ID = 8132;
const KAVEH_BURST_GROUP_ID = 8139;

// Measured: gcsim (MIT) kaveh/attack.go, each strike's hitmarks, the frames its action cancels at by default, its poise, and its
// Fan of the angle gcsim gives it, a circle of its radius placed at its offset ahead of the body. Painted Dome's stance widens
// Each radius to gcsim's second set. Https://github.com/genshinsim/gcsim/tree/main/internal/characters/kaveh
const NORMAL_ATTACK_STRIKES = [
  { angle: 260, burstRadius: 3.1, cancelFrames: 44, hitmarkFrames: 27, offset: 0.5, poiseDamage: 107.738, radius: 2.2 },
  { angle: 260, burstRadius: 3.1, cancelFrames: 45, hitmarkFrames: 22, offset: 0.5, poiseDamage: 98.524, radius: 2.2 },
  { angle: 240, burstRadius: 3.2, cancelFrames: 56, hitmarkFrames: 33, offset: 0.5, poiseDamage: 123.542, radius: 2.3 },
  { angle: 360, burstRadius: 3.1, cancelFrames: 81, hitmarkFrames: 40, offset: 2.5, poiseDamage: 148.118, radius: 2.3 },
];

// Measured: gcsim (MIT) kaveh/skill.go, Artistic Ingenuity's circle of radius 5 round the body at 35 frames, and its animation at
// 52 frames. The Dendro Cores it ruptures are not built: see the page
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/kaveh
const SKILL_HITMARK_FRAMES = 35;
const SKILL_FRAMES = 52;
const SKILL_HIT_AREA = createCircleReach(0, 5);

// Measured: gcsim (MIT) kaveh/burst.go, Painted Dome's circle of radius 5 round the body at 36 frames, and its animation at 49
// Frames. Its stance lasts its 720 frames, which the kit starts with the animation rather than at the hit
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/kaveh
const BURST_HITMARK_FRAMES = 36;
const BURST_FRAMES = 49;
const BURST_HIT_AREA = createCircleReach(0, 5);
const BURST_STANCE_SECONDS = 720 / 60;

// Provisional: gcsim gives Kaveh no charged attack (it has no charge file), so its spin and final hit take the table's
// Charged attack shape, as Dori's do, the spin at once and the final hit at the table's maximum duration, each in a circle of
// Radius 2 round the body. A recording of the attack settles all three
const CHARGED_SPIN_HITMARK_SECONDS = 0;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0, 2);
// Provisional: the charged attack drains its stamina per second, as Dori's does, so none is spent as it starts
const CHARGED_ATTACK_STAMINA = 0;

// Measured: gcsim (MIT) kaveh/plunge.go, the low plunge's hitmark at 41 frames with 85 frames of animation and poise 150, the high
// Plunge's at 41 with 84 and poise 200, and the collision at 35 frames, the low plunge's hitmark less six
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/kaveh
const LOW_PLUNGE_HITMARK_FRAMES = 41;
const HIGH_PLUNGE_HITMARK_FRAMES = 41;
const COLLISION_HITMARK_FRAMES = 35;
const LOW_PLUNGE_FRAMES = 85;
const HIGH_PLUNGE_FRAMES = 84;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Provisional: gcsim gives Kaveh's collision no poise, so it deals none until a source gives it
const PLUNGE_COLLISION_POISE_DAMAGE = 0;

export const KAVEH_CHARACTER_ID = 10_000_081;

// Kaveh's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Artistic Ingenuity's
// Circle, and Painted Dome, which strikes its circle and widens his strikes for its twelve seconds. The Dendro Cores his skill
// And burst rupture, Painted Dome's Bloom DMG Bonus and his passives are not built yet
export const createKavehKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KAVEH_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KAVEH_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KAVEH_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const createNormalAttacks = (radiusOf: (strike: (typeof NORMAL_ATTACK_STRIKES)[number]) => number): KitAction[] =>
    NORMAL_ATTACK_STRIKES.map((strike, index) => ({
      hits: [
        {
          hitArea: createFanReach(strike.angle, strike.offset + radiusOf(strike)),
          hitmarkSeconds: strike.hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage: strike.poiseDamage,
          talentMultiplier: attackMultiplier(index),
        },
      ],
      seconds: strike.cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }));

  const normalAttacks = createNormalAttacks((strike) => strike.radius);
  const burstNormalAttacks = createNormalAttacks((strike) => strike.burstRadius);

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Dendro,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_SPIN_HITMARK_SECONDS,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: attackMultiplier(7),
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(5),
      },
    ],
    seconds: attackMultiplier(7),
    staminaPerSecond: attackMultiplier(6),
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalBurst: KitAction = {
    hits: [
      {
        element: Element.Dendro,
        gauge: 2,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(0),
      },
    ],
    onStart: ({ combatant, kitEffectState }) => {
      // Painted Dome's stance widens his strikes for its duration, and plays the rest of his kit as it stands
      const stance: KitStance = {
        actions: {
          chargedAttack,
          chargedAttackStamina: CHARGED_ATTACK_STAMINA,
          elementalBurst,
          elementalSkill,
          normalAttacks: burstNormalAttacks,
        },
        characterId: combatant.characterId,
        elapsedSeconds: 0,
        kind: "stance",
        secondsRemaining: BURST_STANCE_SECONDS,
      };
      addKitEffect(kitEffectState, stance);
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack,
    chargedAttackStamina: CHARGED_ATTACK_STAMINA,
    elementalBurst,
    elementalSkill,
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(10),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.low,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(1),
  };
};
