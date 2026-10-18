import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";

// A hit that lands on a character: a strike that costs it HP with no kit as the source, or a shield taking a strike for
// It. A drown reads the same as the HP loss, as the record gives it no cause
const checkIsHitOn = (event: KitEvent, characterId: number): boolean =>
  event.kind === KitEventKind.ShieldAbsorbed
    ? event.struckCharacterId === characterId
    : event.kind === KitEventKind.HealthChanged &&
      event.characterId === characterId &&
      event.healthShare < 0 &&
      event.sourceCharacterId === undefined;

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
  if (!isSkillHeld || activeCombatant.characterId !== characterId || !checkIsHitOn(event, characterId)) return;
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining: seconds });
};
