// The colour per element, as the game's interface paints the element's name: what a character with no row in
// `CharacterColorMap` yet is drawn in, and an element missing here too (the player character's "None") leaves the
// Mods in their own accent
export const ElementColorMap: Record<string, string> = {
  Anemo: "#33ccb3",
  Cryo: "#98c8e8",
  Dendro: "#7bb42d",
  Electro: "#d376f0",
  Geo: "#cfa726",
  Hydro: "#1c72fd",
  Pyro: "#e2311d",
};
