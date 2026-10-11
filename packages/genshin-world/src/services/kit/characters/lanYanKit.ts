import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Lan Yan's proud skill groups, read at her talent level. The attack group holds her strikes at 0 to 5, the charged
// Attack at 6 and its stamina at 7, and the plunges' collision, low and high at 8, 9 and 10. The skill group holds
// Feathermoon Ring at 0, its shield's absorption at 1 and its flat shield at 2, the shield's seconds at 3 and the
// Skill's cooldown at 4. The burst group holds Lustrous Moonrise at 0, its cooldown at 1 and its energy cost at 2
const LAN_YAN_ATTACK_GROUP_ID = 10831;
const LAN_YAN_SKILL_GROUP_ID = 10832;
const LAN_YAN_BURST_GROUP_ID = 10839;

export const LAN_YAN_CHARACTER_ID = 10_000_108;

// Measured: gcsim (MIT) lanyan/attack.go, each strike's hitmark, its animation and its reach. The first strike is a box
// Of 2.2 by 3 metres, the second a box of 2.3 by 3, both offset 0.2 metres back; the third a circle of 2.2 metres ahead
// By 0.3; the fourth a fan of 240 degrees of 2.4 metres ahead by 0.5. The second and third strikes each land two hits
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lanyan/attack.go
const NORMAL_ATTACKS: {
  frames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; talentIndex: number }[];
}[] = [
  { frames: 30, hits: [{ hitArea: createBoxReach(-0.2, 2.2, 3), hitmarkFrames: 11, talentIndex: 0 }] },
  {
    frames: 46,
    hits: [
      { hitArea: createBoxReach(-0.2, 2.3, 3), hitmarkFrames: 17, talentIndex: 1 },
      { hitArea: createBoxReach(-0.2, 2.3, 3), hitmarkFrames: 37, talentIndex: 2 },
    ],
  },
  {
    frames: 53,
    hits: [
      { hitArea: createCircleReach(0.3, 2.2), hitmarkFrames: 15, talentIndex: 3 },
      { hitArea: createCircleReach(0.3, 2.2), hitmarkFrames: 21, talentIndex: 4 },
    ],
  },
  { frames: 63, hits: [{ hitArea: createFanReach(240, 0.5 + 2.4), hitmarkFrames: 40, talentIndex: 5 }] },
];
// Measured: gcsim (MIT) lanyan/charge.go, three hits at 42, 49 and 56 frames, each a circle of 2.5 metres centred on the
// Primary target, with the animation at 70 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lanyan/charge.go
const CHARGED_ATTACK_HITMARK_FRAMES = [42, 49, 56];
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 2.5);
const CHARGED_ATTACK_FRAMES = 70;
// Measured: gcsim (MIT) lanyan/plunge.go, the low plunge's hit at 44 frames on a circle of 3 metres, the high's at 46 on
// A circle of 3.5 metres, both in a 67-frame animation, and the collision 38 frames in on a circle of 1.5 metres
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lanyan/plunge.go
const PLUNGE_FRAMES = 67;
const LOW_PLUNGE_HITMARK_FRAMES = 44;
const HIGH_PLUNGE_HITMARK_FRAMES = 46;
const PLUNGE_COLLISION_HITMARK_FRAMES = 38;
const LOW_PLUNGE_HIT_AREA = createCircleReach(0, 3);
const HIGH_PLUNGE_HIT_AREA = createCircleReach(0, 3.5);
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(0, 1.5);
// Measured: gcsim (MIT) lanyan/burst.go, the burst's three hits at 30, 46 and 51 frames on a circle of 6 metres round the
// Primary target, in an animation of 100 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lanyan/burst.go
const BURST_HITMARK_FRAMES = [30, 46, 51];
const BURST_FRAMES = 100;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6);
// Measured: gcsim (MIT) lanyan/skill.go, the press's animation of 49 frames when it hits nothing
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lanyan/skill.go
const SKILL_FRAMES = 49;
// Constellation 4 adds 60 Elemental Mastery to each member of the deployed team for 12 seconds as the burst is cast,
// As gcsim (MIT) lanyan/cons.go gives it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lanyan/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ELEMENTAL_MASTERY = 60;
const CONSTELLATION_4_SECONDS = 12;
const CONSTELLATION_4_SOURCE = "lanyan-c4";

// Lan Yan's first kit, at talent level 1: her four strikes, a charged attack, a collision and two plunges, and the burst's
// Three hits. Her multipliers are read from her proud skill groups
export const createLanYanKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAN_YAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAN_YAN_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const normalAttacks = NORMAL_ATTACKS.map(({ frames, hits }): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, talentIndex }): KitHit => ({
      gauge: 1,
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(talentIndex),
    })),
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  const chargedAttackHits = CHARGED_ATTACK_HITMARK_FRAMES.map((hitmarkFrames): KitHit => ({
    gauge: 1,
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.ChargedAttack,
    poiseDamage: 0,
    talentMultiplier: attackMultiplier(6),
  }));
  const createPlunge = (hitArea: AttackArea, hitmarkFrames: number, talentIndex: number): KitAction => ({
    hits: [
      {
        gauge: 1,
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(talentIndex),
      },
    ],
    seconds: PLUNGE_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  return {
    burstCooldownSeconds: burstMultiplier(1),
    burstEnergyCost: burstMultiplier(2),
    chargedAttack: {
      hits: chargedAttackHits,
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst: {
      hits: BURST_HITMARK_FRAMES.map((hitmarkFrames): KitHit => ({
        gauge: 2,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(0),
      })),
      onStart: ({ combatant, kitEffectState, party }) => {
        if (combatant.constellationCount < CONSTELLATION_4) return;
        for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
          addKitEffect(kitEffectState, {
            amount: CONSTELLATION_4_ELEMENTAL_MASTERY,
            attribute: Attribute.ElementalMastery,
            characterId,
            kind: "buff",
            secondsRemaining: CONSTELLATION_4_SECONDS,
            source: CONSTELLATION_4_SOURCE,
          });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Not built: the Swallow-Wisp Pinion Dance's press, which sets a shield going that absorbs the element it finds on the
    // Enemy it detects, and its Feathermoon Rings, which play in place of her attacks for 66 frames from that detect. The
    // Rings wait on a stance's attack tags, and the shield on the hook that absorbs an element from the field, so the press
    // Deals nothing until then, as Constellations 1, 2 and 6 and Ascension 1 and 4 wait on the same two
    elementalSkill: { hits: [], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: createPlunge(HIGH_PLUNGE_HIT_AREA, HIGH_PLUNGE_HITMARK_FRAMES, 10),
    lowPlunge: createPlunge(LOW_PLUNGE_HIT_AREA, LOW_PLUNGE_HITMARK_FRAMES, 9),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, LAN_YAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
  };
};
