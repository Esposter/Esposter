import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Chevreuse's proud skill groups, read at her talent level. The attack group holds the four strikes' hits at 0 to 4,
// The charged attack at 5 and its stamina at 6, and the plunges' collision, low and high at 7, 8 and 9. The skill group
// Holds the press at 0, the hold at 1, the Overcharged Ball at 2 and Surging Blade at 6 of its own, which the kit does not
// Build yet. The burst group holds Explosive Grenade at 0, the secondary shells at 1, the burst's cooldown at 2 and its energy cost at 3
const CHEVREUSE_ATTACK_GROUP_ID = 9031;
const CHEVREUSE_SKILL_GROUP_ID = 9032;
const CHEVREUSE_BURST_GROUP_ID = 9039;

export const CHEVREUSE_CHARACTER_ID = 10_000_090;

// Measured: gcsim v2.47.2 (MIT) chevreuse/attack.go, each strike's hitmarks and the animation that ends it at 60 fps, and
// Its reach. The first and third strikes' first hits are boxes on the body, the second and third's second hits circles
// Of radius 1.6 centred 0.4 metres ahead, and the fourth a box 1 metre ahead. A circle centred ahead is priced as its
// Offset plus its radius, as Zhongli's are. gcsim gives no poise for a normal attack
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chevreuse/attack.go
const CIRCLE_STRIKE_HIT_AREA = createFanReach(360, 0.4 + 1.6);
const STRIKES: { frames: number; hits: { groupIndex: number; hitArea: AttackArea; hitmarkFrames: number }[] }[] = [
  { frames: 33, hits: [{ groupIndex: 0, hitArea: createBoxReach(0, 1.6, 2), hitmarkFrames: 11 }] },
  { frames: 33, hits: [{ groupIndex: 1, hitArea: CIRCLE_STRIKE_HIT_AREA, hitmarkFrames: 12 }] },
  {
    frames: 46,
    hits: [
      { groupIndex: 2, hitArea: createBoxReach(0, 1.6, 2), hitmarkFrames: 15 },
      { groupIndex: 3, hitArea: CIRCLE_STRIKE_HIT_AREA, hitmarkFrames: 25 },
    ],
  },
  { frames: 67, hits: [{ groupIndex: 4, hitArea: createBoxReach(1, 1.5, 4), hitmarkFrames: 33 }] },
];

// Measured: gcsim v2.47.2 (MIT) chevreuse/charge.go, the thrust at 27 frames, a circle of radius 0.8 on the primary target,
// Its animation 65 frames
const CHARGED_ATTACK_HITMARK_FRAMES = 27;
const CHARGED_ATTACK_FRAMES = 65;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);

// Measured: gcsim v2.47.2 (MIT) chevreuse/skill.go, the press's box 0.5 metres behind the body of 2 by 6 metres at 25
// Frames, its animation 31; the hold's box 0.5 behind of 3 by 7 at 19 frames past its release, its animation 26
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chevreuse/skill.go
const PRESS_HITMARK_FRAMES = 25;
const PRESS_FRAMES = 31;
const PRESS_HIT_AREA = createBoxReach(-0.5, 2, 6);
const HOLD_HITMARK_FRAMES = 19;
const HOLD_FRAMES = 26;
const HOLD_HIT_AREA = createBoxReach(-0.5, 3, 7);
// The Overcharged Ball, a circle of radius 5 on the primary target, lands with the hold's hitmark
const OVERCHARGED_BALL_RADIUS = 5;
// Provisional: no table or wiki page gives the seconds a press must be held to become the hold, so it is Zhongli's, until
// A recording measures it
const HOLD_MINIMUM_HELD_SECONDS = 0.5;
// The skill's cooldown, which gcsim v2.47.2 (MIT) chevreuse/skill.go sets at 15 seconds for both the press and the hold
const SKILL_COOLDOWN_SECONDS = 15;

// Measured: gcsim v2.47.2 (MIT) chevreuse/burst.go, Explosive Grenade's circle of radius 6 round Chevreuse at 59 frames,
// Its animation 61, and its 8 secondary shells, which explode in five groups from 24 to 60 frames after it, each a circle
// Of radius 6 round the primary target's position when she casts, as gcsim's arcs of 60 degrees. A shell's hitmark falls
// Past the animation's end, and the hit still lands, so the burst's hits keep gcsim's frames
const BURST_HITMARK_FRAMES = 59;
const BURST_FRAMES = 61;
const BURST_BLAST_HIT_AREA = createFanReach(360, 6);
const BURST_SHELL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6);
const BURST_SHELL_GROUPS = [
  { count: 1, delayFrames: 24 },
  { count: 2, delayFrames: 33 },
  { count: 2, delayFrames: 42 },
  { count: 2, delayFrames: 51 },
  { count: 1, delayFrames: 60 },
];

// Overloaded reactions set the Overcharged Ball going for the next hold, as gcsim's overcharged-ball subscription does,
// Whoever triggers them, until a hold casts the ball
const OVERCHARGED_BALL_STATUS_ID = "chevreuse-overcharged-ball";

const hitmark = (frames: number): number => frames / 60;
// The Overcharged Ball's hold spends the ball as it starts, so the next hold is a plain one again
const consumeOverchargedBall = ({ kitEffectState }: KitContext): void => {
  kitEffectState.effects = kitEffectState.effects.filter(
    (effect) => !(effect.kind === "status" && effect.id === OVERCHARGED_BALL_STATUS_ID),
  );
};

// The one kit a character holds in the party: its strikes, its charged attack, its plunges, its press and hold with the
// Overcharged Ball a hold casts after an Overloaded reaction, and Explosive Grenade with its shells
export const createChevreuseKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHEVREUSE_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const skillMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHEVREUSE_SKILL_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const burstMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHEVREUSE_BURST_GROUP_ID, TALENT_START_LEVEL, groupIndex);

  const normalAttacks = STRIKES.map(({ frames, hits }): KitAction => ({
    hits: hits.map(({ groupIndex, hitArea, hitmarkFrames }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmark(hitmarkFrames),
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(groupIndex),
    })),
    seconds: hitmark(frames),
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const overchargedBallHit: KitHit = {
    element: Element.Pyro,
    gauge: 1,
    hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, OVERCHARGED_BALL_RADIUS),
    hitmarkSeconds: hitmark(HOLD_HITMARK_FRAMES),
    isBlunt: true,
    poiseDamage: 125,
    talentMultiplier: skillMultiplier(2),
  };
  // The Overcharged Ball's hold spends the ball as it starts, so the next hold is a plain one again

  const burstShellHits: KitHit[] = BURST_SHELL_GROUPS.flatMap(({ count, delayFrames }) =>
    Array.from({ length: count }, (): KitHit => ({
      element: Element.Pyro,
      gauge: 1,
      hitArea: BURST_SHELL_HIT_AREA,
      hitmarkSeconds: hitmark(BURST_HITMARK_FRAMES + delayFrames),
      internalCooldownTag: InternalCooldownTag.ElementalBurst,
      isBlunt: true,
      poiseDamage: 25,
      talentMultiplier: burstMultiplier(1),
    })),
  );

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: hitmark(CHARGED_ATTACK_HITMARK_FRAMES),
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(5),
        },
      ],
      seconds: hitmark(CHARGED_ATTACK_FRAMES),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(6),
    elementalBurst: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 2,
          hitArea: BURST_BLAST_HIT_AREA,
          hitmarkSeconds: hitmark(BURST_HITMARK_FRAMES),
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: burstMultiplier(0),
        },
        ...burstShellHits,
      ],
      seconds: hitmark(BURST_FRAMES),
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 1,
          hitArea: PRESS_HIT_AREA,
          hitmarkSeconds: hitmark(PRESS_HITMARK_FRAMES),
          internalCooldownTag: InternalCooldownTag.ElementalSkill,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(0),
        },
      ],
      seconds: hitmark(PRESS_FRAMES),
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillHolds: [
      {
        action: {
          hits: [
            {
              element: Element.Pyro,
              gauge: 1,
              hitArea: HOLD_HIT_AREA,
              hitmarkSeconds: hitmark(HOLD_HITMARK_FRAMES),
              internalCooldownTag: InternalCooldownTag.ElementalSkill,
              poiseDamage: 0,
              talentMultiplier: skillMultiplier(1),
            },
          ],
          seconds: hitmark(HOLD_FRAMES),
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: SKILL_COOLDOWN_SECONDS,
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
        variant: {
          action: {
            hits: [overchargedBallHit],
            onStart: consumeOverchargedBall,
            seconds: hitmark(HOLD_FRAMES),
            targetingArea: SKILL_TARGETING_AREA,
          },
          checkIsActive: ({ activeCombatant: combatant, kitEffectState }) =>
            checkHasKitStatus(kitEffectState.effects, combatant.characterId, OVERCHARGED_BALL_STATUS_ID),
        },
      },
    ],
    // Provisional: gcsim has no plunge file for Chevreuse, so her plunges' reach is the shared plunge reach and their
    // Landing is at the action's start, as Zhongli's are. gcsim gives no poise for a plunge
    highPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.high, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(9) },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.low, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(8) },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // Overloaded from any source sets the ball going on the team's Chevreuse, as gcsim's subscription does, until a hold
    // Casts it. The status has no end, so it stands until a hold spends it
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        !event.reactions.some(({ reactionType }) => reactionType === ReactionType.Overloaded)
      )
        return;
      if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, OVERCHARGED_BALL_STATUS_ID)) return;
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        id: OVERCHARGED_BALL_STATUS_ID,
        kind: "status",
        secondsRemaining: Number.POSITIVE_INFINITY,
      });
    },
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(7),
    },
    skillCooldownSeconds: SKILL_COOLDOWN_SECONDS,
  };
};
