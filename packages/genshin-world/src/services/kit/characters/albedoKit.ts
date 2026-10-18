import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim v2.47.2 (MIT) albedo/skill.go, Abiogenesis: Solar Isotoma's field set 3 metres ahead of the body with a
// Radius of 10, and each Transient Blossom set off by a hit on an enemy inside it once every 2 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/skill.go
const SOLAR_ISOTOMA_ID = "albedo-solar-isotoma";
const TRANSIENT_BLOSSOM_COOLDOWN_STATUS_ID = "albedo-transient-blossom-cooldown";
// Calcite Might, as the dump's Albedo_PermanentSkill_1 row and gcsim v2.47.2 (MIT) albedo/asc.go give it: from Ascension
// 1, a Transient Blossom deals 25% more DMG to an enemy under half its HP
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/asc.go
const CALCITE_MIGHT_ASCENSION = 1;
const CALCITE_MIGHT_HEALTH_SHARE = 0.5;
const CALCITE_MIGHT_DAMAGE_BONUS = 0.25;
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
// Constellation 4: the active party member within the standing Solar Isotoma's field has its Plunging Attack DMG raised 30%
// for a second, as gcsim v2.47.2 (MIT) albedo/cons.go gives it. gcsim checks the field every 0.3 seconds from the skill's
// hitmark, when the Solar Isotoma is made, and a status here counts those 0.3 seconds, so a check runs as it runs out. A
// Check that finds the field standing gives the active member the bonus for a second
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/cons.go
const ALBEDO_CONSTELLATION_4 = 4;
const CONSTELLATION_4_PLUNGING_ATTACK_BONUS = 0.3;
const CONSTELLATION_4_SECONDS = 1;
const CONSTELLATION_4_CHECK_SECONDS = 0.3;
const CONSTELLATION_4_CHECK_STATUS_ID = "albedo-constellation-4-check";
const CONSTELLATION_4_SOURCE = "albedo-constellation-4";
const TRANSIENT_BLOSSOM_ENERGY = 1.2;
const SOLAR_ISOTOMA_DEFENSE_PERCENT = 0.5;
const SOLAR_ISOTOMA_DEFENSE_SECONDS = 20;
const FLOWER_OF_EDEN_SOURCE = "albedo-flower-of-eden";
// Constellation 2, Opening of Phanerozoic, from the wiki and gcsim v2.47.2 (MIT): each Transient Blossom gives Albedo a stack
// Of Fatal Reckoning, up to four, lasting 30 seconds, and each stack consumed by Tectonic Tide adds 30% of his DEF to each
// Fatal Blossom as flat damage
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/cons.go
const ALBEDO_CONSTELLATION_2 = 2;
const FATAL_RECKONING_DEFENSE_SHARE = 0.3;
const FATAL_RECKONING_MAX_STACKS = 4;
const FATAL_RECKONING_SECONDS = 30;
const FATAL_RECKONING_STATUS_ID = "albedo-fatal-reckoning";

export const ALBEDO_CHARACTER_ID = 10_000_038;

// Each Transient Blossom adds a stack of Fatal Reckoning, up to four, and refreshes the thirty seconds it lasts
const addFatalReckoningStack = (kitEffectState: KitEffectState, combatant: Combatant): void => {
  const { characterId } = combatant;
  const stacks = checkIsKitStatusActive(kitEffectState.effects, characterId, FATAL_RECKONING_STATUS_ID)
    ? (findKitStatus(kitEffectState.effects, characterId, FATAL_RECKONING_STATUS_ID)?.stacks ?? 0)
    : 0;
  addKitStatus(kitEffectState, characterId, {
    id: FATAL_RECKONING_STATUS_ID,
    secondsRemaining: FATAL_RECKONING_SECONDS,
    stacks: Math.min(FATAL_RECKONING_MAX_STACKS, stacks + 1),
  });
};

// A copy of a Fatal Blossom that Tectonic Tide adds the flat damage of its Fatal Reckoning stacks to
const withFatalReckoningBonus = (hit: KitHit, bonus: number): KitHit => ({
  ...hit,
  additiveBaseDamageBonus: () => bonus,
});

// Tectonic Tide consumes every stack of Fatal Reckoning, and returns the flat damage they add to each Fatal Blossom
const consumeFatalReckoningBonus = (kitEffectState: KitEffectState, combatant: Combatant): number => {
  const { characterId } = combatant;
  if (
    combatant.constellationCount < ALBEDO_CONSTELLATION_2 ||
    !checkIsKitStatusActive(kitEffectState.effects, characterId, FATAL_RECKONING_STATUS_ID)
  )
    return 0;
  const status = findKitStatus(kitEffectState.effects, characterId, FATAL_RECKONING_STATUS_ID);
  const stacks = status?.stacks ?? 0;
  if (status) status.stacks = 0;
  return stacks * FATAL_RECKONING_DEFENSE_SHARE * combatant.attributes.defense;
};

// Albedo's behaviour: Abiogenesis: Solar Isotoma casts the Solar Isotoma 3 metres ahead as the press starts, a summon that
// Spawns as its hit lands and ends the one standing. A hit on an enemy inside the standing field sets off a Transient
// Blossom at that enemy, priced by the DEF of the Albedo who cast the field, once every 2 seconds, and Rite of Progeniture:
// Tectonic Tide casts its Fatal Blossoms at the standing Solar Isotoma, and from Ascension 4 raises the Elemental Mastery of
// The deployed team. From Ascension 1 a Transient Blossom deals more to an enemy under half its HP. Constellation 1's energy
// and Constellation 2's Fatal Reckoning stacks follow each Transient Blossom, and Tectonic Tide adds the stacks as flat
// Damage to each Fatal Blossom, though not to its own first hit, which the record plays and the kit cannot change per cast.
// Constellation 4's plunging attack bonus reaches the active member within the Solar Isotoma's field, and Constellation 6 is
// Not built: it needs the shield a Crystallize gives a member read at a strike, which the kit does not yet hold. The Silver
// Isotoma clause an earlier note named for Constellation 4 is not built: gcsim v2.47.2 does not model it, and the wiki text
// Was not checked
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
        const fatalReckoningBonus = consumeFatalReckoningBonus(kitEffectState, combatant);
        const blossoms =
          fatalReckoningBonus === 0
            ? fatalBlossoms
            : fatalBlossoms.map((hit) => withFatalReckoningBonus(hit, fatalReckoningBonus));
        const solarIsotoma = findStandingKitSummon(kitEffectState.effects, SOLAR_ISOTOMA_ID, combatant.characterId);
        if (solarIsotoma) castKitSummon(kitEffectState, solarIsotoma.body, solarIsotoma.combatant, blossoms);
        if (combatant.ascension < TECTONIC_TIDE_ASCENSION) return;
        buffKitTeam(kitEffectState, party, {
          amount: TECTONIC_TIDE_ELEMENTAL_MASTERY,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: TECTONIC_TIDE_ELEMENTAL_MASTERY_SECONDS,
          source: TECTONIC_TIDE_SOURCE,
        });
      },
    },
    getStrikeDamageBonus: ({ combatant, hit }, enemy) =>
      combatant.ascension >= CALCITE_MIGHT_ASCENSION &&
      hit === transientBlossom &&
      enemy.health / enemy.maxHealth < CALCITE_MIGHT_HEALTH_SHARE
        ? CALCITE_MIGHT_DAMAGE_BONUS
        : 0,
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
      if (combatant.constellationCount >= ALBEDO_CONSTELLATION_2) addFatalReckoningStack(kitEffectState, combatant);
      if (combatant.constellationCount < ALBEDO_CONSTELLATION_1) return;
      const member = getPartyMember(party, characterId);
      member.energy = Math.min(combatant.kit.burstEnergyCost, member.energy + TRANSIENT_BLOSSOM_ENERGY);
    },
    // Constellation 4: the active member's plunges, while it stands in the standing Solar Isotoma's field, checked as each
    // 0.3 seconds from the cast runs out
    onStep: ({ activeCombatant, body, kitEffectState }, combatant) => {
      if (combatant.constellationCount < ALBEDO_CONSTELLATION_4) return;
      if (
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          CONSTELLATION_4_CHECK_STATUS_ID,
          CONSTELLATION_4_CHECK_SECONDS,
        )
      )
        return;
      const solarIsotoma = findStandingKitSummon(kitEffectState.effects, SOLAR_ISOTOMA_ID, combatant.characterId);
      if (
        !solarIsotoma ||
        !checkIsInKitField({ centre: solarIsotoma.body.position, radius: solarIsotomaRadius }, body.position)
      )
        return;
      buffKitMember(kitEffectState, activeCombatant.characterId, {
        amount: CONSTELLATION_4_PLUNGING_ATTACK_BONUS,
        attribute: Attribute.PlungingAttackDamageBonus,
        secondsRemaining: CONSTELLATION_4_SECONDS,
        source: CONSTELLATION_4_SOURCE,
      });
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
        // Constellation 4's clock starts at the hitmark, the Solar Isotoma's spawn, so its first check runs 0.3 seconds after it
        if (combatant.constellationCount >= ALBEDO_CONSTELLATION_4)
          addKitStatus(kitEffectState, combatant.characterId, {
            id: CONSTELLATION_4_CHECK_STATUS_ID,
            secondsRemaining: solarIsotomaHit.hitmarkSeconds + CONSTELLATION_4_CHECK_SECONDS,
          });
        castKitSummon(kitEffectState, createAheadBody(body, solarIsotomaAheadMetres), combatant, [solarIsotomaHit], {
          id: SOLAR_ISOTOMA_ID,
          secondsRemaining: solarIsotomaSeconds,
          spawnSeconds: solarIsotomaHit.hitmarkSeconds,
        });
      },
    },
  };
};
