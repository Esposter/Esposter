import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

export const CHASCA_CHARACTER_ID = 10_000_104;

// Chasca's proud groups, read at her talent level. The attack group holds her four normal attacks' hits at 0 to 3, the
// Aimed Shot at 4, the fully-charged Aimed Shot at 5, and the collision, low and high plunges at 6, 7 and 8. The skill
// Group holds Spirit Reins' Resonance at 0 and its cooldown at 5. The burst group holds Galesplitting Soulseeker Shell at
// 0, its cooldown at 3 and its energy at 4
const CHASCA_ATTACK_GROUP_ID = 10431;
const CHASCA_SKILL_GROUP_ID = 10432;
const CHASCA_BURST_GROUP_ID = 10439;

// Measured: gcsim (MIT) chasca/attack.go, the normal attacks' hitmarks and animations, each strike's box of 0.1 by 1 metre
// Half a metre ahead of her, which the Sethos box also takes. The fourth strike is one hit at 39 frames, as gcsim queues it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chasca/attack.go
const NORMAL_ATTACKS: readonly { frames: number; hits: { groupIndex: number; hitmarkFrames: number }[] }[] = [
  { frames: 27, hits: [{ groupIndex: 0, hitmarkFrames: 10 }] },
  { frames: 29, hits: [{ groupIndex: 1, hitmarkFrames: 8 }] },
  {
    frames: 53,
    hits: [
      { groupIndex: 2, hitmarkFrames: 14 },
      { groupIndex: 2, hitmarkFrames: 20 },
    ],
  },
  { frames: 73, hits: [{ groupIndex: 3, hitmarkFrames: 39 }] },
];
const STRIKE_HIT_AREA: AttackArea = createBoxReach(-0.5, 0.1, 1);

// Measured: gcsim (MIT) chasca/aimed.go, the fully-charged Aimed Shot at 86 frames of a 96-frame animation, its Anemo box as
// The strikes', and no Poise. Its stamina is none, as the other bows' are
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chasca/aimed.go
const CHARGED_ATTACK_FRAMES = 96;
const CHARGED_ATTACK_HITMARK_FRAMES = 86;

// Measured: gcsim (MIT) chasca/plunge.go, the low plunge at 50 frames of an 80-frame animation with its radius of 3, and the
// Collision at 44 frames, a circle of radius 1.5 at her. gcsim gives no high plunge, so the high one below is provisional
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chasca/plunge.go
const PLUNGE_FRAMES = 80;
const COLLISION_HITMARK_FRAMES = 44;
const COLLISION_HIT_AREA = createFanReach(360, 1.5);
const LOW_PLUNGE_HITMARK_FRAMES = 50;

// Measured: gcsim (MIT) chasca/skill.go, Spirit Reins' Resonance at 3 frames, a circle of radius 5.5 round her, and the
// Earliest cancel of its press at 6 frames. The press then starts the Nightsoul Blessing, which is not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chasca/skill.go
const SKILL_FRAMES = 6;
const SKILL_HITMARK_FRAMES = 3;
const SKILL_HIT_AREA = createFanReach(360, 5.5);

// Measured: gcsim (MIT) chasca/burst.go, Galesplitting Soulseeker Shell at 96 frames of a 114-frame animation, a circle of
// Radius 6 on the primary target. The five shells after it depend on the party's elements, which a kit step cannot read yet
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chasca/burst.go
const BURST_FRAMES = 114;
const BURST_HITMARK_FRAMES = 96;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6);

export const createChascaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHASCA_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const skillMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHASCA_SKILL_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const burstMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHASCA_BURST_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ frames, hits }) => ({
    hits: hits.map(({ groupIndex, hitmarkFrames }) => ({
      hitArea: STRIKE_HIT_AREA,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(groupIndex),
    })),
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack: {
      hits: [
        {
          element: Element.Anemo,
          hitArea: STRIKE_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(5),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // A bow's charged attack spends no stamina, as the table gives the bows
    chargedAttackStamina: 0,
    // Galesplitting is the burst's first hit. Its five Soulseeker shells after it are not built, since their Radiant
    // Shells take the party's elements, which a kit step cannot read yet
    elementalBurst: {
      hits: [
        {
          element: Element.Anemo,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalBurst,
          poiseDamage: 0,
          talentMultiplier: burstMultiplier(0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          element: Element.Anemo,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalSkill,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(0),
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The high plunge is provisional: gcsim gives its multiplier and no hitmark, so it lands with the low plunge's
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(8),
        },
      ],
      seconds: PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.low,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(7),
        },
      ],
      seconds: PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: COLLISION_HIT_AREA,
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(5),
  };
};
