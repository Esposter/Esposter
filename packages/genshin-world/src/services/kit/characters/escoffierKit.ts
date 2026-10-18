import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
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

export const ESCOFFIER_CHARACTER_ID = 10_000_112;

// Escoffier's behaviour outside the passives and constellations that wait: Low-Temperature Cooking casts its Frosty
// Parfait ticks and, outside the Aligned interval, its Surging Blade, and Scoring Cuts sets going its heal and, from
// Ascension 1, Rehab Diet. Her Cryo RES shred from Ascension 4, and her Constellations, wait on the hooks the page names
// Constellation 1 needs the party's elements, which the kit does not read, to set the Cryo CRIT DMG of nearby members
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
  const skillTickHits = readHits("frostyParfaitTicks");
  const surgingBladeHit = readHit("surgingBlade");
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
