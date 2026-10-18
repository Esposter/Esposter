import type { MonumentKindTiming } from "#src/models/genshinAssets/puzzles/MonumentKindTiming";

import { Element } from "genshin-world";

// The element an Elemental Monument is lit by where the wiki gives none. Its monument page names seven element variants
// And shows only Pyro's temporary monument, so Pyro stands in until a recording measures the place's own element
export const PROVISIONAL_MONUMENT_ELEMENT = Element.Pyro;
// Whether an Elemental Monument goes out after its time where the wiki gives none. The Pyro monument is the one the
// Wiki shows as temporary, so a timed monument stands in until a recording measures the place's own timing
export const PROVISIONAL_MONUMENT_IS_TIMED = true;
// What the wiki's Elemental Monument page gives a Mondstadt monument: no element, since it names none per place, and no
// Timing, since its one temporary variant is not tied to a place. Every Mondstadt monument is therefore provisional
export const ELEMENTAL_MONUMENT_WIKI_TIMING: MonumentKindTiming = {};
// A Shrine of Depths key's English name, the region it names first, as the key's source takes its region
export const SHRINE_KEY_NAME_REGEX = /^(?<regionName>.+) Shrine of Depths Key$/u;
// Each region a Shrine of Depths key can name, by the name the key's English name gives it, as the slug the world's
// Regions take. A key naming a region not here is left out and noted, never guessed at
export const SHRINE_KEY_REGIONS: Readonly<Record<string, string>> = {
  Fontaine: "fontaine",
  Inazuma: "inazuma",
  Liyue: "liyue",
  Mondstadt: "mondstadt",
  Natlan: "natlan",
  Snezhnaya: "snezhnaya",
  Sumeru: "sumeru",
};
// The Seelie page's count of each region's own Seelie, Electro Seelie included, from its Locations list. Its sub-areas count
// Apart, the Chasm and Chenyu Vale from Liyue and the Dragonspine, Windrest Peak and Temple of Space from Mondstadt, so a
// Region's published count can differ from its wiki count by theirs
export const SEELIE_WIKI_COUNTS: Readonly<Record<string, number>> = {
  fontaine: 68,
  inazuma: 110,
  liyue: 81,
  mondstadt: 51,
  snezhnaya: 13,
  sumeru: 154,
};
