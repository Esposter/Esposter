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
export const SHRINE_KEY_NAME_PATTERN = /^(?<regionName>.+) Shrine of Depths Key$/u;
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
