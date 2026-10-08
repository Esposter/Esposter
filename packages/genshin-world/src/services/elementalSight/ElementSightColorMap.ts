import { Element } from "#src/models/Element";

// Provisional: the colour a thing with an element on it shows, the game's own hue for each element as its interface
// Paints the element's name (the persona plugin's nameplates keep the same table), until a recording measures the
// Highlight's colours
export const ElementSightColorMap: Record<Element, string> = {
  [Element.Anemo]: "#33ccb3",
  [Element.Cryo]: "#98c8e8",
  [Element.Dendro]: "#7bb42d",
  [Element.Electro]: "#d376f0",
  [Element.Geo]: "#cfa726",
  [Element.Hydro]: "#1c72fd",
  [Element.Pyro]: "#e2311d",
};
