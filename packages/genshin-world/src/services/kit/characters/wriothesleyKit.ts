import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Wriothesley's proud skill groups, read at his talent level. The attack group holds the strikes at 0 to 5 (the fourth
// Strike's two hits at 3 and 4), the charged attack at 6 and its stamina at 7, and the plunges' collision, low and high at
// 8, 9 and 10. The skill group holds Icefang Rush's enhanced strike at 0 and its cooldown at 3. The burst group holds
// Darkgold Wolfbite's strikes at 0, the Surging Blade at 1, its cooldown at 2 and its energy cost at 3
const WRIOTHESLEY_ATTACK_GROUP_ID = 8631;
const WRIOTHESLEY_SKILL_GROUP_ID = 8632;
const WRIOTHESLEY_BURST_GROUP_ID = 8639;

export const WRIOTHESLEY_CHARACTER_ID = 10_000_086;

// Measured: gcsim (MIT) wriothesley/attack.go, each strike's hitmarks, the frame its action cancels at by default, and its box
// On the target, whose length prices its reach. A strike deals no poise, and its box is priced as the circle of its length
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wriothesley
const STRIKE_HIT_RADIUS = 3;
const NORMAL_ATTACKS = [
  { cancelFrames: 27, hits: [{ hitmarkFrames: 12, talentIndex: 0 }] },
  { cancelFrames: 25, hits: [{ hitmarkFrames: 10, talentIndex: 1 }] },
  { cancelFrames: 41, hits: [{ hitmarkFrames: 18, talentIndex: 2 }] },
  {
    cancelFrames: 56,
    hits: [
      { hitmarkFrames: 25, talentIndex: 3 },
      { hitmarkFrames: 35, talentIndex: 4 },
    ],
  },
  { cancelFrames: 59, hits: [{ hitmarkFrames: 39, talentIndex: 5 }] },
];

// Measured: gcsim (MIT) wriothesley/charge.go, the charged attack's box at 19 frames with its animation at 52 frames and 110
// Poise, in the box its base form reaches, which is its box of 2.8 by 3.6 1.2 metres behind the body. Its ascension and
// Constellation boxes are not built
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wriothesley
const CHARGED_ATTACK_FRAMES = 52;
const CHARGED_ATTACK_HITMARK_FRAMES = 19;
const CHARGED_ATTACK_POISE_DAMAGE = 110;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 3.6);

// Measured: gcsim (MIT) wriothesley/plunge.go, the low plunge at 44 frames with its animation at 75, the high at 47 frames with
// Its animation at 76, and the collision at 38 frames on a circle of radius 1.5, which deals no poise. gcsim gives the plunges
// No poise
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wriothesley
const LOW_PLUNGE_HITMARK_FRAMES = 44;
const LOW_PLUNGE_FRAMES = 75;
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_FRAMES = 76;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(0, 3.5);
const PLUNGE_COLLISION_HITMARK_FRAMES = 38;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(0, 1.5);

// Measured: gcsim (MIT) wriothesley/skill.go, Icefang Rush's animation at 29 frames. The skill deals no damage of its own, and
// Its cooldown is the table's sixteen seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wriothesley
const SKILL_FRAMES = 29;

// Measured: gcsim (MIT) wriothesley/burst.go, Darkgold Wolfbite's five strikes from 99 frames and every 5 frames after, each on
// The target's box, with its animation at 133 frames. The box is priced as the circle of its half length of eight metres
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wriothesley
const BURST_FRAMES = 133;
const BURST_HITMARK_FRAMES = [99, 104, 109, 114, 119];
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 8);

// Not built yet: Icefang Rush's enhanced normal attacks, the strike multiplied by the skill's enhancement, their Chilling
// Penalty drain and their particles. Both wait on the wearer's HP, which a kit's combatant does not carry, and the enhancement
// Ends when the skill's ten seconds do or the wearer swaps off. Darkgold Wolfbite's Surging Blade hits at 160 frames, past the
// Burst's animation, so it waits on a timed hit. His passives and constellations are not built.
export const createWriothesleyKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, WRIOTHESLEY_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, WRIOTHESLEY_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, WRIOTHESLEY_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hits }) => ({
    hits: hits.map(({ hitmarkFrames, talentIndex }): KitHit => ({
      hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, STRIKE_HIT_RADIUS),
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(talentIndex),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst: {
      hits: BURST_HITMARK_FRAMES.map((frames): KitHit => ({
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: frames / 60,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(0),
      })),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: 0,
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
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(3),
  };
};
