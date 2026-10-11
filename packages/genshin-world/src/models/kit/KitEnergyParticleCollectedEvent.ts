import type { Element } from "#src/models/Element";
import type { KitEventKind } from "#src/models/kit/KitEventKind";
import type { EnergyDropKind } from "#src/models/shared/EnergyDropKind";

// Particles or orbs reached the party: the member on the field who collected them, how many of them and which of the two
// They were, and their element, none for a clear one. Every standing member has already taken their energy, the one on
// The field in full and the others a share by the party's size
export interface KitEnergyParticleCollectedEvent {
  characterId: number;
  count: number;
  element?: Element;
  energyDropKind: EnergyDropKind;
  kind: KitEventKind.EnergyParticleCollected;
}
