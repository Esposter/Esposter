import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim v2.47.2 (MIT) albedo/skill.go, Abiogenesis: Solar Isotoma's field set 3 metres ahead of the body with a
// Radius of 10, and each Transient Blossom set off by a hit on an enemy inside it once every 2 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/skill.go
const SOLAR_ISOTOMA_ID = "albedo-solar-isotoma";
const TRANSIENT_BLOSSOM_COOLDOWN_STATUS_ID = "albedo-transient-blossom-cooldown";
// Measured: gcsim v2.47.2 (MIT) albedo/asc.go, A4: Rite of Progeniture: Tectonic Tide raises the Elemental Mastery of the
// Party for 10 seconds by 125, as its A4 gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/asc.go
const TECTONIC_TIDE_ASCENSION = 4;
const TECTONIC_TIDE_ELEMENTAL_MASTERY = 125;
const TECTONIC_TIDE_ELEMENTAL_MASTERY_SECONDS = 10;
const TECTONIC_TIDE_SOURCE = "albedo-tectonic-tide";
// Constellation 1, Flower of Eden, from the wiki: each Transient Blossom of the Solar Isotoma regenerates 1.2 Energy for
// Albedo, and his Solar Isotoma raises his DEF by 50% for 20 seconds
const ALBEDO_CONSTELLATION_1 = 1;
const TRANSIENT_BLOSSOM_ENERGY = 1.2;
const SOLAR_ISOTOMA_DEFENSE_PERCENT = 0.5;
const SOLAR_ISOTOMA_DEFENSE_SECONDS = 20;
const FLOWER_OF_EDEN_SOURCE = "albedo-flower-of-eden";

export const ALBEDO_CHARACTER_ID = 10_000_038;

// Albedo's behaviour: Abiogenesis: Solar Isotoma casts the Solar Isotoma 3 metres ahead as the press starts, a summon that
// Spawns as its hit lands and ends the one standing. A hit on an enemy inside the standing field sets off a Transient
// Blossom at that enemy, priced by the DEF of the Albedo who cast the field, once every 2 seconds, and Rite of Progeniture:
// Tectonic Tide casts its Fatal Blossoms at the standing Solar Isotoma, and from Ascension 4 raises the Elemental Mastery of
// The deployed team. A1's damage to enemies at half HP or less is not built, nor Constellations 2, 4 and 6: Constellation 2's
// Fatal Reckoning stacks need a burst hit whose DMG grows with the stacks it consumes, Constellation 4's jump destroys a
// Silver Isotoma and needs a plunge's ground impact DMG per member, and Constellation 6 needs the shield a Crystallize
// Gives a member read at a strike, which the kit does not yet hold
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
      onStart: ({ activeCombatant: combatant, kitEffectState, party }) => {
        const solarIsotoma = findStandingKitSummon(kitEffectState.effects, SOLAR_ISOTOMA_ID, combatant.characterId);
        if (solarIsotoma) castKitSummon(kitEffectState, solarIsotoma.body, solarIsotoma.combatant, fatalBlossoms);
        if (combatant.ascension < TECTONIC_TIDE_ASCENSION) return;
        buffKitTeam(kitEffectState, party, {
          amount: TECTONIC_TIDE_ELEMENTAL_MASTERY,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: TECTONIC_TIDE_ELEMENTAL_MASTERY_SECONDS,
          source: TECTONIC_TIDE_SOURCE,
        });
      },
    },
    // A hit that lands on an enemy inside the standing Solar Isotoma's field sets off a Transient Blossom at that enemy, once
    // Every 2 seconds, while the cooldown Albedo carries is not up
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
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
      if (combatant.constellationCount < ALBEDO_CONSTELLATION_1) return;
      const member = getPartyMember(party, characterId);
      member.energy = Math.min(combatant.kit.burstEnergyCost, member.energy + TRANSIENT_BLOSSOM_ENERGY);
    },
    // A new Solar Isotoma ends the one standing, as Fischl's Oz does
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (combatant.constellationCount >= ALBEDO_CONSTELLATION_1)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: SOLAR_ISOTOMA_DEFENSE_PERCENT,
            attribute: Attribute.DefensePercent,
            secondsRemaining: SOLAR_ISOTOMA_DEFENSE_SECONDS,
            source: FLOWER_OF_EDEN_SOURCE,
          });
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
