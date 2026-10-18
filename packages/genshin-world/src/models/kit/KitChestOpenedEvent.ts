import type { KitEventKind } from "#src/models/kit/KitEventKind";

// The character on the field opened a chest in the world
export interface KitChestOpenedEvent {
  characterId: number;
  kind: KitEventKind.ChestOpened;
}
