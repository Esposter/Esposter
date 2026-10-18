import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A shield took part of an enemy's strike on a party member: the owner that cast it, and the damage it took
export interface KitShieldAbsorbedEvent {
  amount: number;
  characterId: number;
  kind: KitEventKind.ShieldAbsorbed;
}
