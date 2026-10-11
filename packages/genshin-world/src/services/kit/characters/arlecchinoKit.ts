import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

export const ARLECCHINO_CHARACTER_ID = 10_000_096;

// Arlecchino's proud groups, read at her talent level. The attack group holds her six strikes at 0 to 5 with the fourth's
// Two hits both at 3, the charged attack at 6 with its stamina at 7, the collision at 8, and the low and high plunges at
// 9 and 10. The skill group holds Spike at 0, Cleave at 1, the cooldown at 4. The burst group holds its damage at 0, its
// Cooldown at 4 and its energy cost at 5
const ARLECCHINO_ATTACK_GROUP_ID = 9631;
const ARLECCHINO_SKILL_GROUP_ID = 9632;
const ARLECCHINO_BURST_GROUP_ID = 9639;

// Measured: gcsim (MIT) arlecchino/attack.go, each strike's animation and hitmarks at 60 fps, with the hitboxes gcsim
// Offsets them by: a box or a circle's reach priced as its offset plus its radius, so a circle 0.5 metres ahead of her
// And 1 radius reaches 1.5. The Bond of Life's Pyro variant of each strike is not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/arlecchino/attack.go
const NORMAL_ATTACKS: readonly {
  frames: number;
  groupIndex: number;
  hitArea: ReturnType<typeof createFanReach>;
  hitmarkFrames: readonly number[];
}[] = [
  { frames: 24, groupIndex: 0, hitArea: createBoxReach(-0.15, 1.9, 3), hitmarkFrames: [11] },
  { frames: 31, groupIndex: 1, hitArea: createFanReach(300, 2.6 + 0.5), hitmarkFrames: [16] },
  { frames: 39, groupIndex: 2, hitArea: createBoxReach(-1.2, 1.9, 4), hitmarkFrames: [17] },
  { frames: 55, groupIndex: 3, hitArea: createFanReach(360, 2.8 + Math.hypot(0.5, 0.7)), hitmarkFrames: [24, 35] },
  { frames: 43, groupIndex: 4, hitArea: createFanReach(360, 2.5 + 2.4), hitmarkFrames: [21] },
  { frames: 59, groupIndex: 5, hitArea: createFanReach(360, 3 + 2.5), hitmarkFrames: [44] },
];
// Provisional: gcsim gives Arlecchino's strikes no poise, so they carry none until a source gives it
const NORMAL_ATTACK_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) arlecchino/charge.go, the charged attack's hit at 37 frames within its 60-frame animation, a circle
// Of radius 4 0.9 metres ahead of her
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/arlecchino/charge.go
const CHARGED_ATTACK_FRAMES = 60;
const CHARGED_ATTACK_HITMARK_FRAMES = 37;
const CHARGED_ATTACK_HIT_AREA = createFanReach(360, 4 + 0.9);

// Measured: gcsim (MIT) arlecchino/plunge.go, the low and high plunges' hits at 47 and 48 frames, their animations at 79 and
// 81 frames, circles of radius 3 and 5 one metre ahead, and their poise of 100 and 150. The collision, which gcsim queues
// 41 frames into a plunge, is a circle of radius 1 one metre ahead
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/arlecchino/plunge.go
const COLLISION_HITMARK_FRAMES = 41;
const COLLISION_HIT_AREA = createFanReach(360, 1 + 1);
const LOW_PLUNGE_FRAMES = 79;
const LOW_PLUNGE_HITMARK_FRAMES = 47;
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 3 + 1);
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_FRAMES = 81;
const HIGH_PLUNGE_HITMARK_FRAMES = 48;
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 5 + 1);
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) arlecchino/skill.go, All Is Ash's Spike at 17 frames, a circle of radius 0.5 on her, and its Cleave
// At 38 frames, a circle of radius 6 4.5 metres past the target. The skill's animation is 77 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/arlecchino/skill.go
const SKILL_FRAMES = 77;
const SPIKE_HITMARK_FRAMES = 17;
const SPIKE_HIT_AREA = createFanReach(360, 0.5);
const CLEAVE_HITMARK_FRAMES = 38;
// Priced conservatively: the Cleave's circle sits 4.5 metres past the target, so its reach from the target is the offset
// Plus its radius
const CLEAVE_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6 + 4.5);

// Measured: gcsim (MIT) arlecchino/burst.go, Balemoon Rising's hit at 110 frames within its 146-frame animation, a circle of
// Radius 6.5 six metres ahead of her
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/arlecchino/burst.go
const BURST_FRAMES = 146;
const BURST_HITMARK_FRAMES = 110;
const BURST_HIT_AREA = createFanReach(360, 6 + 6.5);

export const createArlecchinoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, ARLECCHINO_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const skillMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, ARLECCHINO_SKILL_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const burstMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, ARLECCHINO_BURST_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ frames, groupIndex, hitArea, hitmarkFrames }) => ({
    hits: hitmarkFrames.map((hitmark) => ({
      hitArea,
      hitmarkSeconds: hitmark / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: NORMAL_ATTACK_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(groupIndex),
    })),
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  return {
    burstCooldownSeconds: burstMultiplier(4),
    burstEnergyCost: burstMultiplier(5),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 1,
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
    // All Is Ash: Spike on her, then Cleave on the target. Blood-Debt Directive is not built
    elementalSkill: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 1,
          hitArea: SPIKE_HIT_AREA,
          hitmarkSeconds: SPIKE_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalSkill,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(0),
        },
        {
          element: Element.Pyro,
          gauge: 1,
          hitArea: CLEAVE_HIT_AREA,
          hitmarkSeconds: CLEAVE_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalSkill,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(1),
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
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
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: COLLISION_HIT_AREA,
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    // Her skill's cooldown is gcsim's 30 seconds, and its reset by the burst is not built
    skillCooldownSeconds: skillMultiplier(4),
  };
};
