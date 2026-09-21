import type { Localization } from "#src/models/Localization";
import type { LocalizationStrings } from "#src/models/LocalizationStrings";

// A localization with every string present: the language's own where it has one and English's where it has not,
// Merged once on the way out of `readLocalization` so no reader falls back a second time. English is authored as
// One of these, which is what makes it the language every other inherits from
export interface ResolvedLocalization extends Localization {
  strings: LocalizationStrings;
}
