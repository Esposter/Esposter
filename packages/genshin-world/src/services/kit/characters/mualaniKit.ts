import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

export const MUALANI_CHARACTER_ID = 10_000_102;

// Mualani's proud groups, read at her talent level. The attack group holds her three strikes at 0 to 2, the charged attack
// At 3 with its stamina at 4, and the collision, low and high plunges at 5, 6 and 7. The skill group holds its cooldown at 5.
// The burst group holds Boomsharka-laka's share of Max HP at 0, its cooldown at 1 and its energy cost at 2
const MUALANI_ATTACK_GROUP_ID = 10231;
const MUALANI_SKILL_GROUP_ID = 10232;
const MUALANI_BURST_GROUP_ID = 10239;

// Measured: gcsim (MIT) mualani/attack.go, each strike's animation and its one hitmark at 60 fps, a circle of radius 0.7 on
// The target. The Nightsoul Blessing's Sharky's Bite is not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mualani/attack.go
const NORMAL_ATTACKS: readonly { frames: number; groupIndex: number; hitmarkFrames: number }[] = [
  { frames: 33, groupIndex: 0, hitmarkFrames: 11 },
  { frames: 32, groupIndex: 1, hitmarkFrames: 9 },
  { frames: 67, groupIndex: 2, hitmarkFrames: 31 },
];
const NORMAL_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.7);

// Measured: gcsim (MIT) mualani/charge.go, the charged attack's hit at 71 frames of its 100-frame animation, a circle of radius
// 3.5 one metre ahead of her. Out of idle it starts with a 13-frame windup, which both the hit and the animation carry
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mualani/charge.go
const CHARGED_ATTACK_WINDUP_FRAMES = 13;
const CHARGED_ATTACK_FRAMES = 100;
const CHARGED_ATTACK_HITMARK_FRAMES = 71;
const CHARGED_ATTACK_HIT_AREA = createFanReach(360, 1 + 3.5);

// Provisional: gcsim has no plunge for Mualani, its plunge handlers returning not implemented, so each plunge hits as its
// Action starts, with the plunge reach a kit without a gcsim plunge borrows and no poise. The collision, low and high
// Plunges' multipliers are the table's at 5, 6 and 7, each the plunge's standard share of the collision
const PLUNGE_SECONDS = 0.4;

// Measured: gcsim (MIT) mualani/burst.go, Boomsharka-laka's one hit at 108 frames, which gcsim queues at its travel of 70
// Frames past it, so it lands at 178 frames of its 180-frame animation. A circle of radius 5 round the target
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mualani/burst.go
const BURST_FRAMES = 180;
const BURST_HITMARK_FRAMES = 108 + 70;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 5);

export const createMualaniKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, MUALANI_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const skillMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, MUALANI_SKILL_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const burstMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, MUALANI_BURST_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ frames, groupIndex, hitmarkFrames }) => ({
    hits: [
      {
        hitArea: NORMAL_ATTACK_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(groupIndex),
      },
    ],
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  return {
    burstCooldownSeconds: burstMultiplier(1),
    burstEnergyCost: burstMultiplier(2),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: (CHARGED_ATTACK_WINDUP_FRAMES + CHARGED_ATTACK_HITMARK_FRAMES) / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(3),
        },
      ],
      seconds: (CHARGED_ATTACK_WINDUP_FRAMES + CHARGED_ATTACK_FRAMES) / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(4),
    elementalBurst: {
      hits: [
        {
          // Its damage is its share of Max HP, read off her Max HP as the hit is priced
          additiveBaseDamageBonus: (combatant) => burstMultiplier(0) * combatant.attributes.maxHealth,
          element: Element.Hydro,
          gauge: 1,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalBurst,
          poiseDamage: 0,
          talentMultiplier: 0,
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The Nightsoul Blessing a press starts is not built, so a press has no hit. Its cooldown is the table's six seconds,
    // Which gcsim runs from the Blessing's end
    elementalSkill: { hits: [], seconds: 69 / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.high, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(7) },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.low, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(6) },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(5),
    },
    skillCooldownSeconds: skillMultiplier(5),
  };
};
