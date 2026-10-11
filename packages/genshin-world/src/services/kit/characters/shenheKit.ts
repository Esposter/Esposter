import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Shenhe's proud skill groups, read at her talent level. The attack group holds the first three strikes at 0 to 2, the
// fourth's two hits at 3 and 4, the fifth at 5, the charged attack at 6 and its stamina at 7, and the plunges' collision, low
// and high at 8, 9 and 10. The skill group holds Spring Spirit Summoning's press at 0, its hold at 1, the Quill's ATK share at
// 2, the press's and hold's Quill durations at 3 and 4, their Quill quotas at 5 and 6, and the press's and hold's cooldowns at
// 7 and 8. The burst group holds Divine Maiden's Deliverance's initial hit at 0, its RES Decrease at 1, its DoT at 2, its
// seconds at 3, its cooldown at 4 and its energy cost at 5
const SHENHE_ATTACK_GROUP_ID = 6331;
const SHENHE_SKILL_GROUP_ID = 6332;
const SHENHE_BURST_GROUP_ID = 6339;

// Measured: gcsim (MIT) shenhe/attack.go, the first three strikes' fan and circle of 2.5 metres and their 0.5 offset, the
// fourth's box of 2.2 by 3.6 and the fifth's circle of 3 at the same offset, each a strike at its hitmark, cancelling at
// Its cancel frame
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/shenhe
const NORMAL_ATTACK_STRIKES: {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 23, hits: [{ hitArea: createFanReach(270, 3), hitmarkFrames: 14, index: 0 }] },
  { cancelFrames: 29, hits: [{ hitArea: createFanReach(270, 3), hitmarkFrames: 17, index: 1 }] },
  { cancelFrames: 33, hits: [{ hitArea: createFanReach(360, 3), hitmarkFrames: 19, index: 2 }] },
  {
    cancelFrames: 27,
    hits: [
      { hitArea: createBoxReach(0, 2.2, 3.6), hitmarkFrames: 14, index: 3 },
      { hitArea: createBoxReach(0, 2.2, 3.6), hitmarkFrames: 18, index: 4 },
    ],
  },
  { cancelFrames: 49, hits: [{ hitArea: createFanReach(360, 3.5), hitmarkFrames: 26, index: 5 }] },
];

// Measured: gcsim (MIT) shenhe/charge.go, the charged attack's circle of 0.8 metres on the primary target at 25 frames, its
// Animation at 81 frames
const CHARGED_ATTACK_HITMARK_FRAMES = 25;
const CHARGED_ATTACK_FRAMES = 81;
const CHARGED_ATTACK_RADIUS = 0.8;

// Measured: gcsim (MIT) shenhe/skill.go, Spring Spirit Summoning's press at 4 frames on a circle of 0.8 metres on the primary
// Target, its animation at 38 frames, and its hold at 33 frames on a circle of 4 metres 1.5 metres ahead of the body, its
// Animation at 78 frames
const SKILL_PRESS_HITMARK_FRAMES = 4;
const SKILL_PRESS_ANIMATION_FRAMES = 38;
const SKILL_PRESS_RADIUS = 0.8;
const SKILL_HOLD_HITMARK_FRAMES = 33;
const SKILL_HOLD_ANIMATION_FRAMES = 78;
const SKILL_HOLD_OFFSET = 1.5;
const SKILL_HOLD_RADIUS = 4;
// Provisional: gcsim takes a hold from the input alone, with no threshold, so the seconds a skill must be held before it is a
// Hold are an estimate until a recording of the hold input measures them, as Eula's and Diona's are
const HOLD_MINIMUM_HELD_SECONDS = 0.5;

// Measured: gcsim (MIT) shenhe/burst.go, Divine Maiden's Deliverance's initial hit at 78 frames, a fan of 120 degrees and a
// Circle of 8 metres 2 metres ahead of the body, with 250 poise, its animation at 100 frames, and its field of 7 metres at the
// Same centre. Its DoT ticks every 117 frames from 82 frames, each tick two hits, the second 30 frames and an offset of 0, 2 or
// 4 frames on from the first, and the field's Ascension 1 Cryo DMG Bonus is 15% for an active character inside it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/shenhe
const BURST_HITMARK_FRAMES = 78;
const BURST_ANIMATION_FRAMES = 100;
const BURST_OFFSET_METRES = 2;
const BURST_INITIAL_RADIUS = 8;
const BURST_INITIAL_FAN_DEGREES = 120;
const BURST_INITIAL_POISE_DAMAGE = 250;
const BURST_FIELD_RADIUS = 7;
const BURST_START_FRAMES = 47;
const BURST_FIRST_TICK_FRAMES = 82;
const BURST_TICK_INTERVAL_FRAMES = 117;
const BURST_TICK_SECOND_HIT_FRAMES = 30;
const BURST_TICK_OFFSETS_FRAMES = [0, 2, 4];
const BURST_ASCENSION = 1;
const BURST_CRYO_DAMAGE_BONUS = 0.15;
const BURST_CRYO_DAMAGE_BONUS_SOURCE = "shenhe-burst-cryo";

// Provisional: gcsim gives the Cryo skill and burst no gauge, so the press, hold and each DoT tick read 1U as Ganyu's Cryo hits
// do, and gcsim gives no poise for the strikes, charged attack, skill or plunges, so each deals none until a source gives it
// The plunges last 0.4 seconds as Ganyu's do, since gcsim gives Shenhe's no frames for them here
const PLUNGE_SECONDS = 0.4;

// Shenhe's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Spring Spirit Summoning's
// press and its hold, and Divine Maiden's Deliverance with its initial hit, its field's DoT and the Cryo DMG Bonus and the RES
// Decrease it gives. Her Quill is not built: the kit prices a hit from its striker alone, and a Quill adds Shenhe's ATK to
// The hits of whoever carries it, which no kit step reads. Her passives and constellations are not built
export const createShenheKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SHENHE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SHENHE_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SHENHE_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const burstDurationSeconds = burstTalentMultiplier(3);
  const burstResistanceReduction = burstTalentMultiplier(1);
  const burstDotMultiplier = burstTalentMultiplier(2);
  const fieldTickIntervalSeconds = BURST_TICK_INTERVAL_FRAMES / 60;

  // The Cryo DMG Bonus and RES Decrease a DoT tick gives, the RES held for the tick interval until the next tick
  const burstResistanceStatus: EnemyStatus = {
    damageTakenBonus: 0,
    id: "shenhe-burst-shred",
    physicalResistanceReduction: burstResistanceReduction,
    resistanceReduction: { [Element.Cryo]: burstResistanceReduction },
    secondsRemaining: fieldTickIntervalSeconds,
  };
  const createBurstTickHit = (tickIndex: number, isSecondHit: boolean): KitHit => ({
    element: Element.Cryo,
    enemyStatus: () => burstResistanceStatus,
    gauge: 1,
    hitArea: createFanReach(360, BURST_FIELD_RADIUS),
    hitmarkSeconds: isSecondHit
      ? (BURST_TICK_SECOND_HIT_FRAMES + BURST_TICK_OFFSETS_FRAMES[tickIndex % BURST_TICK_OFFSETS_FRAMES.length]) / 60
      : 0,
    poiseDamage: 0,
    talentMultiplier: burstDotMultiplier,
  });

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(({ cancelFrames, hits }) => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const pressHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, SKILL_PRESS_RADIUS),
    hitmarkSeconds: SKILL_PRESS_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(0),
  };
  const holdHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: createFanReach(360, SKILL_HOLD_OFFSET + SKILL_HOLD_RADIUS),
    hitmarkSeconds: SKILL_HOLD_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(1),
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(4),
    burstEnergyCost: burstTalentMultiplier(5),
    chargedAttack: {
      hits: [
        {
          hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, CHARGED_ATTACK_RADIUS),
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(7),
    elementalBurst: {
      hits: [
        {
          element: Element.Cryo,
          gauge: 1,
          hitArea: createFanReach(BURST_INITIAL_FAN_DEGREES, BURST_OFFSET_METRES + BURST_INITIAL_RADIUS),
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_INITIAL_POISE_DAMAGE,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      // The field is cast ahead of the body and its DoT and buff are summoned there, so it stands where gcsim places it
      onStart: ({ body, combatant, kitEffectState }) => {
        const centreBody = createAheadBody(body, BURST_OFFSET_METRES);
        const field: KitField = {
          centre: { x: centreBody.position.x, z: centreBody.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: BURST_FIRST_TICK_FRAMES / 60,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState, tickIndex }) => {
            if (combatant.ascension >= BURST_ASCENSION)
              addKitEffect(tickEffectState, {
                amount: BURST_CRYO_DAMAGE_BONUS,
                attribute: Attribute.CryoDamageBonus,
                characterId: activeCombatant.characterId,
                kind: "buff",
                secondsRemaining: fieldTickIntervalSeconds,
                source: BURST_CRYO_DAMAGE_BONUS_SOURCE,
              });
            addKitEffect(
              tickEffectState,
              createKitSummon(centreBody, combatant, [
                createBurstTickHit(tickIndex, false),
                createBurstTickHit(tickIndex, true),
              ]),
            );
          },
          radius: BURST_FIELD_RADIUS,
          secondsRemaining: burstDurationSeconds + BURST_START_FRAMES / 60 + 0.1,
          tickIndex: 0,
          tickIntervalSeconds: fieldTickIntervalSeconds,
        };
        addKitEffect(kitEffectState, field);
      },
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [pressHit],
      seconds: SKILL_PRESS_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillHolds: [
      {
        action: { hits: [holdHit], seconds: SKILL_HOLD_ANIMATION_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
        cooldownSeconds: skillTalentMultiplier(8),
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
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
    skillCooldownSeconds: skillTalentMultiplier(7),
  };
};
