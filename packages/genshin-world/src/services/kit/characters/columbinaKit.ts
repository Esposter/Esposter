import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import {
  PLUNGE_HIT_AREAS,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Columbina's proud skill groups, read at her talent level. The attack group holds her three strikes at 0 to 2, the charged
// Attack at 3 and its stamina at 4, the Lunar-Bloom hit of its Moondew Cleanse at 5, and the plunges' collision, low and high
// At 6, 7 and 8. The skill group holds the press's hit at 0, its DoT at 1, its duration at 8 and its cooldown at 9. The burst
// Group holds its hit at 0, its field's buff at 1, its duration at 2, its cooldown at 3 and its energy cost at 4
const COLUMBINA_ATTACK_GROUP_ID = 12531;
const COLUMBINA_SKILL_GROUP_ID = 12532;
const COLUMBINA_BURST_GROUP_ID = 12539;

export const COLUMBINA_CHARACTER_ID = 10_000_125;
// The name the skill's DoT field is found by, so a recast while it runs restarts it rather than stacking a second one
const COLUMBINA_SKILL_FIELD_ID = "columbina-gravity-interference";

// Measured: gcsim (MIT) columbina/attack.go, each strike's hitmark and animation, and its circle of its radius round the
// Primary target, as the strike's reach is priced. gcsim gives her strikes no poise
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/attack.go
const NORMAL_ATTACKS: { cancelFrames: number; groupIndex: number; hitmarkFrames: number; radius: number }[] = [
  { cancelFrames: 36, groupIndex: 0, hitmarkFrames: 23, radius: 1 },
  { cancelFrames: 37, groupIndex: 1, hitmarkFrames: 20, radius: 1 },
  { cancelFrames: 76, groupIndex: 2, hitmarkFrames: 41, radius: 2.5 },
];

// Measured: gcsim (MIT) columbina/charge.go, the charged attack's hit at 57 frames as a circle of radius 3.5 round the
// Primary target, with its animation at 58 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/charge.go
const CHARGED_ATTACK_FRAMES = 58;
const CHARGED_ATTACK_HITMARK_FRAMES = 57;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 3.5);

// Measured: gcsim (MIT) columbina/skill.go, the press's hit at 21 frames as a circle of radius 6 round the body, with its
// Animation at 41 frames, and its DoT ticking every 117 frames from 117 frames after the hit, for the table's duration
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/skill.go
const SKILL_FRAMES = 41;
const SKILL_HITMARK_FRAMES = 21;
const SKILL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
const SKILL_DOT_INTERVAL_FRAMES = 117;
// Provisional: gcsim's DoT reaches 4 metres at Moonsign level 1 and 6 from level 2, which the Moonsign hook would read.
// Until it does the DoT reaches 4 metres, its level 1 value
const SKILL_DOT_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });

// Measured: gcsim (MIT) columbina/burst.go, the burst's hit at 110 frames as a circle of radius 6.5 round the body, with its
// Animation at 131 frames. The field it sets going, whose buff reads the Lunar reactions, waits on that hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/burst.go
const BURST_FRAMES = 131;
const BURST_HITMARK_FRAMES = 110;
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6.5 });

// Provisional: gcsim has no plunge file for Columbina, so her plunges' reach is the kit constants' borrowed from gcsim's
// Bennett plunge, each plunge hits as its action starts, and its seconds are the wiki's standard, not measured
const PLUNGE_SECONDS = 0.4;

// Every hit of hers is Hydro and gives its gauge of one
const hydroHit = (hit: KitHit): KitHit => ({ ...hit, element: Element.Hydro, gauge: 1 });

export const createColumbinaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, COLUMBINA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, COLUMBINA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, COLUMBINA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  // Her skill, burst and DoT deal their damage on her max HP, as gcsim's UseHP gives them, so their talent multiplier is
  // Zero and the share of max HP is the hit's flat damage
  const skillDotHit: KitHit = hydroHit({
    additiveBaseDamageBonus: createMaxHealthScaledBonus(skillMultiplier(1)),
    hitArea: SKILL_DOT_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 0,
    talentMultiplier: 0,
  });
  const skillDurationSeconds = skillMultiplier(8) + SKILL_HITMARK_FRAMES / 60;

  // The DoT's field follows her body, and each tick deals its hit round the field's centre, priced by her as she cast it
  const createSkillField = ({ body, combatant }: { body: KitBody; combatant: Combatant }): KitField => {
    const field: KitField = {
      centre: { x: body.position.x, z: body.position.z },
      characterId: combatant.characterId,
      id: COLUMBINA_SKILL_FIELD_ID,
      isFollowing: true,
      kind: "field",
      nextTickSeconds: (SKILL_HITMARK_FRAMES + SKILL_DOT_INTERVAL_FRAMES) / 60,
      onTick: ({ kitEffectState }) =>
        castKitSummon(kitEffectState, { facing: 0, height: 0, position: field.centre }, combatant, [skillDotHit]),
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: skillDurationSeconds,
      tickIndex: 0,
      tickIntervalSeconds: SKILL_DOT_INTERVAL_FRAMES / 60,
    };
    return field;
  };

  const normalAttacks = NORMAL_ATTACKS.map(({ cancelFrames, groupIndex, hitmarkFrames, radius }): KitAction => ({
    hits: [
      hydroHit({
        hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, radius),
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(groupIndex),
      }),
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttackHit = hydroHit({
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: attackMultiplier(3),
  });

  const skillPressHit = hydroHit({
    additiveBaseDamageBonus: createMaxHealthScaledBonus(skillMultiplier(0)),
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: 0,
  });

  const burstHit = hydroHit({
    additiveBaseDamageBonus: createMaxHealthScaledBonus(burstMultiplier(0)),
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: 0,
  });

  const createPlunge = (hitArea: AttackArea, groupIndex: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(groupIndex) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack: {
      hits: [chargedAttackHit],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(4),
    elementalBurst: { hits: [burstHit], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill: {
      hits: [skillPressHit],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        // A press while the DoT runs restarts its duration, as gcsim restarts the status and keeps its ticks
        const standingField = kitEffectState.effects.find(
          (effect): effect is KitField =>
            effect.kind === "field" &&
            effect.id === COLUMBINA_SKILL_FIELD_ID &&
            effect.characterId === combatant.characterId,
        );
        if (standingField === undefined) addKitEffect(kitEffectState, createSkillField({ body, combatant }));
        else standingField.secondsRemaining = skillDurationSeconds;
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, 8),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, 7),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(9),
  };
};
