import type { Element } from "#src/models/Element";
import type { EnergyDropKind } from "#src/models/shared/EnergyDropKind";

// A particle a reaction drops for the party's energy, of its own element, where an enemy's drop takes the element of the
// Hit that struck it
export interface ParticleDrop {
  count: number;
  element: Element;
  energyDropKind: EnergyDropKind;
}
