import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createPeriodicKitHits } from "#src/services/kit/createPeriodicKitHits";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Kazuha's proud skill groups, read at his talent level. The attack group holds the first strike at 0, the second at 1,
// The third's two hits at 2 and 3, the fourth at 4 and the fifth's three hits at 5, then the charged attack's two values at
// 6 and 7, its stamina at 8, and the plunges' collision, low and high at 9, 10 and 11. The skill group holds the press at 0
// And its cooldown at 1, and the hold at 2 and its cooldown at 3. The burst group holds the slash at 0, the Autumn
// Whirlwind's ticks at 1, its elemental ticks at 2, then its seconds, cooldown and energy cost at 3, 4 and 5
const KAZUHA_ATTACK_GROUP_ID = 4731;
const KAZUHA_SKILL_GROUP_ID = 4732;
const KAZUHA_BURST_GROUP_ID = 4739;

// Measured: gcsim (MIT) kazuha/attack.go, each strike's hitmarks and its animation's frames to its cancel, the five strikes'
// Reach being each circle's radius plus its offset ahead of the body, as the area holds no offsets
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kazuha/attack.go
const NORMAL_ATTACKS = [
  { cancelFrames: 21, hits: [{ hitmarkFrames: 13, reach: 2.5, talentIndex: 0 }] },
  { cancelFrames: 20, hits: [{ hitmarkFrames: 11, reach: 2.2, talentIndex: 1 }] },
  {
    cancelFrames: 33,
    hits: [
      { hitmarkFrames: 16, reach: 2.3, talentIndex: 2 },
      { hitmarkFrames: 25, reach: 2.2, talentIndex: 3 },
    ],
  },
  { cancelFrames: 38, hits: [{ hitmarkFrames: 15, reach: 2.5, talentIndex: 4 }] },
  {
    cancelFrames: 72,
    hits: [
      { hitmarkFrames: 15, reach: 2.2, talentIndex: 5 },
      { hitmarkFrames: 19, reach: 2.2, talentIndex: 5 },
      { hitmarkFrames: 27, reach: 2.2, talentIndex: 5 },
    ],
  },
];

// Measured: gcsim (MIT) kazuha/charge.go, the charged attack's animation at 55 frames and its two slashes at 20 frames, each
// A circle of radius 2.2 offset a metre ahead, so it reaches 3.2 metres
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kazuha/charge.go
const CHARGED_ATTACK_FRAMES = 55;
const CHARGED_ATTACK_HITMARK_FRAMES = 20;
const CHARGED_ATTACK_REACH = 3.2;

// Measured: gcsim (MIT) kazuha/plunge.go, the low and high plunges' hitmarks at 46 and 47 frames of their 73-frame animations,
// Their circles of radius 3 and 5 offset a metre ahead, and their poise of 100 and 150
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kazuha/plunge.go
const PLUNGE_FRAMES = 73;
const LOW_PLUNGE_HITMARK_FRAMES = 46;
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const LOW_PLUNGE_REACH = 4;
const HIGH_PLUNGE_REACH = 6;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
// Provisional: gcsim gives the collision no poise, so it stands at 0 until a source gives it. Its circle of radius 1 is
// Offset a metre ahead, so it reaches 2 metres
const PLUNGE_COLLISION_REACH = 2;
const PLUNGE_COLLISION_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) kazuha/skill.go, Chihayaburu's press at 77 frames with its hit at 10 on a circle of radius 5 round
// The body, and its hold at 175 frames with its hit at 33 on a circle of radius 9 round the body. Each is Anemo at 1U for
// The press and 2U for the hold, as gcsim's durabilities of 25 and 50 give them
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kazuha/skill.go
const PRESS_FRAMES = 77;
const PRESS_HITMARK_FRAMES = 10;
const PRESS_REACH = 5;
const HOLD_FRAMES = 175;
const HOLD_HITMARK_FRAMES = 33;
const HOLD_REACH = 9;
// Provisional: no table or wiki page gives the seconds a press must be held to become the hold, so it is 0.5 seconds as
// Venti's is, until a recording measures it
const HOLD_MINIMUM_HELD_SECONDS = 0.5;
// Provisional: gcsim gives Chihayaburu no poise, so the press and hold stand at 0 until a source gives them
const SKILL_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) kazuha/burst.go, Kazuha Slash's animation at 93 frames, its slash at 82 on a circle of radius 9 offset
// A metre ahead, so it reaches 10 metres, and the Autumn Whirlwind's five ticks from 140 frames, 117 frames apart, each on the
// Same circle round the body
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kazuha/burst.go
const BURST_FRAMES = 93;
const BURST_HITMARK_FRAMES = 82;
const BURST_TICK_FIRST_FRAMES = 140;
const BURST_TICK_INTERVAL_FRAMES = 117;
const BURST_TICK_COUNT = 5;
const BURST_REACH = 10;
// Provisional: gcsim gives the burst no poise, so the slash and its ticks stand at 0 until a source gives them
const BURST_POISE_DAMAGE = 0;
// Measured: gcsim v2.47.2 (MIT) kazuha/burst.go, the Autumn Whirlwind's absorb check runs from 81 frames, the frame before
// The slash, then every 18 frames for at most 17 checks, on a circle of radius 8 offset a metre ahead, so it reaches 9
// Metres. It takes the first aura of Pyro, Hydro, Electro or Cryo an enemy within its reach carries, and each tick after
// It lands its elemental tick in that element, 1U, just ahead of its Anemo tick
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kazuha/burst.go
const ABSORB_CHECK_FIRST_FRAMES = 81;
const ABSORB_CHECK_INTERVAL_FRAMES = 18;
const ABSORB_CHECK_COUNT = 17;
const ABSORB_CHECK_AREA = createFanReach(360, 9);
// The absorb check's field lives a tenth of a second past its last check, so the step that runs it still has it
const ABSORB_FIELD_LINGER_SECONDS = 0.1;

// Measured: gcsim (MIT) kazuha/cons.go, Chihayaburu's and Kazuha Slash's cooldowns each drop by a tenth from Constellation 1,
// Which the table's 360 and 540 frames become 324 and 486 with
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kazuha/cons.go
const PRESS_AND_HOLD_CONSTELLATION = 1;
const COOLDOWN_CONSTELLATION_MULTIPLIER = 0.9;
// Measured: gcsim (MIT) kazuha/cons.go, from Constellation 6 each Chihayaburu or Kazuha Slash gives Kazuha an Anemo infusion for
// 5 seconds, which infuses his normal, charged and plunging attacks
const INFUSION_CONSTELLATION = 6;
const INFUSION_SECONDS = 5;
// Kazuha's Anemo infusion from Constellation 6 lasts for the seconds after each press, hold or slash that gives it
const addInfusion = ({ activeCombatant: combatant, kitEffectState }: KitContext): void => {
  if (combatant.constellationCount < INFUSION_CONSTELLATION) return;
  addKitEffect(kitEffectState, {
    characterId: combatant.characterId,
    element: Element.Anemo,
    kind: "infusion",
    secondsRemaining: INFUSION_SECONDS,
  });
};

export const KAZUHA_CHARACTER_ID = 10_000_047;

// Kazuha's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Chihayaburu's press and
// Hold, and Kazuha Slash with its Autumn Whirlwind and its elemental ticks. Constellation 1 shortens his skill cooldowns and
// Constellation 6 gives him the infusion. His Ascension passives are not built: the absorption of the Chihayaburu, the
// Swirl Elemental Mastery bonus and Constellation 2's field. Its multipliers are read from his proud skill groups
export const createKazuhaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, KAZUHA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, KAZUHA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, KAZUHA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hits }) => ({
    hits: hits.map(({ hitmarkFrames, reach, talentIndex }): KitHit => ({
      hitArea: createFanReach(360, reach),
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(talentIndex),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  const chargedAttackHit = (talentIndex: number): KitHit => ({
    hitArea: createFanReach(360, CHARGED_ATTACK_REACH),
    hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: attackMultiplier(talentIndex),
  });
  const pressHit: KitHit = {
    element: Element.Anemo,
    gauge: 1,
    hitArea: createFanReach(360, PRESS_REACH),
    hitmarkSeconds: PRESS_HITMARK_FRAMES / 60,
    poiseDamage: SKILL_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(0),
  };
  const holdHit: KitHit = {
    element: Element.Anemo,
    gauge: 2,
    hitArea: createFanReach(360, HOLD_REACH),
    hitmarkSeconds: HOLD_HITMARK_FRAMES / 60,
    poiseDamage: SKILL_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(2),
  };
  const slashHit: KitHit = {
    element: Element.Anemo,
    gauge: 2,
    hitArea: createFanReach(360, BURST_REACH),
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    poiseDamage: BURST_POISE_DAMAGE,
    talentMultiplier: burstMultiplier(0),
  };
  // Each tick is Anemo at 1U, as the slash's DoT gives it, on the same circle the slash reaches
  const tickHits = createPeriodicKitHits(
    {
      element: Element.Anemo,
      gauge: 1,
      hitArea: createFanReach(360, BURST_REACH),
      poiseDamage: BURST_POISE_DAMAGE,
      talentMultiplier: burstMultiplier(1),
    },
    BURST_TICK_COUNT,
    BURST_TICK_FIRST_FRAMES,
    BURST_TICK_INTERVAL_FRAMES,
  );
  const hold: KitSkillHold = {
    action: { hits: [holdHit], onStart: addInfusion, seconds: HOLD_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    cooldownSeconds: skillMultiplier(3),
    minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
  };
  return {
    burstCooldownSeconds: burstMultiplier(4),
    burstEnergyCost: burstMultiplier(5),
    chargedAttack: {
      hits: [chargedAttackHit(6), chargedAttackHit(7)],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(8),
    // The slash strikes where Kazuha stands, and its Autumn Whirlwind is a summon cast at his body that ticks from
    // There. Its absorb check is a field set beside it, which takes an element only once and then lands that element's
    // Tick ahead of each tick still to come
    elementalBurst: {
      hits: [slashHit],
      onStart: (context) => {
        addInfusion(context);
        const { activeCombatant: combatant, body, kitEffectState } = context;
        const whirlwind = createKitSummon(body, combatant, tickHits);
        let isAbsorbed = false;
        const absorbField: KitField = {
          centre: { x: whirlwind.body.position.x, z: whirlwind.body.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: ABSORB_CHECK_FIRST_FRAMES / 60,
          onTick: ({ enemyMap }) => {
            if (isAbsorbed) return;
            const element = findAbsorbedElement(
              [...enemyMap.values()].filter((enemy) => checkIsInAttackArea(ABSORB_CHECK_AREA, whirlwind.body, enemy)),
            );
            if (element === undefined) return;
            isAbsorbed = true;
            whirlwind.hits = whirlwind.hits.flatMap((hit) =>
              hit.hitmarkSeconds > whirlwind.elapsedSeconds
                ? [{ ...hit, element, talentMultiplier: burstMultiplier(2) }, hit]
                : [hit],
            );
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining:
            (ABSORB_CHECK_FIRST_FRAMES + ABSORB_CHECK_INTERVAL_FRAMES * (ABSORB_CHECK_COUNT - 1)) / 60 +
            ABSORB_FIELD_LINGER_SECONDS,
          tickIndex: 0,
          tickIntervalSeconds: ABSORB_CHECK_INTERVAL_FRAMES / 60,
        };
        addKitEffect(kitEffectState, whirlwind);
        addKitEffect(kitEffectState, absorbField);
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [pressHit],
      onStart: addInfusion,
      seconds: PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillHolds: [hold],
    getSkillCooldownMultiplier: ({ activeCombatant: combatant }) =>
      combatant.constellationCount >= PRESS_AND_HOLD_CONSTELLATION ? COOLDOWN_CONSTELLATION_MULTIPLIER : 1,
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, HIGH_PLUNGE_REACH),
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(11),
        },
      ],
      seconds: PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, LOW_PLUNGE_REACH),
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(10),
        },
      ],
      seconds: PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, PLUNGE_COLLISION_REACH),
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(9),
    },
    skillCooldownSeconds: skillMultiplier(1),
  };
};
