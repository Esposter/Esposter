import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";

// The attribute each element's RES is summed into, which a hit of that element is resisted by
export const ElementResistanceAttributeMap: Readonly<Record<Element, Attribute>> = {
  [Element.Anemo]: Attribute.AnemoResistance,
  [Element.Cryo]: Attribute.CryoResistance,
  [Element.Dendro]: Attribute.DendroResistance,
  [Element.Electro]: Attribute.ElectroResistance,
  [Element.Geo]: Attribute.GeoResistance,
  [Element.Hydro]: Attribute.HydroResistance,
  [Element.Pyro]: Attribute.PyroResistance,
};
