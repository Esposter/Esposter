import type { LocalizationStrings } from "#src/models/LocalizationStrings";
import type { LocalizedPersonaCard } from "#src/models/LocalizedPersonaCard";
import type { SpinnerContent } from "#src/models/SpinnerContent";

// One authored module per language for the words the data package does not carry, named for the language the way a
// Card is named for its character. Everything the data package does carry — a character's name, title, element,
// Region, description and their own voice lines — is localized by asking it and is absent here by construction.
// Only English fills every string; every other module fills what it has translated and inherits the rest, so a
// Language ships in as many passes as it takes
export interface Localization extends SpinnerContent {
  // The person's half of each card in this language, keyed by the character's English name, which is the identity
  // Every state file and every lookup uses. A character with no gerunds here shows the base verbs alone rather than
  // The card's English ones behind localized ones, so a half-translated language never mixes two scripts in one
  // Spinner — which is why the test is this module's words rather than the language's name, as `readSpinner`
  // Explains. A character with no greeting here is greeted in the card's own words, since one line in another
  // Script is a queue item rather than a broken spinner
  characters: Record<string, LocalizedPersonaCard>;
  // What `Intl` formats against wherever a word is the runtime's rather than ours: the birthday aside's date and
  // Its distance, and the list a verb offers a choice from
  locale: string;
  strings: Partial<LocalizationStrings>;
}
