import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Tighnari's proud skill groups, read at his talent level. The attack group holds his four strikes at 0, 1, 2 and 3, the
// Third strike's two hits both at 2, the fully charged shot at 5, Wreath Arrow at 6 and Clusterbloom Arrow at 7, and the
// Plunges' collision, low and high at 8, 9 and 10. The skill group holds Vijnana-Phala Mine at 0 and its cooldown at 3. The
// Burst group holds Tanglevine Shaft's hit at 0, its Secondary Tanglevine Shaft at 1, its cooldown at 2 and its energy cost
// At 3
const TIGHNARI_ATTACK_GROUP_ID = 6931;
const TIGHNARI_SKILL_GROUP_ID = 6932;
const TIGHNARI_BURST_GROUP_ID = 6939;

// Measured: gcsim v2.47.2 (MIT) tighnari/attack.go, each strike's hitmarks and the frames its action cancels at, its arrow
// Travelling 10 frames to its target, which lands it at the hitmark plus the travel. Each arrow lands on the primary target
// Through a box, priced as a circle of a metre round the body, as Ganyu's arrows are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 26, hitmarkFramesList: [14] },
  { cancelFrames: 23, hitmarkFramesList: [12] },
  { cancelFrames: 37, hitmarkFramesList: [13, 25] },
  { cancelFrames: 68, hitmarkFramesList: [28] },
];

// Measured: gcsim v2.47.2 (MIT) tighnari/aimed.go, the fully charged shot's animation at 94 frames, its arrow at 86 and
// Travelling 10 frames to its target, so it lands at 96 frames, as gcsim's arrow does when the animation's end is taken
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/aimed.go
const FULL_CHARGE_FRAMES = 96;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;

// Measured: gcsim v2.47.2 (MIT) tighnari/skill.go, Vijnana-Phala Mine's hit at 20 frames, 15 for its release and 5 for its
// Travel, a circle of radius 6 round the primary target, with the animation at 30 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/skill.go
const SKILL_FRAMES = 30;
const VIJNANA_PHALA_MINE_HITMARK_FRAMES = 15 + 5;
const VIJNANA_PHALA_MINE_HIT_AREA: AttackArea = createTargetedHitArea(SKILL_TARGETING_AREA, 6);

// Measured: gcsim v2.47.2 (MIT) tighnari/burst.go, Tanglevine Shaft's animation at 118 frames, its six hits at 112 to 128
// Frames, and the Secondary Tanglevine Shaft's six at 147 to 175, each a circle of radius 1 round the primary target
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/burst.go
const BURST_FRAMES = 118;
const TANGLEVINE_SHAFT_HITMARK_FRAMES = [112, 117, 120, 121, 126, 128];
const SECONDARY_TANGLEVINE_SHAFT_HITMARK_FRAMES = [147, 153, 160, 161, 171, 175];
const TANGLEVINE_SHAFT_HIT_AREA: AttackArea = createTargetedHitArea(SKILL_TARGETING_AREA, 1);

// Provisional: gcsim gives Tighnari's strikes, Vijnana-Phala Mine and his burst no poise, so these stand at 0 until a source
// Gives them. The plunges borrow Bennett's, as gcsim v2.47.2 (MIT) bennett/plunge.go and the wiki's collision give them, since
// Tighnari's gcsim folder has no plunge file of its own
const NO_POISE_DAMAGE = 0;
const PLUNGE_COLLISION_POISE_DAMAGE = 25;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const LOW_PLUNGE_FRAMES = 67;
const HIGH_PLUNGE_FRAMES = 68;

export const TIGHNARI_CHARACTER_ID = 10_000_069;

// Tighnari's first kit, at talent level 1: four strikes, a fully charged shot, a collision and two plunges, Vijnana-Phala
// Mine, and Tanglevine Shaft with its Secondary Tanglevine Shaft. Vijnana Suffusion's Wreath Arrow, which turns the
// Charged shot into a shot of its own, is not built: the kit offers no charged variant yet. His passives and constellations
// Are not built either, as they wait on the passive hook
export const createTighnariKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitmarkFramesList }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: hitmarkFramesList.map((hitmarkFrames) => ({
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
      poiseDamage: NO_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
    })),
    // The action runs until its arrow lands, which a hit past the cancel does not wait for otherwise
    seconds: Math.max(cancelFrames, Math.max(...hitmarkFramesList) + ARROW_TRAVEL_FRAMES) / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const fullyChargedArrowHit: KitHit = {
    element: Element.Dendro,
    gauge: 1,
    hitArea: ARROW_HIT_AREA,
    hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
  };
  const vijnanaPhalaMineHit: KitHit = {
    element: Element.Dendro,
    gauge: 1,
    hitArea: VIJNANA_PHALA_MINE_HIT_AREA,
    hitmarkSeconds: VIJNANA_PHALA_MINE_HITMARK_FRAMES / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const tanglevineShaftHits: KitHit[] = TANGLEVINE_SHAFT_HITMARK_FRAMES.map((hitmarkFrames) => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea: TANGLEVINE_SHAFT_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  }));
  const secondaryTanglevineShaftHits: KitHit[] = SECONDARY_TANGLEVINE_SHAFT_HITMARK_FRAMES.map((hitmarkFrames) => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea: TANGLEVINE_SHAFT_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
  }));
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, TIGHNARI_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, TIGHNARI_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    chargedAttack: {
      hits: [fullyChargedArrowHit],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      // Tanglevine Shaft's hits and its secondary's land past the animation, so they are cast with the burst as a summon
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        addKitEffect(
          kitEffectState,
          createKitSummon(body, combatant, [...tanglevineShaftHits, ...secondaryTanglevineShaftHits]),
        );
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [vijnanaPhalaMineHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
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
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, TIGHNARI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, TIGHNARI_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
  };
};
