import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// The Traveler's Anemo form's proud skill groups, read at its talent level. The attacks' group is the female form's, 731,
// Whose charged attack's second hit is the wiki's 72.24%; the male form's, 730, gives 60.716%
const TRAVELER_ATTACK_GROUP_ID = 731;
const TRAVELER_SKILL_GROUP_ID = 732;
const TRAVELER_BURST_GROUP_ID = 739;

// Provisional: the strikes' and charged attack's reach, read off a recording until the attack clips measure it
const SWORD_HIT_AREA: AttackArea = Object.freeze({ angle: (2 * Math.PI) / 3, height: 2, radius: 2 });
// Palm Vortex's reach as the wiki gives it, 6 metres at 100 degrees and 2 high
const PALM_VORTEX_HIT_AREA: AttackArea = Object.freeze({ angle: (5 * Math.PI) / 9, height: 2, radius: 6 });
// Provisional: the burst's reach, read off a recording until the attack clips measure it
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 7, radius: 3 });
// The plunge collision's reach as the wiki gives it, 1 metre all round, its height taken as the low plunge's
// Provisional: the collision's height, which the wiki does not give
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
// Provisional: the low and high plunges' reach, read off a recording until the plunge clips measure it
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.5 });
// The wiki's targeting reach for a sword's attacks, 5 metres and 6 high, and for Palm Vortex, 15 metres and 10 high
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
// Provisional: the burst's and the plunges' targeting reach, taken as the skill's and a sword's until the wiki gives them
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) traveler/common/anemo attack.go, 60 fps frames, for the hitmarks and seconds. The file
// Gives no poise, so each strike's poise is provisional until a source gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/anemo/attack.go
const createNormalAttack = (
  talentMultiplier: number,
  poiseDamage: number,
  hitmarkSeconds: number,
  seconds: number,
): KitAction =>
  Object.freeze({
    hits: [
      {
        hitArea: SWORD_HIT_AREA,
        hitmarkSeconds,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage,
        talentMultiplier,
      },
    ],
    seconds,
    targetingArea: SWORD_TARGETING_AREA,
  });

// The Traveler's first kit, at talent level 1, as the wiki's Lumine's Foreign Ironwind gives it: five strikes, a charged
// Attack, a collision and two plunges, then Palm Vortex and Gust Surge at the element a statue gives them, at 1U. Its
// Multipliers are read from the loaded table's Anemo form's proud skill groups, which match the wiki's to two decimal places
export const createTravelerKit = (talentMultiplierMap: TalentMultiplierMap): Kit => ({
  burstCooldownSeconds: 15,
  burstEnergyCost: 60,
  // Measured: gcsim v2.47.2 (MIT) traveler/common/anemo charge.go, 60 fps frames,
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/anemo/charge.go
  chargedAttack: {
    hits: [
      {
        hitArea: SWORD_HIT_AREA,
        hitmarkSeconds: 14 / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 50.6,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
      },
      {
        hitArea: SWORD_HIT_AREA,
        hitmarkSeconds: 25 / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 50.6,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
      },
    ],
    seconds: 58 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  chargedAttackStamina: 20,
  // Measured: gcsim v2.47.2 (MIT) traveler/common/anemo burst.go, 60 fps frames,
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/anemo/burst.go
  elementalBurst: {
    hits: [
      {
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: 94 / 60,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        // Measured: gcsim v2.47.2 (MIT) sets no poise damage on the anemo burst, so none stands
        // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/anemo/burst.go
        poiseDamage: 0,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, TRAVELER_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
      },
    ],
    seconds: 105 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) traveler/common/anemo skill.go, 60 fps frames,
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/anemo/skill.go
  elementalSkill: {
    hits: [
      {
        gauge: 1,
        hitArea: PALM_VORTEX_HIT_AREA,
        hitmarkSeconds: 34 / 60,
        internalCooldownTag: InternalCooldownTag.ElementalSkill,
        // Measured: gcsim v2.47.2 (MIT) sets no poise damage on the anemo skill, so none stands
        // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/anemo/skill.go
        poiseDamage: 0,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, TRAVELER_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
      },
    ],
    seconds: 61 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Provisional: no source gives the plunges' landing frames, so each hits as its action starts. Their poise is gcsim
  // V2.47.2's (MIT) plunge poise, in its pyro plunge file:
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/pyro/plunge.go
  highPlunge: {
    hits: [
      {
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: 0,
        isBlunt: true,
        poiseDamage: 150,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
      },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      {
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: 0,
        isBlunt: true,
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
      },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    createNormalAttack(
      getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
      40.5,
      16 / 60,
      24 / 60,
    ),
    createNormalAttack(
      getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
      39.6,
      10 / 60,
      21 / 60,
    ),
    createNormalAttack(
      getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
      48.6,
      19 / 60,
      27 / 60,
    ),
    createNormalAttack(
      getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
      54,
      23 / 60,
      38 / 60,
    ),
    createNormalAttack(
      getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
      64.8,
      14 / 60,
      64 / 60,
    ),
  ],
  plungeCollision: {
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 25,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, TRAVELER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
  },
  skillCooldownSeconds: 5,
});
