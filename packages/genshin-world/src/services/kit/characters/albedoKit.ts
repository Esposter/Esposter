import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Measured: gcsim v2.47.2 (MIT) albedo/skill.go, Abiogenesis: Solar Isotoma's field set 3 metres ahead of the body with a
// Radius of 10, and each Transient Blossom set off by a hit on an enemy inside it once every 2 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/skill.go
const SOLAR_ISOTOMA_ID = "albedo-solar-isotoma";
const TRANSIENT_BLOSSOM_COOLDOWN_STATUS_ID = "albedo-transient-blossom-cooldown";

export const ALBEDO_CHARACTER_ID = 10_000_038;

// Albedo's behaviour: Abiogenesis: Solar Isotoma casts the Solar Isotoma 3 metres ahead as the press starts, a summon that
// Spawns as its hit lands and ends the one standing. A hit on an enemy inside the standing field sets off a Transient
// Blossom at that enemy, priced by the DEF of the Albedo who cast the field, once every 2 seconds, and Rite of Progeniture:
// Tectonic Tide casts its Fatal Blossoms at the standing Solar Isotoma. His passives and constellations are not built, as
// Their conditions and party buffs are not on the kit's effects
export const createAlbedoKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const solarIsotomaAheadMetres = readParameter("solarIsotomaAheadMetres");
  const solarIsotomaRadius = readParameter("solarIsotomaRadius");
  const solarIsotomaSeconds = readSeconds("solarIsotomaDuration");
  const transientBlossomCooldownSeconds = readSeconds("transientBlossomCooldown");
  const solarIsotomaHit = readHit("solarIsotoma");
  const transientBlossom = readHit("transientBlossom");
  const fatalBlossoms = readHits("fatalBlossoms");
  return {
    // Each Fatal Blossom is cast with the Solar Isotoma as a summon, as its own clock runs past the animation
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const solarIsotoma = findStandingKitSummon(kitEffectState.effects, SOLAR_ISOTOMA_ID, combatant.characterId);
        if (solarIsotoma) castKitSummon(kitEffectState, solarIsotoma.body, solarIsotoma.combatant, fatalBlossoms);
      },
    },
    // A hit that lands on an enemy inside the standing Solar Isotoma's field sets off a Transient Blossom at that enemy, once
    // Every 2 seconds, while the cooldown Albedo carries is not up
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken) return;
      const { characterId } = combatant;
      const { effects } = kitEffectState;
      const solarIsotoma = findStandingKitSummon(effects, SOLAR_ISOTOMA_ID, characterId);
      if (!solarIsotoma) return;
      const { position } = event.enemy;
      if (
        Math.hypot(position.x - solarIsotoma.body.position.x, position.z - solarIsotoma.body.position.z) >
          solarIsotomaRadius ||
        !startKitCooldown(
          kitEffectState,
          characterId,
          TRANSIENT_BLOSSOM_COOLDOWN_STATUS_ID,
          transientBlossomCooldownSeconds,
        )
      )
        return;
      castKitSummon(kitEffectState, { facing: 0, height: 0, position }, solarIsotoma.combatant, [transientBlossom]);
    },
    // A new Solar Isotoma ends the one standing, as Fischl's Oz does
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        for (const effect of kitEffectState.effects)
          if (effect.kind === "summon" && effect.id === SOLAR_ISOTOMA_ID) effect.secondsRemaining = 0;
        castKitSummon(kitEffectState, createAheadBody(body, solarIsotomaAheadMetres), combatant, [solarIsotomaHit], {
          id: SOLAR_ISOTOMA_ID,
          secondsRemaining: solarIsotomaSeconds,
          spawnSeconds: solarIsotomaHit.hitmarkSeconds,
        });
      },
    },
  };
};
