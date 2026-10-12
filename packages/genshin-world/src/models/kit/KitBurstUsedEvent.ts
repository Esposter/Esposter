import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A member of the deployed team used its Elemental Burst: the member and the energy the burst cost
export interface KitBurstUsedEvent {
  characterId: number;
  energyCost: number;
  kind: KitEventKind.BurstUsed;
}
