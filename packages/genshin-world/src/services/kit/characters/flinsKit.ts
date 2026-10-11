import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Flins's proud skill groups, read at his talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack at 5 and its stamina at 6, and the plunges' collision, low and high at 7, 8 and 9. The skill group holds the five
// Manifest Flame strikes at 0 to 4, its charged attack at 5, Northland Spearstorm at 6, the Manifest Flame's seconds at 8,
// And the skill's cooldown at 9. The burst group holds Cometh the Night's initial and final hits at 0 and 2, its energy
// Cost at 3 and its cooldown at 4
const FLINS_ATTACK_GROUP_ID = 12031;
const FLINS_SKILL_GROUP_ID = 12032;
const FLINS_BURST_GROUP_ID = 12039;

// Measured: gcsim (MIT) flins/attack.go, each strike's hitmarks and the frame its action cancels at by default, and its
// Box or circle round the body, offset by its Y. Her second strike's box is 2 metres wide and 3.8 long
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/flins
const NORMAL_ATTACK_STRIKES: {
  cancelFrames: number;
  hits: { hitArea: KitHit["hitArea"]; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 31, hits: [{ hitArea: createBoxReach(-0.5, 1.3, 3.2), hitmarkFrames: 11, index: 0 }] },
  { cancelFrames: 31, hits: [{ hitArea: createBoxReach(-1.6, 2, 3.8), hitmarkFrames: 11, index: 1 }] },
  { cancelFrames: 45, hits: [{ hitArea: createCircleReach(0.8, 2.8), hitmarkFrames: 16, index: 2 }] },
  {
    cancelFrames: 67,
    hits: [
      { hitArea: createCircleReach(1.2, 2.8), hitmarkFrames: 20, index: 3 },
      { hitArea: createCircleReach(1.2, 2.8), hitmarkFrames: 29, index: 3 },
    ],
  },
  { cancelFrames: 68, hits: [{ hitArea: createCircleReach(0.6, 2.8), hitmarkFrames: 29, index: 4 }] },
];

// Measured: gcsim (MIT) flins/charge.go, the charged attack's box of 4 by 6 metres at its hitmark of 28 frames, in an
// Animation of 60 frames
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/flins
const CHARGED_ATTACK_HIT_AREA = createBoxReach(0, 4, 6);
const CHARGED_ATTACK_HITMARK_FRAMES = 28;
const CHARGED_ATTACK_FRAMES = 60;

// Measured: gcsim (MIT) flins/skill.go, Northland Spearstorm's box is not built, and Manifest Flame's press deals no damage
// Of its own, so it plays no hit and starts the stance: its animation is 44 frames, and its skill's cooldown 16 seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/flins
const SKILL_PRESS_FRAMES = 44;

// Measured: gcsim (MIT) flins/burst.go, Cometh the Night's initial hit, a circle of radius 7 round the body at 93 frames,
// And its final hit at 71 frames after that, in an animation of 130 frames. Its middle hits are Lunar-Charged, which the
// Kit does not price yet, so they are not built
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/flins
const BURST_FRAMES = 130;
const BURST_INITIAL_HITMARK_FRAMES = 93;
const BURST_FINAL_HITMARK_FRAMES = BURST_INITIAL_HITMARK_FRAMES + 71;
const BURST_HIT_AREA = createCircleReach(0, 7);

// Provisional: gcsim gives Cometh the Night a cooldown of 15 seconds, where the game's table gives 20, so the kit ships
// Gcsim's value until a recording of the burst's cooldown settles it
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/flins
const BURST_COOLDOWN_SECONDS = 15;

// Provisional: Flins's gcsim folder has no plunge file, so his plunges take the timings and poise of Bennett's, as Nahida's
// Do. His multipliers are his own table's
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// The charged attack's hit at its hitmark, with the multiplier and element it takes
const chargedAttackHit = (multiplier: number, element: Element | undefined): KitHit => ({
  ...(element === undefined ? {} : { element, gauge: 1 }),
  hitArea: CHARGED_ATTACK_HIT_AREA,
  hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
  poiseDamage: 0,
  talentMultiplier: multiplier,
});

// Not built yet: Thunderous Symphony, the burst Northland Spearstorm arms for six seconds, whose hits are Lunar-Charged;
// Northland Spearstorm, the stance's skill, which waits on a stance's own skill cooldown, so the stance keeps the kit's
// Own skill as Raiden's Musou Isshin does; Cometh the Night's middle hits, which are Lunar-Charged; and Flins's passives
// And constellations, which read the Lunar-Charged reaction or the Manifest Flame's own skill.
export const FLINS_CHARACTER_ID = 10_000_120;

// Flins's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Manifest Flame's press
// Which starts a stance of the Electro strikes and charged attack, and Cometh the Night's initial and final hits. Northland
// Spearstorm, Thunderous Symphony and the Lunar-Charged middle hits are not built, nor are his passives
const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

export const createFlinsKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FLINS_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FLINS_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FLINS_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // The Electro strikes of Manifest Flame, which take the skill's multipliers and the same hitmarks and reaches
  const createStrike = (
    { cancelFrames, hits }: (typeof NORMAL_ATTACK_STRIKES)[number],
    multiplier: (index: number) => number,
    element: Element | undefined,
  ): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      ...(element === undefined ? {} : { element, gauge: 1 }),
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: multiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map((strike) =>
    createStrike(strike, attackMultiplier, undefined),
  );
  const chargedAttack: KitAction = {
    hits: [chargedAttackHit(attackMultiplier(5), undefined)],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const stanceNormalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map((strike) =>
    createStrike(strike, skillMultiplier, Element.Electro),
  );
  const stanceChargedAttack: KitAction = {
    hits: [chargedAttackHit(skillMultiplier(5), Element.Electro)],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const burstHit = (hitmarkFrames: number, index: number): KitHit => ({
    element: Element.Electro,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: burstMultiplier(index),
  });

  return {
    burstCooldownSeconds: BURST_COOLDOWN_SECONDS,
    burstEnergyCost: burstMultiplier(3),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(6),
    // Cometh the Night deals no hit at its start, and its initial hit lands 93 frames in; its final lands 71 frames later
    elementalBurst: {
      hits: [burstHit(BURST_INITIAL_HITMARK_FRAMES, 0), burstHit(BURST_FINAL_HITMARK_FRAMES, 2)],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Manifest Flame's press plays no hit of its own, as gcsim's Arcane Light deals no damage; it starts the stance, which
    // Lasts the Manifest Flame's seconds, and whose strikes and charged attack are the Electro ones
    elementalSkill: {
      hits: [],
      // The Electro strikes are Normal Attack DMG and the charged attack Extra, gcsim's AttackTagNormal and
      // AttackTagExtra in flins/attack.go and charge.go, so each group takes its kit tag
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(
          kitEffectState,
          combatant,
          {
            chargedAttack: stanceChargedAttack,
            chargedAttackStamina: attackMultiplier(6),
            elementalBurst: combatant.kit.elementalBurst,
            elementalSkill: combatant.kit.elementalSkill,
            normalAttacks: stanceNormalAttacks,
          },
          skillMultiplier(8),
          { isEndedOnSwap: true },
        ),
      seconds: SKILL_PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.high,
        hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(9),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.low,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(8),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(7),
    },
    skillCooldownSeconds: skillMultiplier(9),
  };
};
