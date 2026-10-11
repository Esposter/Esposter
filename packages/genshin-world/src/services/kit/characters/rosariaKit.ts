import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Rosaria's proud skill groups, read at her talent level. The attack group holds the strikes at 0 to 5, the first of N3 and
// The second of N5 each as one index, with N3's two hits sharing 2 and N5's sharing 4 and 5 by their order, so the string
// Reads 0, 1, 2, 3, 4 and 5 for its seven hits. The charged attack is at 6 and its stamina at 7, and the plunges' collision,
// Low and high are at 8, 9 and 10. The skill group holds Ravaging Confession's two hits at 0 and 1 and its cooldown at 2.
// The burst group holds Rites of Termination's slash at 0, its lance at 1, its field's tick at 2, its seconds at 3, its
// Cooldown at 4 and its energy cost at 5
const ROSARIA_ATTACK_GROUP_ID = 4531;
const ROSARIA_SKILL_GROUP_ID = 4532;
const ROSARIA_BURST_GROUP_ID = 4539;

// Measured: gcsim v2.47.2 (MIT) rosaria/attack.go, each strike's hitmarks and its attack cancel frame, each reach priced as
// Its offset plus its radius for a circle, and as its far corner for a box. N3's two hits and N5's two share one index each
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/attack.go
const STRIKE_HIT_AREAS = Object.freeze({
  n1: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.5 + 2.5 }),
  n2: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.5 + 2.5 }),
  n3: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(3.6, 2.2 / 2) }),
  n4: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2 + 2.3 }),
  n5Box: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(3, 2 / 2) }),
  n5Circle: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 + 2.5 }),
});

// Measured: gcsim v2.47.2 (MIT) rosaria/charge.go, the charged attack's circle of radius 0.8 round the body at 22 frames,
// Its animation at 69 frames and its cancel at 22
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/charge.go
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 });
const CHARGED_HITMARK_FRAMES = 22;
const CHARGED_ANIMATION_FRAMES = 69;

// Measured: gcsim v2.47.2 (MIT) rosaria/skill.go, Ravaging Confession's first hit a box of 2 wide and 4 long from one metre
// Behind the body at 24 frames, and its second a circle of radius 2.8 half a metre ahead at 38, in an animation of 51
// Frames with a cooldown of 360 frames. Rosaria's teleport behind the target is not built, so both reach from the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/skill.go
const RAVAGING_CONFESSION_FIRST_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(4 - 1, 2 / 2),
});
const RAVAGING_CONFESSION_SECOND_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: 0.5 + 2.8,
});
const RAVAGING_CONFESSION_FIRST_HITMARK_FRAMES = 24;
const RAVAGING_CONFESSION_SECOND_HITMARK_FRAMES = 38;
const RAVAGING_CONFESSION_ANIMATION_FRAMES = 51;

// Measured: gcsim v2.47.2 (MIT) rosaria/burst.go, Rites of Termination's slash at 15 frames, its lance at 56, both on the
// Enemies round the body, and its field's ticks every 120 frames from 120 after the lance, each a circle of radius 6.5 that
// Sits 3 metres ahead of the body. The animation is 70 frames, and Constellation 2 adds 240 frames to the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/rosaria/burst.go
const RITES_SLASH_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.5 + 3.5 });
const RITES_LANCE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 + 6 });
const RITES_TICK_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 + 6.5 });
const RITES_SLASH_HITMARK_FRAMES = 15;
const RITES_LANCE_HITMARK_FRAMES = 56;
const RITES_ANIMATION_FRAMES = 70;
const RITES_TICK_INTERVAL_SECONDS = 2;
const RITES_FIELD_ID = "rosaria-rites-of-termination-field";
// Provisional: gcsim's field lasts 510 frames, half a second past the table's 8 seconds, which this adds to it as Diona's does
const RITES_FIELD_MARGIN_SECONDS = 0.5;
const RITES_CONSTELLATION = 2;
const RITES_CONSTELLATION_SECONDS = 4;

// Provisional: gcsim gives Rosaria's strikes, charged attack, skill and burst no poise, so each deals none until the
// Wiki's advanced properties are measured
const NO_POISE_DAMAGE = 0;
// Provisional: the plunges' frames are not fetched from gcsim, so they are provisional until the Mac measures them
const PLUNGE_SECONDS = 0.4;

export const ROSARIA_CHARACTER_ID = 10_000_045;

// Rosaria's first kit, at talent level 1: a seven-hit string, a charged attack, a collision and two plunges, Ravaging
// Confession's two hits and cooldown, and Rites of Termination's slash, lance and field of ticks. Her multipliers are read
// From her proud skill groups. Her passives, her constellations other than 2, and her teleport behind the target are not
// Built, as the kit events and the body do not reach them
export const createRosariaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ROSARIA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ROSARIA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ROSARIA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const createStrikeHit = (hitArea: AttackArea, hitmarkFrames: number, index: number): KitHit => ({
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: attackTalentMultiplier(index),
  });
  const normalAttacks: KitAction[] = [
    { hits: [createStrikeHit(STRIKE_HIT_AREAS.n1, 9, 0)], seconds: 19 / 60, targetingArea: STRIKE_TARGETING_AREA },
    { hits: [createStrikeHit(STRIKE_HIT_AREAS.n2, 13, 1)], seconds: 23 / 60, targetingArea: STRIKE_TARGETING_AREA },
    {
      hits: [createStrikeHit(STRIKE_HIT_AREAS.n3, 19, 2), createStrikeHit(STRIKE_HIT_AREAS.n3, 28, 2)],
      seconds: 31 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    { hits: [createStrikeHit(STRIKE_HIT_AREAS.n4, 32, 3)], seconds: 44 / 60, targetingArea: STRIKE_TARGETING_AREA },
    {
      hits: [createStrikeHit(STRIKE_HIT_AREAS.n5Box, 26, 4), createStrikeHit(STRIKE_HIT_AREAS.n5Circle, 40, 5)],
      seconds: 66 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
  ];

  const ravagingConfessionFirstHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: RAVAGING_CONFESSION_FIRST_HIT_AREA,
    hitmarkSeconds: RAVAGING_CONFESSION_FIRST_HITMARK_FRAMES / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: skillTalentMultiplier(0),
  };
  const ravagingConfessionSecondHit: KitHit = {
    ...ravagingConfessionFirstHit,
    hitArea: RAVAGING_CONFESSION_SECOND_HIT_AREA,
    hitmarkSeconds: RAVAGING_CONFESSION_SECOND_HITMARK_FRAMES / 60,
    talentMultiplier: skillTalentMultiplier(1),
  };
  const ritesSlashHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: RITES_SLASH_HIT_AREA,
    hitmarkSeconds: RITES_SLASH_HITMARK_FRAMES / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: burstTalentMultiplier(0),
  };
  const ritesLanceHit: KitHit = {
    ...ritesSlashHit,
    hitArea: RITES_LANCE_HIT_AREA,
    hitmarkSeconds: RITES_LANCE_HITMARK_FRAMES / 60,
    talentMultiplier: burstTalentMultiplier(1),
  };
  const ritesTickHit: KitHit = {
    ...ritesSlashHit,
    hitArea: RITES_TICK_HIT_AREA,
    hitmarkSeconds: 0,
    talentMultiplier: burstTalentMultiplier(2),
  };
  return {
    burstCooldownSeconds: burstTalentMultiplier(4),
    burstEnergyCost: burstTalentMultiplier(5),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_HIT_AREA,
          hitmarkSeconds: CHARGED_HITMARK_FRAMES / 60,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      seconds: CHARGED_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(7),
    elementalBurst: {
      hits: [ritesSlashHit, ritesLanceHit],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const field: KitField = {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          id: RITES_FIELD_ID,
          kind: "field",
          nextTickSeconds: RITES_LANCE_HITMARK_FRAMES / 60 + RITES_TICK_INTERVAL_SECONDS,
          onTick: ({ kitEffectState: tickEffectState }) =>
            addKitEffect(tickEffectState, createKitSummon(body, combatant, [ritesTickHit])),
          radius: RITES_TICK_HIT_AREA.radius,
          secondsRemaining:
            burstTalentMultiplier(3) +
            RITES_FIELD_MARGIN_SECONDS +
            (combatant.constellationCount >= RITES_CONSTELLATION ? RITES_CONSTELLATION_SECONDS : 0),
          tickIndex: 0,
          tickIntervalSeconds: RITES_TICK_INTERVAL_SECONDS,
        };
        addKitEffect(kitEffectState, field);
      },
      seconds: RITES_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [ravagingConfessionFirstHit, ravagingConfessionSecondHit],
      seconds: RAVAGING_CONFESSION_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: NO_POISE_DAMAGE,
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
          poiseDamage: NO_POISE_DAMAGE,
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
      poiseDamage: NO_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(2),
  };
};
