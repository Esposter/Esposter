import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Element } from "#src/models/Element";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) navia/skill.go, Surging Blade's circle centred ahead of the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/skill.go
const SURGING_BLADE_AHEAD_METRES = 3.6;

// Measured: gcsim v2.47.2 (MIT) navia/skill.go and burst.go, Crystal Shrapnel gained by a cannon hit at most once each
// Cooldown, six at most, and Ceremonial Crystalshot clears them all but the excess a Constellation keeps
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

// Navia's behaviour: Rosula Shardshot's press and hold each spend her Crystal Shrapnel and fire Surging Blade off its
// Cooldown, and As the Sunlit Sky's Singing Salute casts Cannon Fire Support, the blast and the cannon's hits gaining
// Crystal Shrapnel. Her Ascension passives, the Shrapnel gained from party Crystallize shards and the shot's pellets past
// Three stacks are not built, as the kit does not read the team's effects in a passive or a strike's DMG and no step
// Gives a shard's reach to a hit. Constellation 4 is built, Constellation 6 keeps its excess Shrapnel, and the rest of her
// Constellations are not
// Constellation 1 needs Energy and skill cooldown cuts per Shrapnel consumed, which the kit does not build yet
// Constellation 2 needs the CRIT Rate per Shrapnel on the shot and the burst's extra Cannon shot, not built
// Constellation 6's CRIT DMG per Shrapnel past three needs a strike CRIT DMG hook, which the kit cannot apply
export const createNaviaKitBehaviour = ({ readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const shrapnelSeconds = readParameter("crystalShrapnelSeconds");
  const arkheIcdSeconds = readParameter("surgingBladeCooldownSeconds");
  const burstShrapnelIcdSeconds = readParameter("crystalShrapnelGainCooldownSeconds");
  // Surging Blade's hit after a press's shot and after a hold's
  const surgingBladeHits = readHits("surgingBlades");

  // A shot fired spends the team's Crystal Shrapnel, keeping the excess past three for Constellation 6 as gcsim's shot does,
  // And fires the Surging Blade, unless its ICD still holds, which the kit sets on the shot and never clears early
  const castShot =
    (surgingBladeHit: KitHit) =>
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
      castKitSummon(kitEffectState, createAheadBody(body, SURGING_BLADE_AHEAD_METRES), combatant, [surgingBladeHit]);
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
  const cannonHitBehaviour = { enemyStatus: createConstellation4Shred, onStrike: onCannonStrike };
  const cannonHits = readHits("cannonFireSupportShots", cannonHitBehaviour);

  return {
    burst: {
      hits: [cannonHitBehaviour],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, cannonHits),
    },
    skill: { onStart: castShot(takeOne(surgingBladeHits, 0)) },
    skillHolds: [{ onStart: castShot(takeOne(surgingBladeHits, 1)) }],
  };
};
