import type { GameText } from "#src/generated/genshinText/models/GameText";
import type { Localization } from "#src/models/Localization";
import type { LocalizationStrings } from "#src/models/LocalizationStrings";

// A localization with every string present: the language's own where it has one and English's where it has not,
// Merged once on the way out of `readLocalization` so no reader falls back a second time, beside the words the game
// Itself says in that language, which no module authors. English is authored as one of these, which is what makes it
// The language every other inherits from
export interface ResolvedLocalization extends Localization {
  gameText: GameText;
  strings: LocalizationStrings;
}
