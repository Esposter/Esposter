import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { countDeployedElements } from "#src/services/party/countDeployedElements";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) navia/skill.go, Surging Blade's circle centred ahead of the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/navia/skill.go
const SURGING_BLADE_AHEAD_METRES = 3.6;

// Measured: gcsim v2.47.2 (MIT) navia/asc.go, each Pyro, Electro, Cryo or Hydro party member adds 20% ATK to Navia, two at most
const ASCENSION_4 = 4;
const ASCENSION_4_ATK_PER_MEMBER = 0.2;
const ASCENSION_4_MAXIMUM_STACKS = 2;
const ASCENSION_4_ELEMENTS: readonly Element[] = [Element.Pyro, Element.Electro, Element.Cryo, Element.Hydro];

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

// Measured: gcsim v2.47.2 (MIT) navia/cons.go, each Shrapnel a shot spends gives Navia 3 Energy and cuts her burst's cooldown
// By one second, up to three of them
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_MAXIMUM_SHRAPNEL = 3;
const CONSTELLATION_1_ENERGY_PER_SHRAPNEL = 3;
const CONSTELLATION_1_BURST_SECONDS_PER_SHRAPNEL = 1;

// Measured: gcsim v2.47.2 (MIT) navia/cons.go, Constellation 2's CRIT Rate of 12% for each shrapnel the press consumes, three at
// Most, and one Cannon Fire Support shot 30 frames after the blade strikes an enemy, three metres round the point of its hit.
// Gcsim draws that point uniformly over the disk of 1.2 metres about the enemy, from its random source
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_CRITICAL_RATE_PER_SHRAPNEL = 0.12;
const CONSTELLATION_2_MAXIMUM_SHRAPNEL = 3;
const CONSTELLATION_2_CANNON_OFFSET_METRES = 1.2;
const CONSTELLATION_2_CANNON_RADIUS_METRES = 3;
const CONSTELLATION_2_CANNON_HITMARK_FRAMES = 30;

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
// Crystal Shrapnel. From Ascension 1 a shot infuses her attacks with Geo and raises their DMG. From Ascension 4 each Pyro,
// Electro, Cryo and Hydro party member adds 20% ATK, two at most. Not built: the Shrapnel gained from party Crystallize
// Shards, and the pellets past three stacks of a shot, as no step gives a shard's reach to a hit. Constellations 1, 2, 4 and
// 6 are built, Constellation 6 keeping its excess Shrapnel, and the rest of her Constellations are not built:
// Constellation 6's CRIT DMG per Shrapnel past three needs a strike CRIT DMG hook, which the kit cannot apply
export const createNaviaKitBehaviour = ({ readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const shrapnelSeconds = readParameter("crystalShrapnelSeconds");
  const arkheIcdSeconds = readParameter("surgingBladeCooldownSeconds");
  const burstShrapnelIcdSeconds = readParameter("crystalShrapnelGainCooldownSeconds");
  // Surging Blade's hit after a press's shot and after a hold's
  const surgingBladeHits = readHits("surgingBlades");

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
  // The cannon shot Constellation 2 fires: a cannon hit of the burst's, on a circle of its own radius and hitmark
  const constellation2CannonHit: KitHit = {
    ...takeOne(cannonHits, 0),
    hitArea: { ...takeOne(cannonHits, 0).hitArea, radius: CONSTELLATION_2_CANNON_RADIUS_METRES },
    hitmarkSeconds: toKitSeconds(CONSTELLATION_2_CANNON_HITMARK_FRAMES),
  };
  // Constellation 2 on a press or hold's blade: its CRIT Rate for the shrapnel the shot consumed, and one cannon shot at the
  // First enemy the blade strikes, which the shot's own flag allows once
  const addConstellation2 = (surgingBladeHit: KitHit, consumedShrapnel: number): KitHit => {
    let isCannonShotFired = false;
    return {
      ...surgingBladeHit,
      criticalRateBonus:
        CONSTELLATION_2_CRITICAL_RATE_PER_SHRAPNEL * Math.min(consumedShrapnel, CONSTELLATION_2_MAXIMUM_SHRAPNEL),
      onStrike: (context, strike, enemy) => {
        if (isCannonShotFired) return;
        isCannonShotFired = true;
        // The point is drawn over the disk about the enemy, its bearing first and then its distance, from the world's source
        const bearing = context.random() * 2 * Math.PI;
        const distance = CONSTELLATION_2_CANNON_OFFSET_METRES * Math.sqrt(context.random());
        castKitSummon(
          context.kitEffectState,
          {
            ...strike.body,
            position: {
              x: enemy.position.x + distance * Math.sin(bearing),
              z: enemy.position.z + distance * Math.cos(bearing),
            },
          },
          strike.combatant,
          [constellation2CannonHit],
          { attackTag: AttackTag.ElementalBurst },
        );
      },
    };
  };

  // A shot fired spends the team's Crystal Shrapnel, keeping the excess past three for Constellation 6 as gcsim's shot does,
  // And fires the Surging Blade, unless its ICD still holds, which the kit sets on the shot and never clears early
  const castShot =
    (surgingBladeHit: KitHit) =>
    ({ activeCombatant: combatant, body, kitEffectState, party }: KitContext): void => {
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
      const stacks = shrapnel?.stacks ?? 0;
      const keptShrapnel =
        combatant.constellationCount >= CONSTELLATION_6 ? Math.max(stacks - CONSTELLATION_6_KEPT_SHRAPNEL, 0) : 0;
      if (shrapnel) {
        shrapnel.stacks = keptShrapnel;
        if (keptShrapnel === 0) shrapnel.secondsRemaining = 0;
      }
      // Constellation 1 rewards each shrapnel the shot spends, whether or not the blade's own cooldown lets it fire
      if (combatant.constellationCount >= CONSTELLATION_1) {
        const spentShrapnel = Math.min(stacks, CONSTELLATION_1_MAXIMUM_SHRAPNEL);
        gainPartyMemberEnergy(party, combatant, spentShrapnel * CONSTELLATION_1_ENERGY_PER_SHRAPNEL);
        const partyMember = getPartyMember(party, characterId);
        partyMember.burstCooldownSeconds = Math.max(
          0,
          partyMember.burstCooldownSeconds - spentShrapnel * CONSTELLATION_1_BURST_SECONDS_PER_SHRAPNEL,
        );
      }
      if (!startKitCooldown(kitEffectState, characterId, ARKHE_ICD_STATUS_ID, arkheIcdSeconds)) return;
      castKitSummon(
        kitEffectState,
        createAheadBody(body, SURGING_BLADE_AHEAD_METRES),
        combatant,
        [
          combatant.constellationCount >= CONSTELLATION_2
            ? addConstellation2(surgingBladeHit, stacks - keptShrapnel)
            : surgingBladeHit,
        ],
        { attackTag: AttackTag.ElementalSkill },
      );
    };

  return {
    burst: {
      hits: [cannonHitBehaviour],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, cannonHits, { attackTag: AttackTag.ElementalBurst });
      },
    },
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants) => {
      const stacks = Math.min(
        ASCENSION_4_MAXIMUM_STACKS,
        countDeployedElements(
          deployedCombatants.map(({ element }) => element),
          ASCENSION_4_ELEMENTS,
        ),
      );
      return combatant.ascension >= ASCENSION_4 && stacks > 0
        ? [{ amount: ASCENSION_4_ATK_PER_MEMBER * stacks, attribute: Attribute.AttackPercent }]
        : [];
    },
    skill: { onStart: castShot(takeOne(surgingBladeHits, 0)) },
    skillHolds: [{ onStart: castShot(takeOne(surgingBladeHits, 1)) }],
  };
};
