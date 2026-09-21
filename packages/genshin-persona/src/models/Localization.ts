import type { LocalizationStrings } from "#src/models/LocalizationStrings";
import type { SpinnerContent } from "#src/models/SpinnerContent";

// One authored module per language for the words the data package does not carry, named for the language the way a
// Card is named for its character. Everything the data package does carry — a character's name, title, element,
// Region, description and their own voice lines — is localized by asking it and is absent here by construction.
// Only English fills every string; every other module fills what it has translated and inherits the rest, so a
// Language ships in as many passes as it takes
export interface Localization extends SpinnerContent {
  // The spinner gerunds of one character, keyed by that character's English name, which is the identity every state
  // File and every lookup uses. A character with no entry shows the base verbs alone rather than English ones, so a
  // Half-translated language never mixes two scripts in one spinner
  characterVerbs: Record<string, string[]>;
  // What the birthday aside's date is formatted against
  dateLocale: string;
  strings: Partial<LocalizationStrings>;
}
