import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { endKitStatus } from "#src/services/kit/effects/endKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

// The most Symbols a wielder holds at once, as the text gives
const SYMBOL_MAXIMUM = 3;

// Symbols a weapon's passive gathers from heals and consumes into its Roused effect: a heal the wielder receives or
// Performs gains A Symbol for the rank's seconds, up to three, whether or not the wielder is on the field. The
// Wielder's skill or burst then consumes every Symbol it holds, and `onRoused` gives the effect they become, once the
// Rank's cooldown has run out, so a skill or burst inside the cooldown consumes none. A skill or burst holding no
// Symbol gives no effect. Each Symbol is its own status, so the symbols' seconds run on their own
export const createSymbolPassiveModule = (
  params: number[],
  {
    onRoused,
    prefix,
  }: {
    onRoused: (context: KitContext, combatant: Combatant, symbols: number, rousedSeconds: number) => void;
    prefix: string;
  },
): PassiveModule => {
  const symbolSeconds = takeOne(params, 0);
  const rousedSeconds = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  const symbolIds = Array.from({ length: SYMBOL_MAXIMUM }, (_value, index) => `${prefix}${index}`);
  const cooldownId = `${prefix}RousedCooldown`;
  return {
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState } = context;
      if (event.kind === KitEventKind.HealthChanged) {
        if (event.healthShare <= 0 || (event.characterId !== characterId && event.sourceCharacterId !== characterId))
          return;
        const freeId = symbolIds.find((id) => !checkIsKitStatusActive(kitEffectState.effects, characterId, id));
        if (freeId !== undefined)
          addKitStatus(kitEffectState, characterId, { id: freeId, secondsRemaining: symbolSeconds });
        return;
      }
      if (
        (event.kind !== KitEventKind.SkillUsed && event.kind !== KitEventKind.BurstUsed) ||
        event.characterId !== characterId
      )
        return;
      const heldIds = symbolIds.filter((id) => checkIsKitStatusActive(kitEffectState.effects, characterId, id));
      if (heldIds.length === 0 || !startKitCooldown(kitEffectState, characterId, cooldownId, cooldownSeconds)) return;
      for (const id of heldIds) endKitStatus(kitEffectState, characterId, id);
      onRoused(context, combatant, heldIds.length, rousedSeconds);
    },
  };
};
