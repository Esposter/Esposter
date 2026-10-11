import type { KitEventKind } from "#src/models/kit/KitEventKind";

// Another character came on the field: the one that left it and the one now on it
export interface KitCharacterSwappedEvent {
  characterId: number;
  kind: KitEventKind.CharacterSwapped;
  previousCharacterId: number;
}
