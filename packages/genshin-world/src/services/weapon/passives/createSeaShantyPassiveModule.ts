import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { createSymbolPassiveModule } from "#src/services/weapon/passives/createSymbolPassiveModule";
import { takeOne } from "@esposter/shared";

const STOIC_ENERGY_ID = "stoicEnergy";
const STOIC_SYMBOL_PREFIX = "stoicSymbol";
// The seconds after the Roused effect before the Energy its Symbols give is restored, as the text gives them
const ENERGY_DELAY_SECONDS = 2;

// Sea Shanty (The Dockhand's Assistant, Portable Power Saw) at its rank: the Roused effect its Stoic's Symbols become
// Gives the Rank's Elemental Mastery for each Symbol for its seconds, and restores the rank's Energy for each two
// Seconds after it occurs. The Energy waits in the status's stacks, which the status hands back as it ends
export const createSeaShantyPassiveModule = (params: number[]): PassiveModule => {
  const energyPerSymbol = takeOne(params, 3);
  const elementalMasteryPerSymbol = takeOne(params, 4);
  const symbolModule = createSymbolPassiveModule(params, {
    onRoused: (context, combatant, symbols, rousedSeconds) => {
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: elementalMasteryPerSymbol * symbols,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: rousedSeconds,
        source: "roused",
      });
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: STOIC_ENERGY_ID,
        secondsRemaining: ENERGY_DELAY_SECONDS,
        stacks: energyPerSymbol * symbols,
      });
    },
    prefix: STOIC_SYMBOL_PREFIX,
  });
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.id === STOIC_ENERGY_ID &&
        event.effect.characterId === combatant.characterId
      )
        gainPartyMemberEnergy(context.party, combatant, event.effect.stacks ?? 0);
      symbolModule.onKitEvent?.(event, context, combatant);
    },
  };
};
