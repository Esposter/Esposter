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
