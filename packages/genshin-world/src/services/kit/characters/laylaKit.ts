import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Layla's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack's two slashes at 3 and 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill
// Group holds Nights of Formal Focus's damage at 0, its star damage at 1, the shield's share of Max HP at 2, its flat
// Shield at 3, its seconds at 4 and its cooldown at 5. The burst group holds Starlight Slug's share of Max HP at 0, its
// Seconds at 1, its cooldown at 2 and its energy cost at 3
const LAYLA_ATTACK_GROUP_ID = 7431;
const LAYLA_SKILL_GROUP_ID = 7432;
const LAYLA_BURST_GROUP_ID = 7439;

// Measured: gcsim (MIT) layla/attack.go, each strike's hitmark, the frame its action cancels at by default and its reach: the
// First a circle, the second and third boxes, each reached from the body by its offset and its box
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/layla
const NORMAL_ATTACKS = [
  { cancelFrames: 33, hitArea: createCircleReach(0.5, 1.5), hitmarkFrames: 13 },
  { cancelFrames: 50, hitArea: createBoxReach(-0.6, 2.2, 3), hitmarkFrames: 12 },
  { cancelFrames: 74, hitArea: createBoxReach(0, 3, 4.5), hitmarkFrames: 31 },
];

// Measured: gcsim (MIT) layla/charge.go, the charged attack's two slashes at 16 and 27 frames, each a circle of radius 2.8
// Set 0.3 metres ahead of the body, and its animation at 49 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/layla
const CHARGED_ATTACK_FRAMES = 49;
const CHARGED_ATTACK_HITMARK_FRAMES = [16, 27];
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.3, 2.8);

// Provisional: Layla's gcsim folder has no plunge file, so her plunges take the timings and poise of Bennett's, as the shared
// Plunge hit areas do (gcsim v2.47.2 bennett/plunge.go). Her multipliers are her own table's
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) layla/skill.go, Nights of Formal Focus's Cryo circle of radius 2.5 round the body at its hitmark of 32
// Frames and its animation at 43 frames. Its shield lands at gcsim's 19 frames, which the kit sets at the cast
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/layla
const SKILL_FRAMES = 43;
const SKILL_HITMARK_FRAMES = 32;
const SKILL_HIT_AREA = createCircleReach(0, 2.5);

// Measured: gcsim (MIT) layla/burst.go, Starlight Slug's animation at 79 frames. Its field holds a circle of radius 12 round the
// Body for 12 seconds, from 36 frames, and each 90 frames it strikes the closest enemy in the circle with a circle of radius
// 1.5, whose flat damage is its share of Max HP. The kit cannot pick that enemy, so each tick reaches every enemy within 13.5
// Metres of the body, which overstates a tick against several enemies
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/layla
const BURST_FRAMES = 79;
const BURST_START_FRAMES = 36;
const BURST_TICK_INTERVAL_FRAMES = 90;
const BURST_DURATION_FRAMES = 12 * 60 + BURST_START_FRAMES;
const BURST_AREA_RADIUS = 12;
const BURST_HIT_RADIUS = 1.5;
// The strike lands 42 frames on from its tick, at gcsim's release of 56 frames and its travel of 22 frames
const BURST_STRIKE_DELAY_FRAMES = 56 + 22 - BURST_START_FRAMES;
const BURST_HIT_AREA = createCircleReach(0, BURST_AREA_RADIUS + BURST_HIT_RADIUS);

// Not built yet: the Night Stars her shield and burst strikes add, and her Ascension and Constellation passives.
export const LAYLA_CHARACTER_ID = 10_000_074;

// Layla's first kit, at talent level 1: three strikes, a charged attack, a collision and two plunges, Nights of Formal
// Focus with its hit and shield, and Starlight Slug's field with its ticks. Her multipliers are read from her proud skill
// Groups and match the table's own
const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

export const createLaylaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAYLA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAYLA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, LAYLA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames }, index): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(index),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const chargedAttack: KitAction = {
    hits: CHARGED_ATTACK_HITMARK_FRAMES.map((frames, index) => ({
      hitArea: CHARGED_ATTACK_HIT_AREA,
      hitmarkSeconds: frames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(3 + index),
    })),
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Cryo,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Cryo,
        health: skillMultiplier(3) + skillMultiplier(2) * combatant.attributes.maxHealth,
        kind: "shield",
        secondsRemaining: skillMultiplier(4),
      });
    },
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Each tick's strike is its share of the caster's Max HP as flat damage, which its talent multiplier does not scale
  const createBurstStrike = (combatant: Combatant): KitHit => ({
    additiveBaseDamageBonus: () => burstMultiplier(0) * combatant.attributes.maxHealth,
    element: Element.Cryo,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_STRIKE_DELAY_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: 0,
  });

  // The field holds the body's place as the burst starts, and each tick strikes from that place
  const createBurstField = (body: KitBody, combatant: Combatant): KitField => {
    const centre = { x: body.position.x, z: body.position.z };
    return {
      centre,
      characterId: combatant.characterId,
      kind: "field",
      nextTickSeconds: BURST_START_FRAMES / 60,
      onTick: ({ kitEffectState }) =>
        addKitEffect(
          kitEffectState,
          createKitSummon({ facing: body.facing, height: body.height, position: centre }, combatant, [
            createBurstStrike(combatant),
          ]),
        ),
      radius: BURST_AREA_RADIUS,
      // The field's last tick falls on the frame gcsim's loop leaves out, so it ends a frame before that
      secondsRemaining: (BURST_DURATION_FRAMES - 1) / 60,
      tickIndex: 0,
      tickIntervalSeconds: BURST_TICK_INTERVAL_FRAMES / 60,
    };
  };

  const elementalBurst: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      addKitEffect(kitEffectState, createBurstField(body, combatant)),
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(5),
    elementalBurst,
    elementalSkill,
    highPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.high,
        hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(8),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.low,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(7),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(5),
  };
};
