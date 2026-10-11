import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Thoma's proud skill groups, read at his talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds Blazing
// Blessing's damage at 0, its shield's share of Max HP at 1 and its flat HP at 2, the shield's seconds at 3 and its cooldown
// At 6. The burst group holds Crimson Ooyoroi's damage at 0, Fiery Collapse's at 1, its shield's share of Max HP at 2 and its
// Flat HP at 3, the burst's seconds at 6, its cooldown at 7 and its energy cost at 8
const THOMA_ATTACK_GROUP_ID = 5031;
const THOMA_SKILL_GROUP_ID = 5032;
const THOMA_BURST_GROUP_ID = 5039;

// Measured: gcsim (MIT, main) internal/characters/thoma/attack.go, each strike's hitmarks and the frame its action cancels at.
// The first two are fans of 270 degrees centred 0.8 metres ahead of the body, the third and fourth are boxes
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/thoma/attack.go
const NORMAL_ATTACK_STRIKES = [
  { cancelFrames: 21, hitArea: createFanReach(270, 2.8), hitmarkFrames: [13], index: 0 },
  { cancelFrames: 27, hitArea: createFanReach(270, 2.8), hitmarkFrames: [18], index: 1 },
  { cancelFrames: 32, hitArea: createBoxReach(-1, 2.6, 3.5), hitmarkFrames: [10, 23], index: 2 },
  { cancelFrames: 58, hitArea: createBoxReach(0.5, 2.2, 6.5), hitmarkFrames: [20], index: 3 },
];

// Measured: gcsim (MIT, main) internal/characters/thoma/charge.go, the charged attack's hit at 27 frames as a circle of
// Radius 0.8 on the primary target, which an area does not hold, so it is priced at the reach the targeting gives it plus its
// Own, and its animation at 64 frames. https://github.com/genshinsim/gcsim/blob/main/internal/characters/thoma/charge.go
const CHARGED_ATTACK_HITMARK_FRAMES = 27;
const CHARGED_ATTACK_FRAMES = 64;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);

// Measured: gcsim (MIT, main) internal/characters/thoma/skill.go, Blazing Blessing's hit at 11 frames as a fan of 270 degrees
// A metre ahead of the body with a radius of 3, its animation at 46 frames, and its Pyro infusion of its own attacks for 30
// Frames from the cast. The shield is set at 9 frames, which the press sets as it starts
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/thoma/skill.go
const SKILL_HITMARK_FRAMES = 11;
const SKILL_FRAMES = 46;
const SKILL_HIT_AREA = createFanReach(270, 4);
const SKILL_INFUSION_SECONDS = 30 / 60;
const SKILL_GAUGE = 1;

// Measured: gcsim (MIT, main) internal/characters/thoma/burst.go, Crimson Ooyoroi's hit at 40 frames as a circle of radius 4
// Round the body, and its animation at 58 frames. Its 50 durability is a gauge of 2U. Fiery Collapse, which fires on a
// Shielded character's hits, is not built: no kit event reaches a shielded character's damage yet
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/thoma/burst.go
const BURST_HITMARK_FRAMES = 40;
const BURST_FRAMES = 58;
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });
const BURST_GAUGE = 2;

// Provisional: the plunges are the standard ones gcsim's plunge template gives, of the same reach and timing as Ganyu's, as
// His own plunge clips are not in the sources fetched. The table's multipliers for them are read as the rest are
const PLUNGE_SECONDS = 0.4;

// Thoma's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Blazing Blessing's hit
// With its Pyro infusion and shield, and Crimson Ooyoroi's hit. His multipliers are read from his proud skill groups. Fiery
// Collapse, his passives and his constellations are not built yet
export const createThomaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, THOMA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, THOMA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, THOMA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(
    ({ cancelFrames, hitArea, hitmarkFrames, index }): KitAction => ({
      hits: hitmarkFrames.map((frames): KitHit => ({
        hitArea,
        hitmarkSeconds: frames / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(index),
      })),
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  return {
    burstCooldownSeconds: burstTalentMultiplier(7),
    burstEnergyCost: burstTalentMultiplier(8),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(4),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(5),
    elementalBurst: {
      hits: [
        {
          element: Element.Pyro,
          gauge: BURST_GAUGE,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          element: Element.Pyro,
          gauge: SKILL_GAUGE,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: skillTalentMultiplier(0),
        },
      ],
      // Blazing Blessing sets its shield as it starts, from Thoma's Max HP and the table's share and flat HP, for its seconds,
      // and infuses his own attacks with Pyro for the infusion's seconds
      onStart: ({ combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Pyro,
          health: skillTalentMultiplier(1) * combatant.attributes.maxHealth + skillTalentMultiplier(2),
          kind: "shield",
          secondsRemaining: skillTalentMultiplier(3),
        });
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Pyro,
          kind: "infusion",
          secondsRemaining: SKILL_INFUSION_SECONDS,
        });
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(8),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(7),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(6),
    },
    skillCooldownSeconds: skillTalentMultiplier(6),
  };
};
