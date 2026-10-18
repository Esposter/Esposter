import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A shield took part of an enemy's strike on a party member: the owner that cast it, the party member the strike was on,
// And the damage it took
export interface KitShieldAbsorbedEvent {
  amount: number;
  characterId: number;
  kind: KitEventKind.ShieldAbsorbed;
  struckCharacterId: number;
}
