import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { Party } from "#src/models/party/Party";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";

// Whether the event is a hit the combatant lands on an enemy while it is the active character on the field
export const checkIsActiveCharacterHit = (
  event: KitEvent,
  party: Party,
  combatant: Combatant,
): event is Extract<KitEvent, { kind: KitEventKind.DamageTaken }> =>
  event.kind === KitEventKind.DamageTaken &&
  event.striker.characterId === combatant.characterId &&
  getActiveCharacterId(party) === combatant.characterId;
