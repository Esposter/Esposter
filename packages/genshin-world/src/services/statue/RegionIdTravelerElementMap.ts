import { Element } from "#src/models/Element";

// The element the Traveler takes from a region's statue, by the region's id in the save. Natlan's is not here until its
// Quest step the wiki names is read, so a resonance there leaves the Traveler's element as the last region gave it
export const RegionIdTravelerElementMap: Partial<Readonly<Record<string, Element>>> = {
  fontaine: Element.Hydro,
  inazuma: Element.Electro,
  liyue: Element.Geo,
  mondstadt: Element.Anemo,
  snezhnaya: Element.Cryo,
  sumeru: Element.Dendro,
};
