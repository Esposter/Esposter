import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A character came on the field: the one that left it, absent when the battle opens on this one, and the one now on it
export interface KitCharacterSwappedEvent {
  characterId: number;
  kind: KitEventKind.CharacterSwapped;
  previousCharacterId?: number;
}
