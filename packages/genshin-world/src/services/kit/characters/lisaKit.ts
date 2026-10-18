import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
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

export const LISA_CHARACTER_ID = 10_000_006;

// Lisa's behaviour: Violet Arc's press gives each enemy it strikes a stack of Conductive, as her charged attack does from
// Ascension 1, and its hold strikes each enemy at the multiplier and poise of its stacks, consuming them. Lightning Rose
// Is a summon whose discharges land from her body. A4's effect is not built
// Constellation 1 needs a hit event from Violet Arc's hold, which no kit event carries, to regenerate energy
// Constellation 2 needs a DEF buff for as long as the hold lasts, which the skill holds do not carry the length of
// Constellation 4 needs the simultaneous bolt count of Lightning Rose, which the kit does not read
// Constellation 6's text is not confirmed yet, so it is not built
export const createLisaKitBehaviour = ({ readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const discharges = readHits("discharges");
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
