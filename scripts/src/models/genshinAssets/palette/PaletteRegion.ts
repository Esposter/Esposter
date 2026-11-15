// The regions whose building palette is sampled, each named as its extraction folder is
export const PaletteRegion = {
  Fontaine: "fontaine",
  Inazuma: "inazuma",
  Liyue: "liyue",
  Mondstadt: "mondstadt",
  Natlan: "natlan",
  NodKrai: "nod-krai",
  Sumeru: "sumeru",
} as const;
export type PaletteRegion = (typeof PaletteRegion)[keyof typeof PaletteRegion];
