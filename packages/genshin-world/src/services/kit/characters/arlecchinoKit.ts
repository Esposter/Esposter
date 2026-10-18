import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { getPartyMember } from "#src/services/party/getPartyMember";

// The Balemoon Alone May Know, her utility passive, gives 40% Pyro DMG Bonus in combat, from no ascension, as gcsim v2.47.2
// (MIT) arlecchino/asc.go's passive() gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/arlecchino/asc.go
const PYRO_DAMAGE_BONUS = 0.4;

// Balemoon Rising resets her skill's cooldown 107 frames after it starts, as gcsim v2.47.2 (MIT) arlecchino/burst.go queues
// ResetActionCooldown(action.ActionSkill) at that frame
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/arlecchino/burst.go
const BURST_SKILL_RESET_FRAMES = 107;

export const ARLECCHINO_CHARACTER_ID = 10_000_096;

// Arlecchino's behaviour: her passive, and Balemoon Rising's reset of her skill's cooldown. Her six strikes, charged attack,
// Plunges, All Is Ash's Spike and Cleave are her record's alone. Not built: the Bond of Life's Pyro variant of each strike,
// Blood-Debt Directive and the HP debt they read, since the framework holds no HP-debt state for a kit to read or change, and
// Her Ascension 1 passive waits on that hook. Her Ascension 4 passive's RES, which gcsim v2.47.2 does not model, is not built
// Constellation 1 needs the Masque of the Red Death or a Blood-Debt Directive's absorption, not recorded by the kit
// Constellation 2 needs a Blood-Debt Directive's absorption, which the kit does not record
// Constellation 4 needs a Blood-Debt Directive's absorption, which the kit does not record
// Constellation 6 needs Bond of Life's percentage, which the kit does not hold
export const createArlecchinoKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      scheduleKitTask(kitEffectState, combatant.characterId, toKitSeconds(BURST_SKILL_RESET_FRAMES), ({ party }) => {
        getPartyMember(party, combatant.characterId).skillCooldownSeconds = 0;
      }),
  },
  getPassiveBonuses: () => [{ amount: PYRO_DAMAGE_BONUS, attribute: Attribute.PyroDamageBonus }],
});
