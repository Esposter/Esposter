import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Kirara's proud skill groups, read at her talent level. The attack group holds her strikes at 0, 1 and 4, the third's two
// Hits at 2 and 3, the charged attack's three hits at 5 to 7, its stamina at 8, and the plunges' collision, low and high at 9,
// 10 and 11. The skill group holds Tail-Flicking Flying Kick's damage at 0, the shield's share and flat amount at 1 and 2, its
// Maximum's at 3 and 4, Urgent Neko Parcel's cat at 6, the longest hold's seconds at 7, Flipclaw Strike's damage at 8 and the
// Press's cooldown at 9. The burst group holds Secret Art: Surprise Dispatch's damage at 0, each Cat Grass Cardamom's at 1,
// The mines' seconds at 2, its cooldown at 3 and its energy cost at 4
const KIRARA_ATTACK_GROUP_ID = 6131;
const KIRARA_SKILL_GROUP_ID = 6132;
const KIRARA_BURST_GROUP_ID = 6139;

// Measured: gcsim (MIT, main) kirara/attack.go, each strike's hitmarks, its cancel frames, and its circles and box round the
// Body, each reach priced as its offset plus its radius, and the box as the circle to its far corner. The third strike
// Hits at 17 and 39 frames, and its animation cancels at 39 to 61 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kirara/attack.go
const createCircleReach = (offset: number, radius: number) => createFanReach(360, offset + radius);
const KIRARA_STRIKES = [
  { animationFrames: 33, hits: [{ hitArea: createCircleReach(0.6, 2), hitmarkFrames: 13, index: 0 }] },
  { animationFrames: 35, hits: [{ hitArea: createBoxReach(-0.3, 1.8, 3.8), hitmarkFrames: 18, index: 1 }] },
  {
    animationFrames: 61,
    hits: [
      { hitArea: createCircleReach(0.4, 2), hitmarkFrames: 17, index: 2 },
      { hitArea: createCircleReach(0.9, 2), hitmarkFrames: 39, index: 3 },
    ],
  },
  { animationFrames: 63, hits: [{ hitArea: createCircleReach(1, 2.1), hitmarkFrames: 39, index: 4 }] },
];

// Measured: gcsim (MIT, main) kirara/charge.go, the charged attack's three circles of radius 2.8 offset 1, 1 and 1.5 metres
// Ahead at 20, 27 and 37 frames, and its animation at 52 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kirara/charge.go
const CHARGED_ATTACK_FRAMES = 52;
const CHARGED_ATTACK_HITS = [
  { hitArea: createCircleReach(1, 2.8), hitmarkFrames: 20, index: 5 },
  { hitArea: createCircleReach(1, 2.8), hitmarkFrames: 27, index: 6 },
  { hitArea: createCircleReach(1.5, 2.8), hitmarkFrames: 37, index: 7 },
];

// Measured: gcsim (MIT, main) kirara/skill.go, Tail-Flicking Flying Kick's fan of 270 degrees with a circle of radius 2.5 a
// Half metre ahead, at 14 frames of an animation of 38. Its shield comes a frame after the hit. The short hold's cat ticks at
// 17 frames round the body and its Flipclaw Strike kick at 48, with an animation of 79 frames. Urgent Neko Parcel ticks every
// Half second from 16 frames, up to the hold's seconds and 12 frames past them, and its Flipclaw Strike kick lands at 36 frames
// Past the release, with an animation of 68 frames past it. Its shield lasts 12 seconds
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kirara/skill.go
const PRESS_KICK_HITMARK_FRAMES = 14;
const PRESS_FRAMES = 38;
const PRESS_KICK_REACH = createFanReach(270, 0.5 + 2.5);
const SHORT_HOLD_CAT_HITMARK_FRAMES = 17;
const SHORT_HOLD_KICK_HITMARK_FRAMES = 48;
const SHORT_HOLD_FRAMES = 79;
const CAT_REACH = createFanReach(360, 3);
const KICK_REACH = createFanReach(360, 0.5 + 2.6);
const CAT_FIRST_HITMARK_FRAMES = 16;
const CAT_INTERVAL_FRAMES = 30;
const CAT_TAIL_FRAMES = 12;
const HOLD_KICK_FRAMES_AFTER_RELEASE = 36;
const HOLD_FRAMES_AFTER_RELEASE = 68;
const HOLD_COOLDOWN_SECONDS_PER_HELD_SECOND = 0.4;
const SHIELD_SECONDS = 12;
const SELF_INFUSION_SECONDS = 0.1;
// Provisional: gcsim gives the short hold's cooldown as 8.2 seconds, which the table does not list, and no table or wiki page
// Gives the seconds a press must be held to become a short hold, so it is 0.5 seconds as Sayu's is, until a recording measures
const SHORT_HOLD_COOLDOWN_SECONDS = 8.2;
const SHORT_HOLD_MINIMUM_HELD_SECONDS = 0.5;

// Measured: gcsim (MIT, main) kirara/burst.go, Secret Art: Surprise Dispatch's animation at 58 frames, its box's circle of
// Radius 6 three metres ahead at 38 frames, and its six Cat Grass Cardamoms, two of which explode at 180 frames on a circle
// Of radius 2 round the primary target and the other four at expiry, 80 frames past the twelve seconds' mark, 18 frames apart.
// The box is priced as the circle to its far corner
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kirara/burst.go
const BURST_FRAMES = 58;
const BURST_BOX_HITMARK_FRAMES = 38;
const BURST_BOX_REACH = createFanReach(360, 3 + 6);
const CARDAMOM_COUNT = 6;
const CARDAMOM_DETONATE_FRAMES = 180;
const CARDAMOM_EXPIRY_OFFSET_FRAMES = 80;
const CARDAMOM_INTERVAL_FRAMES = 18;
const CARDAMOM_HIT_AREA_RADIUS = 2;
// Provisional: the mines are read as detonating twice at 180 frames by default, which the kit does not choose
const CARDAMOM_DETONATED_COUNT = 2;

// Provisional: gcsim gives Kirara's strikes, charged attack, skill and burst no poise, so these deal none, as Keqing's do
// Provisional: gcsim gives Kirara no plunge timing either, so her plunges are the reaches the other kits' plunges use, at
// 0.4 seconds, until the Mac measures them

export const KIRARA_CHARACTER_ID = 10_000_061;

// Kirara's first kit, at talent level 1: four strikes with a charged attack of three hits, a collision and two plunges,
// Tail-Flicking Flying Kick with its shield, its short hold and its holds of up to ten seconds with Urgent Neko Parcel and
// Flipclaw Strike, and Secret Art: Surprise Dispatch with its box and the Cat Grass Cardamoms it sets. Her passives and
// Constellations are not built, and the 0.1 second Dendro self-infusion is built. Her multipliers are read from her proud
// Skill groups
export const createKiraraKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KIRARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KIRARA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KIRARA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // The shield is a share of her Max HP and a flat amount, capped at its maximum's share and flat amount, as gcsim caps it
  const createShield = (combatant: Combatant): KitShield => {
    const { maxHealth } = combatant.attributes;
    const health = Math.min(
      skillTalentMultiplier(1) * maxHealth + skillTalentMultiplier(2),
      skillTalentMultiplier(3) * maxHealth + skillTalentMultiplier(4),
    );
    return {
      characterId: combatant.characterId,
      element: Element.Dendro,
      health,
      kind: "shield",
      secondsRemaining: SHIELD_SECONDS,
    };
  };

  // Tail-Flicking Flying Kick, its press and each hold cast the shield and the Dendro self-infusion as they start
  const addSkillStart = ({ combatant, kitEffectState }: KitStepContext): void => {
    addKitEffect(kitEffectState, createShield(combatant));
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      element: Element.Dendro,
      kind: "infusion",
      secondsRemaining: SELF_INFUSION_SECONDS,
    });
  };

  const normalAttacks: KitAction[] = KIRARA_STRIKES.map(({ animationFrames, hits }): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  // Her kicks are Dendro under gauge 1, her cat ticks likewise, and each is a skill's hit
  const catHit = (hitmarkFrames: number): KitHit => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea: CAT_REACH,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(6),
  });
  const kickHit = (hitArea: KitHit["hitArea"], hitmarkFrames: number, talentIndex: number): KitHit => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(talentIndex),
  });

  const pressAction: KitAction = {
    hits: [kickHit(PRESS_KICK_REACH, PRESS_KICK_HITMARK_FRAMES, 0)],
    onStart: addSkillStart,
    seconds: PRESS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const shortHold: KitSkillHold = {
    action: {
      hits: [catHit(SHORT_HOLD_CAT_HITMARK_FRAMES), kickHit(KICK_REACH, SHORT_HOLD_KICK_HITMARK_FRAMES, 8)],
      onStart: addSkillStart,
      seconds: SHORT_HOLD_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    cooldownSeconds: SHORT_HOLD_COOLDOWN_SECONDS,
    minimumHeldSeconds: SHORT_HOLD_MINIMUM_HELD_SECONDS,
  };

  // Each level of Urgent Neko Parcel is the hold for that many whole seconds: its cat ticks every half second from 16
  // Frames, up to the hold's seconds and 12 frames past them, its kick 36 frames past its release, and its cooldown the
  // Press's base plus 0.4 seconds for each second held
  const createHoldLevel = (heldSeconds: number): KitSkillHold => {
    const duration = heldSeconds * 60;
    const catHits: KitHit[] = [];
    for (
      let hitmarkFrames = CAT_FIRST_HITMARK_FRAMES;
      hitmarkFrames <= duration + CAT_TAIL_FRAMES;
      hitmarkFrames += CAT_INTERVAL_FRAMES
    )
      catHits.push(catHit(hitmarkFrames));
    return {
      action: {
        hits: [...catHits, kickHit(KICK_REACH, HOLD_KICK_FRAMES_AFTER_RELEASE + duration, 8)],
        onStart: addSkillStart,
        seconds: (HOLD_FRAMES_AFTER_RELEASE + duration) / 60,
        targetingArea: SKILL_TARGETING_AREA,
      },
      cooldownSeconds: skillTalentMultiplier(9) + heldSeconds * HOLD_COOLDOWN_SECONDS_PER_HELD_SECOND,
      minimumHeldSeconds: heldSeconds,
    };
  };
  const holds: KitSkillHold[] = Array.from({ length: skillTalentMultiplier(7) }, (_hold, index) =>
    createHoldLevel(index + 1),
  );

  // Secret Art: Surprise Dispatch's mines are a summon cast at her body: the two detonated at 180 frames on the primary
  // Target, then the rest at the expiry, 18 frames apart, each a circle of radius 2 round the primary target
  const cardamomHitArea = createTargetedHitArea(SKILL_TARGETING_AREA, CARDAMOM_HIT_AREA_RADIUS);
  const createCardamomHit = (hitmarkFrames: number): KitHit => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea: cardamomHitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: burstTalentMultiplier(1),
  });
  const createCardamomSummon = (body: KitBody, combatant: Combatant): KitSummon => {
    const expiryFrames = CARDAMOM_EXPIRY_OFFSET_FRAMES + burstTalentMultiplier(2) * 60;
    const detonatedHits = Array.from({ length: CARDAMOM_DETONATED_COUNT }, () =>
      createCardamomHit(CARDAMOM_DETONATE_FRAMES),
    );
    const expiryHits = Array.from({ length: CARDAMOM_COUNT - CARDAMOM_DETONATED_COUNT }, (_mine, index) =>
      createCardamomHit(expiryFrames + index * CARDAMOM_INTERVAL_FRAMES),
    );
    return createKitSummon(body, combatant, [...detonatedHits, ...expiryHits]);
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(3),
    burstEnergyCost: burstTalentMultiplier(4),
    chargedAttack: {
      hits: CHARGED_ATTACK_HITS.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(index),
      })),
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(8),
    elementalBurst: {
      hits: [
        {
          element: Element.Dendro,
          gauge: 2,
          hitArea: BURST_BOX_REACH,
          hitmarkSeconds: BURST_BOX_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      onStart: ({ body, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, createCardamomSummon(body, combatant)),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: pressAction,
    elementalSkillHolds: [shortHold, ...holds],
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(11),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(9),
    },
    skillCooldownSeconds: skillTalentMultiplier(9),
  };
};
