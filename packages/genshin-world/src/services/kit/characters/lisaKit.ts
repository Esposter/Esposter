import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { regeneratePartyMemberEnergy } from "#src/services/party/regeneratePartyMemberEnergy";

// Measured: gcsim v2.47.2 (MIT) lisa/skill.go, each press applies a stack of Conductive to the enemy it hits, up to 3,
// And the stacks have no duration in gcsim. Lisa's charged attacks apply one too from her A1 (lisa/asc.go), and the hold
// Consumes the stacks.
const CONDUCTIVE_STATUS_ID = "conductive";
const CONDUCTIVE_STACK: EnemyStatus = {
  damageTakenBonus: 0,
  id: CONDUCTIVE_STATUS_ID,
  maxStacks: 3,
  secondsRemaining: Infinity,
  stacks: 1,
};

export const LISA_CHARACTER_ID = 10_000_006;

// Measured: gcsim v2.47.2 (MIT) lisa/cons.go. Constellation 6: when Lisa takes the field, each opponent within 5 metres of
// Her gains three stacks of Conductive, once every 5 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_COOLDOWN_ID = "lisa-constellation-6-cooldown";
const CONSTELLATION_6_COOLDOWN_SECONDS = 5;
const CONSTELLATION_6_RADIUS = 5;
const CONSTELLATION_6_STACKS = 3;
// Measured: gcsim v2.47.2 (MIT) lisa/skill.go, c1cb: each enemy a hold hits gives Lisa 2 Energy, counted up to five hits
// A hold. Constellation 1 regenerates 2 Energy for every opponent hit while holding Violet Arc, 10 at most per hold
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/skill.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ENERGY = 2;
const CONSTELLATION_1_MAX_ENERGY = 10;

// Lisa's behaviour: Violet Arc's press gives each enemy it strikes a stack of Conductive, as her charged attack does from
// Ascension 1, and its hold strikes each enemy at the multiplier and poise of its stacks, consuming them. Lightning Rose
// Is a summon whose discharges land from her body. A4's effect is not built. Constellations 1 and 6 are built
// Constellation 2 needs a DEF buff for as long as the hold lasts, which the skill holds do not carry the length of
// Constellation 4 needs the simultaneous bolt count of Lightning Rose, which the kit does not read
export const createLisaKitBehaviour = ({ readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const discharges = readHits("discharges");
  const lightningRoseSeconds = readSeconds("lightningRose");
  // Constellation 1's Energy the hold in progress has regenerated, which its start clears
  let holdRegeneratedEnergy = 0;
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, discharges, { secondsRemaining: lightningRoseSeconds }),
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
        // Constellation 1: each opponent the hold hits regenerates Energy for her, 10 at most per hold
        hits: [
          {
            onStrike: ({ party }, { combatant }) => {
              if (combatant.constellationCount < CONSTELLATION_1 || holdRegeneratedEnergy >= CONSTELLATION_1_MAX_ENERGY)
                return;
              regeneratePartyMemberEnergy(party, combatant, CONSTELLATION_1_ENERGY);
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
