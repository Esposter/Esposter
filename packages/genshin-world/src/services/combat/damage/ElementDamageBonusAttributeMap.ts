import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";

// The attribute each element's damage bonus is summed into, which a hit of that element takes
export const ElementDamageBonusAttributeMap: Record<Element, Attribute> = {
  [Element.Anemo]: Attribute.AnemoDamageBonus,
  [Element.Cryo]: Attribute.CryoDamageBonus,
  [Element.Dendro]: Attribute.DendroDamageBonus,
  [Element.Electro]: Attribute.ElectroDamageBonus,
  [Element.Geo]: Attribute.GeoDamageBonus,
  [Element.Hydro]: Attribute.HydroDamageBonus,
  [Element.Pyro]: Attribute.PyroDamageBonus,
};
