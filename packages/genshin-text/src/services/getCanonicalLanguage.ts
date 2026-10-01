import type { GameLanguage } from "#src/models/GameLanguage";

import { GameLanguages } from "#src/models/GameLanguage";
import { getLanguageDisplayName } from "#src/services/getLanguageDisplayName";

// A game language matched however a person typed it — by its English spelling, or by the language's own name for
// Itself, which is the one a list of languages shows and therefore the one it invites. Nothing when it names none
export const getCanonicalLanguage = (name: string): GameLanguage | undefined =>
  GameLanguages.find(
    (language) =>
      language.toLowerCase() === name.toLowerCase() ||
      getLanguageDisplayName(language, language).toLowerCase() === name.toLowerCase(),
  );
