import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { createKitField } from "#src/services/kit/effects/createKitField";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Faruzan's proud skill groups, read at her talent level. The attack group holds her four strikes at 0 to 3, the aimed shot at
// 4 and the fully charged shot at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds Wind Realm
// Of Nasamjnin's hit at 0, Pressurized Collapse's vortex at 1, the Manifest Gale's seconds at 3 and its cooldown at 4. The
// Burst group holds The Wind's Secret Ways' hit at 0, its Anemo DMG Bonus at 1, the Prayerful Wind's seconds at 2, Perfidious
// Wind's Ruin's RES cut at 3 and its seconds at 4, its field's seconds at 5, its cooldown at 6 and its energy cost at 7
const FARUZAN_ATTACK_GROUP_ID = 7631;
const FARUZAN_SKILL_GROUP_ID = 7632;
const FARUZAN_BURST_GROUP_ID = 7639;

// Measured: gcsim (MIT, main) faruzan/attack.go, each strike's hitmark and the frame its action cancels at, its arrow
// Travelling 10 frames to its target. Each arrow lands on the primary target through a box, priced as a circle of a metre
// Round the body, as Yelan's and Ganyu's are
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/faruzan/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 26, hitmarkFrames: 14 },
  { cancelFrames: 21, hitmarkFrames: 10 },
  { cancelFrames: 39, hitmarkFrames: 24 },
  { cancelFrames: 86, hitmarkFrames: 29 },
];

// Measured: gcsim (MIT, main) faruzan/aimed.go, the fully charged shot's animation at 96 frames and its arrow at 86, travelling
// 10 frames. Its Hurricane Arrow variant, which the Manifest Gale's state turns it into, is not built, as is its partial charge
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/faruzan/aimed.go
const FULL_CHARGE_FRAMES = 96;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;
const FULL_CHARGE_INDEX = 5;

// Measured: gcsim (MIT, main) faruzan/skill.go, Wind Realm of Nasamjnin's animation at 35 frames and its polyhedron's hit at 14,
// It is a circle of radius 3, three metres ahead of the body, which is priced as that offset plus its radius
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/faruzan/skill.go
const SKILL_FRAMES = 35;
const SKILL_HITMARK_FRAMES = 14;
const SKILL_HIT_AREA = createCircleReach(3, 3);
// Measured: gcsim (MIT, main) faruzan/burst.go, The Wind's Secret Ways' animation at 71 frames and its initial hit at 54 frames,
// It is a circle of radius 6.3, 1.5 metres ahead of the body, priced as that offset plus its radius
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/faruzan/burst.go
const BURST_FRAMES = 71;
const BURST_HITMARK_FRAMES = 54;
const BURST_HIT_AREA = createCircleReach(1.5, 6.3);

// Measured: gcsim (MIT, main) faruzan/burst.go, the Dazzling Polyhedron's 745 frames from the cast, the ticker starting at 43
// Frames, and its Whirlwind Pulses every 120 frames from 137 frames on the ticker, six of them through the field's duration.
// The gadgets are placed from the body at the cast, so the Pulses cast from where gcsim places them
const BURST_TICKER_START_FRAMES = 43;
const BURST_FIELD_FRAMES = 745;
const BURST_FIRST_PULSE_FRAMES = 137;
const WHIRLWIND_PULSE_INTERVAL_FRAMES = 120;
const WHIRLWIND_PULSE_RADIUS = 6;
// Measured: gcsim (MIT, main) faruzan/burst.go, the three gadgets' places, offset from the body at the cast as gcsim's
// CalcOffsetPoint places them: the top right, the top left, then the bottom middle, cycled through by each Pulse
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/faruzan/burst.go
const WHIRLWIND_GADGET_OFFSETS: readonly { forward: number; lateral: number }[] = [
  { forward: 10.5, lateral: 5.19 },
  { forward: 10.5, lateral: -5.19 },
  { forward: 1.5, lateral: 0 },
];

// Measured: gcsim (MIT, main) faruzan/burst.go, Prayerful Wind's Gift's 0.18 Anemo DMG Bonus, refreshed by each Pulse
// It is also given at the cast, where gcsim's ticker starts 43 frames on. Its seconds are the table's at 2
const PRAYERFUL_WIND_SOURCE = "faruzan-prayerful-wind";

// Provisional: gcsim gives the strikes' arrows and the skill's hit no poise, so these stand in as Yelan's and Ganyu's do until a
// Source gives them
const ARROW_POISE_DAMAGE = 12.9;
const FULL_CHARGE_POISE_DAMAGE = 20;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;
// Provisional: the plunges' seconds and reaches are the collision, low and high plunges' of 1, 3 and 5 metres, as Yelan's are
const PLUNGE_SECONDS = 0.4;

// The Wind's Secret Ways' Perfidious Wind's Ruin, which the initial hit and each Whirlwind Pulse give the enemies they reach
const PERFIDIOUS_WIND_RUIN_ID = "faruzan-perfidious-wind-ruin";

export const FARUZAN_CHARACTER_ID = 10_000_076;

// A body the given metres ahead of another at its facing, and the given metres across it, as gcsim's offsets place a point:
// Forward runs along the facing's bearing, and across it lies the bearing a quarter turn to the right of that
const createOffsetBody = (
  { facing, height, position }: KitBody,
  { forward, lateral }: { forward: number; lateral: number },
): KitBody => ({
  facing,
  height,
  position: {
    x: position.x - Math.sin(facing) * forward + Math.cos(facing) * lateral,
    z: position.z - Math.cos(facing) * forward - Math.sin(facing) * lateral,
  },
});

// Faruzan's first kit, at talent level 1: four strikes, a fully charged shot, a collision and two plunges, Wind Realm of
// Nasamjnin with its hit, and The Wind's Secret Ways with its initial hit and its Dazzling Polyhedron. The polyhedron's Whirlwind
// Pulses shred each enemy they reach and give the party Prayerful Wind's Anemo DMG Bonus. The Manifest Gale and Pressurized
// Collapse, her partial aimed shot, her particles, her passive and constellations are not built
export const createFaruzanKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FARUZAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FARUZAN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FARUZAN_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // The shred a Whirlwind Pulse and the initial hit give an enemy, its Anemo RES cut by the table's share for its seconds
  const createPerfidiousWindRuin = (): EnemyStatus => ({
    damageTakenBonus: 0,
    id: PERFIDIOUS_WIND_RUIN_ID,
    resistanceReduction: { [Element.Anemo]: burstTalentMultiplier(3) },
    secondsRemaining: burstTalentMultiplier(4),
  });

  const createNormalAttack = (
    { cancelFrames, hitmarkFrames }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
        poiseDamage: ARROW_POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const fullChargeHit: KitHit = {
    element: Element.Anemo,
    gauge: 1,
    hitArea: ARROW_HIT_AREA,
    hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
    poiseDamage: FULL_CHARGE_POISE_DAMAGE,
    talentMultiplier: attackTalentMultiplier(FULL_CHARGE_INDEX),
  };

  const skillHit: KitHit = {
    element: Element.Anemo,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(0),
  };

  const burstHit: KitHit = {
    element: Element.Anemo,
    enemyStatus: createPerfidiousWindRuin,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: burstTalentMultiplier(0),
  };

  // A Whirlwind Pulse is a hit of no damage cast from its gadget's place, which shreds each enemy within its radius
  const createWhirlwindPulse = (gadgetBody: KitBody, combatant: Combatant): KitSummon =>
    createKitSummon(gadgetBody, combatant, [
      {
        enemyStatus: createPerfidiousWindRuin,
        hitArea: createCircleReach(0, WHIRLWIND_PULSE_RADIUS),
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier: 0,
      },
    ]);

  // Prayerful Wind's Gift gives every member of the deployed team the Anemo DMG Bonus for its seconds
  const addPrayerfulWindsGift = (kitEffectState: KitEffectState, { characterIdMemberMap }: Party): void => {
    for (const characterId of characterIdMemberMap.keys())
      buffKitMember(kitEffectState, characterId, {
        amount: burstTalentMultiplier(1),
        attribute: Attribute.AnemoDamageBonus,
        secondsRemaining: burstTalentMultiplier(2),
        source: PRAYERFUL_WIND_SOURCE,
      });
  };

  // The Dazzling Polyhedron's field is placed where the burst is cast, and its gadgets are placed from that cast's body. Its ticks
  // Are the Whirlwind Pulses, each cast from the gadget its count cycles to, and it lasts the ticker's start plus its frames
  const createDazzlingPolyhedron = (castBody: KitBody, combatant: Combatant): KitField =>
    createKitField(combatant.characterId, castBody.position, {
      nextTickSeconds: (BURST_TICKER_START_FRAMES + BURST_FIRST_PULSE_FRAMES) / 60,
      onTick: ({ kitEffectState, party }, tickIndex) => {
        addPrayerfulWindsGift(kitEffectState, party);
        const gadgetOffset = WHIRLWIND_GADGET_OFFSETS[tickIndex % WHIRLWIND_GADGET_OFFSETS.length];
        if (gadgetOffset)
          addKitEffect(kitEffectState, createWhirlwindPulse(createOffsetBody(castBody, gadgetOffset), combatant));
      },
      secondsRemaining: (BURST_TICKER_START_FRAMES + BURST_FIELD_FRAMES) / 60 + 0.1,
      tickIntervalSeconds: WHIRLWIND_PULSE_INTERVAL_FRAMES / 60,
    });

  const createPlunge = (radius: number, poiseDamage: number, index: number): KitAction => ({
    hits: [
      {
        hitArea: createFanReach(360, radius),
        hitmarkSeconds: 0,
        poiseDamage,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  return {
    burstCooldownSeconds: burstTalentMultiplier(6),
    burstEnergyCost: burstTalentMultiplier(7),
    chargedAttack: {
      hits: [fullChargeHit],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [burstHit],
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        addKitEffect(kitEffectState, createDazzlingPolyhedron(body, combatant));
        addPrayerfulWindsGift(kitEffectState, party);
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [skillHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: createPlunge(5, HIGH_PLUNGE_POISE_DAMAGE, 8),
    lowPlunge: createPlunge(3, LOW_PLUNGE_POISE_DAMAGE, 7),
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(6),
    },
    skillCooldownSeconds: skillTalentMultiplier(4),
  };
};
