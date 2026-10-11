import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { createKitField } from "#src/services/kit/effects/createKitField";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Ayato's proud skill groups, read at his talent level. The attack group holds the five strikes at 0 to 4, the fourth
// Strike's two hits both at 3 as gcsim reads them, the charged attack at 5 and its stamina at 6, and the plunges'
// Collision, low and high at 7, 8 and 9. The skill group holds Kamisato Art: Kyouka's three Shunsuiken strikes at 0 to 2,
// The Namisen share of his Max HP per stack at 4, the water illusion's DMG at 5 and its cooldown at 7. The burst group
// Holds Kamisato Art: Suiyuu's hit at 0, its seconds at 2, its cooldown at 3 and its energy cost at 4
const AYATO_ATTACK_GROUP_ID = 6631;
const AYATO_SKILL_GROUP_ID = 6632;
const AYATO_BURST_GROUP_ID = 6639;

// Measured: gcsim (MIT) ayato/attack.go, each strike's hitmarks and the frame its action cancels at by default, and its reach
// From the body: a circle is its offset plus its radius, and a box is priced to its far corner. The fourth strike's two hits
// Share its box
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/ayato
const NORMAL_ATTACKS = [
  { cancelFrames: 21, hitArea: createCircleReach(0.6, 1.7), hitmarkFrames: [12], index: 0 },
  { cancelFrames: 27, hitArea: createCircleReach(0.8, 1.7), hitmarkFrames: [18], index: 1 },
  { cancelFrames: 34, hitArea: createBoxReach(0.3, 1.6, 2.8), hitmarkFrames: [20], index: 2 },
  { cancelFrames: 29, hitArea: createBoxReach(-0.2, 2, 2.6), hitmarkFrames: [22, 25], index: 3 },
  { cancelFrames: 63, hitArea: createBoxReach(0.6, 6, 2), hitmarkFrames: [41], index: 4 },
];

// Measured: gcsim (MIT) ayato/charge.go, the charged attack's slash at 24 frames, a circle of radius 0.8 round its primary
// Target, with its animation at 55 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/ayato
const CHARGED_ATTACK_FRAMES = 55;
const CHARGED_ATTACK_HITMARK_FRAMES = 24;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);

// Measured: gcsim (MIT) ayato/plunge.go, the collision at 39 frames, the low plunge at 45 with its animation at 75 and the
// High at 47 with its animation at 76. Each plunge is a circle one metre ahead of the body with its radius of 3 or 5, and
// The collision a circle of radius 1 there, with the low and high plunges' poise of 100 and 150
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/ayato
const PLUNGE_COLLISION_HITMARK_FRAMES = 39;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const LOW_PLUNGE_FRAMES = 75;
const LOW_PLUNGE_HITMARK_FRAMES = 45;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_FRAMES = 76;
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) ayato/skill.go, Kamisato Art: Kyouka's animation at 21 frames, its water illusion's hit a circle of
// Radius 3.5 round the body at its illusion delay, which gcsim takes as its least of 35 frames when none is given. Soukai
// Kanka lasts six seconds from the cast, and a second cast restarts it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/ayato
const SKILL_FRAMES = 21;
const ILLUSION_DELAY_FRAMES = 35;
const ILLUSION_HIT_AREA = createFanReach(360, 3.5);
const SOUKAI_KANKA_SECONDS = 6;
// Measured: gcsim (MIT) ayato/skill.go, each Shunsuiken strike's hitmark at 5 frames, its animation at 23 frames and its box of
// 8 by 7 metres round the body, which each of its strikes and Constellation 6's extra strikes reach
const SHUNSUIKEN_FRAMES = 23;
const SHUNSUIKEN_HITMARK_FRAMES = 5;
const SHUNSUIKEN_HIT_AREA = createBoxReach(0, 8, 7);
// Measured: gcsim (MIT) ayato/cons.go, Constellation 6's two extra Shunsuiken strikes, each 450% of his ATK, at 20 and 22
// Frames from the attack's start, so 15 and 17 frames from the strike that sets them off
const CONSTELLATION_6_HIT_MULTIPLIER = 4.5;
const CONSTELLATION_6_HITMARK_FRAMES = [20, 22];

// Measured: gcsim (MIT) ayato/asc.go and cons.go, Ascension 1 sets the Namisen stacks to two as Kyouka is cast and to the most
// Once its water illusion explodes, the most being four, or five from Constellation 2. Constellation 1 raises his normal
// Attacks by 40% against an enemy at half its HP or less, and Constellation 6 arms one extra pair of strikes
const ASCENSION_1 = 1;
const ASCENSION_1_CAST_STACKS = 2;
const NAMISEN_STACKS_MAX = 4;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_DAMAGE_BONUS = 0.4;
const CONSTELLATION_1_HEALTH_SHARE = 0.5;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_NAMISEN_STACKS_MAX = 5;
const CONSTELLATION_6 = 6;
// A stack or a mark a kit holds until the swap ends it, as gcsim's Namisen stacks last while he stays on the field
const HELD_UNTIL_SWAP_SECONDS = Number.POSITIVE_INFINITY;
const NAMISEN_STATUS_ID = "ayato-namisen";
const CONSTELLATION_6_STATUS_ID = "ayato-constellation-6";

// Measured: gcsim (MIT) ayato/burst.go, Kamisato Art: Suiyuu's animation at 123 frames and a circle of radius 10 round the
// Body that follows it. Its ticks fall every 30 frames from the 101st for its 18 seconds, each striking a random enemy in the
// Circle 38 frames on with a circle of radius 2.5. The kit cannot draw that enemy, so each tick strikes every enemy the
// Reach of 12.5 round the body holds, which overstates a tick against several enemies
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/ayato
const BURST_FRAMES = 123;
const BURST_FIRST_TICK_FRAMES = 101;
const BURST_TICK_INTERVAL_FRAMES = 30;
const BURST_HIT_DELAY_FRAMES = 38;
const BURST_AREA_RADIUS = 10;
const BURST_HIT_RADIUS = 2.5;
const BURST_HIT_AREA = createFanReach(360, BURST_AREA_RADIUS + BURST_HIT_RADIUS);

// The Namisen stacks a character carries, and the most it can
const countNamisenStacks = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, NAMISEN_STATUS_ID)?.stacks ?? 0;
const getNamisenStacksMax = (combatant: Combatant): number =>
  combatant.constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_NAMISEN_STACKS_MAX : NAMISEN_STACKS_MAX;

export const AYATO_CHARACTER_ID = 10_000_066;

// Ayato's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Kamisato Art: Kyouka with
// Its water illusion and Soukai Kanka, whose Shunsuiken strikes take the Namisen stacks, and Kamisato Art: Suiyuu with its
// Ticks. Ascension 1, Constellations 1, 2 and 6 are built. Ascension 4's energy off the field, Constellation 4's team attack
// Speed and the Max HP that Constellation 2 gives at three stacks are not, as the kit has no off-field energy or attack speed
// To price them, and a passive reads the combatant alone; the normal attack DMG bonus of Suiyuu is not either, as no kit step
// Reads a normal attack's DMG Bonus from the team's effects
export const createAyatoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, AYATO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, AYATO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, AYATO_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const namisenShare = skillMultiplier(4);
  const burstSeconds = burstMultiplier(2);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames, index }): KitAction => ({
      hits: hitmarkFrames.map((frames) => ({
        hitArea,
        hitmarkSeconds: frames / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(index),
      })),
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(5),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createPlunge = (
    hitArea: KitHit["hitArea"],
    hitmarkFrames: number,
    animationFrames: number,
    poiseDamage: number,
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        isBlunt: true,
        poiseDamage,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  // Each Shunsuiken strike's DMG takes the Namisen stacks as it prices, from the team's effects through the owner the stance
  // Holds, as additiveBaseDamageBonus gets the striker alone. Each enemy it strikes adds a stack, and Constellation 6's extra
  // Pair is set off by the first enemy struck while it is armed
  const createShunsuikenHit = (index: number, combatant: Combatant, kitEffectState: KitEffectState): KitHit => ({
    additiveBaseDamageBonus: (striker) =>
      striker.attributes.maxHealth * namisenShare * countNamisenStacks(kitEffectState.effects, striker.characterId),
    element: Element.Hydro,
    gauge: 1,
    hitArea: SHUNSUIKEN_HIT_AREA,
    hitmarkSeconds: SHUNSUIKEN_HITMARK_FRAMES / 60,
    onStrike: ({ kitEffectState: effectState }, { body }) => {
      const { characterId } = combatant;
      const stacks = countNamisenStacks(effectState.effects, characterId);
      if (stacks < getNamisenStacksMax(combatant))
        addKitStatus(effectState, characterId, {
          id: NAMISEN_STATUS_ID,
          secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
          stacks: stacks + 1,
        });
      const constellation6 = findKitStatus(effectState.effects, characterId, CONSTELLATION_6_STATUS_ID);
      if (!constellation6) return;
      constellation6.secondsRemaining = 0;
      castKitSummon(
        effectState,
        body,
        combatant,
        CONSTELLATION_6_HITMARK_FRAMES.map((frames) => ({
          element: Element.Hydro,
          gauge: 1,
          hitArea: SHUNSUIKEN_HIT_AREA,
          hitmarkSeconds: (frames - SHUNSUIKEN_HITMARK_FRAMES) / 60,
          poiseDamage: 0,
          talentMultiplier: CONSTELLATION_6_HIT_MULTIPLIER,
        })),
      );
    },
    poiseDamage: 0,
    talentMultiplier: skillMultiplier(index),
  });

  // Suiyuu's field follows the body, and ticks its random strike from the body's circle of radius 10 every 30 frames, each
  // Tick's hit landing 38 frames on from it
  const burstHit: KitHit = {
    element: Element.Hydro,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HIT_DELAY_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: burstMultiplier(0),
  };
  const createBurstField = ({ facing, height, position }: KitBody, combatant: Combatant): KitField => {
    const burstField = createKitField(combatant.characterId, position, {
      isFollowing: true,
      nextTickSeconds: BURST_FIRST_TICK_FRAMES / 60,
      onTick: ({ kitEffectState }) =>
        castKitSummon(kitEffectState, { facing, height, position: burstField.centre }, combatant, [burstHit]),
      radius: BURST_AREA_RADIUS,
      secondsRemaining: BURST_FIRST_TICK_FRAMES / 60 + burstSeconds,
      tickIntervalSeconds: BURST_TICK_INTERVAL_FRAMES / 60,
    });
    return burstField;
  };

  const elementalBurst: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      addKitEffect(kitEffectState, createBurstField(body, combatant)),
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: ILLUSION_HIT_AREA,
        hitmarkSeconds: ILLUSION_DELAY_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(5),
      },
    ],
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      const { characterId } = combatant;
      if (combatant.ascension >= ASCENSION_1) {
        addKitStatus(kitEffectState, characterId, {
          id: NAMISEN_STATUS_ID,
          secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
          stacks: ASCENSION_1_CAST_STACKS,
        });
        // The water illusion's explosion sets the stacks to the most, as it lands at the illusion delay
        scheduleKitTask(kitEffectState, characterId, ILLUSION_DELAY_FRAMES / 60, ({ kitEffectState: effectState }) =>
          addKitStatus(effectState, characterId, {
            id: NAMISEN_STATUS_ID,
            secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
            stacks: getNamisenStacksMax(combatant),
          }),
        );
      }
      if (combatant.constellationCount >= CONSTELLATION_6)
        addKitStatus(kitEffectState, characterId, {
          id: CONSTELLATION_6_STATUS_ID,
          secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
        });
      // Soukai Kanka replaces the string with three Shunsuiken strikes, and keeps the kit's charged attack, plunges, skill and
      // Burst: a stance cannot take out the charged attack or the plunges, which gcsim refuses in the skill state, so those stand
      // As the kit's own. The Shunsuiken strikes are Normal Attack DMG, gcsim's AttackTagNormal in ayato/attack.go's
      // SoukaiKanka
      enterKitStance(
        kitEffectState,
        combatant,
        {
          chargedAttack,
          chargedAttackStamina: attackMultiplier(6),
          elementalBurst,
          elementalSkill,
          normalAttacks: [0, 1, 2].map((index) => ({
            hits: [createShunsuikenHit(index, combatant, kitEffectState)],
            seconds: SHUNSUIKEN_FRAMES / 60,
            targetingArea: STRIKE_TARGETING_AREA,
          })),
        },
        SOUKAI_KANKA_SECONDS,
        { isEndedOnSwap: true },
      );
    },
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const highPlunge = createPlunge(
    HIGH_PLUNGE_HIT_AREA,
    HIGH_PLUNGE_HITMARK_FRAMES,
    HIGH_PLUNGE_FRAMES,
    HIGH_PLUNGE_POISE_DAMAGE,
    9,
  );
  const lowPlunge = createPlunge(
    LOW_PLUNGE_HIT_AREA,
    LOW_PLUNGE_HITMARK_FRAMES,
    LOW_PLUNGE_FRAMES,
    LOW_PLUNGE_POISE_DAMAGE,
    8,
  );

  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(6),
    elementalBurst,
    elementalSkill,
    // Constellation 1 raises each of his normal attacks against an enemy at half its HP or less, Shunsuiken's included
    getStrikeDamageBonus: ({ attackTag, combatant }, enemy) =>
      combatant.constellationCount >= CONSTELLATION_1 &&
      attackTag === AttackTag.NormalAttack &&
      enemy.health / enemy.maxHealth <= CONSTELLATION_1_HEALTH_SHARE
        ? CONSTELLATION_1_DAMAGE_BONUS
        : 0,
    highPlunge,
    lowPlunge,
    normalAttacks,
    // Leaving the field clears the Namisen stacks as it ends Soukai Kanka, as gcsim's swap does
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      const namisen = findKitStatus(kitEffectState.effects, combatant.characterId, NAMISEN_STATUS_ID);
      if (namisen) namisen.secondsRemaining = 0;
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(7),
    },
    skillCooldownSeconds: skillMultiplier(7),
  };
};
