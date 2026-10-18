import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";

// Whether an event is a strike on a character: HP it loses with no kit as the source, or a shield on it absorbing a
// Strike. A drown reads the same as the HP loss, as the record gives it no cause
export const checkIsStrikeOn = (event: KitEvent, characterId: number): boolean =>
  (event.kind === KitEventKind.HealthChanged &&
    event.characterId === characterId &&
    event.healthShare < 0 &&
    event.sourceCharacterId === undefined) ||
  (event.kind === KitEventKind.ShieldAbsorbed && event.struckCharacterId === characterId);
