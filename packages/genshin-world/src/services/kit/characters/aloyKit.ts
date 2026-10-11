import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Aloy's proud skill groups, read at her talent level. The attack group holds the first strike's two hits at 0 and 1, the
// next three strikes at 2 to 4, the fully charged shot at 6, and the plunges' collision, low and high at 7, 8 and 9. The
// skill group holds Freeze Bomb's damage at 0, the Chillwater Bomblets' at 1, the Coil and Rushing Ice normal attack bonuses
// at 4 to 8 and its cooldown at 9. The burst group holds Prophecies of Dawn's damage at 0, its cooldown at 1 and its energy
// cost at 2
const ALOY_ATTACK_GROUP_ID = 6231;
const ALOY_SKILL_GROUP_ID = 6232;
const ALOY_BURST_GROUP_ID = 6239;

// Measured: gcsim (MIT) aloy/attack.go and aimed.go, each arrow a box on the primary target that travels 10 frames to it,
// So it lands at its hitmark plus the travel. Priced as a circle of a metre round the body, as Ganyu's arrows are
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/aloy
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;

// Measured: gcsim (MIT) aloy/attack.go, the four strikes' hitmarks and the frame each cancels at. The first strike's two
// Hits are its two talent indexes, and each later strike is one
const NORMAL_ATTACK_STRIKES = [
  {
    cancelFrames: 31,
    hits: [
      { hitmarkFrames: 11, index: 0 },
      { hitmarkFrames: 24, index: 1 },
    ],
  },
  { cancelFrames: 28, hits: [{ hitmarkFrames: 16, index: 2 }] },
  { cancelFrames: 38, hits: [{ hitmarkFrames: 23, index: 3 }] },
  { cancelFrames: 61, hits: [{ hitmarkFrames: 30, index: 4 }] },
];

// Measured: gcsim (MIT) aloy/aimed.go, the fully charged shot's animation at 96 frames and its arrow's hitmark at 86
const FULL_CHARGE_FRAMES = 96;
const FULL_CHARGE_HITMARK_FRAMES = 86;

// Measured: gcsim (MIT) aloy/skill.go, Freeze Bomb released at 20 frames and landing 5 frames of travel on, its animation at
// 66 frames, and each Chillwater Bomblet landing 6 frames after the last, so the first at 31 and the second at 37
const SKILL_ANIMATION_FRAMES = 66;
const FREEZE_BOMB_HITMARK_FRAMES = 20 + 5;
const BOMBLET_INTERVAL_FRAMES = 6;
const BOMBLET_COUNT = 2;
// Measured: gcsim (MIT) aloy/skill.go, Freeze Bomb's circle of radius 4 and the bomblets' circles of radius 2, each centred on
// The primary target, so each is priced by the targeting reach and its radius
const FREEZE_BOMB_RADIUS = 4;
const BOMBLET_RADIUS = 2;
// The coil stacks a Chillwater Bomblet adds, and the stacks at which Rushing Ice takes them and infuses Aloy's attacks
const COIL_RUSHING_ICE_STACKS = 4;
const COIL_STATUS_ID = "aloy-coil";
const RUSHING_ICE_STATUS_ID = "aloy-rushing-ice";
// Provisional: gcsim gives the coils no end while Aloy is on the field, so their status is held until Rushing Ice takes them,
// which the kit model reads as a status with no seconds to run out
const COIL_STATUS_SECONDS = Number.POSITIVE_INFINITY;

// Measured: gcsim (MIT) aloy/burst.go, Prophecies of Dawn's circle of radius 6.5 centred 6.5 metres ahead of the body, its
// Hitmark at 100 frames and its animation at 117 frames
const BURST_HITMARK_FRAMES = 100;
const BURST_ANIMATION_FRAMES = 117;
// A circle centred ahead of the body is priced as its offset plus its radius
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6.5 + 6.5 });

// Provisional: the plunges last 0.4 seconds as Ganyu's do, since gcsim gives Aloy's no frames for them
const PLUNGE_SECONDS = 0.4;

// Aloy's first kit, at talent level 1: four strikes, a fully charged shot, a collision and two plunges, Freeze Bomb with its
// Two Chillwater Bomblets, which each add a coil stack, and Prophecies of Dawn. Four coil stacks give Cryo infusion for the
// Table's ten seconds of Rushing Ice. Her Coil and Rushing Ice normal attack bonuses are not built, as no kit step reads a
// normal attack's DMG bonus from the team's effects. Her constellations are not built, as the game cannot activate them
export const createAloyKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ALOY_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ALOY_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ALOY_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const rushingIceSeconds = skillTalentMultiplier(8);

  // Each Chillwater Bomblet that lands counts a coil stack, and the fourth gives Rushing Ice, which holds off any more coils
  // until it ends. Provisional: gcsim counts a bomblet once for all the enemies it strikes, where this counts each one
  const addCoilStack = ({ combatant, kitEffectState }: KitStepContext): void => {
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, RUSHING_ICE_STATUS_ID)) return;
    const coil = kitEffectState.effects.find(
      (effect): effect is KitStatus =>
        effect.kind === "status" && effect.characterId === combatant.characterId && effect.id === COIL_STATUS_ID,
    );
    const stacks = (coil?.stacks ?? 0) + 1;
    if (stacks < COIL_RUSHING_ICE_STACKS) {
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        id: COIL_STATUS_ID,
        kind: "status",
        secondsRemaining: COIL_STATUS_SECONDS,
        stacks,
      });
      return;
    }
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      id: COIL_STATUS_ID,
      kind: "status",
      secondsRemaining: COIL_STATUS_SECONDS,
      stacks: 0,
    });
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      element: Element.Cryo,
      kind: "infusion",
      secondsRemaining: rushingIceSeconds,
    });
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      id: RUSHING_ICE_STATUS_ID,
      kind: "status",
      secondsRemaining: rushingIceSeconds,
    });
  };

  const freezeBombHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, FREEZE_BOMB_RADIUS),
    hitmarkSeconds: FREEZE_BOMB_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(0),
  };
  // Provisional: gcsim gives no gauge for the Cryo skill, so each bomblet reads 1U as Ganyu's Cryo hits do
  const bomblet = (index: number): KitHit => ({
    element: Element.Cryo,
    gauge: 1,
    hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, BOMBLET_RADIUS),
    hitmarkSeconds: (FREEZE_BOMB_HITMARK_FRAMES + BOMBLET_INTERVAL_FRAMES * (index + 1)) / 60,
    onStrike: addCoilStack,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(1),
  });

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(({ cancelFrames, hits }) => ({
    hits: hits.map(({ hitmarkFrames, index }): KitHit => ({
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  return {
    burstCooldownSeconds: burstTalentMultiplier(1),
    burstEnergyCost: burstTalentMultiplier(2),
    chargedAttack: {
      hits: [
        {
          element: Element.Cryo,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: (FULL_CHARGE_HITMARK_FRAMES + ARROW_TRAVEL_FRAMES) / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // gcsim charges no stamina for the fully charged shot, so none
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [
        {
          element: Element.Cryo,
          gauge: 1,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [freezeBombHit, ...Array.from({ length: BOMBLET_COUNT }, (_bomblet, index) => bomblet(index))],
      seconds: SKILL_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(8),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(7),
    },
    skillCooldownSeconds: skillTalentMultiplier(9),
  };
};
