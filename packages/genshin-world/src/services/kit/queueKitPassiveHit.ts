import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

// A hit a passive owns, dealt by its wielder from the body it stands on: queued to strike in the step it is raised in,
// With no attack tag, so it counts as no normal or charged attack for energy or speed
export const queueKitPassiveHit = (context: KitContext, combatant: Combatant, hit: KitHit): void => {
  context.strikes.push({ body: context.body, combatant, hit });
};
