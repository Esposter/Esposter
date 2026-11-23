import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createSymbolPassiveModule } from "#src/services/weapon/passives/createSymbolPassiveModule";
import { takeOne } from "@esposter/shared";

const UNITY_SYMBOL_PREFIX = "unitySymbol";
const STRUGGLE_SOURCE = "struggle";

// Masons' Ditty (Prospector's Drill, Range Gauge) at its rank: the Struggle effect its Unity's Symbols become gives the
// Rank's ATK And All Elemental DMG Bonus for each Symbol, for its seconds
export const createMasonsDittyPassiveModule = (params: number[]): PassiveModule => {
  const attackPercentPerSymbol = takeOne(params, 3);
  const elementalDamageBonusPerSymbol = takeOne(params, 4);
  return createSymbolPassiveModule(params, {
    onRoused: (context, combatant, symbols, rousedSeconds) => {
      const { characterId } = combatant;
      buffKitMember(context.kitEffectState, characterId, {
        amount: attackPercentPerSymbol * symbols,
        attribute: Attribute.AttackPercent,
        secondsRemaining: rousedSeconds,
        source: STRUGGLE_SOURCE,
      });
      for (const attribute of ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES)
        buffKitMember(context.kitEffectState, characterId, {
          amount: elementalDamageBonusPerSymbol * symbols,
          attribute,
          secondsRemaining: rousedSeconds,
          source: STRUGGLE_SOURCE,
        });
    },
    prefix: UNITY_SYMBOL_PREFIX,
  });
};
