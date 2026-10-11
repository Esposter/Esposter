import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Xianyun's proud skill groups, read at her talent level. The attack group holds her four strikes at 0 to 3, her charged
// Attack at 4, the plunge collision at 6, the low plunge at 7 and the high at 8. The skill group holds Skyladder's press at 0
// And its cooldown at 4. The burst group holds Stars Gather at Dusk's damage at 0 and its cooldown at 9 and its energy cost at
// 10
const XIANYUN_ATTACK_GROUP_ID = 9331;
const XIANYUN_SKILL_GROUP_ID = 9332;
const XIANYUN_BURST_GROUP_ID = 9339;

// Measured: gcsim (MIT, main) xianyun/attack.go, the four strikes' animations, hitmarks and circles. Each strike's damage lands
// Travel frames after its hitmark, the travel gcsim gives a strike by default
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xianyun/attack.go
const STRIKE_TRAVEL_FRAMES = 10;
const STRIKES = [
  { animationFrames: 34, hitmarkFrames: 12, index: 0, radius: 0.8 },
  { animationFrames: 38, hitmarkFrames: 14, index: 1, radius: 0.8 },
  { animationFrames: 65, hitmarkFrames: 34, index: 2, radius: 0.8 },
  { animationFrames: 93, hitmarkFrames: 38, index: 3, radius: 1 },
];

// Measured: gcsim (MIT, main) xianyun/charge.go, the charged attack's animation at 73 frames and its hit at 56 frames, which
// Travels as a strike does to a circle of radius 3. Taken as gcsim gives it outside a normal attack: the windup gcsim takes off
// Both after one is not modelled
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xianyun/charge.go
const CHARGED_ATTACK_FRAMES = 73;
const CHARGED_ATTACK_HITMARK_FRAMES = 56 + STRIKE_TRAVEL_FRAMES;
const CHARGED_ATTACK_RADIUS = 3;

// Measured: gcsim (MIT, main) xianyun/plunge.go, the low plunge's animation at 65 frames and its circle of radius 3 landing at 44
// Frames, and the high plunge's at 68 frames and its circle of radius 3.5 landing at 46. The collision is a circle of radius 1.5
// Which the plunge's own collision interval strikes with
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xianyun/plunge.go
const LOW_PLUNGE = { animationFrames: 65, hitmarkFrames: 44, radius: 3 };
const HIGH_PLUNGE = { animationFrames: 68, hitmarkFrames: 46, radius: 3.5 };
const PLUNGE_COLLISION_RADIUS = 1.5;

// Measured: gcsim (MIT, main) xianyun/skill.go, Skyladder's press at 244 frames for the first leap, which strikes each enemy
// Within 1.5 metres of the body at 3 frames. The leap's Driftcloud Wave, its plunges and the two further presses are not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xianyun/skill.go
const SKILL_FRAMES = 244;
const SKILL_HITMARK_FRAMES = 3;
const SKILL_RADIUS = 1.5;

// Measured: gcsim (MIT, main) xianyun/burst.go, Stars Gather at Dusk's animation at 103 frames and its hit at 75 frames, on each
// Enemy within 7 metres of the body. Its heals and Starwicker are not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/xianyun/burst.go
const BURST_FRAMES = 103;
const BURST_HITMARK_FRAMES = 75;
const BURST_RADIUS = 7;

// Provisional: gcsim gives Xianyun's strikes, charged attack, plunges and burst no poise, so they stand at 0 until a source gives them
const POISE_DAMAGE = 0;

export const XIANYUN_CHARACTER_ID = 10_000_093;

// Xianyun's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Skyladder's first press
// And Stars Gather at Dusk's hit. Her multipliers are read from her proud skill groups. Driftcloud Wave, her two further
// Skyladder presses, Starwicker, the burst's heals, her airborne buff, her passives and constellations are not built
export const createXianyunKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, XIANYUN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, XIANYUN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, XIANYUN_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const createStrike = ({ animationFrames, hitmarkFrames, index, radius }: (typeof STRIKES)[number]): KitAction => ({
    hits: [
      {
        element: Element.Anemo,
        hitArea: createFanReach(360, radius),
        hitmarkSeconds: (hitmarkFrames + STRIKE_TRAVEL_FRAMES) / 60,
        poiseDamage: POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const createPlunge = (
    { animationFrames, hitmarkFrames, radius }: { animationFrames: number; hitmarkFrames: number; radius: number },
    index: number,
  ): KitAction => ({
    hits: [
      {
        element: Element.Anemo,
        hitArea: createFanReach(360, radius),
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const chargedAttackHit: KitHit = {
    element: Element.Anemo,
    hitArea: createFanReach(360, CHARGED_ATTACK_RADIUS),
    hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
    poiseDamage: POISE_DAMAGE,
    talentMultiplier: attackTalentMultiplier(4),
  };

  const skillHit: KitHit = {
    element: Element.Anemo,
    hitArea: createFanReach(360, SKILL_RADIUS),
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(0),
  };

  const burstHit: KitHit = {
    element: Element.Anemo,
    hitArea: createFanReach(360, BURST_RADIUS),
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    poiseDamage: POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(0),
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(9),
    burstEnergyCost: burstTalentMultiplier(10),
    chargedAttack: {
      hits: [chargedAttackHit],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: { hits: [burstHit], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill: { hits: [skillHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: createPlunge(HIGH_PLUNGE, 8),
    lowPlunge: createPlunge(LOW_PLUNGE, 7),
    normalAttacks: STRIKES.map((strike) => createStrike(strike)),
    plungeCollision: {
      element: Element.Anemo,
      hitArea: createFanReach(360, PLUNGE_COLLISION_RADIUS),
      hitmarkSeconds: 0,
      poiseDamage: POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(6),
    },
    skillCooldownSeconds: skillTalentMultiplier(4),
  };
};
