// The seven elements, each spelt as the game's own tables spell it, so a table read from the game parses into them
export enum Element {
  Anemo = "Wind",
  Cryo = "Ice",
  Dendro = "Grass",
  Electro = "Electric",
  Geo = "Rock",
  Hydro = "Water",
  Pyro = "Fire",
}

// In the order the game lays the elements out, as its loading row does. It is written out, since lint sorts an enum's
// Members and the enum's own order is alphabetical
export const Elements: Element[] = [
  Element.Pyro,
  Element.Hydro,
  Element.Anemo,
  Element.Electro,
  Element.Dendro,
  Element.Cryo,
  Element.Geo,
];
