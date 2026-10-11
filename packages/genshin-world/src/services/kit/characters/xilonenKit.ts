import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

export const XILONEN_CHARACTER_ID = 10_000_103;

// Xilonen's proud groups, read at her talent level. The attack group holds her three strikes at 0, 1, 2 and 3 for the
// Second strike's two hits and the third, the charged attack at 4 with its stamina at 5, and the collision, low and high
// Plunges at 6, 7 and 8. Their Defense shares are the plunges' and the skill's. The skill group holds Yohual's Scratch at
// 0, its cooldown at 5. The burst group holds Ocelotlicue Point's Defense share at 0, its cooldown at 5 and its energy at 6
const XILONEN_ATTACK_GROUP_ID = 10331;
const XILONEN_SKILL_GROUP_ID = 10332;
const XILONEN_BURST_GROUP_ID = 10339;

// Measured: gcsim (MIT) xilonen/attack.go, the strikes' hitmarks, animations, and each hit's circle or fan, which gcsim
// Centres 1 metre ahead for the first strike and half a metre behind for the second and third, priced as their offset plus
// Their radius. The Blade Roller strikes of the Nightsoul Blessing are not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xilonen/attack.go
const NORMAL_ATTACKS: readonly {
  frames: number;
  hits: { groupIndex: number; hitArea: AttackArea; hitmarkFrames: number }[];
}[] = [
  { frames: 34, hits: [{ groupIndex: 0, hitArea: createFanReach(360, 1 + 2.1), hitmarkFrames: 18 }] },
  {
    frames: 57,
    hits: [
      { groupIndex: 1, hitArea: createFanReach(150, 0.5 + 2.5), hitmarkFrames: 16 },
      { groupIndex: 2, hitArea: createFanReach(150, 0.5 + 2.7), hitmarkFrames: 32 },
    ],
  },
  { frames: 70, hits: [{ groupIndex: 3, hitArea: createFanReach(160, 0.5 + 3.2), hitmarkFrames: 22 }] },
];

// Measured: gcsim (MIT) xilonen/charge.go, the charged attack's box at 23 frames of its 42-frame animation, a box 1.8 metres
// Behind her, 2 wide and 4.5 long, with Poise 120. The charged attack costs 20 stamina
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xilonen/charge.go
const CHARGED_ATTACK_FRAMES = 42;
const CHARGED_ATTACK_HITMARK_FRAMES = 23;
const CHARGED_ATTACK_HIT_AREA = createBoxReach(-1.8, 2, 4.5);
const CHARGED_ATTACK_POISE_DAMAGE = 120;

// Measured: gcsim (MIT) xilonen/plunge.go, the collision at 41 frames, a circle of radius 1 one metre ahead, the low plunge at
// 47 frames of 75 with radius 3 and Poise 100, the high at 50 frames with radius 5 and Poise 150. Each plunge's damage is
// Its share of Defense
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xilonen/plunge.go
const PLUNGE_FRAMES = 75;
const COLLISION_HITMARK_FRAMES = 41;
const COLLISION_HIT_AREA = createFanReach(360, 1 + 1);
const LOW_PLUNGE_HITMARK_FRAMES = 47;
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 1 + 3);
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 50;
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 1 + 5);
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) xilonen/skill.go, Yohual's Scratch's hit at 6 frames of its 20-frame animation, a circle of radius
// 0.8 one metre ahead of her, its damage her Defense share. The press then starts the Nightsoul Blessing, which is not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xilonen/skill.go
const SKILL_FRAMES = 20;
const SKILL_HITMARK_FRAMES = 6;
const SKILL_HIT_AREA = createFanReach(360, 1 + 0.8);

// A hit's damage as a share of its striker's Defense, read as the hit is priced
const defenseShare = (multiplier: number) => (combatant: Combatant) => multiplier * combatant.attributes.defense;

export const createXilonenKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, XILONEN_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const skillMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, XILONEN_SKILL_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const burstMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, XILONEN_BURST_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ frames, hits }) => ({
    hits: hits.map(({ groupIndex, hitArea, hitmarkFrames }) => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(groupIndex),
    })),
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  return {
    burstCooldownSeconds: burstMultiplier(5),
    burstEnergyCost: burstMultiplier(6),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(4),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(5),
    // Ocelotlicue Point is not built: its damage is read only with fewer than two Samplers in the party, which a kit step
    // Cannot count yet, and its heal, which it gives with two or more, is a timed heal that is not built either
    elementalBurst: { hits: [], seconds: 101 / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill: {
      hits: [
        {
          additiveBaseDamageBonus: defenseShare(skillMultiplier(0)),
          element: Element.Geo,
          gauge: 1,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalSkill,
          poiseDamage: 0,
          talentMultiplier: 0,
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          additiveBaseDamageBonus: defenseShare(attackMultiplier(8)),
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: 0,
        },
      ],
      seconds: PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          additiveBaseDamageBonus: defenseShare(attackMultiplier(7)),
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: 0,
        },
      ],
      seconds: PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      additiveBaseDamageBonus: defenseShare(attackMultiplier(6)),
      hitArea: COLLISION_HIT_AREA,
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: 0,
    },
    skillCooldownSeconds: skillMultiplier(5),
  };
};
