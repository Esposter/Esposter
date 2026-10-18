import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

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

// Measured: gcsim v2.47.2 (MIT) lisa/asc.go, from Ascension 4 each opponent Lightning Rose hits has its DEF decreased by 15%
// For 10 seconds, as the dump's Lisa passive text gives it. Each discharge refreshes the status rather than stacking it
const LIGHTNING_ROSE_ASCENSION = 4;
const LIGHTNING_ROSE_DEFENSE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  defenseReduction: 0.15,
  id: "lisa-lightning-rose",
  secondsRemaining: 10,
};
const getLightningRoseStatus = ({ ascension }: Combatant): EnemyStatus | undefined =>
  ascension >= LIGHTNING_ROSE_ASCENSION ? LIGHTNING_ROSE_DEFENSE_STATUS : undefined;

export const LISA_CHARACTER_ID = 10_000_006;

// Lisa's behaviour: Violet Arc's press gives each enemy it strikes a stack of Conductive, as her charged attack does from
// Ascension 1, and its hold strikes each enemy at the multiplier and poise of its stacks, consuming them. Lightning Rose
// Is a summon whose discharges land from her body, and from Ascension 4 each discharge lowers the DEF of the enemy it hits
export const createLisaKitBehaviour = ({ readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const discharges = readHits("discharges", { enemyStatus: getLightningRoseStatus });
  const lightningRoseSeconds = readSeconds("lightningRose");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, discharges, { secondsRemaining: lightningRoseSeconds }),
    },
    // A1: each enemy a charged attack hits gains a stack of Conductive
    chargedAttack: {
      hits: [{ enemyStatus: (combatant) => (combatant.ascension >= 1 ? CONDUCTIVE_STACK : undefined) }],
    },
    skill: { hits: [{ enemyStatus: () => CONDUCTIVE_STACK }] },
    skillHolds: [{ hits: [{ stackedHitStatusId: CONDUCTIVE_STATUS_ID }] }],
  };
};
