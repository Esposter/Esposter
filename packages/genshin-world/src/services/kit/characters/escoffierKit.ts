import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { copyKitBody } from "#src/services/kit/copyKitBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { countDeployedElements } from "#src/services/party/countDeployedElements";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";

// Low-Temperature Cooking's Surging Blade lands only while the Aligned interval is not running, as gcsim v2.47.2 (MIT)
// Escoffier/skill.go checks it, and starts it, in the task it queues at the blade's 83rd frame, its cooldown starting 22
// Frames after the press there, which the framework does not hold. Arkhe's application is a TODO in gcsim, so it is not
// Applied here
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/escoffier/skill.go
const ALIGNED_HITMARK_FRAMES = 83;
const ALIGNED_INTERVAL_STATUS_ID = "escoffier-aligned-icd";
// Scoring Cuts' heal lands on the active character as a single tick of a field the burst sets going, as gcsim v2.47.2 (MIT)
// Escoffier/burst.go heals
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/escoffier/burst.go
const BURST_HEAL_FIELD_ID = "escoffier-scoring-cuts-heal";
// Measured: gcsim v2.47.2 (MIT) escoffier/asc.go, Rehab Diet heals the active character nine times for 1.3824 of her ATK
// Each tick, and the burst starts it on Ascension 1 or above
const REHAB_DIET_SCALING = 1.3824;
const REHAB_DIET_FIELD_ID = "escoffier-rehab-diet";
const REHAB_DIET_ASCENSION = 1;
// Measured: gcsim v2.47.2 (MIT) escoffier/asc.go, Ascension 4's Hydro and Cryo RES shred by how many Hydro or Cryo members the
// Team holds, 0 to 55%, for 12 seconds, on each enemy her skill and burst hit
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/escoffier/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_RES_SHREDS = [0, 0.05, 0.1, 0.15, 0.55];
const ASCENSION_4_SECONDS = 12;
const ASCENSION_4_STATUS_ID = "escoffier-ascension-4-res-shred";
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CRITICAL_DAMAGE = 0.6;
const CONSTELLATION_1_SECONDS = 15;
const CONSTELLATION_1_STATUS_ID = "escoffier-constellation-1-cryo-crit-dmg";
const CRYO_HYDRO_ELEMENTS: readonly Element[] = [Element.Cryo, Element.Hydro];

// Whether the deployed team holds members of Cryo and Hydro alone, and at least one of them
const checkIsCryoHydroTeam = (deployedElements: readonly (Element | undefined)[] | undefined): boolean =>
  deployedElements !== undefined &&
  deployedElements.length > 0 &&
  countDeployedElements(deployedElements, CRYO_HYDRO_ELEMENTS) === deployedElements.length;

// Constellation 1's window, which her skill and burst open for 15 seconds on an Ascension 4 Escoffier and a team of Cryo and
// Hydro members, as gcsim v2.47.2 (MIT) escoffier/cons.go's c1 does at the end of each, and the wiki states the same window
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/escoffier/cons.go
const startConstellation1 = (combatant: Combatant, kitEffectState: KitEffectState): void => {
  if (
    combatant.constellationCount < CONSTELLATION_1 ||
    combatant.ascension < ASCENSION_4 ||
    !checkIsCryoHydroTeam(combatant.deployedElements)
  )
    return;
  addKitStatus(kitEffectState, combatant.characterId, {
    id: CONSTELLATION_1_STATUS_ID,
    secondsRemaining: CONSTELLATION_1_SECONDS,
  });
};

// The CRIT DMG a Cryo strike gets from the window open on the Escoffier that owns it, read as the strike is priced
const getConstellation1CriticalDamage = (
  ownerCharacterId: number,
  striker: Combatant,
  hit: KitHit,
  effects: readonly KitEffect[],
): number =>
  getKitHitElement(hit, striker) === Element.Cryo &&
  checkIsKitStatusActive(effects, ownerCharacterId, CONSTELLATION_1_STATUS_ID)
    ? CONSTELLATION_1_CRITICAL_DAMAGE
    : 0;

// The RES shred a hit of hers applies to the enemy it strikes, as the team stands
const getAscension4Status = (combatant: Combatant): EnemyStatus | undefined => {
  const shred = ASCENSION_4_RES_SHREDS[countDeployedElements(combatant.deployedElements, CRYO_HYDRO_ELEMENTS)];
  if (combatant.ascension < ASCENSION_4 || !shred) return undefined;
  return {
    damageTakenBonus: 0,
    id: ASCENSION_4_STATUS_ID,
    resistanceReduction: { [Element.Cryo]: shred, [Element.Hydro]: shred },
    secondsRemaining: ASCENSION_4_SECONDS,
  };
};

export const ESCOFFIER_CHARACTER_ID = 10_000_112;

// Escoffier's behaviour outside the passives and constellations that wait: Low-Temperature Cooking casts its Frosty
// Parfait ticks and, outside the Aligned interval, its Surging Blade, and Scoring Cuts sets going its heal and, from
// Ascension 1, Rehab Diet and the Cryo and Hydro RES shred of Ascension 4 are built. Her Constellations wait on the hooks the page names
// Constellation 1 is built: her skill and burst open its 15-second window, and its CRIT DMG reaches each deployed member's Cryo strikes
// Constellation 2 needs Cooking Mek's Cold Storage Mode, which the skill does not build yet
// Constellation 4 needs Rehab Diet's six seconds and its chance to heal and restore energy, which the kit does not roll
// Constellation 6 needs Cooking Mek's Cold Storage Mode and the effects it sets, which are not built
export const createEscoffierKitBehaviour = ({
  kit,
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const skillTickHits = readHits("frostyParfaitTicks", { enemyStatus: getAscension4Status });
  const surgingBladeHit = readHit("surgingBlade", { enemyStatus: getAscension4Status });
  const alignedIntervalSeconds = readParameter("alignedIntervalSeconds");
  const burstHealFlat = readParameter("scoringCutsFlatHeal");
  const burstHealAttackShare = readParameter("scoringCutsHealAttackShare");
  const burstHealSeconds = readSeconds("burstHeal");
  const burstRadius = takeOne(kit.elementalBurst.hits).hitArea.radius;
  const rehabDietFirstTickSeconds = readSeconds("rehabDietFirstTick");
  const rehabDietIntervalSeconds = readSeconds("rehabDietInterval");
  const rehabDietLastTickSeconds = readSeconds("rehabDietLastTick");
  return {
    burst: {
      hits: [{ enemyStatus: getAscension4Status }],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        startConstellation1(combatant, kitEffectState);
        // Scoring Cuts' heal is one tick of a field, which heals the active character from the caster's ATK, a flat
        // Amount and a share of it
        castKitField(kitEffectState, combatant.characterId, body.position, {
          id: BURST_HEAL_FIELD_ID,
          nextTickSeconds: burstHealSeconds,
          onTick: (tick) => {
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              burstHealFlat + burstHealAttackShare * combatant.attributes.attack,
            );
          },
          radius: burstRadius,
          secondsRemaining: burstHealSeconds + 0.5,
          // A second past the one tick, so no second tick falls within the field
          tickIntervalSeconds: 1,
        });
        if (combatant.ascension < REHAB_DIET_ASCENSION) return;
        // Rehab Diet heals the active character from the caster's ATK each tick
        castKitField(kitEffectState, combatant.characterId, body.position, {
          id: REHAB_DIET_FIELD_ID,
          nextTickSeconds: rehabDietFirstTickSeconds,
          onTick: (tick) => {
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              REHAB_DIET_SCALING * combatant.attributes.attack,
            );
          },
          radius: burstRadius,
          secondsRemaining: rehabDietLastTickSeconds + 0.5,
          tickIntervalSeconds: rehabDietIntervalSeconds,
        });
      },
    },
    // Constellation 1 reaches a deployed member's Cryo strike while the window of its member, whose kit this is, is open
    getPartyStrikeBonus: (member, { combatant, hit }, _enemy, _party, effects) => ({
      criticalDamageBonus: getConstellation1CriticalDamage(member.characterId, combatant, hit, effects),
    }),
    // Constellation 1: a Cryo strike of hers gets 60% CRIT DMG while her window is open, as gcsim's c1 buffs every Cryo attack
    getStrikeCriticalDamageBonus: ({ combatant, hit }, _enemy, _party, effects) =>
      getConstellation1CriticalDamage(combatant.characterId, combatant, hit, effects),
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        startConstellation1(combatant, kitEffectState);
        castKitSummon(kitEffectState, body, combatant, skillTickHits, { attackTag: AttackTag.ElementalSkill });
        // The blade is placed where she cast it, and queued at its 83rd frame, which checks the interval and
        // Starts it there. It then lands with no delay of its own, as gcsim's queued attack has zero delays
        // (skill.go lines 69 to 93)
        const bladeBody = copyKitBody(body);
        scheduleKitTask(kitEffectState, combatant.characterId, toKitSeconds(ALIGNED_HITMARK_FRAMES), (tick) => {
          if (
            !startKitCooldown(
              tick.kitEffectState,
              combatant.characterId,
              ALIGNED_INTERVAL_STATUS_ID,
              alignedIntervalSeconds,
            )
          )
            return;
          castKitSummon(tick.kitEffectState, bladeBody, combatant, [{ ...surgingBladeHit, hitmarkSeconds: 0 }], {
            attackTag: AttackTag.ElementalSkill,
          });
        });
      },
    },
  };
};
