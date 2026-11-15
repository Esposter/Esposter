// A part of the game whose assets are exported and fitted together, named by the folder its exports go in
export const DerivedAssetComponent = {
  Character: "character",
  Fontaine: "fontaine",
  Hud: "hud",
  Inazuma: "inazuma",
  Liyue: "liyue",
  Login: "login",
  Mondstadt: "mondstadt",
  Natlan: "natlan",
  NodKrai: "nod-krai",
  PlayerGirl: "playergirl",
  Props: "props",
  Snezhnaya: "snezhnaya",
  Sumeru: "sumeru",
  Traveler: "traveler",
  Weapons: "weapons",
  Windrise: "windrise",
} as const;
export type DerivedAssetComponent = (typeof DerivedAssetComponent)[keyof typeof DerivedAssetComponent];
