import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Collei's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the fully
// Charged shot at 5 (its aimed shot at 4 is not a kit action), and the plunges' collision, low and high at 6, 7 and 8. The
// Skill group holds Floral Brush's hit at 0 and its cooldown at 1. The burst group holds Trump-Card Kitty's explosion at 0,
// Its leap at 1, its duration in seconds at 2, its cooldown at 3 and its energy cost at 4
const COLLEI_ATTACK_GROUP_ID = 6731;
const COLLEI_SKILL_GROUP_ID = 6732;
const COLLEI_BURST_GROUP_ID = 6739;

// Measured: gcsim v2.47.2 (MIT) collei/attack.go, each strike's hitmark and the frame its action cancels at, its arrow
// Travelling 10 frames to its target, which lands it at the hitmark plus the travel. Each arrow lands on the primary target
// Through a box, priced as a circle of a metre round the body, as Ganyu's arrows are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/collei/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 24, hitmarkFrames: 16 },
  { cancelFrames: 25, hitmarkFrames: 14 },
  { cancelFrames: 43, hitmarkFrames: 22 },
  { cancelFrames: 65, hitmarkFrames: 32 },
];

// Measured: gcsim v2.47.2 (MIT) collei/aimed.go, the fully charged shot's animation at 96 frames, its arrow at 86 and
// Travelling 10 frames to its target, so it lands with the animation's end
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/collei/aimed.go
const FULL_CHARGE_FRAMES = 96;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;

// Measured: gcsim v2.47.2 (MIT) collei/skill.go, Floral Brush's animation at 68 frames, its two hits at 34 and 138 frames,
// Both circles of radius 2 round the body under the one multiplier
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/collei/skill.go
const FLORAL_BRUSH_FRAMES = 68;
const FLORAL_BRUSH_HITMARK_FRAMES = [34, 138];
const FLORAL_BRUSH_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2 });

// Measured: gcsim v2.47.2 (MIT) collei/burst.go, Trump-Card Kitty's animation at 67 frames, its explosion at 25 frames, a
// Circle of radius 5.5 round the body. Its leap ticks every 30 frames from 68 frames, each a circle of radius 4 round the
// Spot the kitty was cast at, while its status lasts 378 frames from the explosion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/collei/burst.go
const TRUMP_CARD_KITTY_FRAMES = 67;
const EXPLOSION_HITMARK_FRAMES = 25;
const EXPLOSION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5.5 });
const LEAP_FIRST_TICK_FRAMES = 68;
const LEAP_TICK_INTERVAL_FRAMES = 30;
const LEAP_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });
const LEAP_STATUS_FRAMES = 378;
// Provisional: the table gives the kitty 6 seconds, and gcsim's 378 frames are 6.3, so gcsim's value is shipped until the
// Leap is measured in a recording, as the roadmap's manual verification asks
const TRUMP_CARD_KITTY_SECONDS = LEAP_STATUS_FRAMES / 60;

// Provisional: gcsim gives Collei's strikes, Floral Brush and Trump-Card Kitty no poise, so these stand at 0 until a source
// Gives them. The plunges borrow Bennett's, as gcsim v2.47.2 (MIT) bennett/plunge.go and the wiki's collision give them
const STRIKE_POISE_DAMAGE = 0;
const PLUNGE_COLLISION_POISE_DAMAGE = 25;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
// The plunges borrow Bennett's timings, as gcsim v2.47.2 (MIT) bennett/plunge.go gives them, since Collei's gcsim folder
// Has no plunge file of its own
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const LOW_PLUNGE_FRAMES = 67;
const HIGH_PLUNGE_FRAMES = 68;

export const COLLEI_CHARACTER_ID = 10_000_067;

// Collei's first kit, at talent level 1: four strikes, a fully charged shot, a collision and two plunges, Floral Brush's two
// Hits, and Trump-Card Kitty with its explosion and leap. Her passives and constellations are not built yet: Sprout and
// The Zone's extension wait on a reaction a party member's hit causes, and the rest wait on a passive's hook
export const createColleiKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitmarkFrames }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
        poiseDamage: STRIKE_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const fullyChargedArrowHit: KitHit = {
    element: Element.Dendro,
    gauge: 1,
    hitArea: ARROW_HIT_AREA,
    hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
    poiseDamage: STRIKE_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
  };
  const floralBrushHits: KitHit[] = FLORAL_BRUSH_HITMARK_FRAMES.map((hitmarkFrames) => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea: FLORAL_BRUSH_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: STRIKE_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  }));
  const explosionHit: KitHit = {
    element: Element.Dendro,
    gauge: 1,
    hitArea: EXPLOSION_HIT_AREA,
    hitmarkSeconds: EXPLOSION_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: STRIKE_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const leapHit: KitHit = {
    element: Element.Dendro,
    gauge: 1,
    hitArea: LEAP_HIT_AREA,
    hitmarkSeconds: 0,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: STRIKE_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, COLLEI_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, COLLEI_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    chargedAttack: {
      hits: [fullyChargedArrowHit],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      // The explosion lands 25 frames in, from the body the kitty was cast at
      hits: [explosionHit],
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        // The leap's field ticks from the kitty's first leap at 68 frames, every 30 frames while its status lasts, and each
        // Tick's hit is cast where the kitty was cast, so it lands from there whatever the body does after
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: LEAP_FIRST_TICK_FRAMES / 60,
          onTick: ({ kitEffectState: tickEffectState }) => {
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [leapHit]);
          },
          radius: LEAP_HIT_AREA.radius,
          secondsRemaining: EXPLOSION_HITMARK_FRAMES / 60 + TRUMP_CARD_KITTY_SECONDS,
          tickIntervalSeconds: LEAP_TICK_INTERVAL_FRAMES / 60,
        });
      },
      seconds: TRUMP_CARD_KITTY_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: floralBrushHits, seconds: FLORAL_BRUSH_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
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
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, COLLEI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, COLLEI_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
};
