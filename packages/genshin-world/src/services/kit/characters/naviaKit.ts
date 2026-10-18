import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) navia/skill.go, Surging Blade's circle centred ahead of the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/skill.go
const SURGING_BLADE_AHEAD_METRES = 3.6;

// Measured: gcsim v2.47.2 (MIT) navia/asc.go, each Pyro, Electro, Cryo or Hydro party member adds 20% ATK to Navia, two at most
const ASCENSION_4 = 4;
const ASCENSION_4_ATK_PER_MEMBER = 0.2;
const ASCENSION_4_MAXIMUM_STACKS = 2;
const ASCENSION_4_ELEMENTS = new Set([Element.Pyro, Element.Electro, Element.Cryo, Element.Hydro]);

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

// Undisclosed Distribution Channels, as the dump's Navia_PermanentSkill_1 row and gcsim v2.47.2 (MIT) navia/asc.go give it:
// From Ascension 1, for 4 seconds after a shot fires, her normal attacks, charged attack and plunges deal Geo DMG and 40%
// More of it. gcsim adds only the DMG Bonus, as her attacks are Geo there already
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/asc.go
const UNDISCLOSED_DISTRIBUTION_CHANNELS_ASCENSION = 1;
const UNDISCLOSED_DISTRIBUTION_CHANNELS_DAMAGE_BONUS = 0.4;
const UNDISCLOSED_DISTRIBUTION_CHANNELS_SECONDS = 4;

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
// Crystal Shrapnel. From Ascension 1 a shot infuses her attacks with Geo and raises their DMG. From Ascension 4 she gains
// Each Pyro, Electro, Cryo and Hydro party member adds 20% ATK, two at most. The Shrapnel gained from party Crystallize
// Shards and the shot's pellets past three stacks is not built, as no step gives a shard's reach to a hit. Constellation 4
// Is built, Constellation 6 keeps its excess Shrapnel, and the rest of her Constellations are not built.
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
      if (combatant.ascension >= UNDISCLOSED_DISTRIBUTION_CHANNELS_ASCENSION)
        addKitEffect(kitEffectState, {
          characterId,
          damageBonus: UNDISCLOSED_DISTRIBUTION_CHANNELS_DAMAGE_BONUS,
          element: Element.Geo,
          kind: "infusion",
          secondsRemaining: UNDISCLOSED_DISTRIBUTION_CHANNELS_SECONDS,
        });
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
    getPassiveBonuses: (combatant, _healthShare, deployedElements) => {
      const stacks = Math.min(
        ASCENSION_4_MAXIMUM_STACKS,
        deployedElements.filter((element) => ASCENSION_4_ELEMENTS.has(element)).length,
      );
      return combatant.ascension >= ASCENSION_4 && stacks > 0
        ? [{ amount: ASCENSION_4_ATK_PER_MEMBER * stacks, attribute: Attribute.AttackPercent }]
        : [];
    },
    skill: { onStart: castShot(takeOne(surgingBladeHits, 0)) },
    skillHolds: [{ onStart: castShot(takeOne(surgingBladeHits, 1)) }],
  };
};
