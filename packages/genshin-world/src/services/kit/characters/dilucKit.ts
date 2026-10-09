import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Diluc's proud skill groups, read at its talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's cyclic and final slashes at 4 and 5, the stamina a second and the charge's duration at 6 and 7, and the
// Plunges' collision, low and high at 8, 9 and 10, which the wiki's Tempered Sword values match to two decimals
const DILUC_ATTACK_GROUP_ID = 1631;
const DILUC_SKILL_GROUP_ID = 1632;
const DILUC_BURST_GROUP_ID = 1639;

// Measured: gcsim v2.47.2 (MIT) diluc/attack.go, the fans of the first and third strikes at 300 degrees and radius 2.
// The second and fourth are boxes, which an area does not hold, so each is a circle to the box's farthest corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/attack.go
const CLAYMORE_FAN_HIT_AREA: AttackArea = Object.freeze({ angle: (5 * Math.PI) / 3, height: 2, radius: 2 });
// Provisional: the second strike's box, 2 wide and 3 long, offset one metre behind the feet, to its far corner
const SECOND_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.7 });
// Provisional: the fourth strike's box, offset half a metre behind the feet, to its far corner
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.2 });
// Measured: gcsim v2.47.2 (MIT) diluc/config.yml, the charged attack's spinning slash a circle of radius 3 and its final
// Slash of radius 3.5, both marked not yet implemented there. Their height is provisional
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/config.yml
const CHARGED_CYCLIC_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const CHARGED_FINAL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Measured: gcsim v2.47.2 (MIT) diluc/plunge.go, the collision a circle of radius 1, the low plunge's 3 and the high's 5,
// Each one metre above the feet. Their height is provisional
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Provisional: the Searing Onslaught's box, 3 wide and 3.5 long, to its far corner, until the area holds boxes
const SKILL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.3 });
// Measured: gcsim v2.47.2 (MIT) diluc/skill.go, the second press's fan of 300 degrees and radius 2.2, offset 1.2 metres
// Ahead, so its reach is the offset plus the radius, and the third press's box, 3.5 wide and 4 long, offset 0.3 metres
// Behind, to its far corner. Both are provisional until the area holds offsets and boxes
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/skill.go
const SKILL_SECOND_PRESS_HIT_AREA: AttackArea = Object.freeze({ angle: (5 * Math.PI) / 3, height: 2, radius: 3.4 });
const SKILL_THIRD_PRESS_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.9 });
// Provisional: Dawn's slashing box, 16 wide and 6 long, offset a metre behind the feet, to its far corner
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 7, radius: 8.9 });
// Measured: gcsim v2.47.2 (MIT) diluc/burst.go, the phoenix's tick box, 16 wide and 8 long, and its explosion box, 16 wide
// And 10 long, each priced to its far corner from the phoenix, which is provisional until an area holds boxes
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const DAWN_TICK_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 7, radius: 8.9 });
const DAWN_EXPLOSION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 7, radius: 9.4 });
// The wiki's targeting reach for a sword's attacks, 5 metres and 6 high, and provisional for the skill and burst, as
// The Traveler's are, until the wiki gives them
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) diluc/attack.go strikes' hitmarks and cancel frames at 60 fps, the cancel frame giving
// The action's seconds. Each strike's poise is the wiki's Tempered Sword advanced properties, and each is blunt
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/attack.go
const createNormalAttack = (
  hitArea: AttackArea,
  poiseDamage: number,
  talentMultiplier: number,
  hitmarkSeconds: number,
  seconds: number,
): KitAction => ({
  hits: [
    {
      hitArea,
      hitmarkSeconds,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      isBlunt: true,
      poiseDamage,
      talentMultiplier,
    },
  ],
  seconds,
  targetingArea: SWORD_TARGETING_AREA,
});

// Provisional: gcsim does not model the charged attack and the wiki's table gives no frames for it, so its two slashes
// Land at half a second and a second, and it ends at a second and a fifth, until a recording of it measures them

// Dawn's infusion lasts 8 seconds, and A4 extends it by 4 seconds and gives a 20% Pyro damage bonus for as long
// Wiki: the Dawn infusion's duration and A4's extension and damage bonus, as gcsim v2.47.2 (MIT) diluc/burst.go gives them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const DILUC_INFUSION_SECONDS = 8;
const DILUC_A4_EXTRA_INFUSION_SECONDS = 4;
const DILUC_A4_PYRO_DAMAGE_BONUS = 0.2;

// Measured: gcsim v2.47.2 (MIT) diluc/burst.go, the slash's hitmark at 100 frames, from which the phoenix launches
const DILUC_BURST_HITMARK_SECONDS = 100 / 60;
// Measured: gcsim v2.47.2 (MIT) diluc/burst.go, the phoenix spawns a metre ahead of the body and moves 14 metres a second,
// Striking every 12 frames from its launch, eight times, and exploding 1.7 seconds after its launch, 24.8 metres on
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const DAWN_SPAWN_METRES = 1;
const DAWN_METRES_PER_SECOND = 14;
const DAWN_TICK_INTERVAL_SECONDS = 12 / 60;
const DAWN_TICK_COUNT = 8;
const DAWN_EXPLOSION_SECONDS = 1.7;

// Measured: gcsim v2.47.2 (MIT) diluc/burst.go, the phoenix's ticks and explosion, each 50 durability, 2U of Pyro, and
// Not blunt. gcsim's copy of the slash's 100 poise carries to them, so each keeps it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const createDawnPhoenixHit = (hitArea: AttackArea, hitmarkSeconds: number, talentMultiplier: number): KitHit => ({
  gauge: 2,
  hitArea,
  hitmarkSeconds,
  internalCooldownTag: InternalCooldownTag.ElementalBurst,
  poiseDamage: 100,
  talentMultiplier,
});

// Dawn's phoenix, launched by the slash: it spawns a metre ahead of the body, travels forward from its launch, strikes on
// Each of its ticks and explodes at the end of its path, all priced by the combatant that cast it
const createDawnPhoenix = (
  body: KitBody,
  combatant: Combatant,
  talentMultiplierMap: TalentMultiplierMap,
): KitSummon => {
  const { facing, height, position } = body;
  const tickHits = Array.from({ length: DAWN_TICK_COUNT }, (_value, index) =>
    createDawnPhoenixHit(
      DAWN_TICK_HIT_AREA,
      DILUC_BURST_HITMARK_SECONDS + DAWN_TICK_INTERVAL_SECONDS * (index + 1),
      getTalentMultiplier(talentMultiplierMap, DILUC_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
    ),
  );
  const explosionSeconds = DILUC_BURST_HITMARK_SECONDS + DAWN_EXPLOSION_SECONDS;
  return {
    ...createKitSummon(
      {
        facing,
        height,
        position: {
          x: position.x - Math.sin(facing) * DAWN_SPAWN_METRES,
          z: position.z - Math.cos(facing) * DAWN_SPAWN_METRES,
        },
      },
      combatant,
      [
        ...tickHits,
        createDawnPhoenixHit(
          DAWN_EXPLOSION_HIT_AREA,
          explosionSeconds,
          getTalentMultiplier(talentMultiplierMap, DILUC_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
        ),
      ],
    ),
    travel: { metresPerSecond: DAWN_METRES_PER_SECOND, startSeconds: DILUC_BURST_HITMARK_SECONDS },
  };
};

// Diluc's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Searing Onslaught's
// Three presses and Dawn. Its multipliers are read from its proud skill groups and match the wiki's to two decimal places
export const createDilucKit = (talentMultiplierMap: TalentMultiplierMap): Kit => ({
  burstCooldownSeconds: 12,
  burstEnergyCost: 40,
  chargedAttack: {
    hits: [
      {
        hitArea: CHARGED_CYCLIC_HIT_AREA,
        hitmarkSeconds: 0.5,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        isBlunt: true,
        poiseDamage: 60,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
      },
      {
        hitArea: CHARGED_FINAL_HIT_AREA,
        hitmarkSeconds: 1,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        isBlunt: true,
        poiseDamage: 120,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
      },
    ],
    seconds: 1.2,
    // Measured: the table's stamina a second for the charge, 40, drained while the charge plays, as the wiki gives it
    staminaPerSecond: getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    targetingArea: SWORD_TARGETING_AREA,
  },
  // The charge needs no stamina to start and spends none at once, since its stamina is drained as it plays
  chargedAttackStamina: 0,
  // Measured: gcsim v2.47.2 (MIT) diluc/burst.go, the slash at 100 frames and the cancel frame at 140 frames
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
  elementalBurst: {
    hits: [
      {
        element: Element.Pyro,
        gauge: 2,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: DILUC_BURST_HITMARK_SECONDS,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        isBlunt: true,
        // The wiki's Dawn advanced properties: the slashing damage's 100 poise and 2U of Pyro under an Elemental Burst ICD
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
      },
    ],
    onStart: ({ body, combatant, kitEffectState }) => {
      const hasA4 = combatant.ascension >= 4;
      const secondsRemaining = DILUC_INFUSION_SECONDS + (hasA4 ? DILUC_A4_EXTRA_INFUSION_SECONDS : 0);
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Pyro,
        kind: "infusion",
        secondsRemaining,
      });
      if (hasA4)
        addKitEffect(kitEffectState, {
          amount: DILUC_A4_PYRO_DAMAGE_BONUS,
          attribute: Attribute.PyroDamageBonus,
          characterId: combatant.characterId,
          kind: "buff",
          secondsRemaining,
        });
      addKitEffect(kitEffectState, createDawnPhoenix(body, combatant, talentMultiplierMap));
    },
    seconds: 140 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) diluc/skill.go, the first press's hit at 24 frames and its cancel frame at 32. The wiki's
  // Searing Onslaught gauge is 1U, with no internal cooldown
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/skill.go
  elementalSkill: {
    hits: [
      {
        element: Element.Pyro,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: 24 / 60,
        isBlunt: true,
        poiseDamage: 120,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
      },
    ],
    seconds: 32 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) diluc/skill.go, the three presses' hitmarks, 24, 28 and 46 frames, their cancel frames,
  // 32, 38 and 66, and the window of 4 seconds each press opens. The second and third presses' gauge is 1U each, as the
  // First's, and their multipliers are the table's second and third indices
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/skill.go
  elementalSkillChain: {
    followUps: [
      {
        hits: [
          {
            element: Element.Pyro,
            gauge: 1,
            hitArea: SKILL_SECOND_PRESS_HIT_AREA,
            hitmarkSeconds: 28 / 60,
            isBlunt: true,
            poiseDamage: 120,
            talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
          },
        ],
        seconds: 38 / 60,
        targetingArea: SKILL_TARGETING_AREA,
      },
      {
        hits: [
          {
            element: Element.Pyro,
            gauge: 1,
            hitArea: SKILL_THIRD_PRESS_HIT_AREA,
            hitmarkSeconds: 46 / 60,
            isBlunt: true,
            poiseDamage: 120,
            talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
          },
        ],
        seconds: 66 / 60,
        targetingArea: SKILL_TARGETING_AREA,
      },
    ],
    windowSeconds: 4,
  },
  highPlunge: {
    hits: [
      {
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: 40 / 60,
        isBlunt: true,
        poiseDamage: 200,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
      },
    ],
    seconds: 81 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      {
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: 36 / 60,
        isBlunt: true,
        poiseDamage: 150,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
      },
    ],
    seconds: 78 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    createNormalAttack(
      CLAYMORE_FAN_HIT_AREA,
      108.1,
      getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
      24 / 60,
      32 / 60,
    ),
    createNormalAttack(
      SECOND_STRIKE_HIT_AREA,
      105.57,
      getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
      39 / 60,
      46 / 60,
    ),
    createNormalAttack(
      CLAYMORE_FAN_HIT_AREA,
      119.03,
      getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
      26 / 60,
      34 / 60,
    ),
    createNormalAttack(
      FOURTH_STRIKE_HIT_AREA,
      161.46,
      getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
      49 / 60,
      99 / 60,
    ),
  ],
  // The collision's poise is the wiki's 35, and it applies no gauge of its own, 0U, as the wiki's table gives
  plungeCollision: {
    gauge: 0,
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 35,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, DILUC_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
  },
  skillCooldownSeconds: 10,
});
