import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Yanfei's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack's multiplier at each count of Scarlet Seals from none to four at 3 to 7, its radius at each count at 8 to 12, its
// Stamina at 13 and the stamina each seal cuts at 14, then the collision, low plunge and high plunge at 15, 16 and 17. The
// Skill group holds Signed Edict at 0 and its cooldown at 1. The burst group holds Done Deal at 0, its Pyro DMG bonus to
// Charged Attacks at 1, its seconds at 2, then its cooldown and energy cost at 4 and 5
const YANFEI_ATTACK_GROUP_ID = 4831;
const YANFEI_SKILL_GROUP_ID = 4832;
const YANFEI_BURST_GROUP_ID = 4839;

// Measured: gcsim (MIT) yanfei/attack.go, each strike's hitmark at 12, 16 and 37 frames, its travel of 10 frames to the primary
// Target, and its animation to its cancel. Each strike is a circle of radius 0.75 on the primary target, so it reaches the
// Target's radius plus its own
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yanfei/attack.go
const NORMAL_ATTACK_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_RADIUS = 0.75;
const NORMAL_ATTACKS = [
  { cancelFrames: 26, hitmarkFrames: 12, talentIndex: 0 },
  { cancelFrames: 28, hitmarkFrames: 16, talentIndex: 1 },
  { cancelFrames: 73, hitmarkFrames: 37, talentIndex: 2 },
];

// Measured: gcsim (MIT) yanfei/charge.go, the charged attack's animation at 79 frames and its hit at 63, from a standing
// Start, on a circle of the charge's radius on the primary target, which grows with each Scarlet Seal from 2.5 to 4 metres.
// A start from a run adds a 16-frame windup gcsim reads from the player's state, which the kit does not, so the hit lands
// At 63 frames from every start
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yanfei/charge.go
const CHARGED_ATTACK_FRAMES = 79;
const CHARGED_ATTACK_HITMARK_FRAMES = 63;
// The radius at none, one and two seals, with three and four seals both at the maximum radius
const CHARGED_ATTACK_RADII = [2.5, 3, 3.5];
const CHARGED_ATTACK_MAXIMUM_RADIUS = 4;
const CHARGED_ATTACK_STAMINA_REDUCTION = 0.15;
const CHARGED_ATTACK_STAMINA_CONSTELLATION = 1;
const CHARGED_ATTACK_STAMINA_REDUCTION_FROM_CONSTELLATION = 0.25;

// Measured: gcsim (MIT) yanfei/plunge.go, the low plunge's circle of radius 3 at 45 frames of a 65-frame animation, the high
// Plunge's of radius 3.5 at 47 frames of 67, and the collision's circle of radius 1.5 round the body
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yanfei/plunge.go
const LOW_PLUNGE_FRAMES = 65;
const LOW_PLUNGE_HITMARK_FRAMES = 45;
const LOW_PLUNGE_RADIUS = 3;
const HIGH_PLUNGE_FRAMES = 67;
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_RADIUS = 3.5;
const PLUNGE_COLLISION_RADIUS = 1.5;
// Provisional: gcsim gives the plunges and the collision no poise, so they stand at 0 until a source gives them
const PLUNGE_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) yanfei/skill.go, Signed Edict's animation at 46 frames and its hit at 32 on a circle of radius 3.5 on
// The primary target, its cooldown of 9 seconds read from the skill group
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yanfei/skill.go
const SKILL_FRAMES = 46;
const SKILL_HITMARK_FRAMES = 32;
const SKILL_RADIUS = 3.5;
const SKILL_POISE_DAMAGE = 120;

// Measured: gcsim (MIT) yanfei/burst.go, Done Deal's animation at 58 frames and its hit at 24 on a circle of radius 6.5 round
// The body, its Scarlet Seals added each second for its 15 seconds, and its Pyro DMG bonus to Charged Attacks
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yanfei/burst.go
const BURST_FRAMES = 58;
const BURST_HITMARK_FRAMES = 24;
const BURST_RADIUS = 6.5;
const BURST_POISE_DAMAGE = 200;
const BURST_SECONDS = 15;
const BURST_SEAL_INTERVAL_SECONDS = 1;
const DONE_DEAL_STATUS_ID = "yanfei-done-deal";

// Measured: gcsim (MIT) yanfei/yanfei.go, Scarlet Seals last 10 seconds from the last one gained, and Yanfei holds three of
// Them, four from Constellation 6
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yanfei/yanfei.go
const SEAL_SECONDS = 10;
const MAX_SEALS = 3;
const MAX_SEALS_CONSTELLATION = 6;
const MAX_SEALS_WITH_CONSTELLATION = 4;
// A seal is a status of its own slot, as a status of one id restarts rather than stacks, so the count is the slots held
const SEAL_STATUS_IDS = ["yanfei-seal-0", "yanfei-seal-1", "yanfei-seal-2", "yanfei-seal-3"];

// Measured: gcsim (MIT) yanfei/asc.go, Ascension 1 gives 5% Pyro DMG Bonus per seal consumed for 6 seconds, which a charged
// Attack dispels, and the stamina each seal cuts a charged attack's cost by is 15%, 25% from Constellation 1
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/yanfei/asc.go
const SEAL_PYRO_BONUS_ASCENSION = 1;
const SEAL_PYRO_BONUS_PER_SEAL = 0.05;
const SEAL_PYRO_BONUS_SECONDS = 6;

const checkIsSealStatus = (effect: KitEffect, characterId: number): boolean =>
  effect.kind === "status" && effect.characterId === characterId && SEAL_STATUS_IDS.includes(effect.id);

const countSeals = (kitEffectState: KitEffectState, characterId: number): number =>
  kitEffectState.effects.filter((effect) => checkIsSealStatus(effect, characterId)).length;

const getMaximumSeals = (combatant: Combatant): number =>
  combatant.constellationCount >= MAX_SEALS_CONSTELLATION ? MAX_SEALS_WITH_CONSTELLATION : MAX_SEALS;

// Sets the seals Yanfei holds to the count given, each restarting its slot, so every seal runs out together
const setSeals = (kitEffectState: KitEffectState, characterId: number, count: number): void => {
  for (const id of SEAL_STATUS_IDS.slice(0, count))
    addKitEffect(kitEffectState, { characterId, id, kind: "status", secondsRemaining: SEAL_SECONDS });
};

const gainSeals = (kitEffectState: KitEffectState, combatant: Combatant, gained: number): void => {
  const count = Math.min(countSeals(kitEffectState, combatant.characterId) + gained, getMaximumSeals(combatant));
  setSeals(kitEffectState, combatant.characterId, count);
};

const checkIsDoneDealActive = (kitEffectState: KitEffectState, characterId: number): boolean =>
  kitEffectState.effects.some(
    (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === DONE_DEAL_STATUS_ID,
  );

export const YANFEI_CHARACTER_ID = 10_000_048;

// Yanfei's first kit, at talent level 1: three strikes, a charged attack that spends her Scarlet Seals, a collision and two
// Plunges, Signed Edict and Done Deal. Her Scarlet Seals come from her strikes, Signed Edict and Done Deal, and from Done
// Deal's each second, with Constellation 6 giving her a fourth. Her Ascension 1 Pyro DMG bonus and Constellation 1's
// Stamina cut are built. Her Ascension 4 shot, her Constellation 2 CRIT Rate and her Constellation 4 shield are not, as no
// Kit event reaches the enemy's health or the shield's health. Its multipliers are read from her proud skill groups
export const createYanfeiKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, YANFEI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, YANFEI_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, YANFEI_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  // A strike's seal is gained as it lands on an enemy, one for each enemy struck, capped at the most Yanfei holds
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hitmarkFrames, talentIndex }) => ({
    hits: [
      {
        element: Element.Pyro,
        gauge: 1,
        hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, NORMAL_ATTACK_RADIUS),
        hitmarkSeconds: (hitmarkFrames + NORMAL_ATTACK_TRAVEL_FRAMES) / 60,
        onStrike: ({ kitEffectState }, { combatant }) => gainSeals(kitEffectState, combatant, 1),
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(talentIndex),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  const skillHit: KitHit = {
    element: Element.Pyro,
    gauge: 1,
    hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, SKILL_RADIUS),
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    isBlunt: true,
    onStrike: ({ kitEffectState }, { combatant }) =>
      setSeals(kitEffectState, combatant.characterId, getMaximumSeals(combatant)),
    poiseDamage: SKILL_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(0),
  };
  const burstHit: KitHit = {
    element: Element.Pyro,
    gauge: 2,
    hitArea: createFanReach(360, BURST_RADIUS),
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    isBlunt: true,
    onStrike: ({ kitEffectState }, { combatant }) =>
      setSeals(kitEffectState, combatant.characterId, getMaximumSeals(combatant)),
    poiseDamage: BURST_POISE_DAMAGE,
    talentMultiplier: burstMultiplier(0),
  };
  return {
    burstCooldownSeconds: burstMultiplier(4),
    burstEnergyCost: burstMultiplier(5),
    // The charged attack spends the seals as it starts, its hit a summon cast at the body.
    // The seals it spent set its multiplier and radius, and the Done Deal's Pyro DMG bonus while it is up. Ascension
    // 1's bonus is set from them too
    chargedAttack: {
      hits: [],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const seals = countSeals(kitEffectState, combatant.characterId);
        if (combatant.ascension >= SEAL_PYRO_BONUS_ASCENSION)
          addKitEffect(kitEffectState, {
            amount: seals * SEAL_PYRO_BONUS_PER_SEAL,
            attribute: Attribute.PyroDamageBonus,
            characterId: combatant.characterId,
            kind: "buff",
            secondsRemaining: SEAL_PYRO_BONUS_SECONDS,
            source: "yanfei-a1",
          });
        const hit: KitHit = {
          ...(checkIsDoneDealActive(kitEffectState, combatant.characterId) ? { damageBonus: burstMultiplier(1) } : {}),
          element: Element.Pyro,
          gauge: 1,
          hitArea: createTargetedHitArea(
            STRIKE_TARGETING_AREA,
            CHARGED_ATTACK_RADII[seals] ?? CHARGED_ATTACK_MAXIMUM_RADIUS,
          ),
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: 80,
          talentMultiplier: attackMultiplier(3 + seals),
        };
        castKitSummon(kitEffectState, body, combatant, [hit]);
        kitEffectState.effects = kitEffectState.effects.filter(
          (effect) => !checkIsSealStatus(effect, combatant.characterId),
        );
      },
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(13),
    // Done Deal's hit gives the full seals, and its seconds add one each second while it stands, on a field the whole
    // Battlefield holds, as gcsim's tick runs wherever Yanfei is
    elementalBurst: {
      hits: [burstHit],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          id: DONE_DEAL_STATUS_ID,
          kind: "status",
          secondsRemaining: BURST_SECONDS,
        });
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: BURST_SEAL_INTERVAL_SECONDS,
          onTick: ({ kitEffectState: tickEffectState }) => gainSeals(tickEffectState, combatant, 1),
          secondsRemaining: BURST_SECONDS,
          tickIntervalSeconds: BURST_SEAL_INTERVAL_SECONDS,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [skillHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    getChargedAttackStaminaMultiplier: ({ activeCombatant: combatant, kitEffectState }) => {
      const reduction =
        combatant.constellationCount >= CHARGED_ATTACK_STAMINA_CONSTELLATION
          ? CHARGED_ATTACK_STAMINA_REDUCTION_FROM_CONSTELLATION
          : CHARGED_ATTACK_STAMINA_REDUCTION;
      return 1 - reduction * countSeals(kitEffectState, combatant.characterId);
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, HIGH_PLUNGE_RADIUS),
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(17),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          element: Element.Pyro,
          gauge: 1,
          hitArea: createFanReach(360, LOW_PLUNGE_RADIUS),
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(16),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      element: Element.Pyro,
      hitArea: createFanReach(360, PLUNGE_COLLISION_RADIUS),
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(15),
    },
    skillCooldownSeconds: skillMultiplier(1),
  };
};
