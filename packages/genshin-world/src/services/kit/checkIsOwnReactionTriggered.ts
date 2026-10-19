import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitReactionTriggeredEvent } from "#src/models/kit/KitReactionTriggeredEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";

// Whether an event is a reaction the combatant itself triggered
export const checkIsOwnReactionTriggered = (
  event: KitEvent,
  combatant: Combatant,
): event is KitReactionTriggeredEvent =>
  event.kind === KitEventKind.ReactionTriggered && event.striker.characterId === combatant.characterId;
