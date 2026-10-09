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

// Chongyun's proud skill groups, read at his talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's cyclic and final slashes at 4 and 5 and its stamina a second at 6, and the plunges' collision, low and high at
// 8, 9 and 10. The skill group holds Layered Frost's damage at 0, the infusion's seconds at 1, its cooldown at 2 and its
// Field's seconds at 3. The burst group holds Cloud-Parting Star's damage at 0, its cooldown at 1 and its energy cost at 2
const CHONGYUN_ATTACK_GROUP_ID = 3631;
const CHONGYUN_SKILL_GROUP_ID = 3632;
const CHONGYUN_BURST_GROUP_ID = 3639;

// Measured: gcsim v2.47.2 (MIT) chongyun/attack.go, each strike's circle or box as priced from the body: a circle is its
// Offset plus its radius, a fan keeps its angle, and a box spawns on its near edge, so it is priced as the circle to its far
// Corner. The fourth strike's box is 2 wide and 3 long from half a metre behind
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2 });
const SECOND_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: (3 * Math.PI) / 2, height: 2, radius: 1 + 2 });
const THIRD_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(2.5, 2 / 2),
});
// Measured: gcsim v2.47.2 (MIT) chongyun/config.yml, the charged attack's spinning circle of radius 3 a third of a metre
// Ahead and its final circle of radius 3.5, both marked not yet implemented there
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/config.yml
const CHARGED_CYCLIC_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.3 + 3 });
const CHARGED_FINAL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Measured: gcsim v2.47.2 (MIT) chongyun/plunge.go, the collision's circle of radius 1 a metre ahead, and the low and high
// Plunges' of 3 and 5 a metre ahead, each priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 5 });
// Measured: gcsim v2.47.2 (MIT) chongyun/skill.go, Layered Frost's circle of radius 2.5 centred 1.5 metres ahead, priced
// As its offset plus its radius, and the field it leaves, a circle of radius 8 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/skill.go
const SKILL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 + 2.5 });
const FIELD_RADIUS = 8;
const FIELD_OFFSET_METRES = 1.5;
// Provisional: gcsim v2.47.2 (MIT) chongyun/burst.go drops each blade as a circle of radius 3.5 on the primary target, which
// An area does not hold, so a blade reaches the 5 metres an attack targets within, as Xingqiu's sword rain does
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the other kits' are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) chongyun/attack.go, each strike's hitmark, animation and poise at 60 fps. Each strike is
// Blunt, and each is physical
const CHONGYUN_STRIKES = [
  { animationFrames: 30, hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 26, index: 0, poiseDamage: 105 },
  { animationFrames: 36, hitArea: SECOND_STRIKE_HIT_AREA, hitmarkFrames: 24, index: 1, poiseDamage: 95 },
  { animationFrames: 57, hitArea: THIRD_STRIKE_HIT_AREA, hitmarkFrames: 41, index: 2, poiseDamage: 121 },
  { animationFrames: 101, hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 53, index: 3, poiseDamage: 152 },
];

// Measured: gcsim v2.47.2 (MIT) chongyun/skill.go, Layered Frost's hit at 36 frames, its animation's 52, and the field
// Ticking each second from the hit, which infuses the active character with Cryo while it stands in the field
const SKILL_ANIMATION_FRAMES = 52;
const SKILL_HITMARK_FRAMES = 36;
const SKILL_HIT_POISE_DAMAGE = 150;
const FIELD_TICK_SECONDS = 1;
// The field lasts from its hit for its seconds, which the table gives as 10, and a tenth of a second past its last tick
const FIELD_TICK_MARGIN_SECONDS = 0.1;

// Measured: gcsim v2.47.2 (MIT) chongyun/burst.go, the three blades at 50, 59 and 67 frames and the animation's 79. Each
// Blade's poise is 100, as gcsim gives it
const BURST_ANIMATION_FRAMES = 79;
const BURST_HITMARK_FRAMES = [50, 59, 67];
const BURST_POISE_DAMAGE = 100;

// Provisional: gcsim has the charged attack's spinning and final slashes marked not yet implemented, so they land at half a
// Second and a second, as Beidou's and Razor's do, and the charged attack ends at a second and a fifth. The wiki's
// Advanced properties give the cyclic slash 60 poise and the final 120, both blunt
const CHARGED_CYCLIC_HITMARK_SECONDS = 0.5;
const CHARGED_FINAL_HITMARK_SECONDS = 1;
const CHARGED_ATTACK_SECONDS = 1.2;
const CHARGED_CYCLIC_POISE_DAMAGE = 60;
const CHARGED_FINAL_POISE_DAMAGE = 120;

// Measured: gcsim v2.47.2 (MIT) chongyun/plunge.go, the low plunge's hitmark at 47 frames and animation's 85, the high's 47
// And 87. The wiki's advanced properties give the low and high plunges 150 and 200 poise, as gcsim gives them, and the
// Collision 35, which gcsim gives none
const LOW_PLUNGE_HITMARK_FRAMES = 47;
const LOW_PLUNGE_ANIMATION_FRAMES = 85;
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_ANIMATION_FRAMES = 87;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;
const PLUNGE_COLLISION_POISE_DAMAGE = 35;

// Chongyun's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Spirit Blade:
// Chonghua's Layered Frost with its field that infuses the active character, and Spirit Blade: Cloud-Parting Star. Its
// Multipliers are read from his proud skill groups. Rimechaser Blade (A4), Steady Breathing (A1), the swap infusion and
// The constellations wait for events the kit does not see: a field's end, a swap and the attack speed of its characters.
// The charged attack's stamina is drained a second for as long as it plays, as Beidou's is
export const createChongyunKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHONGYUN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHONGYUN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHONGYUN_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // A claymore's strikes are physical and blunt under the Normal Attack internal cooldown
  const normalAttacks: KitAction[] = CHONGYUN_STRIKES.map(
    ({ animationFrames, hitArea, hitmarkFrames, index, poiseDamage }): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage,
          talentMultiplier: attackTalentMultiplier(index),
        },
      ],
      seconds: animationFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  // Layered Frost's field infuses the active character with Cryo each second while it stands in the field, for the infusion's
  // Seconds, and its hit lands at its hitmark with 2U of Cryo and 150 poise
  const infusionSeconds = skillTalentMultiplier(1);
  const skillHit: KitHit = {
    element: Element.Cryo,
    gauge: 2,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: SKILL_HIT_POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(0),
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(1),
    burstEnergyCost: burstTalentMultiplier(2),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_CYCLIC_HIT_AREA,
          hitmarkSeconds: CHARGED_CYCLIC_HITMARK_SECONDS,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage: CHARGED_CYCLIC_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(4),
        },
        {
          hitArea: CHARGED_FINAL_HIT_AREA,
          hitmarkSeconds: CHARGED_FINAL_HITMARK_SECONDS,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage: CHARGED_FINAL_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(5),
        },
      ],
      seconds: CHARGED_ATTACK_SECONDS,
      staminaPerSecond: attackTalentMultiplier(6),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    // Cloud-Parting Star's three blades, each 1U of Cryo, from the cast, with no internal cooldown
    elementalBurst: {
      hits: BURST_HITMARK_FRAMES.map((hitmarkFrames): KitHit => ({
        element: Element.Cryo,
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: BURST_POISE_DAMAGE,
        talentMultiplier: burstTalentMultiplier(0),
      })),
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [skillHit],
      onStart: ({ body, combatant, kitEffectState }) => {
        // The field is placed as the press's hit is, a metre and a half ahead of the body
        const fieldCentre = {
          x: body.position.x - Math.sin(body.facing) * FIELD_OFFSET_METRES,
          z: body.position.z - Math.cos(body.facing) * FIELD_OFFSET_METRES,
        };
        addKitEffect(kitEffectState, {
          centre: fieldCentre,
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: SKILL_HITMARK_FRAMES / 60,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState }) =>
            addKitEffect(tickEffectState, {
              characterId: activeCombatant.characterId,
              element: Element.Cryo,
              kind: "infusion",
              secondsRemaining: infusionSeconds,
            }),
          radius: FIELD_RADIUS,
          secondsRemaining: skillTalentMultiplier(3) + SKILL_HITMARK_FRAMES / 60 + FIELD_TICK_MARGIN_SECONDS,
          tickIndex: 0,
          tickIntervalSeconds: FIELD_TICK_SECONDS,
        });
      },
      seconds: SKILL_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: HIGH_PLUNGE_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(2),
  };
};
