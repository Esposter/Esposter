import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Kaeya's proud skill groups, read at his talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack's two hits at 5 and 6, its stamina at 7 and the plunges' collision, low and high at 8, 9 and 10. The skill group
// Holds the press at 0 and its cooldown at 1, and the burst group holds Glacial Waltz's icicle at 0. These are the groups
// Whose values the wiki and gcsim agree on; the talent table's other groups for him, 2531 and 2539, give different strikes
// And icicle
const KAEYA_ATTACK_GROUP_ID = 1531;
const KAEYA_SKILL_GROUP_ID = 1532;
const KAEYA_BURST_GROUP_ID = 1539;

// Measured: gcsim v2.47.2 (MIT) kaeya/attack.go, charge.go, plunge.go and skill.go. Each reach is a circle or box centred
// A metre or so ahead of the body, so each is priced as its far reach from the body until an area holds an offset
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/attack.go
const createCircleReach = (offset: number, radius: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: offset + radius });
const createBoxReach = (offset: number, width: number, length: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(offset + length, width / 2) });
const FIRST_STRIKE_HIT_AREA = createCircleReach(0.8, 1.7);
const SECOND_STRIKE_HIT_AREA = createCircleReach(1.2, 1.5);
const THIRD_STRIKE_HIT_AREA = createBoxReach(-0.2, 1, 2.6);
const FOURTH_STRIKE_HIT_AREA = createBoxReach(0.3, 1, 3.5);
const FIFTH_STRIKE_HIT_AREA = createCircleReach(0.5, 1.8);
const CHARGE_HIT_AREA = createCircleReach(1, 2.2);
const CHARGE_FINAL_HIT_AREA = createCircleReach(1.3, 2.2);
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const FROSTGNAW_HIT_AREA = createBoxReach(-0.2, 4, 8);
// Measured: gcsim v2.47.2 (MIT) kaeya/burst.go, each icicle is a circle of radius 4 round Kaeya
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/burst.go
const ICICLE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) kaeya/burst.go, the icicles run from 53 frames for 534 frames. Three start 40 frames apart
// And each comes round every 120 frames, so the ticks fall on these thirteen frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/burst.go
const ICICLE_HITMARK_FRAMES = [53, 93, 133, 173, 213, 253, 293, 333, 373, 413, 453, 493, 533];
const GLACIAL_WALTZ_SECONDS = 534 / 60;

// Kaeya's hits, all physical, so none applies a gauge. Their poise is the wiki's Ceremonial Bladework advanced properties
const createNormalAttack = (
  hitArea: AttackArea,
  hitmarkSeconds: number,
  talentMultiplier: number,
  poiseDamage: number,
  seconds: number,
): KitAction => ({
  hits: [{ hitArea, hitmarkSeconds, poiseDamage, talentMultiplier }],
  seconds,
  targetingArea: SWORD_TARGETING_AREA,
});

// Glacial Waltz's icicles: each a Cryo hit of 1U under an Elemental Burst internal cooldown, the wiki's 25 poise
const createIcicleHits = (talentMultiplierMap: TalentMultiplierMap): KitHit[] =>
  ICICLE_HITMARK_FRAMES.map((frames) => ({
    element: Element.Cryo,
    gauge: 1,
    hitArea: ICICLE_HIT_AREA,
    hitmarkSeconds: frames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 25,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, KAEYA_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  }));

// Kaeya's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Frostgnaw and Glacial
// Waltz. Its multipliers are read from its proud skill groups. Frostgnaw's damage against Water, A4's particles and
// Glacial Waltz's activation knockback are not built
export const createKaeyaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => ({
  burstCooldownSeconds: 20,
  burstEnergyCost: 80,
  // Measured: gcsim v2.47.2 (MIT) kaeya/charge.go, the two slashes at 16 frames. The wiki's Ceremonial Bladework gives
  // Each 45 poise and no gauge
  chargedAttack: {
    hits: [
      {
        hitArea: CHARGE_HIT_AREA,
        hitmarkSeconds: 16 / 60,
        poiseDamage: 45,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
      },
      {
        hitArea: CHARGE_FINAL_HIT_AREA,
        hitmarkSeconds: 16 / 60,
        poiseDamage: 45,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
      },
    ],
    seconds: 55 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
  // Measured: gcsim v2.47.2 (MIT) kaeya/burst.go, the cancel frame at 78 and the cooldown of 20 seconds. Glacial Waltz's
  // Icicles are a summon's hits, landing from where Kaeya cast it and priced by him
  elementalBurst: {
    hits: [],
    onStart: ({ body, combatant, effects }) =>
      addKitEffect(effects, {
        body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
        combatant,
        elapsedSeconds: 0,
        hits: createIcicleHits(talentMultiplierMap),
        kind: "summon",
        secondsRemaining: GLACIAL_WALTZ_SECONDS,
      }),
    seconds: 78 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) kaeya/skill.go, Frostgnaw's blast at 28 frames and its cancel frame at 53. The wiki's
  // Frostgnaw applies 2U of Cryo with no internal cooldown and 140 poise. Its cooldown is the wiki's 6 seconds, which
  // Gcsim gives too
  elementalSkill: {
    hits: [
      {
        element: Element.Cryo,
        gauge: 2,
        // Measured: gcsim v2.47.2 (MIT) kaeya/skill.go, A1: each enemy Frostgnaw hits heals Kaeya by 15% of his ATK. The
        // Heal is not scaled by Healing Bonus, as the other heals are not
        // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/skill.go
        healAttackShare: (combatant) => (combatant.ascension >= 1 ? 0.15 : 0),
        hitArea: FROSTGNAW_HIT_AREA,
        hitmarkSeconds: 28 / 60,
        poiseDamage: 140,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, KAEYA_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
      },
    ],
    seconds: 53 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  highPlunge: {
    hits: [
      {
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: 47 / 60,
        isBlunt: true,
        poiseDamage: 150,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
      },
    ],
    seconds: 77 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      {
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: 45 / 60,
        isBlunt: true,
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
      },
    ],
    seconds: 74 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    createNormalAttack(
      FIRST_STRIKE_HIT_AREA,
      14 / 60,
      getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
      27.3,
      30 / 60,
    ),
    createNormalAttack(
      SECOND_STRIKE_HIT_AREA,
      9 / 60,
      getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
      23.4,
      25 / 60,
    ),
    createNormalAttack(
      THIRD_STRIKE_HIT_AREA,
      14 / 60,
      getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
      44.1,
      47 / 60,
    ),
    createNormalAttack(
      FOURTH_STRIKE_HIT_AREA,
      23 / 60,
      getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
      56.7,
      46 / 60,
    ),
    createNormalAttack(
      FIFTH_STRIKE_HIT_AREA,
      30 / 60,
      getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
      110.6,
      64 / 60,
    ),
  ],
  // The collision's poise is the wiki's 25, and it applies no gauge, as the wiki's table gives
  plungeCollision: {
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 25,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, KAEYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
  },
  // Measured: gcsim v2.47.2 (MIT) kaeya/skill.go, the 360-frame cooldown, which is the wiki's 6 seconds
  skillCooldownSeconds: 6,
});
