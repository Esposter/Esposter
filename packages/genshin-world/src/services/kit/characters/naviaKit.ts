import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Navia's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's two hits at 4 and 5 and its stamina a second at 6, and the plunges' collision, low and high at 8, 9 and 10. The
// Skill group holds Rosula Shardshot's damage at 0, the Crystal Shrapnel's DMG per stack past three at 1, which the kit does
// Not price, the Shrapnel's seconds at 2, the press's cooldown at 3, Surging Blade's damage at 4 and its cooldown at 5. The
// Burst group holds Cannon Fire Support's seconds at 2, the burst's damage at 0, the cannon's at 1, its cooldown at 3, its
// Energy cost at 4 and the Crystal Shrapnel gain's cooldown at 5
const NAVIA_ATTACK_GROUP_ID = 9131;
const NAVIA_SKILL_GROUP_ID = 9132;
const NAVIA_BURST_GROUP_ID = 9139;

// Measured: gcsim v2.47.2 (MIT) navia/attack.go, each strike's hitmarks, the animation that ends it at 60 fps, its reach
// From the body and the hit's poise. A circle is its offset plus its radius, and a box is priced to its far corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/attack.go
const NORMAL_ATTACKS = [
  { cancelFrames: 28, hitArea: createCircleReach(0.5, 2), hitmarkFrames: [23], index: 0, poiseDamage: 129.8 },
  { cancelFrames: 42, hitArea: createBoxReach(-1.5, 2, 4.3), hitmarkFrames: [22], index: 1, poiseDamage: 120.1 },
  { cancelFrames: 48, hitArea: createBoxReach(0.3, 3, 4.5), hitmarkFrames: [31, 39, 48], index: 2, poiseDamage: 50.5 },
  { cancelFrames: 93, hitArea: createBoxReach(-1.85, 2, 4.7), hitmarkFrames: [41], index: 3, poiseDamage: 185.9 },
];

// Provisional: gcsim has no charged attack for Navia, so these are the claymore charge Razor's kit reads, two hits at half
// A second and a second, ending at 1.2 seconds, drained at its stamina a second. Its reach is her first strike's circle
// Until a recording measures it, and its poise is none
const CHARGED_ATTACK_HITMARK_FRAMES = [30, 60] as const;
const CHARGED_ATTACK_FRAMES = 72;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.5, 2);

// Measured: gcsim v2.47.2 (MIT) navia/plunge.go, the collision at 31 frames, a circle of radius 1 one metre ahead, the low
// Plunge at 37 frames with its animation at 82, a circle of radius 3 one metre ahead and 150 poise, and the high at 40
// Frames with its animation at 83, a circle of radius 5 and 200 poise. The plunges are blunt, the collision slashes
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 31;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const LOW_PLUNGE_FRAMES = 82;
const LOW_PLUNGE_HITMARK_FRAMES = 37;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_FRAMES = 83;
const HIGH_PLUNGE_HITMARK_FRAMES = 40;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Measured: gcsim v2.47.2 (MIT) navia/skill.go, Rosula Shardshot fires 11 frames after a press and 40 after a hold is
// Released, its pellets reaching the target 9 frames on, and its animation runs 41 frames from a press and 72 from a
// Release. The pellets' reach is the box of 4.07 by 11.55 metres round the body, and five pellets, the count with no
// Crystal Shrapnel, land on a target as gcsim's multiplier for five hits prices them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/skill.go
const PRESS_FIRING_FRAMES = 11;
const PRESS_FRAMES = 41;
const HOLD_FIRING_FRAMES = 40;
const HOLD_FRAMES = 72;
const PELLET_TRAVEL_FRAMES = 9;
const SHARDSHOT_HIT_AREA = createBoxReach(-0.043841, 4.0722, 11.5461);
const SHARDSHOT_FIVE_PELLET_MULTIPLIER = 1.2;
// The hold is taken once it has been held 0.2 seconds, as gcsim's tap converts to a hold at 0.2
const HOLD_MINIMUM_HELD_SECONDS = 0.2;
// Navia holds two charges of her skill, as the game's skill kit gives her
const SKILL_CHARGES = 2;

// Measured: gcsim v2.47.2 (MIT) navia/skill.go, Surging Blade lands 28 frames after the shot fires, then 36 frames later,
// A circle of radius 3 three and a half metres ahead of the body. Its ICD is set at the first of the two. The kit reads
// The blade at the body's own spot, the spot gcsim takes when no enemy stands in the shot's cone, and has it at once
const SURGING_BLADE_FRAMES = 28 + 36;
const SURGING_BLADE_AHEAD_METRES = 3.6;
const SURGING_BLADE_HIT_AREA = createCircleReach(0, 3);

// Measured: gcsim v2.47.2 (MIT) navia/burst.go, the initial blast at 104 frames on a box of 5 by 12 metres, and the
// Animation's 127. Cannon Fire Support starts 154 frames on and lands its shots 9 frames after each tick, which falls every
// 42 frames, and every third falls 48 frames after the one before it, until the burst's 12 seconds run out
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/burst.go
const BURST_FRAMES = 127;
const BURST_HITMARK_FRAMES = 104;
const BURST_HIT_AREA = createBoxReach(0, 5, 12);
const CANNON_DELAY_FRAMES = 154;
const CANNON_INTERVAL_FRAMES = 42;
const CANNON_LONG_INTERVAL_FRAMES = 48;
// The cannon's random spot lies within 10 metres of Navia, or 1 to 6 metres ahead, so each shot strikes the reach of 10
// Metres and its 3 metres of blast, which overstates a shot against one enemy in the reach
const CANNON_REACH_METRES = 10;
const CANNON_BLAST_RADIUS = 3;
const CANNON_HIT_AREA = createCircleReach(CANNON_REACH_METRES, CANNON_BLAST_RADIUS);

// Measured: gcsim v2.47.2 (MIT) navia/skill.go and burst.go, Crystal Shrapnel gained by a cannon hit at most every 2.4 seconds,
// Six at most, and Ceremonial Crystalshot clears them all but the excess a Constellation keeps
const SHRAPNEL_MAX = 6;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_KEPT_SHRAPNEL = 3;
const SHRAPNEL_STATUS_ID = "navia-crystal-shrapnel";
const BURST_SHRAPNEL_ICD_STATUS_ID = "navia-burst-shrapnel-icd";
const ARKHE_ICD_STATUS_ID = "navia-arkhe-icd";

// Measured: gcsim v2.47.2 (MIT) navia/cons.go, Constellation 4's Geo RES cut of 20% for eight seconds on each enemy a burst
// Hit strikes, the blast and the cannon's shots alike
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_GEO_RESISTANCE_REDUCTION = 0.2;
const CONSTELLATION_4_SECONDS = 8;
const CONSTELLATION_4_STATUS_ID = "navia-c4-shred";

const countShrapnel = (kitEffectState: KitEffectState, characterId: number): number =>
  findKitStatus(kitEffectState.effects, characterId, SHRAPNEL_STATUS_ID)?.stacks ?? 0;

// Constellation 4's Geo RES cut, given the enemy's striker, from its Constellation count
const createConstellation4Shred = (combatant: Combatant): EnemyStatus | undefined =>
  combatant.constellationCount < CONSTELLATION_4
    ? undefined
    : {
        damageTakenBonus: 0,
        id: CONSTELLATION_4_STATUS_ID,
        resistanceReduction: { [Element.Geo]: CONSTELLATION_4_GEO_RESISTANCE_REDUCTION },
        secondsRemaining: CONSTELLATION_4_SECONDS,
      };

export const NAVIA_CHARACTER_ID = 10_000_091;

// Navia's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Rosula Shardshot with
// Its press and hold and Surging Blade, and As the Sunlit Sky's Singing Salute with its blast and Cannon Fire Support. Her
// Crystal Shrapnel is gained from the cannon's hits and spent by the shot. Her Ascension passives, the Shrapnel gained from
// Party Crystallize shards and the shot's pellets past three stacks are not built, as the kit does not read the team's
// Effects in a passive or a strike's DMG and no step gives a shard's reach to a hit. Constellation 4 is built, Constellation 6
// Keeps its excess Shrapnel, and the rest of her Constellations are not
export const createNaviaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NAVIA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NAVIA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NAVIA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const shrapnelSeconds = skillMultiplier(2);
  const arkheIcdSeconds = skillMultiplier(5);
  const burstShrapnelIcdSeconds = burstMultiplier(5);
  const cannonFrames = Math.round(burstMultiplier(2) * 60);
  const skillCooldownSeconds = skillMultiplier(3);

  // A strike's hits are blunt under the normal attack's internal cooldown, each at its hitmark, the third strike's three at 0
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames, index, poiseDamage }): KitAction => ({
      hits: hitmarkFrames.map((frames): KitHit => ({
        hitArea,
        hitmarkSeconds: frames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        isBlunt: true,
        poiseDamage,
        talentMultiplier: attackMultiplier(index),
      })),
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  // Provisional, as the kit's charged attack has no gcsim source: its two hits and its stamina a second
  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES[0] / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        isBlunt: true,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES[1] / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        isBlunt: true,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(5),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    staminaPerSecond: attackMultiplier(6),
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
  const lowPlunge = createPlunge(
    LOW_PLUNGE_HIT_AREA,
    LOW_PLUNGE_HITMARK_FRAMES,
    LOW_PLUNGE_FRAMES,
    LOW_PLUNGE_POISE_DAMAGE,
    9,
  );
  const highPlunge = createPlunge(
    HIGH_PLUNGE_HIT_AREA,
    HIGH_PLUNGE_HITMARK_FRAMES,
    HIGH_PLUNGE_FRAMES,
    HIGH_PLUNGE_POISE_DAMAGE,
    10,
  );

  // A pellet's hit at a press or a hold, which lands its damage the travel delay after the shot fires
  const createShardshotHit = (firingFrames: number): KitHit => ({
    element: Element.Geo,
    gauge: 1,
    hitArea: SHARDSHOT_HIT_AREA,
    hitmarkSeconds: (firingFrames + PELLET_TRAVEL_FRAMES) / 60,
    isBlunt: true,
    poiseDamage: 150,
    talentMultiplier: skillMultiplier(0) * SHARDSHOT_FIVE_PELLET_MULTIPLIER,
  });

  // A shot fired spends the team's Crystal Shrapnel, keeping the excess past three for Constellation 6 as gcsim's shot does,
  // And fires the Surging Blade, unless its ICD still holds, which the kit sets on the shot and never clears early
  const castShot =
    (firingFrames: number) =>
    ({ activeCombatant: combatant, body, kitEffectState }: KitContext): void => {
      const { characterId } = combatant;
      const shrapnel = findKitStatus(kitEffectState.effects, characterId, SHRAPNEL_STATUS_ID);
      if (shrapnel) {
        const keptShrapnel =
          combatant.constellationCount >= CONSTELLATION_6
            ? Math.max((shrapnel.stacks ?? 0) - CONSTELLATION_6_KEPT_SHRAPNEL, 0)
            : 0;
        shrapnel.stacks = keptShrapnel;
        if (keptShrapnel === 0) shrapnel.secondsRemaining = 0;
      }
      if (!startKitCooldown(kitEffectState, characterId, ARKHE_ICD_STATUS_ID, arkheIcdSeconds)) return;
      castKitSummon(kitEffectState, createAheadBody(body, SURGING_BLADE_AHEAD_METRES), combatant, [
        {
          element: Element.Geo,
          gauge: 0,
          hitArea: SURGING_BLADE_HIT_AREA,
          hitmarkSeconds: (firingFrames + SURGING_BLADE_FRAMES) / 60,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(4),
        },
      ]);
    };

  const elementalSkill: KitAction = {
    hits: [createShardshotHit(PRESS_FIRING_FRAMES)],
    onStart: castShot(PRESS_FIRING_FRAMES),
    seconds: PRESS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };
  const elementalSkillHold: KitAction = {
    hits: [createShardshotHit(HOLD_FIRING_FRAMES)],
    onStart: castShot(HOLD_FIRING_FRAMES),
    seconds: HOLD_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // A cannon hit gains a Crystal Shrapnel, at most once each cooldown of the burst's shrapnel group
  const onCannonStrike = ({ kitEffectState }: KitContext, { combatant }: KitStrike): void => {
    const { characterId } = combatant;
    if (!startKitCooldown(kitEffectState, characterId, BURST_SHRAPNEL_ICD_STATUS_ID, burstShrapnelIcdSeconds)) return;
    const stacks = countShrapnel(kitEffectState, characterId);
    if (stacks < SHRAPNEL_MAX)
      addKitStatus(kitEffectState, characterId, {
        id: SHRAPNEL_STATUS_ID,
        secondsRemaining: shrapnelSeconds,
        stacks: stacks + 1,
      });
  };

  const blastHit: KitHit = {
    element: Element.Geo,
    enemyStatus: createConstellation4Shred,
    gauge: 2,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    isBlunt: true,
    onStrike: onCannonStrike,
    poiseDamage: 100,
    talentMultiplier: burstMultiplier(0),
  };

  // The cannon's ticks, from the frame the cannon starts at, each tick at 42 frames on and every third at 48, as gcsim's loop
  // Spaces them
  const getCannonTickFrames = (): number[] => {
    const tickFrames: number[] = [];
    let frame = 0;
    for (let count = 1; frame <= cannonFrames; count++) {
      tickFrames.push(frame);
      frame += count % 3 === 2 ? CANNON_LONG_INTERVAL_FRAMES : CANNON_INTERVAL_FRAMES;
    }
    return tickFrames;
  };
  const cannonHits: KitHit[] = getCannonTickFrames().map((tickFrame) => ({
    element: Element.Geo,
    enemyStatus: createConstellation4Shred,
    gauge: 1,
    hitArea: CANNON_HIT_AREA,
    hitmarkSeconds: (CANNON_DELAY_FRAMES + tickFrame + PELLET_TRAVEL_FRAMES) / 60,
    isBlunt: true,
    onStrike: onCannonStrike,
    poiseDamage: 50,
    talentMultiplier: burstMultiplier(1),
  }));

  const elementalBurst: KitAction = {
    hits: [blastHit],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      castKitSummon(kitEffectState, body, combatant, cannonHits),
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack,
    chargedAttackStamina: 0,
    elementalBurst,
    elementalSkill,
    elementalSkillCharges: SKILL_CHARGES,
    elementalSkillHolds: [
      {
        action: elementalSkillHold,
        cooldownSeconds: skillCooldownSeconds,
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    highPlunge,
    lowPlunge,
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds,
  };
};
