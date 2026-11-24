import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Measured: gcsim v2.47.2 (MIT) lisa/skill.go, each press applies a stack of Conductive to the enemy it hits, up to 3,
// And the stacks have no duration in gcsim. Lisa's charged attacks apply one too from her A1 (lisa/asc.go), and the
// Hold consumes the stacks.
const CONDUCTIVE_STATUS_ID = "conductive";
const CONDUCTIVE_STACK: EnemyStatus = {
  damageTakenBonus: 0,
  id: CONDUCTIVE_STATUS_ID,
  maxStacks: 3,
  secondsRemaining: Infinity,
  stacks: 1,
};

// Measured: gcsim v2.47.2 (MIT) lisa/asc.go, from Ascension 4 each opponent Lightning Rose hits has its DEF decreased
// By its record's defense reduction for the record's seconds, as the dump's Lisa passive text gives them. Each
// Discharge refreshes the status rather than stacking it
const LIGHTNING_ROSE_ASCENSION = 4;

export const LISA_CHARACTER_ID = 10_000_006;

// Measured: gcsim v2.47.2 (MIT) lisa/cons.go. Constellation 6: when Lisa takes the field, each opponent within 5 metres
// Of her gains three stacks of Conductive, once every 5 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_COOLDOWN_ID = "lisa-constellation-6-cooldown";
const CONSTELLATION_6_COOLDOWN_SECONDS = 5;
const CONSTELLATION_6_RADIUS = 5;
const CONSTELLATION_6_STACKS = 3;
// Measured: gcsim v2.47.2 (MIT) lisa/skill.go, c1cb: each enemy a hold hits gives Lisa 2 Energy, counted up to five
// Hits A hold. Constellation 1 regenerates 2 Energy for every opponent hit while holding Violet Arc, 10 at most per
// Hold https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/skill.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ENERGY = 2;
const CONSTELLATION_1_MAX_ENERGY = 10;

// Lisa's behaviour: Violet Arc's press gives each enemy it strikes a stack of Conductive, as her charged attack does
// From Ascension 1, and its hold strikes each enemy at the multiplier and poise of its stacks, consuming them.
// Lightning Rose is a summon whose discharges land from her body, and from Ascension 4 each discharge lowers the DEF of
// The enemy it hits. constellations 1 and 6 are built. Constellation 2 needs a DEF buff for as long as the hold lasts,
// Which the skill holds do not carry the length of. Constellation 4 needs the simultaneous bolt count of Lightning
// Rose, which the kit does not read measured: gcsim v2.47.2 (MIT) lisa/burst.go lines 60 to 62: the discharges are
// Queued from the cast, the first at 119 frames and one every 30 frames after it, thirty in all. The record's discharge
// Hitmarks are that schedule
export const createLisaKitBehaviour = ({ readHits, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const lightningRoseDefenseStatus: EnemyStatus = {
    damageTakenBonus: 0,
    defenseReduction: readParameter("lightningRoseDefenseReduction"),
    id: "lisa-lightning-rose",
    secondsRemaining: readParameter("lightningRoseDefenseSeconds"),
  };
  const getLightningRoseStatus = ({ ascension }: Combatant): EnemyStatus | undefined =>
    ascension >= LIGHTNING_ROSE_ASCENSION ? lightningRoseDefenseStatus : undefined;
  const discharges = readHits("discharges", { enemyStatus: getLightningRoseStatus });
  const lightningRoseSeconds = readSeconds("lightningRose");
  // Constellation 1's Energy the hold in progress has regenerated, which its start clears
  let holdRegeneratedEnergy = 0;
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, discharges, {
          attackTag: AttackTag.ElementalBurst,
          secondsRemaining: lightningRoseSeconds,
        });
      },
    },
    // A1: each enemy a charged attack hits gains a stack of Conductive
    chargedAttack: {
      hits: [{ enemyStatus: (combatant) => (combatant.ascension >= 1 ? CONDUCTIVE_STACK : undefined) }],
    },
    // Constellation 6: when Lisa takes the field, each opponent near her gains three stacks of Conductive
    onKitEvent: (event, { body, enemyMap, kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.CharacterSwapped ||
        event.characterId !== combatant.characterId ||
        combatant.constellationCount < CONSTELLATION_6 ||
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          CONSTELLATION_6_COOLDOWN_ID,
          CONSTELLATION_6_COOLDOWN_SECONDS,
        )
      )
        return;
      for (const enemy of enemyMap.values())
        if (checkIsInKitField({ centre: body.position, radius: CONSTELLATION_6_RADIUS }, enemy.position))
          addEnemyStatus(enemy, { ...CONDUCTIVE_STACK, stacks: CONSTELLATION_6_STACKS });
    },
    skill: { hits: [{ enemyStatus: () => CONDUCTIVE_STACK }] },
    skillHolds: [
      {
        // Measured: gcsim v2.47.2 (MIT) lisa/zz_lisa.dm.go, skillHold's rows {0} to {3}: the non-Conductive hold, then
        // One row per stack of Conductive, each a parameter of proud skill group 432 at its index, read in skill.go
        // Constellation 1: each opponent the hold hits regenerates Energy for her, 10 at most per hold
        hits: [
          {
            onStrike: ({ party }, { combatant }) => {
              if (combatant.constellationCount < CONSTELLATION_1 || holdRegeneratedEnergy >= CONSTELLATION_1_MAX_ENERGY)
                return;
              gainPartyMemberEnergy(party, combatant, CONSTELLATION_1_ENERGY);
              holdRegeneratedEnergy += CONSTELLATION_1_ENERGY;
            },
            stackedHitStatusId: CONDUCTIVE_STATUS_ID,
          },
        ],
        onStart: () => {
          holdRegeneratedEnergy = 0;
        },
      },
    ],
  };
};
