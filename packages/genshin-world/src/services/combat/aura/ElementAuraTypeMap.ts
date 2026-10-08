import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";

// The aura each element leaves on a target. Anemo and Geo leave none
export const ElementAuraTypeMap: Partial<Record<Element, AuraType>> = {
  [Element.Cryo]: AuraType.Cryo,
  [Element.Dendro]: AuraType.Dendro,
  [Element.Electro]: AuraType.Electro,
  [Element.Hydro]: AuraType.Hydro,
  [Element.Pyro]: AuraType.Pyro,
};
