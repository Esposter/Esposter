import type { Localization } from "#src/models/Localization";
import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import { GameTextLoaderMap } from "#src/generated/genshinText/generated/GameTextLoaderMap";
import { getCanonicalLanguage } from "#src/generated/genshinText/services/getCanonicalLanguage";
import english from "#src/localizations/english";
import { DEFAULT_LANGUAGE, LOCALIZATIONS_DIRECTORY } from "#src/services/constants";
import { readPersonaModule } from "#src/services/readPersonaModule";

// The words that are ours in the interface language: the language's own module over English's, merged per string so
// A language that has translated its spinner and not its verbs' output shows each in the language it has, beside the
// Game's own words in it. A game language with no module is English here for our words and still the game's own for
// Its; a name that is no game language at all is English throughout
export const readLocalization = async (language: string): Promise<ResolvedLocalization> => {
  const gameLanguage = getCanonicalLanguage(language);
  if (!gameLanguage || gameLanguage === DEFAULT_LANGUAGE) return english;

  const gameText = await GameTextLoaderMap[gameLanguage]();
  const localization = await readPersonaModule<Localization>(LOCALIZATIONS_DIRECTORY, gameLanguage);
  return localization
    ? { ...localization, gameText, strings: { ...english.strings, ...localization.strings } }
    : { ...english, gameText };
};
