import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createPeriodicKitHits } from "#src/services/kit/createPeriodicKitHits";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { takeOne } from "@esposter/shared";

// Alhaitham's proud skill groups, read at his talent level. The attack group holds the five strikes at 0, 1, 2 with its
// Second hit at 3, 4 and 5, the charged attack's two hits at 6 and 7 and its stamina at 8, and the plunges' collision, low
// And high at 9, 10 and 11. The skill group holds Universality's rush at 0 and its Elemental Mastery at 1, a projection's
// Hit at 3 and its Elemental Mastery at 4, and the skill's cooldown at 10. The burst group holds Particular Field's instance
// At 0 and its Elemental Mastery at 1, its cooldown at 6 and its energy cost at 7
const ALHAITHAM_ATTACK_GROUP_ID = 7831;
const ALHAITHAM_SKILL_GROUP_ID = 7832;
const ALHAITHAM_BURST_GROUP_ID = 7839;

// Measured: gcsim (MIT) alhaitham/attack.go, each strike's hitmarks and the frame its action cancels at by default, and its
// Reach: a circle is its offset plus its radius, and a box is priced to its far corner, as Ayato's strikes are. The first
// Strike's fan is 180 degrees
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/alhaitham
const NORMAL_ATTACK_CANCEL_FRAMES = [29, 31, 55, 51, 90] as const;
const CHARGED_ATTACK_FRAMES = 64;
const CHARGED_ATTACK_HIT_RADIUS = 2.5;
const CHARGED_ATTACK_HITMARK_FRAMES = [19, 27];

// Measured: gcsim (MIT) alhaitham/plunge.go, the collision at 40 frames, the low plunge at 46 with its falling animation at
// 70 and the high at 48 with its animation at 77. Each plunge is a circle a metre ahead of the body with its radius of 3 or 5,
// And the collision a circle of radius 1 there, with the low and high plunges' poise of 100 and 150
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/alhaitham
const PLUNGE_COLLISION_HITMARK_FRAMES = 40;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const LOW_PLUNGE_FRAMES = 70;
const LOW_PLUNGE_HITMARK_FRAMES = 46;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_FRAMES = 77;
const HIGH_PLUNGE_HITMARK_FRAMES = 48;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) alhaitham/skill.go, Universality: An Elaboration on Form's tap at 19 frames with its animation at 44,
// And its hold at 28 with its animation at 87. Each is a circle on the primary target, offset a metre for the tap and two for
// The hold, of radius 2.25, and each makes a Mirror 15 or 23 frames after the cast. The hold is taken from a half second
// Provisional: gcsim takes the hold as a parameter and gives no threshold for it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/alhaitham
const SKILL_HIT_RADIUS = 2.25;
const SKILL_TAP_HITMARK_FRAMES = 19;
const SKILL_TAP_ANIMATION_FRAMES = 44;
const SKILL_TAP_OFFSET = 1;
const SKILL_TAP_MIRROR_FRAMES = 15;
const SKILL_HOLD_HITMARK_FRAMES = 28;
const SKILL_HOLD_ANIMATION_FRAMES = 87;
const SKILL_HOLD_OFFSET = 2;
const SKILL_HOLD_MIRROR_FRAMES = 23;
// Provisional: gcsim takes the hold as a parameter and gives no threshold for it, so a half second holds the skill until
// The Mac measures the game's own hold threshold
const HOLD_MINIMUM_HELD_SECONDS = 0.5;

// Measured: gcsim (MIT) alhaitham/burst.go, Particular Field: Fetters of Phenomena's animation at 91 frames, its hits at 94
// And every 21 frames after, and a circle of radius 6.8 centred 7.1 metres ahead of the body, which the hits land in. Its hit
// Count is four plus two per Mirror consumed, and the Mirrors it makes after 184 frames are three less those consumed
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/alhaitham
const BURST_FRAMES = 91;
const BURST_FIRST_HITMARK_FRAMES = 94;
const BURST_HIT_INTERVAL_FRAMES = 21;
const BURST_HIT_AREA = createCircleReach(7.1, 6.8);
const BURST_BASE_HIT_COUNT = 4;
const BURST_HIT_COUNT_PER_MIRROR = 2;
const BURST_MIRROR_REGEN_FRAMES = 184;

// Measured: gcsim (MIT) alhaitham/skill.go, each Mirror is a decay of one every 233 frames, the chain of the first Mirror of a
// Run, and a Projection Attack's hits at the Mirrors it has, each with its shape and hitmarks. The left hitmarks of its two
// Shapes that gcsim picks between at random are taken, which land a frame or two after the right ones
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/alhaitham
const MIRRORS_MAX = 3;
const MIRROR_DECAY_FRAMES = 233;
const PROJECTION_ICD_FRAMES = 96;
const PROJECTION_ATTACK_SHAPES = [
  { hitArea: createBoxReach(0, 7, 3), hitmarkFrames: [39] },
  { hitArea: createFanReach(180, 5.4), hitmarkFrames: [28, 37] },
  { hitArea: createCircleReach(4, 4), hitmarkFrames: [32, 41, 51] },
];

// Measured: gcsim (MIT) alhaitham/asc.go and cons.go, Ascension 1 makes a Mirror from a charged attack's or a plunge's hit
// On an enemy once every 12 seconds, and Ascension 4 raises a Projection Attack's and the burst's DMG by 0.1% per Elemental
// Mastery, to 100%. Constellation 2 gives 50 Elemental Mastery for 8 seconds for each Mirror made, up to four, Constellation
// 4 gives the team 30 Elemental Mastery per Mirror the burst consumed for 15 seconds and Alhaitham 10% Dendro DMG per Mirror
// Made for as long, and Constellation 6 gives 10% CRIT Rate and 70% CRIT DMG for 6 seconds on each Mirror past three, which
// Each further one extends by 6 seconds
const ASCENSION_1 = 1;
const ASCENSION_1_ICD_SECONDS = 12;
const ASCENSION_4 = 4;
const ASCENSION_4_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY = 0.001;
const ASCENSION_4_DAMAGE_BONUS_MAX = 1;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ELEMENTAL_MASTERY = 50;
const CONSTELLATION_2_SECONDS = 8;
const CONSTELLATION_2_STACKS_MAX = 4;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ELEMENTAL_MASTERY_PER_MIRROR = 30;
const CONSTELLATION_4_DENDRO_DAMAGE_BONUS_PER_MIRROR = 0.1;
const CONSTELLATION_4_SECONDS = 15;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_CRITICAL_RATE = 0.1;
const CONSTELLATION_6_CRITICAL_DAMAGE = 0.7;
const CONSTELLATION_6_SECONDS = 6;
// A stance, status or infusion a kit holds until a swap ends it, as gcsim's Mirrors last while he stays on the field
const HELD_UNTIL_SWAP_SECONDS = Number.POSITIVE_INFINITY;
const MIRROR_STATUS_ID = "alhaitham-mirrors";
const MIRROR_DECAY_FIELD_ID = "alhaitham-mirror-decay";
const MIRROR_REGEN_TASK_ID = "alhaitham-mirror-regen";
const PROJECTION_ICD_STATUS_ID = "alhaitham-projection-icd";
const ASCENSION_1_ICD_STATUS_ID = "alhaitham-a1-icd";
const CONSTELLATION_2_CURSOR_STATUS_ID = "alhaitham-c2-cursor";
const CONSTELLATION_2_SOURCE_PREFIX = "alhaitham-c2-";
const CONSTELLATION_4_LOSS_SOURCE = "alhaitham-c4-loss";
const CONSTELLATION_4_GAIN_SOURCE = "alhaitham-c4-gain";
const CONSTELLATION_6_SOURCE = "alhaitham-c6";

// The field of an id the team holds
const findKitField = (effects: readonly KitEffect[], id: string): KitField | undefined =>
  effects.find((effect): effect is KitField => effect.kind === "field" && effect.id === id);
const findKitBuff = (
  effects: readonly KitEffect[],
  characterId: number,
  attribute: Attribute,
  source: string,
): KitBuff | undefined =>
  effects.find(
    (effect): effect is KitBuff =>
      effect.kind === "buff" &&
      effect.characterId === characterId &&
      effect.attribute === attribute &&
      effect.source === source,
  );
const getMirrorCount = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, MIRROR_STATUS_ID)?.stacks ?? 0;

// Sets the Mirrors a character holds, with the Dendro infusion of its normal attacks, charged attack and plunges while it holds
// Any. Zero ends the Mirrors, their decay and that infusion, as a swap or the burst's consumption does
const setMirrorCount = (kitEffectState: KitEffectState, characterId: number, mirrors: number): void => {
  if (mirrors <= 0) {
    const status = findKitStatus(kitEffectState.effects, characterId, MIRROR_STATUS_ID);
    if (status) {
      status.stacks = 0;
      status.secondsRemaining = 0;
    }
    for (const effect of kitEffectState.effects) {
      if (effect.kind === "infusion" && effect.characterId === characterId && effect.element === Element.Dendro)
        effect.secondsRemaining = 0;
      if (effect.kind === "field" && effect.id === MIRROR_DECAY_FIELD_ID) effect.secondsRemaining = 0;
    }
    return;
  }
  addKitStatus(kitEffectState, characterId, {
    id: MIRROR_STATUS_ID,
    secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
    stacks: mirrors,
  });
  addKitEffect(kitEffectState, {
    characterId,
    element: Element.Dendro,
    kind: "infusion",
    secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
  });
};

// Starts the decay of the Mirrors, one every 233 frames, or restarts it if one is running, which is gcsim's chain: a new
// Chain supersedes the one before it, so the one field is moved to its first tick rather than a second added
const startMirrorDecay = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant): void => {
  const { characterId } = combatant;
  const field = findKitField(kitEffectState.effects, MIRROR_DECAY_FIELD_ID);
  if (field) {
    field.nextTickSeconds = MIRROR_DECAY_FRAMES / 60;
    field.secondsRemaining = HELD_UNTIL_SWAP_SECONDS;
    return;
  }
  castKitField(kitEffectState, characterId, body.position, {
    id: MIRROR_DECAY_FIELD_ID,
    nextTickSeconds: MIRROR_DECAY_FRAMES / 60,
    onTick: ({ kitEffectState: effectState }) => {
      const count = getMirrorCount(effectState.effects, characterId);
      setMirrorCount(effectState, characterId, count > 1 ? count - 1 : 0);
    },
    secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
    tickIntervalSeconds: MIRROR_DECAY_FRAMES / 60,
  });
};

// Adds Constellation 2's Elemental Mastery for one Mirror made, on the next of its four sources, as gcsim cycles them
const addConstellation2Buff = (kitEffectState: KitEffectState, characterId: number): void => {
  const cursor = findKitStatus(kitEffectState.effects, characterId, CONSTELLATION_2_CURSOR_STATUS_ID)?.stacks ?? 0;
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_2_CURSOR_STATUS_ID,
    secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
    stacks: (cursor + 1) % CONSTELLATION_2_STACKS_MAX,
  });
  buffKitMember(kitEffectState, characterId, {
    amount: CONSTELLATION_2_ELEMENTAL_MASTERY,
    attribute: Attribute.ElementalMastery,
    secondsRemaining: CONSTELLATION_2_SECONDS,
    source: `${CONSTELLATION_2_SOURCE_PREFIX}${cursor + 1}`,
  });
};

// Adds Constellation 6's CRIT for each Mirror past three, where a further one extends the buff already on him
const addConstellation6Buffs = (kitEffectState: KitEffectState, characterId: number, overflow: number): void => {
  for (let index = 0; index < overflow; index++) {
    const critical = findKitBuff(kitEffectState.effects, characterId, Attribute.CriticalRate, CONSTELLATION_6_SOURCE);
    if (critical) {
      critical.secondsRemaining += CONSTELLATION_6_SECONDS;
      const criticalDamage = findKitBuff(
        kitEffectState.effects,
        characterId,
        Attribute.CriticalDamage,
        CONSTELLATION_6_SOURCE,
      );
      if (criticalDamage) criticalDamage.secondsRemaining += CONSTELLATION_6_SECONDS;
      continue;
    }
    buffKitMember(kitEffectState, characterId, {
      amount: CONSTELLATION_6_CRITICAL_RATE,
      attribute: Attribute.CriticalRate,
      secondsRemaining: CONSTELLATION_6_SECONDS,
      source: CONSTELLATION_6_SOURCE,
    });
    buffKitMember(kitEffectState, characterId, {
      amount: CONSTELLATION_6_CRITICAL_DAMAGE,
      attribute: Attribute.CriticalDamage,
      secondsRemaining: CONSTELLATION_6_SECONDS,
      source: CONSTELLATION_6_SOURCE,
    });
  }
};

// Makes Mirrors as gcsim's mirror gain does: a run's first Mirror, or one that overflows past three, starts the decay, and
// Constellation 2 and 6 answer each one made
const gainMirrors = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant, generated: number): void => {
  if (generated <= 0) return;
  const { characterId, constellationCount } = combatant;
  const count = getMirrorCount(kitEffectState.effects, characterId);
  const total = count + generated;
  if (count === 0 || total > MIRRORS_MAX) startMirrorDecay(kitEffectState, body, combatant);
  setMirrorCount(kitEffectState, characterId, Math.min(total, MIRRORS_MAX));
  if (constellationCount >= CONSTELLATION_2)
    for (let made = 0; made < generated; made++) addConstellation2Buff(kitEffectState, characterId);
  if (constellationCount >= CONSTELLATION_6 && total > MIRRORS_MAX)
    addConstellation6Buffs(kitEffectState, characterId, total - MIRRORS_MAX);
};

// The Elemental Mastery a hit's flat damage takes, from its striker's total at the multiplier
const elementalMasteryMultiplier = (combatant: Combatant, multiplier: number): number =>
  combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * multiplier;

// The Mirrors a skill makes as it lands: two when the character holds none, and one otherwise
const getSkillMirrorGain = (effects: readonly KitEffect[], characterId: number): number =>
  getMirrorCount(effects, characterId) === 0 ? 2 : 1;

export const ALHAITHAM_CHARACTER_ID = 10_000_078;

// Alhaitham's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Universality: An
// Elaboration on Form's tap and hold, Particular Field: Fetters of Phenomena's burst, and the Mirrors they make. The
// Mirrors' Dendro infusion, the Projection Attacks, Ascension 1 and 4, and Constellations 2, 4 and 6 are built. Constellation
// 1's skill cooldown cut is not, as the kit has no cooldown reduction by seconds, and the low plunge after the hold is not,
// As a plunge has no variant the skill's hold can set; the rest of the hold's effects are built as gcsim gives them
export const createAlhaithamKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ALHAITHAM_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ALHAITHAM_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ALHAITHAM_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  // A Projection Attack triggers on a normal attack, charged attack or plunge that strikes an enemy. An Ascension 1 charged
  // Attack or plunge makes a Mirror first, so the projection counts it, and Projection Attack's own cooldown holds it to once
  // Each 1.6 seconds, as gcsim's projection does
  const triggerProjection = (
    { kitEffectState }: KitContext,
    { body, combatant }: KitStrike,
    isMirrorSource: boolean,
  ): void => {
    const { ascension, characterId } = combatant;
    if (
      isMirrorSource &&
      ascension >= ASCENSION_1 &&
      startKitCooldown(kitEffectState, characterId, ASCENSION_1_ICD_STATUS_ID, ASCENSION_1_ICD_SECONDS)
    )
      gainMirrors(kitEffectState, body, combatant, 1);
    const count = getMirrorCount(kitEffectState.effects, characterId);
    if (
      count === 0 ||
      !startKitCooldown(kitEffectState, characterId, PROJECTION_ICD_STATUS_ID, PROJECTION_ICD_FRAMES / 60)
    )
      return;
    const { hitArea, hitmarkFrames } = takeOne(PROJECTION_ATTACK_SHAPES, count - 1);
    castKitSummon(
      kitEffectState,
      body,
      combatant,
      hitmarkFrames.map((frames): KitHit => ({
        additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, skillMultiplier(4)),
        element: Element.Dendro,
        gauge: 1,
        hitArea,
        hitmarkSeconds: frames / 60,
        internalCooldownTag: InternalCooldownTag.ElementalSkill,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(3),
      })),
    );
  };

  const createStrikeHit = (
    hitArea: AttackArea,
    hitmarkFrames: number,
    talentMultiplier: number,
    internalCooldownTag: InternalCooldownTag,
    isMirrorSource: boolean,
  ): KitHit => ({
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag,
    onStrike: (context, strike) => triggerProjection(context, strike, isMirrorSource),
    poiseDamage: 0,
    talentMultiplier,
  });

  const createPlungeHit = (
    hitArea: AttackArea,
    hitmarkFrames: number,
    poiseDamage: number,
    talentMultiplier: number,
  ): KitHit => ({
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    isBlunt: true,
    onStrike: (context, strike) => triggerProjection(context, strike, true),
    poiseDamage,
    talentMultiplier,
  });

  // The burst's hits, four plus two per Mirror consumed, each on its hitmark, and Ascension 4's share of the Elemental Mastery
  const createBurstHits = (count: number): KitHit[] =>
    createPeriodicKitHits(
      {
        additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, burstMultiplier(1)),
        element: Element.Dendro,
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(0),
      },
      count,
      BURST_FIRST_HITMARK_FRAMES,
      BURST_HIT_INTERVAL_FRAMES,
    );

  const createSkillAction = (
    hitmarkFrames: number,
    animationFrames: number,
    offset: number,
    mirrorFrames: number,
  ): KitAction => ({
    hits: [
      {
        additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, skillMultiplier(1)),
        element: Element.Dendro,
        gauge: 1,
        hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, offset + SKILL_HIT_RADIUS),
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      scheduleKitTask(kitEffectState, combatant.characterId, mirrorFrames / 60, (tick) =>
        gainMirrors(
          tick.kitEffectState,
          body,
          combatant,
          getSkillMirrorGain(tick.kitEffectState.effects, combatant.characterId),
        ),
      ),
    seconds: animationFrames / 60,
    targetingArea: SKILL_TARGETING_AREA,
  });

  const elementalSkill = createSkillAction(
    SKILL_TAP_HITMARK_FRAMES,
    SKILL_TAP_ANIMATION_FRAMES,
    SKILL_TAP_OFFSET,
    SKILL_TAP_MIRROR_FRAMES,
  );
  const holdAction = createSkillAction(
    SKILL_HOLD_HITMARK_FRAMES,
    SKILL_HOLD_ANIMATION_FRAMES,
    SKILL_HOLD_OFFSET,
    SKILL_HOLD_MIRROR_FRAMES,
  );

  const elementalBurst: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
      const { characterId, constellationCount } = combatant;
      const consumed = getMirrorCount(kitEffectState.effects, characterId);
      castKitSummon(
        kitEffectState,
        body,
        combatant,
        createBurstHits(BURST_BASE_HIT_COUNT + BURST_HIT_COUNT_PER_MIRROR * consumed),
      );
      setMirrorCount(kitEffectState, characterId, 0);
      // Constellation 4's loss is the team's Elemental Mastery for each Mirror consumed, to every member but Alhaitham
      if (constellationCount >= CONSTELLATION_4 && consumed > 0)
        for (const memberId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
          if (memberId === characterId) continue;
          buffKitMember(kitEffectState, memberId, {
            amount: CONSTELLATION_4_ELEMENTAL_MASTERY_PER_MIRROR * consumed,
            attribute: Attribute.ElementalMastery,
            secondsRemaining: CONSTELLATION_4_SECONDS,
            source: CONSTELLATION_4_LOSS_SOURCE,
          });
        }
      // Constellation 6 makes three Mirrors whatever the burst consumed, and the rest are made 184 frames on
      const generated = constellationCount >= CONSTELLATION_6 ? MIRRORS_MAX : MIRRORS_MAX - consumed;
      if (generated <= 0) return;
      scheduleKitTask(
        kitEffectState,
        characterId,
        BURST_MIRROR_REGEN_FRAMES / 60,
        (tick) => {
          gainMirrors(tick.kitEffectState, body, combatant, generated);
          if (constellationCount >= CONSTELLATION_4)
            buffKitMember(tick.kitEffectState, characterId, {
              amount: CONSTELLATION_4_DENDRO_DAMAGE_BONUS_PER_MIRROR * generated,
              attribute: Attribute.DendroDamageBonus,
              secondsRemaining: CONSTELLATION_4_SECONDS,
              source: CONSTELLATION_4_GAIN_SOURCE,
            });
        },
        { id: MIRROR_REGEN_TASK_ID },
      );
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const createNormalAttack = (
    cancelFrames: number,
    hitArea: AttackArea,
    hits: { hitmarkFrames: number; talentMultiplier: number }[],
  ): KitAction => ({
    hits: hits.map(({ hitmarkFrames, talentMultiplier }) =>
      createStrikeHit(hitArea, hitmarkFrames, talentMultiplier, InternalCooldownTag.NormalAttack, false),
    ),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const normalAttacks: KitAction[] = [
    createNormalAttack(NORMAL_ATTACK_CANCEL_FRAMES[0], createFanReach(180, 2.4), [
      { hitmarkFrames: 11, talentMultiplier: attackMultiplier(0) },
    ]),
    createNormalAttack(NORMAL_ATTACK_CANCEL_FRAMES[1], createBoxReach(-0.1, 2, 2.5), [
      { hitmarkFrames: 13, talentMultiplier: attackMultiplier(1) },
    ]),
    createNormalAttack(NORMAL_ATTACK_CANCEL_FRAMES[2], createBoxReach(0, 2, 3), [
      { hitmarkFrames: 15, talentMultiplier: attackMultiplier(2) },
      { hitmarkFrames: 29, talentMultiplier: attackMultiplier(3) },
    ]),
    createNormalAttack(NORMAL_ATTACK_CANCEL_FRAMES[3], createBoxReach(0, 3, 4.5), [
      { hitmarkFrames: 21, talentMultiplier: attackMultiplier(4) },
    ]),
    createNormalAttack(NORMAL_ATTACK_CANCEL_FRAMES[4], createCircleReach(2.2, 2.5), [
      { hitmarkFrames: 35, talentMultiplier: attackMultiplier(5) },
    ]),
  ];

  const chargedAttack: KitAction = {
    hits: CHARGED_ATTACK_HITMARK_FRAMES.map((frames, index) =>
      createStrikeHit(
        createTargetedHitArea(STRIKE_TARGETING_AREA, CHARGED_ATTACK_HIT_RADIUS),
        frames,
        attackMultiplier(6 + index),
        InternalCooldownTag.ChargedAttack,
        true,
      ),
    ),
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(6),
    burstEnergyCost: burstMultiplier(7),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(8),
    elementalBurst,
    elementalSkill,
    elementalSkillHolds: [
      { action: holdAction, cooldownSeconds: skillMultiplier(10), minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS },
    ],
    getStrikeDamageBonus: ({ combatant, hit }) =>
      combatant.ascension >= ASCENSION_4 &&
      (hit.internalCooldownTag === InternalCooldownTag.ElementalBurst ||
        hit.internalCooldownTag === InternalCooldownTag.ElementalSkill)
        ? Math.min(
            combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] *
              ASCENSION_4_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY,
            ASCENSION_4_DAMAGE_BONUS_MAX,
          )
        : 0,
    highPlunge: {
      hits: [
        createPlungeHit(
          HIGH_PLUNGE_HIT_AREA,
          HIGH_PLUNGE_HITMARK_FRAMES,
          HIGH_PLUNGE_POISE_DAMAGE,
          attackMultiplier(11),
        ),
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        createPlungeHit(LOW_PLUNGE_HIT_AREA, LOW_PLUNGE_HITMARK_FRAMES, LOW_PLUNGE_POISE_DAMAGE, attackMultiplier(10)),
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // Leaving the field clears the Mirrors and the Mirror a rush or a burst has yet to make, as gcsim's swap does
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      setMirrorCount(kitEffectState, combatant.characterId, 0);
      for (const effect of kitEffectState.effects)
        if (effect.kind === "field" && effect.id === MIRROR_REGEN_TASK_ID) effect.secondsRemaining = 0;
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      onStrike: (context, strike) => triggerProjection(context, strike, true),
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(9),
    },
    skillCooldownSeconds: skillMultiplier(10),
  };
};
