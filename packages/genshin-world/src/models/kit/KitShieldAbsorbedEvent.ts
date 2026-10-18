import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A shield took part of an enemy's strike on a party member: the owner that cast it, the party member the strike was on,
// The damage it took, and the health it has left, none once the strike broke it
export interface KitShieldAbsorbedEvent {
  amount: number;
  characterId: number;
  health: number;
  kind: KitEventKind.ShieldAbsorbed;
  struckCharacterId: number;
}
