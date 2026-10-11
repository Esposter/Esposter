import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import {
  PLUNGE_HIT_AREAS,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  SUMMON_LINGER_SECONDS,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Skirk's proud skill groups, read at her talent level. The attack group holds her five strikes at 0 to 5, the charged attack's
// Stamina at 7 and the plunges' collision, low and high at 8, 9 and 10. The skill group holds the Seven-Phase Flash's five strikes
// At 0 to 6, its charged attack at 7, its stamina at 8, its plunges at 9 to 11 and its cooldown at 14. The burst group holds
// Havoc: Ruin's slash at 0, its final slash at 1 and its cooldown at 7
export const SKIRK_CHARACTER_ID = 10_000_114;
const SKIRK_ATTACK_GROUP_ID = 11_431;
const SKIRK_SKILL_GROUP_ID = 11_432;
const SKIRK_BURST_GROUP_ID = 11_439;

// Measured: gcsim (MIT) skirk/attack.go, the five strikes' animations, which are their cancel frames by default, and their hits.
// Each hit is queued 2 frames before its hitmark for the windup inside the animation, and the third and fourth strikes reach a box
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/skirk
const NORMAL_ATTACKS = [
  { cancelFrames: 27, hits: [{ hitArea: createCircleReach(0.3, 2), hitmarkFrames: 11, index: 0 }] },
  { cancelFrames: 25, hits: [{ hitArea: createCircleReach(-0.3, 2.2), hitmarkFrames: 5, index: 1 }] },
  {
    cancelFrames: 43,
    hits: [
      { hitArea: createBoxReach(-1.8, 2.5, 3.5), hitmarkFrames: 6, index: 2 },
      { hitArea: createBoxReach(-1.8, 2.5, 3.5), hitmarkFrames: 20, index: 3 },
    ],
  },
  { cancelFrames: 23, hits: [{ hitArea: createBoxReach(-1, 2.5, 6), hitmarkFrames: 9, index: 4 }] },
  { cancelFrames: 72, hits: [{ hitArea: createCircleReach(-0.3, 3.2), hitmarkFrames: 33, index: 5 }] },
];

// Measured: gcsim (MIT) skirk/charge.go, the charged attack's two slashes at 27 and 34 frames, each a circle of radius 2.8 round the
// Primary target, and its animation at 53 frames
const CHARGED_ATTACK_FRAMES = 53;
const CHARGED_ATTACK_HITMARK_FRAMES = [27, 34];
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 2.8);

// Provisional: gcsim has no plunge file for Skirk, so the plunges' reach is the shared borrowed one, and each hits as its action
// Starts, as Nilou's do. Their seconds and poise of 100, 150 and 25 are Nilou's and Zhongli's, until a recording measures them
const PLUNGE_SECONDS = 0.4;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const COLLISION_POISE_DAMAGE = 25;

// Measured: gcsim (MIT) skirk/skill.go, Seven-Phase Flash's press lands no hit and animates for 43 frames. Its state begins 19 frames on
// And lasts 754 frames from then, and gcsim sets the skill's 8-second cooldown when that state exits, not at the press
const SKILL_FRAMES = 43;
const SKILL_DELAY_FRAMES = 19;
const SEVEN_PHASE_FLASH_FRAMES = 754;

// Measured: gcsim (MIT) skirk/attack.go, the five strikes of the Seven-Phase Flash, each hit's Cryo, its reach and its hitmark,
// Whose animations are their cancel frames by default
const SEVEN_PHASE_NORMAL_ATTACKS = [
  { cancelFrames: 30, hits: [{ hitArea: createBoxReach(-0.4, 7, 5), hitmarkFrames: 12, index: 0 }] },
  { cancelFrames: 43, hits: [{ hitArea: createBoxReach(-0.4, 7, 3.5), hitmarkFrames: 11, index: 1 }] },
  {
    cancelFrames: 42,
    hits: [
      { hitArea: createBoxReach(-0.4, 6, 3.5), hitmarkFrames: 11, index: 2 },
      { hitArea: createBoxReach(-0.2, 6, 3.5), hitmarkFrames: 23, index: 3 },
    ],
  },
  {
    cancelFrames: 60,
    hits: [
      { hitArea: createBoxReach(-0.5, 5, 6), hitmarkFrames: 11, index: 4 },
      { hitArea: createBoxReach(-0.5, 5, 6), hitmarkFrames: 27, index: 5 },
    ],
  },
  { cancelFrames: 72, hits: [{ hitArea: createBoxReach(-0.4, 11, 6), hitmarkFrames: 25, index: 6 }] },
];

// Measured: gcsim (MIT) skirk/charge.go, the Seven-Phase Flash's charged attack: three Cryo slashes at 28, 37 and 46 frames, each
// A circle of radius 3.3 round Skirk, and its animation at 54 frames
const SEVEN_PHASE_CHARGED_ATTACK_FRAMES = 54;
const SEVEN_PHASE_CHARGED_ATTACK_HITMARK_FRAMES = [28, 37, 46];
const SEVEN_PHASE_CHARGED_ATTACK_HIT_AREA = createCircleReach(0, 3.3);

// Measured: gcsim (MIT) skirk/burst.go, Havoc: Ruin's five slashes at 109, 111, 114, 125 and 135 frames and its final slash at 158,
// Each a box 14 metres wide and 12 long at gcsim's offset of -5, and its animation at 151 frames
const RUIN_FRAMES = 151;
const RUIN_SLASH_FRAMES = [109, 111, 114, 125, 135];
const RUIN_FINAL_SLASH_FRAMES = 158;
const RUIN_HIT_AREA = createBoxReach(-5, 14, 12);

// Measured: gcsim (MIT) skirk/burst.go, Havoc: Extinction's animation at 41 frames. It lands no hit, and it sets the normal attacks'
// Bonus and the void rifts' absorption, which are not built
const EXTINCTION_FRAMES = 41;

// Measured: gcsim (MIT) skirk/skirk.go, her energy maximum is 0, as the table gives her burst no energy cost: her burst is gated by
// Serpent's Subtlety instead, which the kit does not hold
const BURST_ENERGY_COST = 0;

const createPlunge = (hitArea: AttackArea, poiseDamage: number, talentMultiplier: number): KitAction => ({
  hits: [{ hitArea, hitmarkSeconds: 0, isBlunt: true, poiseDamage, talentMultiplier }],
  seconds: PLUNGE_SECONDS,
  targetingArea: STRIKE_TARGETING_AREA,
});

const createDelayedField = (
  body: KitBody,
  characterId: number,
  delaySeconds: number,
  onTick: KitField["onTick"],
): KitField => ({
  centre: { x: body.position.x, z: body.position.z },
  characterId,
  kind: "field",
  nextTickSeconds: delaySeconds,
  onTick,
  radius: UNBOUNDED_FIELD_RADIUS,
  secondsRemaining: delaySeconds + SUMMON_LINGER_SECONDS,
  tickIndex: 0,
  tickIntervalSeconds: 1,
});

export const createSkirkKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SKIRK_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SKIRK_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SKIRK_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hits }): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttack: KitAction = {
    hits: CHARGED_ATTACK_HITMARK_FRAMES.map((frames): KitHit => ({
      hitArea: CHARGED_ATTACK_HIT_AREA,
      hitmarkSeconds: frames / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    })),
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  // The Seven-Phase Flash's strikes are Cryo, and their multipliers are the skill group's, as gcsim's AttackSkill reads them
  const sevenPhaseNormalAttacks: KitAction[] = SEVEN_PHASE_NORMAL_ATTACKS.map(({ cancelFrames, hits }): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      element: Element.Cryo,
      gauge: 1,
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: skillMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  const sevenPhaseChargedAttack: KitAction = {
    hits: SEVEN_PHASE_CHARGED_ATTACK_HITMARK_FRAMES.map((frames): KitHit => ({
      element: Element.Cryo,
      gauge: 1,
      hitArea: SEVEN_PHASE_CHARGED_ATTACK_HIT_AREA,
      hitmarkSeconds: frames / 60,
      poiseDamage: 0,
      talentMultiplier: skillMultiplier(7),
    })),
    seconds: SEVEN_PHASE_CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createRuinHit = (frames: number, index: number): KitHit => ({
    element: Element.Cryo,
    gauge: 1,
    hitArea: RUIN_HIT_AREA,
    hitmarkSeconds: frames / 60,
    poiseDamage: 0,
    talentMultiplier: burstMultiplier(index),
  });
  const elementalBurst: KitAction = {
    hits: [...RUIN_SLASH_FRAMES.map((frames) => createRuinHit(frames, 0)), createRuinHit(RUIN_FINAL_SLASH_FRAMES, 1)],
    seconds: RUIN_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Havoc: Extinction is the burst the Seven-Phase Flash plays in place of Havoc: Ruin. It lands no hit of its own
  const extinction: KitAction = { hits: [], seconds: EXTINCTION_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA };

  // The Seven-Phase Flash plays its own strikes, charged attack and burst in place of the kit's while it lasts, and a press of its
  // Skill is blocked by the cooldown the press set. Its strikes deal Normal Attack DMG, its charged attack Charged Attack DMG and its
  // Burst Elemental Burst DMG, as gcsim's AttackTag of each hit reads
  const createSevenPhaseFlashStance = (characterId: number, skill: KitAction): KitStance => ({
    actions: {
      chargedAttack: sevenPhaseChargedAttack,
      chargedAttackStamina: attackMultiplier(7),
      elementalBurst: extinction,
      elementalSkill: skill,
      normalAttacks: sevenPhaseNormalAttacks,
    },
    attackTags: {
      chargedAttack: AttackTag.ChargedAttack,
      elementalBurst: AttackTag.ElementalBurst,
      elementalSkill: AttackTag.ElementalSkill,
      normalAttacks: AttackTag.NormalAttack,
    },
    characterId,
    elapsedSeconds: 0,
    kind: "stance",
    secondsRemaining: SEVEN_PHASE_FLASH_FRAMES / 60,
  });

  // The Seven-Phase Flash's press lands no hit: its state is entered on the field 19 frames on, through a field that ticks once
  const elementalSkill: KitAction = {
    hits: [],
    onStart: ({ body, combatant, kitEffectState }) =>
      addKitEffect(
        kitEffectState,
        createDelayedField(body, combatant.characterId, SKILL_DELAY_FRAMES / 60, ({ kitEffectState: tickState }) =>
          addKitEffect(tickState, createSevenPhaseFlashStance(combatant.characterId, elementalSkill)),
        ),
      ),
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(7),
    burstEnergyCost: BURST_ENERGY_COST,
    chargedAttack,
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst,
    elementalSkill,
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, HIGH_PLUNGE_POISE_DAMAGE, attackMultiplier(10)),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, LOW_PLUNGE_POISE_DAMAGE, attackMultiplier(9)),
    normalAttacks,
    // Leaving the field ends the Seven-Phase Flash, as gcsim's exit from the field does
    onKitEvent: (event, { combatant, kitEffectState }) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      for (const effect of kitEffectState.effects)
        if (effect.kind === "stance" && effect.characterId === combatant.characterId) effect.secondsRemaining = 0;
    },
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: COLLISION_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(8),
    },
    // The cooldown runs from the press through the state's 19 frames and its 754, then gcsim's 8 seconds, as the state's cap ends
    // It. An early end, by a swap or Serpent's Subtlety running out, is not counted, as the cooldown is set at the press
    skillCooldownSeconds: (SKILL_DELAY_FRAMES + SEVEN_PHASE_FLASH_FRAMES) / 60 + skillMultiplier(14),
  };
};
