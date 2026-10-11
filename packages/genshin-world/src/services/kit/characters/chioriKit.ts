import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Chiori's proud skill groups, read at her talent level. The attack group holds the four strikes at 0, 1, 2 and 3 for the
// Third's two hits and 4 for the fourth, the charged attack's two hits at 5 and 6 and its stamina at 7, and the plunges'
// Collision, low and high at 8, 9 and 10. The skill group holds Tamoto's damage at 0 with its DEF share at 1, its duration
// At 2, its attack interval at 3, the upward sweep's damage at 4 with its DEF share at 5, and the press's cooldown at 6. The
// Burst group holds Hiyoku: Twin Blades' damage at 0 with its DEF share at 1, its cooldown at 2 and its energy cost at 3
const CHIORI_ATTACK_GROUP_ID = 9431;
const CHIORI_SKILL_GROUP_ID = 9432;
const CHIORI_BURST_GROUP_ID = 9439;

export const CHIORI_CHARACTER_ID = 10_000_094;

// Measured: gcsim (MIT) chiori/attack.go, each strike's hitmarks and animation at 60 fps, and its reach: a circle of
// Radius 1.6 centred 0.5 metres ahead, then 1.8 centred 0.6 ahead, the third's box from 0.6 metres behind to 3 ahead, 1.8
// Wide, and a circle of radius 2.8 centred 0.9 ahead. Each circle is priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chiori/attack.go
const NORMAL_ATTACKS = [
  { frames: 22, hitArea: createFanReach(360, 0.5 + 1.6), hits: [{ groupIndex: 0, hitmarkFrames: 17 }] },
  { frames: 33, hitArea: createFanReach(360, 0.6 + 1.8), hits: [{ groupIndex: 1, hitmarkFrames: 16 }] },
  {
    frames: 42,
    hitArea: createBoxReach(-0.6, 1.8, 3.6),
    hits: [
      { groupIndex: 2, hitmarkFrames: 24 },
      { groupIndex: 3, hitmarkFrames: 32 },
    ],
  },
  { frames: 59, hitArea: createFanReach(360, 0.9 + 2.8), hits: [{ groupIndex: 4, hitmarkFrames: 37 }] },
] as const;
// Provisional: gcsim gives Chiori's strikes no poise, so they carry none until a source gives it
const NORMAL_ATTACK_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) chiori/charge.go, the two thrusts at 25 and 26 frames, circles of radius 2.3 and 2.4 centred 1.4
// And 1.6 metres ahead, and the animation's 44 frames. Each circle is priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chiori/charge.go
const CHARGED_ATTACK_FRAMES = 44;
const CHARGED_ATTACK_HITS = [
  { groupIndex: 5, hitArea: createFanReach(360, 1.4 + 2.3), hitmarkFrames: 25 },
  { groupIndex: 6, hitArea: createFanReach(360, 1.6 + 2.4), hitmarkFrames: 26 },
] as const;

// Measured: gcsim (MIT) chiori/plunge.go and config.yml, the plunge circles of radius 1, 3 and 5 centred a metre ahead,
// Each priced as its offset plus its radius, and the low plunge's hitmark at 41 frames within its animation's 69
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chiori/plunge.go
const PLUNGE_FRAMES = 69;
const LOW_PLUNGE_HITMARK_FRAMES = 41;
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1 + 1);
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 1 + 3);
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 1 + 5);
// The low plunge's poise as gcsim gives it. gcsim has no high plunge of Chiori's, so the high plunge lands with the low one
// Provisional: at the 150 poise gcsim gives Arlecchino's high plunge
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) chiori/skill.go, the upward sweep's box from her body 3.5 metres ahead and 5.5 wide, at 21 frames
// Its press and its hold's 37, the animations 51 and 88, and the press's cooldown, read from the group at 16 seconds
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chiori/skill.go
const SKILL_PRESS_FRAMES = 51;
const SKILL_HOLD_FRAMES = 88;
const SKILL_PRESS_HITMARK_FRAMES = 21;
const SKILL_HOLD_HITMARK_FRAMES = 37;
const UPWARD_SWEEP_HIT_AREA = createBoxReach(0, 5.5, 3.5);
const UPWARD_SWEEP_POISE_DAMAGE = 50;
// Provisional: no table or wiki page gives the seconds a press must be held to become the hold, so it is Bennett's first
// Charge Level's, as Zhongli's is, until a recording measures it
const HOLD_MINIMUM_HELD_SECONDS = 0.5;

// Measured: gcsim (MIT) chiori/ticker.go and skill.go, Tamoto's doll lasting 17.5 seconds from its cast, its first attack
// 36 frames of start delay and 5 of attack delay on, then every 216 frames while it stands, and its search of 12 metres
// Round the doll, which strikes a circle of radius 1.2 on the target found. The table's duration reads 17 seconds
// Provisional: gcsim's 17.5 is shipped where the table reads 17
const TAMOTO_DURATION_SECONDS = 17.5;
const TAMOTO_START_DELAY_FRAMES = 36;
const TAMOTO_ATTACK_DELAY_FRAMES = 5;
const TAMOTO_INTERVAL_FRAMES = 216;
const TAMOTO_ATTACK_COUNT = Math.ceil(
  (TAMOTO_DURATION_SECONDS * 60 - TAMOTO_START_DELAY_FRAMES) / TAMOTO_INTERVAL_FRAMES,
);
const TAMOTO_SEARCH_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 12 });
const TAMOTO_TARGET_RADIUS = 1.2;
const TAMOTO_HIT_AREA = createTargetedHitArea(TAMOTO_SEARCH_AREA, TAMOTO_TARGET_RADIUS);
// The press casts Tamoto at 19 frames and the hold at 34, which its end is counted from
const PRESS_TAMOTO_CAST_FRAMES = 19;
const HOLD_TAMOTO_CAST_FRAMES = 34;

// Measured: gcsim (MIT) chiori/burst.go, Hiyoku: Twin Blades' strike at 92 frames as a circle of radius 12 round her, its
// Animation's 101 frames, and its 200 poise. gcsim's energy is the table's 50
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/chiori/burst.go
const BURST_FRAMES = 101;
const BURST_HITMARK_FRAMES = 92;
const BURST_HIT_AREA = createFanReach(360, 12);
const BURST_POISE_DAMAGE = 200;

// Tamoto's hit from one of its attacks, the damage its ATK and DEF shares make, given its cast at the frame
const createTamotoHits = (castFrames: number, talentMultiplierMap: TalentMultiplierMap): KitHit[] => {
  const attackShare = getTalentMultiplier(talentMultiplierMap, CHIORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 0);
  const defenseShare = getTalentMultiplier(talentMultiplierMap, CHIORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 1);
  return Array.from({ length: TAMOTO_ATTACK_COUNT }, (_value, index): KitHit => ({
    additiveBaseDamageBonus: ({ attributes }) => defenseShare * attributes.defense,
    element: Element.Geo,
    gauge: 1,
    hitArea: TAMOTO_HIT_AREA,
    hitmarkSeconds:
      (castFrames + TAMOTO_START_DELAY_FRAMES + TAMOTO_ATTACK_DELAY_FRAMES + TAMOTO_INTERVAL_FRAMES * index) / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    poiseDamage: 0,
    talentMultiplier: attackShare,
  }));
};

export const createChioriKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const sweepDefenseShare = getTalentMultiplier(talentMultiplierMap, CHIORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 5);
  const burstDefenseShare = getTalentMultiplier(talentMultiplierMap, CHIORI_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHIORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ frames, hitArea, hits }) => ({
    hits: hits.map(({ groupIndex, hitmarkFrames }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: NORMAL_ATTACK_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(groupIndex),
    })),
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  // Tamoto is cast where the body stands at the frame it is summoned, and stands until its duration from that frame ends
  const castTamoto =
    (castFrames: number): NonNullable<KitAction["onStart"]> =>
    ({ body, combatant, kitEffectState }) => {
      addKitEffect(
        kitEffectState,
        createKitSummon(
          body,
          combatant,
          createTamotoHits(castFrames, talentMultiplierMap),
          (castFrames + TAMOTO_DURATION_SECONDS * 60) / 60,
        ),
      );
    };
  const castPressTamoto = castTamoto(PRESS_TAMOTO_CAST_FRAMES);
  const castHoldTamoto = castTamoto(HOLD_TAMOTO_CAST_FRAMES);
  const skillCooldownSeconds = getTalentMultiplier(talentMultiplierMap, CHIORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 6);
  const createSweep = (hitmarkFrames: number): KitHit => ({
    additiveBaseDamageBonus: ({ attributes }) => sweepDefenseShare * attributes.defense,
    element: Element.Geo,
    gauge: 1,
    hitArea: UPWARD_SWEEP_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    isBlunt: true,
    poiseDamage: UPWARD_SWEEP_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, CHIORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
  });
  const lowPlungeHit: KitHit = {
    hitArea: LOW_PLUNGE_HIT_AREA,
    hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
    talentMultiplier: attackMultiplier(9),
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, CHIORI_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, CHIORI_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    chargedAttack: {
      hits: CHARGED_ATTACK_HITS.map(({ groupIndex, hitArea, hitmarkFrames }): KitHit => ({
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(groupIndex),
      })),
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst: {
      hits: [
        {
          additiveBaseDamageBonus: ({ attributes }) => burstDefenseShare * attributes.defense,
          element: Element.Geo,
          gauge: 2,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, CHIORI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [createSweep(SKILL_PRESS_HITMARK_FRAMES)],
      onStart: castPressTamoto,
      seconds: SKILL_PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillHolds: [
      {
        action: {
          hits: [createSweep(SKILL_HOLD_HITMARK_FRAMES)],
          onStart: castHoldTamoto,
          seconds: SKILL_HOLD_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: skillCooldownSeconds,
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    highPlunge: {
      hits: [
        {
          ...lowPlungeHit,
          hitArea: HIGH_PLUNGE_HIT_AREA,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(10),
        },
      ],
      seconds: PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: { hits: [lowPlungeHit], seconds: PLUNGE_FRAMES / 60, targetingArea: STRIKE_TARGETING_AREA },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds,
  };
};
