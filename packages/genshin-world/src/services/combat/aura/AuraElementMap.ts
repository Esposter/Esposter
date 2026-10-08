import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";

// The element each aura shows as. Quicken is Dendro and Electro at once, so it names no one element and is none
export const AuraElementMap: Partial<Record<AuraType, Element>> = {
  [AuraType.Burning]: Element.Pyro,
  [AuraType.Cryo]: Element.Cryo,
  [AuraType.Dendro]: Element.Dendro,
  [AuraType.Electro]: Element.Electro,
  [AuraType.Freeze]: Element.Cryo,
  [AuraType.Hydro]: Element.Hydro,
  [AuraType.Pyro]: Element.Pyro,
};
