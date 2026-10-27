import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";

// The Balemoon Alone May Know, her utility passive, gives 40% Pyro DMG Bonus in combat, from no ascension, as gcsim v2.47.2
// (MIT) arlecchino/asc.go's passive() gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/arlecchino/asc.go
const PYRO_DAMAGE_BONUS = 0.4;

// Balemoon Rising resets her skill's cooldown 107 frames after it starts, as gcsim v2.47.2 (MIT) arlecchino/burst.go queues
// ResetActionCooldown(action.ActionSkill) at that frame
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/arlecchino/burst.go
const BURST_SKILL_RESET_FRAMES = 107;
// Constellation 6, From This Day On, We Shall Delight in New Life Together: for 20 seconds after All Is Ash, her Normal Attacks
// And Balemoon Rising gain 10% CRIT Rate and 70% CRIT DMG, once every 15 seconds, as the dump's paramList 0.1, 0.7, 20 and 15
// Give and gcsim v2.47.2 (MIT) arlecchino/cons.go's c6skill does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/arlecchino/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_CRITICAL_RATE = 0.1;
const CONSTELLATION_6_CRITICAL_DAMAGE = 0.7;
const CONSTELLATION_6_SECONDS = 20;
const CONSTELLATION_6_COOLDOWN_SECONDS = 15;
const CONSTELLATION_6_COOLDOWN_ID = "arlecchino-constellation-6-cooldown";
const CONSTELLATION_6_STATUS_ID = "arlecchino-constellation-6";
// The attack kinds Constellation 6's CRIT covers: her Normal Attacks and Balemoon Rising
const CONSTELLATION_6_ATTACK_TAGS = new Set<AttackTag>([AttackTag.ElementalBurst, AttackTag.NormalAttack]);

// Whether a strike is one Constellation 6's CRIT covers, while its status holds on the striker
const checkIsConstellation6Strike = (strike: KitStrike, effects: readonly KitEffect[]): boolean =>
  strike.attackTag !== undefined &&
  CONSTELLATION_6_ATTACK_TAGS.has(strike.attackTag) &&
  checkIsKitStatusActive(effects, strike.combatant.characterId, CONSTELLATION_6_STATUS_ID);

export const ARLECCHINO_CHARACTER_ID = 10_000_096;

// Arlecchino's behaviour: her passive, Balemoon Rising's reset of her skill's cooldown, and Constellation 6's CRIT on her
// Normal Attacks and Balemoon Rising for 20 seconds after All Is Ash. Her six strikes, charged attack, Plunges, All Is Ash's
// Spike and Cleave are her record's alone. Not built: the Bond of Life's Pyro variant of each strike, Blood-Debt Directive and
// The HP debt they read, since the framework holds no HP-debt state for a kit to read or change, and her Ascension 1 passive
// Waits on that hook. Her Ascension 4 passive's RES, which gcsim v2.47.2 does not model, is not built
// Constellation 1 needs the Masque of the Red Death or a Blood-Debt Directive's absorption, not recorded by the kit
// Constellation 2 needs a Blood-Debt Directive's absorption, which the kit does not record
// Constellation 4 needs a Blood-Debt Directive's absorption, which the kit does not record
// Constellation 6's added DMG to Balemoon Rising needs Bond of Life's percentage, which the kit does not hold
export const createArlecchinoKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      scheduleKitTask(kitEffectState, combatant.characterId, toKitSeconds(BURST_SKILL_RESET_FRAMES), ({ party }) => {
        getPartyMember(party, combatant.characterId).skillCooldownSeconds = 0;
      }),
  },
  getPassiveBonuses: () => [{ amount: PYRO_DAMAGE_BONUS, attribute: Attribute.PyroDamageBonus }],
  getStrikeCriticalDamageBonus: (strike, _enemy, _party, effects) =>
    checkIsConstellation6Strike(strike, effects) ? CONSTELLATION_6_CRITICAL_DAMAGE : 0,
  getStrikeCriticalRateBonus: (strike, _enemy, _party, effects) =>
    checkIsConstellation6Strike(strike, effects) ? CONSTELLATION_6_CRITICAL_RATE : 0,
  skill: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      if (
        combatant.constellationCount >= CONSTELLATION_6 &&
        startKitCooldown(
          kitEffectState,
          combatant.characterId,
          CONSTELLATION_6_COOLDOWN_ID,
          CONSTELLATION_6_COOLDOWN_SECONDS,
        )
      )
        addKitStatus(kitEffectState, combatant.characterId, {
          id: CONSTELLATION_6_STATUS_ID,
          secondsRemaining: CONSTELLATION_6_SECONDS,
        });
    },
  },
});
