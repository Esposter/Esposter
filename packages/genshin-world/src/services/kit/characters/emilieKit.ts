import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { AuraType } from "#src/models/combat/AuraType";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Emilie's proud skill groups, read at her talent level. The attack group holds her four strikes at 0 to 3, the charged
// Attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds the
// Lumidouce Case's summon hit at 0, Spiritbreath Thorn at 4, its cooldown at 5 and the skill's own at 6. The burst group
// Holds the burst's cooldown at 2 and its energy cost at 3
const EMILIE_ATTACK_GROUP_ID = 9931;
const EMILIE_SKILL_GROUP_ID = 9932;
const EMILIE_BURST_GROUP_ID = 9939;

export const EMILIE_CHARACTER_ID = 10_000_099;

// Measured: gcsim (MIT) emilie/attack.go, each strike's hitmark and animation, and its reach round the primary target: a
// Circle of radius 2 centred 0.4 metres ahead for the first, a box of 1.6 by 3 metres on the target for the second, and
// Circles of radius 2.5 and 3 centred 0.4 metres ahead for the third and fourth
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/attack.go
const NORMAL_ATTACK_HIT_AREAS = [
  createTargetedHitArea(STRIKE_TARGETING_AREA, 0.4 + 2),
  createTargetedHitArea(STRIKE_TARGETING_AREA, createBoxReach(0, 1.6, 3).radius),
  createTargetedHitArea(STRIKE_TARGETING_AREA, 0.4 + 2.5),
  createTargetedHitArea(STRIKE_TARGETING_AREA, 0.4 + 3),
];
const NORMAL_ATTACK_FRAMES = [28, 32, 49, 71];
const NORMAL_ATTACK_HITMARK_FRAMES = [11, 16, 33, 34];
// Measured: gcsim (MIT) emilie/charge.go, the thrust's box of 3.3 by 3.5 metres centred 1.2 metres behind the primary
// Target, its hitmark at 26 frames and its animation at 50
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/charge.go
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, createBoxReach(-1.2, 3.3, 3.5).radius);
const CHARGED_ATTACK_HITMARK_FRAMES = 26;
const CHARGED_ATTACK_FRAMES = 50;
// Measured: gcsim (MIT) emilie/plunge.go, the collision a circle of radius 1 and the low and high plunges circles of
// Radius 3 and 5, each centred a metre ahead of the body, with the collision at 41 frames, the low plunge's hitmark at
// 47 and its animation at 78, and the high plunge's at 49 and 79, their poise 100 and 150
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/plunge.go
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1 + 1);
const PLUNGE_COLLISION_HITMARK_FRAMES = 41;
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 1 + 3);
const LOW_PLUNGE_HITMARK_FRAMES = 47;
const LOW_PLUNGE_FRAMES = 78;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 1 + 5);
const HIGH_PLUNGE_HITMARK_FRAMES = 49;
const HIGH_PLUNGE_FRAMES = 79;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
// Measured: gcsim (MIT) emilie/skill.go, the Lumidouce Case's summon hit as a circle of radius 4.5 centred 2.6 metres
// Ahead of the body at 37 frames, the animation's 37, and Spiritbreath Thorn at 62 frames as the same circle centred 2.6
// Metres ahead of the primary target. Thorn's cooldown of 10 seconds has always run out before the skill's of 14 comes
// Round again, so every press lands it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/skill.go
const SKILL_FRAMES = 37;
const SKILL_SUMMON_HITMARK_FRAMES = 37;
const SKILL_SUMMON_HIT_AREA = createFanReach(360, 2.6 + 4.5);
const SPIRITBREATH_THORN_HITMARK_FRAMES = 62;
const SPIRITBREATH_THORN_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 2.6 + 4.5);
// Measured: gcsim (MIT) emilie/burst.go, the burst's animation of 111 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/burst.go
const BURST_FRAMES = 111;
// Constellation 2's status on each hit that strikes, from two constellations
const getConstellationStatus = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_STATUS : undefined;
// Measured: gcsim (MIT) emilie/cons.go, Constellation 2's Dendro RES cut of 30% for 10 seconds on each enemy the skill's
// Hits strike, whose damage is not zero
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/cons.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "emilie-constellation-2",
  resistanceReduction: { [Element.Dendro]: 0.3 },
  secondsRemaining: 10,
};
// Measured: gcsim (MIT) emilie/asc.go, Ascension 4's DMG Bonus of 0.15 per 1000 total ATK, capped at 36%, on each attack
// That strikes a Burning enemy
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_ATTACK_SHARE = 0.15;
const ASCENSION_4_DAMAGE_BONUS_CAP = 0.36;

// The DMG Bonus Ascension 4 adds to a strike of Emilie's that lands on an enemy Burning, read from her total ATK
const getAscension4DamageBonus = (combatant: Combatant, enemy: Enemy): number =>
  combatant.ascension >= ASCENSION_4 && enemy.elementalState.auras.has(AuraType.Burning)
    ? Math.min((combatant.attributes.attack / 1000) * ASCENSION_4_ATTACK_SHARE, ASCENSION_4_DAMAGE_BONUS_CAP)
    : 0;

// Emilie's first kit, at talent level 1: her four strikes, a charged attack, a collision and two plunges, the Lumidouce
// Case's summon hit with Spiritbreath Thorn, and Constellation 2 and Ascension 4. Her multipliers are read from her
// Proud skill groups
export const createEmilieKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, EMILIE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, EMILIE_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const normalAttacks = NORMAL_ATTACK_HIT_AREAS.map((hitArea, index): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: NORMAL_ATTACK_HITMARK_FRAMES[index] / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: NORMAL_ATTACK_FRAMES[index] / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  const createPlunge = (
    hitArea: AttackArea,
    hitmarkFrames: number,
    seconds: number,
    poiseDamage: number,
    groupIndex: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        isBlunt: true,
        poiseDamage,
        talentMultiplier: attackMultiplier(groupIndex),
      },
    ],
    seconds: seconds / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, EMILIE_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, EMILIE_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(4),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(5),
    // Not built: the burst is the Lumidouce Case at level 3, which strikes a random enemy in its area every 0.3 seconds
    // And moves on Cleardew, so until the Cleardew hook lands the burst deals nothing and only spends its energy
    elementalBurst: { hits: [], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    // Not built: the Lumidouce Case's ticks, its levels and Cleardew, so the skill deals its summon hit and Thorn only
    elementalSkill: {
      hits: [
        {
          element: Element.Dendro,
          enemyStatus: getConstellationStatus,
          gauge: 1,
          hitArea: SKILL_SUMMON_HIT_AREA,
          hitmarkSeconds: SKILL_SUMMON_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(0),
        },
        {
          element: Element.Dendro,
          enemyStatus: getConstellationStatus,
          hitArea: SPIRITBREATH_THORN_HIT_AREA,
          hitmarkSeconds: SPIRITBREATH_THORN_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(4),
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getStrikeDamageBonus: ({ combatant }, enemy) => getAscension4DamageBonus(combatant, enemy),
    highPlunge: createPlunge(
      HIGH_PLUNGE_HIT_AREA,
      HIGH_PLUNGE_HITMARK_FRAMES,
      HIGH_PLUNGE_FRAMES,
      HIGH_PLUNGE_POISE_DAMAGE,
      8,
    ),
    lowPlunge: createPlunge(
      LOW_PLUNGE_HIT_AREA,
      LOW_PLUNGE_HITMARK_FRAMES,
      LOW_PLUNGE_FRAMES,
      LOW_PLUNGE_POISE_DAMAGE,
      7,
    ),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(6),
  };
};
