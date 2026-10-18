import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { checkIsStrikeOn } from "#src/services/kit/checkIsStrikeOn";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";

// Opens a counter window on a character for its seconds, as a status of its id that runs out on its own, and a second
// Opening restarts it. It opens only on a hit that lands on the character on the field while its skill is held, as the
// Context's `isSkillHeld` gives it for the step, so a hit taken on any other step opens nothing
export const openKitCounterWindow = (
  context: KitContext,
  event: KitEvent,
  characterId: number,
  { id, seconds }: { id: string; seconds: number },
): void => {
  const { activeCombatant, isSkillHeld, kitEffectState } = context;
  if (!isSkillHeld || activeCombatant.characterId !== characterId || !checkIsStrikeOn(event, characterId)) return;
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining: seconds });
};
