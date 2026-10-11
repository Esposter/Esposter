import type { KitEventKind } from "#src/models/kit/KitEventKind";

// The character on the field picked up Mora lying in the world
export interface KitMoraPickedUpEvent {
  characterId: number;
  kind: KitEventKind.MoraPickedUp;
}
