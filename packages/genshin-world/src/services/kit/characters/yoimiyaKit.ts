import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Yoimiya's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4.
// The aimed shot is at 5 and the fully charged shot at 6, and the plunges' collision, low and high are at 8, 9 and 10.
// The skill group holds Niwabi Fire-Dance's duration at 1 and its cooldown at 2. The burst group holds Naganohara
// Meteor Swarm's hit at 0. Aurous Blaze's explosion is at 1, its internal cooldown at 2, its seconds at 3, its cooldown
// It is at 4, and its energy cost is at 5
const YOIMIYA_ATTACK_GROUP_ID = 4931;
const YOIMIYA_SKILL_GROUP_ID = 4932;
const YOIMIYA_BURST_GROUP_ID = 4939;

// Measured: gcsim (MIT, main) internal/characters/yoimiya/attack.go, each strike's hitmarks and the frame its action
// It cancels at the frame. Its arrows travel 10 frames to their target, which lands each hit at the hitmark plus the travel.
// Each arrow lands on the primary target through a box, priced as a circle of a metre round the body, as Ganyu's are
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yoimiya/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_STRIKES = [
  { cancelFrames: 35, hitmarkFrames: [15, 24], index: 0 },
  { cancelFrames: 26, hitmarkFrames: [17], index: 1 },
  { cancelFrames: 39, hitmarkFrames: [25], index: 2 },
  { cancelFrames: 44, hitmarkFrames: [11, 26], index: 3 },
  { cancelFrames: 52, hitmarkFrames: [17], index: 4 },
];

// Measured: gcsim (MIT, main) internal/characters/yoimiya/aimed.go. The fully charged shot's animation is 97 frames.
// Its arrow is at 86 and its travel is 10, and it has no Kindling Arrows, as the hold it is cast with gives none
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yoimiya/aimed.go
const FULL_CHARGE_FRAMES = 97;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;

// Measured: gcsim (MIT, main) internal/characters/yoimiya/skill.go. Niwabi Fire-Dance's animation is 34 frames.
// Infuses her Pyro for the table's seconds from the cast, and gcsim's damage multiplier on her Normal Attacks is not built.
// Its infusion carries no multiplier of its own
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yoimiya/skill.go
const SKILL_FRAMES = 34;

// Measured: gcsim (MIT, main) internal/characters/yoimiya/burst.go. The initial hit is a circle of radius 6 round the body
// It is at 75 frames. Its animation is 113 frames, and the Pyro gauge has 50 durability.
// Aurous Blaze's explosion is not built: it lands on another character's hits, and no kit event reaches them yet
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yoimiya/burst.go
const BURST_FRAMES = 113;
const BURST_HITMARK_FRAMES = 75;
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
const BURST_POISE_DAMAGE = 220;
const BURST_GAUGE = 2;

// Provisional: the plunges are the standard ones gcsim's plunge template gives, of the same reach and timing as Ganyu's, as
// Her own plunge clips are not in the sources fetched. The table's multipliers for them are read as the rest are
const PLUNGE_SECONDS = 0.4;

export const YOIMIYA_CHARACTER_ID = 10_000_049;

// Yoimiya's first kit, at talent level 1: five strikes, a fully charged shot, a collision and two plunges, Niwabi
// Fire-Dance's Pyro infusion for the table's seconds, and Naganohara Meteor Swarm's initial hit.
// Her multipliers are read from her proud skill groups. Aurous Blaze's explosion, her passives and her constellations
// Are not built yet
export const createYoimiyaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YOIMIYA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YOIMIYA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YOIMIYA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(({ cancelFrames, hitmarkFrames, index }): KitAction => ({
    hits: hitmarkFrames.map((frames): KitHit => ({
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: (frames + ARROW_TRAVEL_FRAMES) / 60,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  return {
    burstCooldownSeconds: burstTalentMultiplier(4),
    burstEnergyCost: burstTalentMultiplier(5),
    chargedAttack: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [
        {
          element: Element.Pyro,
          gauge: BURST_GAUGE,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      // Niwabi Fire-Dance infuses her Pyro for the table's seconds, as it starts
      onStart: ({ combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Pyro,
          kind: "infusion",
          secondsRemaining: skillTalentMultiplier(1),
        }),
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(10),
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
          talentMultiplier: attackTalentMultiplier(9),
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
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(2),
  };
};
