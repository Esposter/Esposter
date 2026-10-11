import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Dehya's proud skill groups, read at her talent level. The attack group holds her four strikes at 0 to 3, the charged
// Attack's spin at 4 and its final hit at 5, its stamina per second at 6 and its maximum duration at 7, and the plunges'
// Collision, low and high at 8, 9 and 10. The skill group holds Molten Inferno's damage at 0, Ranging Flame's at 1, the
// Sanctum's DoT at 2 and 3, its mitigation at 4, its field's duration at 6 and its cooldown at 7. The burst group holds
// Flame-Mane's Fist at 0, Incineration Drive at 2, its duration at 4, its cooldown at 5 and its energy cost at 6
const DEHYA_ATTACK_GROUP_ID = 7931;
const DEHYA_SKILL_GROUP_ID = 7932;
const DEHYA_BURST_GROUP_ID = 7939;

// Measured: gcsim (MIT) dehya/attack.go, each strike's hitmarks, the frames its action cancels at by default, its poise, and its
// Reach: a circle or a box ahead of the body. The strikes' box and circle offsets are gcsim's own
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/dehya
const NORMAL_ATTACKS: {
  cancelFrames: number;
  hitArea: KitHit["hitArea"];
  hitmarkFrames: number;
  poiseDamage: number;
}[] = [
  { cancelFrames: 31, hitArea: createCircleReach(0.5, 2.2), hitmarkFrames: 22, poiseDamage: 93.33 },
  { cancelFrames: 34, hitArea: createBoxReach(-1.3, 2.3, 4.3), hitmarkFrames: 26, poiseDamage: 92.72 },
  { cancelFrames: 43, hitArea: createCircleReach(0.5, 1.8), hitmarkFrames: 26, poiseDamage: 115.14 },
  { cancelFrames: 85, hitArea: createBoxReach(-0.8, 3, 4.3), hitmarkFrames: 41, poiseDamage: 143.17 },
];

// Measured: gcsim (MIT) dehya/skill.go, Molten Inferno's circle of radius 5 at 0.8 metres ahead of the body, its hitmark at 20
// Frames and its animation at 39. The Sanctum it leaves, its Molten Inferno DoT, Ranging Flame's reposition and Redmane's
// Blood's mitigation are not built: see the page. Its cooldown is the table's
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/dehya
const SKILL_HITMARK_FRAMES = 20;
const SKILL_FRAMES = 39;
const SKILL_HIT_AREA = createCircleReach(0.8, 5);

// Measured: gcsim (MIT) dehya/burst.go, the first Flame-Mane's Fist at 105 frames, which is where its animation holds until its
// Punches and kick are built. The burst plays no hits yet: its punches and Incineration Drive are not built
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/dehya
const BURST_FRAMES = 105;

// Provisional: gcsim gives Dehya no charged attack (its attack.go leaves it a TODO), so its spin and final hit take the table's
// Charged attack shape, as Dori's do, the spin at once and the final hit at the table's maximum duration, each in a circle of
// Radius 2 round the body. A recording of the attack settles all three
const CHARGED_SPIN_HITMARK_SECONDS = 0;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0, 2);

// Measured: gcsim (MIT) dehya/plunge.go, the low plunge's hitmark at 38 frames with 80 frames of animation and poise 150, the
// High plunge's at 41 with 83 and poise 200, and the collision at 32 frames, the low plunge's hitmark less six
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/dehya
const LOW_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_HITMARK_FRAMES = 41;
const COLLISION_HITMARK_FRAMES = 32;
const LOW_PLUNGE_FRAMES = 80;
const HIGH_PLUNGE_FRAMES = 83;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Provisional: gcsim gives no poise to Dehya's collision, so it deals none until a source gives it
const PLUNGE_COLLISION_POISE_DAMAGE = 0;

export const DEHYA_CHARACTER_ID = 10_000_079;

// Dehya's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, and Molten Inferno's
// Initial hit. Her Sanctum's field, its DoT and mitigation, Ranging Flame's reposition, her burst's punches and kick, and her
// Passives are not built yet
export const createDehyaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DEHYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DEHYA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DEHYA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames, poiseDamage }, index) => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage,
          talentMultiplier: attackMultiplier(index),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const elementalSkillHit: KitHit = {
    element: Element.Pyro,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: skillMultiplier(0),
  };

  return {
    burstCooldownSeconds: burstMultiplier(5),
    burstEnergyCost: burstMultiplier(6),
    chargedAttack: {
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
    },
    chargedAttackStamina: 0,
    elementalBurst: { hits: [], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill: { hits: [elementalSkillHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
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
    skillCooldownSeconds: skillMultiplier(7),
  };
};
