import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";

// Whether an event is damage an enemy took from a hit the combatant itself dealt
export const checkIsOwnDamageTaken = (event: KitEvent, combatant: Combatant): event is KitDamageTakenEvent =>
  event.kind === KitEventKind.DamageTaken && event.striker.characterId === combatant.characterId;
