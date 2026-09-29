/* eslint-disable perfectionist/sort-enums -- declaration order is the game's element order, which ElementTypes lists */
export enum ElementType {
  Pyro = "Pyro",
  Hydro = "Hydro",
  Anemo = "Anemo",
  Electro = "Electro",
  Dendro = "Dendro",
  Cryo = "Cryo",
  Geo = "Geo",
}

// In the order the game lays the elements out, as its loading row does
export const ElementTypes: ElementType[] = Object.values(ElementType);
