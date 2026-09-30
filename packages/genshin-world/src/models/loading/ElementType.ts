export enum ElementType {
  Anemo = "Anemo",
  Cryo = "Cryo",
  Dendro = "Dendro",
  Electro = "Electro",
  Geo = "Geo",
  Hydro = "Hydro",
  Pyro = "Pyro",
}

// In the order the game lays the elements out, as its loading row does. It is written out, since lint sorts an enum's
// Members and the enum's own order is alphabetical
export const ElementTypes: ElementType[] = [
  ElementType.Pyro,
  ElementType.Hydro,
  ElementType.Anemo,
  ElementType.Electro,
  ElementType.Dendro,
  ElementType.Cryo,
  ElementType.Geo,
];
