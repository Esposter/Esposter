import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Neuvillette's proud skill groups, read at his talent level. The attack group holds the strikes at 0 to 2, the charged
// Attack at 3, its judgement at 4 and its stamina at 5, and the collision, low and high plunges at 10, 11 and 12. The skill
// Group holds O Tears, I Shall Repay's share of Max HP at 0, Spiritbreath Thorn's share of ATK at 1 and its cooldown at 3.
// The burst group holds O Tides, I Have Returned's share of Max HP at 0, its Waterfall's at 1, its cooldown at 2 and its
// Energy cost at 3
const NEUVILLETTE_ATTACK_GROUP_ID = 8731;
const NEUVILLETTE_SKILL_GROUP_ID = 8732;
const NEUVILLETTE_BURST_GROUP_ID = 8739;

export const NEUVILLETTE_CHARACTER_ID = 10_000_087;

// A hit whose base damage is a share of its striker's Max HP rather than of its ATK, as gcsim's flat damage hits are: the share
// Is given as the hit's flat base damage and the hit's talent multiplier is zero
const createMaxHealthScaledBonus =
  (talentMultiplier: number) =>
  (combatant: Combatant): number =>
    talentMultiplier * combatant.attributes.maxHealth;

// Measured: gcsim (MIT) neuvillette/attack.go, each strike's hitmark, the frame its action cancels at by default and its circle
// Round the target, of radius 1, 1 and 1.5. A strike deals no poise
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/neuvillette
const NORMAL_ATTACKS = [
  { cancelFrames: 36, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 1), hitmarkFrames: 19, talentIndex: 0 },
  { cancelFrames: 33, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 1), hitmarkFrames: 16, talentIndex: 1 },
  { cancelFrames: 62, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 1.5), hitmarkFrames: 32, talentIndex: 2 },
];

// Measured: gcsim (MIT) neuvillette/charge.go, the short Charge Attack's box at 27 frames with its animation at 87 frames, its
// Cancel at 25 frames and its stamina of 50. The box is priced as the circle of its length of eight metres. The held form,
// Equitable Judgment, is not built
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/neuvillette
const CHARGED_ATTACK_FRAMES = 87;
const CHARGED_ATTACK_HITMARK_FRAMES = 27;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 8);

// Provisional: gcsim gives Neuvillette no plunge file, so his collision, low and high plunges take Bennett's timings, reaches and
// Poise, as gcsim v2.47.2 bennett/plunge.go gives them, with his own multipliers from the table's plunge entries
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) neuvillette/skill.go, O Tears, I Shall Repay's circle of radius 6 round the target at 23 frames, with its
// Animation at 42 frames, its cooldown of twelve seconds and its share of Max HP. Spiritbreath Thorn hits at 60 frames, past
// The animation, so it is not built
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/neuvillette
const SKILL_FRAMES = 42;
const SKILL_HITMARK_FRAMES = 23;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6);

// Measured: gcsim (MIT) neuvillette/burst.go, O Tides, I Have Returned's first hit at 95 frames on a circle of radius 8 ahead of
// The body, and its Waterfall at 135 frames on a circle of radius 5 round the target, with its animation at 135 frames
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/neuvillette
const BURST_FRAMES = 135;
const BURST_INITIAL_HITMARK_FRAMES = 95;
const BURST_INITIAL_HIT_AREA = createCircleReach(1, 8);
const BURST_WATERFALL_HITMARK_FRAMES = 135;
const BURST_WATERFALL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 5);

// Not built yet: Equitable Judgment, the held charged attack, whose length counts the Sourcewater droplets its legal evaluation
// Picks up and whose judgement ticks drain Max HP, and the droplets the skill and burst leave, which nothing collects. Spiritbreath
// Thorn hits at 60 frames, past the skill's animation, and the burst's third Waterfall at 154 frames, past its animation, so both
// Wait on a timed hit. His passives and constellations are not built.
export const createNeuvilletteKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NEUVILLETTE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NEUVILLETTE_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NEUVILLETTE_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hitArea, hitmarkFrames, talentIndex }) => ({
    hits: [
      {
        element: Element.Hydro,
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(talentIndex),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const skillBonus = createMaxHealthScaledBonus(skillMultiplier(0));
  const burstInitialBonus = createMaxHealthScaledBonus(burstMultiplier(0));
  const burstWaterfallBonus = createMaxHealthScaledBonus(burstMultiplier(1));

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack: {
      hits: [
        {
          element: Element.Hydro,
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(3),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(5),
    elementalBurst: {
      hits: [
        {
          additiveBaseDamageBonus: burstInitialBonus,
          element: Element.Hydro,
          hitArea: BURST_INITIAL_HIT_AREA,
          hitmarkSeconds: BURST_INITIAL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: 0,
        },
        {
          additiveBaseDamageBonus: burstWaterfallBonus,
          element: Element.Hydro,
          hitArea: BURST_WATERFALL_HIT_AREA,
          hitmarkSeconds: BURST_WATERFALL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: 0,
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          additiveBaseDamageBonus: skillBonus,
          element: Element.Hydro,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: 0,
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(12),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.low,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(11),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      isBlunt: true,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(10),
    },
    skillCooldownSeconds: skillMultiplier(3),
  };
};
