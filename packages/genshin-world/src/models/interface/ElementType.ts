export enum ElementType {
  Anemo = "Anemo",
  Cryo = "Cryo",
  Dendro = "Dendro",
  Electro = "Electro",
  Geo = "Geo",
  Hydro = "Hydro",
  Pyro = "Pyro",
}

// In the order the game lays the elements out, as its loading row does
export const ElementTypes: ElementType[] = [
  ElementType.Pyro,
  ElementType.Hydro,
  ElementType.Anemo,
  ElementType.Electro,
  ElementType.Dendro,
  ElementType.Cryo,
  ElementType.Geo,
];
