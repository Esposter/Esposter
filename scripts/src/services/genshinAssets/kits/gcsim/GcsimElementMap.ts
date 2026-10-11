import { Element } from "genshin-world";

// The elements gcsim names in an `AttackInfo` literal, the game's own as the kit names them
export const GcsimElementMap: Partial<Record<string, Element>> = {
  "attributes.Anemo": Element.Anemo,
  "attributes.Cryo": Element.Cryo,
  "attributes.Dendro": Element.Dendro,
  "attributes.Electro": Element.Electro,
  "attributes.Geo": Element.Geo,
  "attributes.Hydro": Element.Hydro,
  "attributes.Pyro": Element.Pyro,
};
