import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Yelan's proud skill groups, read at her talent level. The attack group holds her four strikes at 0 to 3, the fourth's two
// Hits both at 3, her fully charged shot at 5 and the plunges' collision, low and high at 7, 8 and 9. The skill group holds
// Lingering Lifeline's damage at 0, as a share of her Max HP, and its cooldown at 3. The burst group holds Depth-Clarion
// Dice's initial damage at 0 and each Exquisite Throw's at 1, both as shares of her Max HP, its seconds at 2, its cooldown at
// 3 and its energy cost at 4
const YELAN_ATTACK_GROUP_ID = 6031;
const YELAN_SKILL_GROUP_ID = 6032;
const YELAN_BURST_GROUP_ID = 6039;

// Measured: gcsim (MIT, main) yelan/attack.go, each arrow's hitmarks and the frame its animation cancels at, each arrow
// Travelling 10 frames to its target. Each arrow lands on the primary target through a box, priced as a circle of a metre
// Round the body, as Ganyu's arrows are
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yelan/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const YELAN_STRIKES = [
  { animationFrames: 15, hitmarkFrames: [13], index: 0 },
  { animationFrames: 21, hitmarkFrames: [13], index: 1 },
  { animationFrames: 38, hitmarkFrames: [18], index: 2 },
  { animationFrames: 67, hitmarkFrames: [15, 29], index: 3 },
];

// Measured: gcsim (MIT, main) yelan/aimed.go, the fully charged Aimed Shot's animation at 96 frames and its arrow at 86,
// Travelling 10 frames. Breakthrough Barb, the 34% roll each Lingering Lifeline hit takes for it, is not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yelan/aimed.go
const FULL_CHARGE_FRAMES = 96;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;
const FULL_CHARGE_INDEX = 5;

// Measured: gcsim (MIT, main) yelan/skill.go, Lingering Lifeline's animation at 42 frames, and its hit on the marked enemy
// One frame after the marking at 35 frames, so at 36. The hit lands on one marked enemy, which an area does not hold, so it is
// Priced at the skill's targeting reach
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yelan/skill.go
const LIFELINE_FRAMES = 42;
const LIFELINE_HITMARK_FRAMES = 36;

// Measured: gcsim (MIT, main) yelan/burst.go, Depth-Clarion Dice's animation at 93 frames and its initial hit at 76 frames,
// A circle of radius 6 offset from the primary target, which is priced round the body as the targeting reach plus its own
// Radius and the offset's length. The burst's field lasts its seconds from the hit, and waves Exquisite Throws each second
// Of it, and one on each Lingering Lifeline hit within it. Each Exquisite Throw is three hits, at 20, 26 and 32 frames after
// Its wave, a circle of radius 0.5 on the primary target
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yelan/burst.go
const BURST_FRAMES = 93;
const BURST_HITMARK_FRAMES = 76;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6 + Math.hypot(1.5, 1.7));
const EXQUISITE_THROW_COUNT = 3;
const EXQUISITE_THROW_TRAVEL_FRAMES = 20;
const EXQUISITE_THROW_INTERVAL_FRAMES = 6;
const EXQUISITE_THROW_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 0.5);
// Provisional: the wave's phase, a second after the burst's hit, as gcsim's ticker starts from the hit's status
const EXQUISITE_THROW_WAVE_SECONDS = 1;
const DEPTH_CLARION_DICE_ID = "yelan-depth-clarion";

// Provisional: gcsim gives the arrows and the plunges no poise, so these stand in as Ganyu's do until a source gives them
const ARROW_POISE_DAMAGE = 12.9;
const FULL_CHARGE_POISE_DAMAGE = 20;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;
// Provisional: the plunges' seconds and reaches are the collision, low and high plunges' of 1, 3 and 5 metres, as Ganyu's
const PLUNGE_SECONDS = 0.4;

export const YELAN_CHARACTER_ID = 10_000_060;

// Yelan's first kit, at talent level 1: four strikes, a fully charged shot with its arrow, a collision and two plunges,
// Lingering Lifeline with its hit, and Depth-Clarion Dice with its field and the Exquisite Throws it waves and throws on each
// Lifeline hit. Her multipliers are read from her proud skill groups. Breakthrough Barb, her passives and constellations are
// Not built
export const createYelanKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YELAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YELAN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YELAN_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // An Exquisite Throw is three hits cast from the body that waved or struck it, priced by its caster's Max HP
  const createExquisiteThrowSummon = ({ facing, height, position }: KitBody, combatant: Combatant): KitSummon => {
    const throwBonus = createMaxHealthScaledBonus(burstTalentMultiplier(1));
    const hits: KitHit[] = Array.from({ length: EXQUISITE_THROW_COUNT }, (_throw, index) => ({
      additiveBaseDamageBonus: throwBonus,
      element: Element.Hydro,
      gauge: 1,
      hitArea: EXQUISITE_THROW_HIT_AREA,
      hitmarkSeconds: (EXQUISITE_THROW_TRAVEL_FRAMES + index * EXQUISITE_THROW_INTERVAL_FRAMES) / 60,
      poiseDamage: 0,
      talentMultiplier: 0,
    }));
    return createKitSummon({ facing, height, position }, combatant, hits);
  };

  const createNormalAttack = ({
    animationFrames,
    hitmarkFrames,
    index,
  }: (typeof YELAN_STRIKES)[number]): KitAction => ({
    hits: hitmarkFrames.map((frames): KitHit => ({
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: (frames + ARROW_TRAVEL_FRAMES) / 60,
      poiseDamage: ARROW_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const fullChargeHit: KitHit = {
    element: Element.Hydro,
    gauge: 1,
    hitArea: ARROW_HIT_AREA,
    hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
    poiseDamage: FULL_CHARGE_POISE_DAMAGE,
    talentMultiplier: attackTalentMultiplier(FULL_CHARGE_INDEX),
  };

  // Lingering Lifeline's hit is a share of her Max HP, and it throws an Exquisite Throw from her body while the burst's field
  // Stands, as gcsim's marked hit does while its burst status holds
  const lifelineHit: KitHit = {
    additiveBaseDamageBonus: createMaxHealthScaledBonus(skillTalentMultiplier(0)),
    element: Element.Hydro,
    gauge: 1,
    hitArea: SKILL_TARGETING_AREA,
    hitmarkSeconds: LIFELINE_HITMARK_FRAMES / 60,
    onStrike: ({ body, combatant, kitEffectState }) => {
      if (!kitEffectState.effects.some((effect) => effect.kind === "field" && effect.id === DEPTH_CLARION_DICE_ID))
        return;
      addKitEffect(kitEffectState, createExquisiteThrowSummon(body, combatant));
    },
    poiseDamage: 0,
    talentMultiplier: 0,
  };

  const burstHit: KitHit = {
    additiveBaseDamageBonus: createMaxHealthScaledBonus(burstTalentMultiplier(0)),
    element: Element.Hydro,
    gauge: 2,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: 0,
  };

  // The burst's field waves an Exquisite Throw each second from its first second after the hit, for the burst's seconds
  // From the hit, and it rings the body wherever it moves, as the field's ticks do not depend on where the body stands
  const createDepthClarionDiceField = (body: KitBody, combatant: Combatant): KitField => ({
    centre: { x: body.position.x, z: body.position.z },
    characterId: combatant.characterId,
    id: DEPTH_CLARION_DICE_ID,
    kind: "field",
    nextTickSeconds: BURST_HITMARK_FRAMES / 60 + EXQUISITE_THROW_WAVE_SECONDS,
    onTick: ({ kitEffectState }) => addKitEffect(kitEffectState, createExquisiteThrowSummon(body, combatant)),
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: BURST_HITMARK_FRAMES / 60 + burstTalentMultiplier(2) + 0.1,
    tickIndex: 0,
    tickIntervalSeconds: EXQUISITE_THROW_WAVE_SECONDS,
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
    burstCooldownSeconds: burstTalentMultiplier(3),
    burstEnergyCost: burstTalentMultiplier(4),
    chargedAttack: {
      hits: [fullChargeHit],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [burstHit],
      onStart: ({ body, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, createDepthClarionDiceField(body, combatant)),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [lifelineHit], seconds: LIFELINE_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: createPlunge(5, HIGH_PLUNGE_POISE_DAMAGE, 9),
    lowPlunge: createPlunge(3, LOW_PLUNGE_POISE_DAMAGE, 8),
    normalAttacks: YELAN_STRIKES.map((strike) => createNormalAttack(strike)),
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(7),
    },
    skillCooldownSeconds: skillTalentMultiplier(3),
  };
};
