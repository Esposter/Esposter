import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Wanderer's proud skill groups, read at his talent level. The attack group holds the strikes at 0 to 3, the third strike's
// Two hits at 2 and 3, the charged attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and
// 8. The skill group holds Hanega: Song of the Wind's damage at 0, Windfavored's strikes' bonus at 1, its charged attack's
// Bonus at 2 and its cooldown at 4. The burst group holds Kyougen: Five Ceremonial Plays' damage at 0, its cooldown at 1
// And its energy cost at 2
const WANDERER_ATTACK_GROUP_ID = 7531;
const WANDERER_SKILL_GROUP_ID = 7532;
const WANDERER_BURST_GROUP_ID = 7539;

// Measured: gcsim (MIT) wanderer/attack.go, each strike's hitmarks and the frame its action cancels at by default. Each strike
// Is a circle of radius 1 round the target, priced round the body at the targeting's reach plus its own
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wanderer
const NORMAL_ATTACK_HIT_RADIUS = 1;
const NORMAL_ATTACKS = [
  { cancelFrames: 35, hitmarkFrames: [11] },
  { cancelFrames: 39, hitmarkFrames: [6] },
  { cancelFrames: 76, hitmarkFrames: [32, 41] },
];

// Measured: gcsim (MIT) wanderer/attack.go and charge.go, Windfavored's strikes, each a circle round the target of radius 2.5,
// 2.5 and 3, their hitmarks, their cancels and the charged attack's circle of radius 3.5 at 36 frames, its animation at 70
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wanderer
const WINDFAVORED_NORMAL_ATTACKS = [
  { cancelFrames: 43, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 2.5), hitmarkFrames: [15] },
  { cancelFrames: 34, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 2.5), hitmarkFrames: [3] },
  { cancelFrames: 70, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 3), hitmarkFrames: [32, 40] },
];
const WINDFAVORED_CHARGED_ATTACK_FRAMES = 70;
const WINDFAVORED_CHARGED_ATTACK_HITMARK_FRAMES = 36;
const WINDFAVORED_CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 3.5);

// Measured: gcsim (MIT) wanderer/charge.go, the charged attack's circle of radius 2.5 round the target at 34 frames, with its
// Animation at 69 frames
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wanderer
const CHARGED_ATTACK_FRAMES = 69;
const CHARGED_ATTACK_HITMARK_FRAMES = 34;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 2.5);

// Measured: gcsim (MIT) wanderer/plunge.go, the low plunge's circle of radius 3 round the body at 41 frames with its animation
// At 72, and the collision's circle of radius 1.5 at 36 frames, which deals no gauge. gcsim gives the plunges no poise
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wanderer
const LOW_PLUNGE_FRAMES = 72;
const LOW_PLUNGE_HITMARK_FRAMES = 41;
const PLUNGE_COLLISION_HITMARK_FRAMES = 36;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(0, 1.5);

// Provisional: gcsim gives Wanderer no high plunge, so it takes Bennett's timings and poise, as the shared plunge hit areas do
// (gcsim v2.47.2 bennett/plunge.go). Its multiplier is his own table's
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) wanderer/skill.go, Hanega: Song of the Wind's circle of radius 6 round the body at 2 frames, its
// Animation at 28 frames, and its cooldown of six seconds, which the table gives
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wanderer
const SKILL_FRAMES = 28;
const SKILL_HITMARK_FRAMES = 2;
const SKILL_HIT_AREA = createCircleReach(0, 6);
// Windfavored lasts while its skydweller points last, 100 of them at six frames each, which is ten seconds
const WINDFAVORED_SECONDS = (100 * 6) / 60;

// Measured: gcsim (MIT) wanderer/burst.go, Kyougen: Five Ceremonial Plays' five strikes at 92 frames and every 6 frames after,
// Each a circle of radius 5 round the target, with its animation at 101 frames, or 145 while Windfavored, which includes the fall
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/wanderer
const BURST_FRAMES = 101;
const WINDFAVORED_BURST_FRAMES = 145;
const BURST_HITMARK_FRAMES = [92, 98, 104, 110, 116];
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 5);

// Not built yet: his Dash and Jump while Windfavored, which hold the skydweller points' drain, the swap lock on his skill, his
// Ascension and Constellation passives.
// The five strikes each take the burst's multiplier, and the animation is the burst's own, or Windfavored's with its fall
const createBurst = (talentMultiplier: number, animationFrames: number): KitAction => ({
  hits: BURST_HITMARK_FRAMES.map((frames) => ({
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: frames / 60,
    poiseDamage: 0,
    talentMultiplier,
  })),
  seconds: animationFrames / 60,
  targetingArea: SKILL_TARGETING_AREA,
});

export const WANDERER_CHARACTER_ID = 10_000_075;

// Wanderer's first kit, at talent level 1: three strikes, a charged attack, a collision and two plunges, Hanega: Song of the
// Wind with Windfavored's strikes and charged attack for its ten seconds, and Kyougen: Five Ceremonial Plays. Its
// Multipliers are read from its proud skill groups and match the table's own
const createNormalAttackHit = (
  hitArea: KitHit["hitArea"],
  hitmarkFrames: number,
  talentMultiplier: number,
): KitHit => ({
  hitArea,
  hitmarkSeconds: hitmarkFrames / 60,
  internalCooldownTag: InternalCooldownTag.NormalAttack,
  poiseDamage: 0,
  talentMultiplier,
});

export const createWandererKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, WANDERER_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, WANDERER_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, WANDERER_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // The table's strike multipliers, the third strike's two hits at 2 and 3
  const strikeMultiplier = (strikeIndex: number, hitIndex: number): number =>
    attackMultiplier(strikeIndex === 2 ? 2 + hitIndex : strikeIndex);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hitmarkFrames }, strikeIndex) => ({
    hits: hitmarkFrames.map((frames, hitIndex) =>
      createNormalAttackHit(
        createTargetedHitArea(STRIKE_TARGETING_AREA, NORMAL_ATTACK_HIT_RADIUS),
        frames,
        strikeMultiplier(strikeIndex, hitIndex),
      ),
    ),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  // Windfavored's strikes and charged attack are his normal attacks' multiplied by the skill's bonus for each
  const windfavoredNormalAttacks: KitAction[] = WINDFAVORED_NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames }, strikeIndex) => ({
      hits: hitmarkFrames.map((frames, hitIndex) =>
        createNormalAttackHit(hitArea, frames, skillMultiplier(1) * strikeMultiplier(strikeIndex, hitIndex)),
      ),
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const windfavoredChargedAttack: KitAction = {
    hits: [
      {
        hitArea: WINDFAVORED_CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: WINDFAVORED_CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(2) * attackMultiplier(4),
      },
    ],
    seconds: WINDFAVORED_CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Anemo,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    onStart: ({ combatant, kitEffectState }) => {
      const stance: KitStance = {
        actions: {
          chargedAttack: windfavoredChargedAttack,
          chargedAttackStamina: attackMultiplier(5),
          elementalBurst: createBurst(burstMultiplier(0), WINDFAVORED_BURST_FRAMES),
          elementalSkill,
          normalAttacks: windfavoredNormalAttacks,
        },
        characterId: combatant.characterId,
        elapsedSeconds: 0,
        kind: "stance",
        secondsRemaining: WINDFAVORED_SECONDS,
      };
      addKitEffect(kitEffectState, stance);
    },
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(1),
    burstEnergyCost: burstMultiplier(2),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(5),
    elementalBurst: createBurst(burstMultiplier(0), BURST_FRAMES),
    elementalSkill,
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(8),
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
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(7),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(4),
  };
};
