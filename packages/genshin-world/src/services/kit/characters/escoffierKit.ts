import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { countDeployedElements } from "#src/services/party/countDeployedElements";
import { takeOne } from "@esposter/shared";

// Low-Temperature Cooking's Surging Blade lands only while the Aligned interval is not running, as gcsim (MIT, main)
// Escoffier/skill.go gates it, its cooldown starting 22 frames after the press there, which the framework does not hold.
// Arkhe's application is a TODO in gcsim, so it is not applied here, and the interval is checked on the cast, not at the
// Blade's hitmark as gcsim queues it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/skill.go
const ALIGNED_INTERVAL_STATUS_ID = "escoffier-aligned-icd";
// Scoring Cuts' heal lands on the active character as a single tick of a field the burst sets going, as gcsim (MIT, main)
// Escoffier/burst.go heals
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/burst.go
const BURST_HEAL_FIELD_ID = "escoffier-scoring-cuts-heal";
// Measured: gcsim (MIT, main) escoffier/asc.go, Rehab Diet heals the active character nine times for 1.3824 of her ATK
// Each tick, and the burst starts it on Ascension 1 or above
const REHAB_DIET_SCALING = 1.3824;
const REHAB_DIET_FIELD_ID = "escoffier-rehab-diet";
const REHAB_DIET_ASCENSION = 1;
// Measured: gcsim (MIT, main) escoffier/asc.go, Ascension 4's Hydro and Cryo RES shred by how many Hydro or Cryo members the
// Team holds, 0 to 55%, for 12 seconds, on each enemy her skill and burst hit
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/escoffier/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_RES_SHREDS = [0, 0.05, 0.1, 0.15, 0.55];
const ASCENSION_4_SECONDS = 12;
const ASCENSION_4_STATUS_ID = "escoffier-ascension-4-res-shred";

// The RES shred a hit of hers applies to the enemy it strikes, as the team stands
const getAscension4Status = (combatant: Combatant): EnemyStatus | undefined => {
  const shred =
    ASCENSION_4_RES_SHREDS[countDeployedElements(combatant.deployedElements, [Element.Hydro, Element.Cryo])];
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
// Constellation 1 needs a crit damage that depends on the striking hit's element and the team's elements, which the framework does not hold
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
  const skillTickHits = readHits("frostyParfaitTicks").map((hit) => ({ ...hit, enemyStatus: getAscension4Status }));
  const surgingBladeHit = { ...readHit("surgingBlade"), enemyStatus: getAscension4Status };
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
        // Scoring Cuts' heal is one tick of a field, which heals the active character from the caster's ATK, a flat
        // Amount and a share of it
        castKitField(kitEffectState, combatant.characterId, body.position, {
          id: BURST_HEAL_FIELD_ID,
          nextTickSeconds: burstHealSeconds,
          onTick: (tick) =>
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              burstHealFlat + burstHealAttackShare * combatant.attributes.attack,
            ),
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
          onTick: (tick) =>
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              REHAB_DIET_SCALING * combatant.attributes.attack,
            ),
          radius: burstRadius,
          secondsRemaining: rehabDietLastTickSeconds + 0.5,
          tickIntervalSeconds: rehabDietIntervalSeconds,
        });
      },
    },
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, skillTickHits);
        if (
          !startKitCooldown(kitEffectState, combatant.characterId, ALIGNED_INTERVAL_STATUS_ID, alignedIntervalSeconds)
        )
          return;
        castKitSummon(kitEffectState, body, combatant, [surgingBladeHit]);
      },
    },
  };
};
