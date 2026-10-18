import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const OBSIDIAN_CODEX_COOLDOWN_ID = "obsidianCodexCooldown";
const OBSIDIAN_CODEX_CRITICAL_RATE_ID = "obsidianCodexCriticalRate";

// Obsidian Codex. Its two-piece bonus raises the DMG its wearer deals by the table's first param while it is in Nightsoul's
// Blessing and on the field. Its four-piece bonus raises its wearer's CRIT Rate by the second param for the third param's
// Seconds after it consumes the first param's Nightsoul points on the field, once every the fourth param's seconds
export const createObsidianCodexSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const { params } = bonus;
  if (bonus.pieceCount === 2) {
    const damageBonus = takeOne(params, 0);
    return {
      getStrikeDamageBonus: (strike, _enemy, party, effects) =>
        getActiveCharacterId(party) === strike.combatant.characterId &&
        checkHasKitStatus(effects, strike.combatant.characterId, NIGHTSOUL_BLESSING_STATUS_ID)
          ? damageBonus
          : 0,
    };
  }
  const pointCount = takeOne(params, 0);
  const criticalRateBonus = takeOne(params, 1);
  const criticalRateSeconds = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount: checkIsKitStatusActive(effects, combatant.characterId, OBSIDIAN_CODEX_CRITICAL_RATE_ID)
          ? criticalRateBonus
          : 0,
        attribute: Attribute.CriticalRate,
      },
    ],
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.NightsoulPointsConsumed ||
        event.characterId !== combatant.characterId ||
        event.points < pointCount ||
        getActiveCharacterId(context.party) !== combatant.characterId ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, OBSIDIAN_CODEX_COOLDOWN_ID)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: OBSIDIAN_CODEX_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: OBSIDIAN_CODEX_CRITICAL_RATE_ID,
        secondsRemaining: criticalRateSeconds,
      });
    },
  };
};
