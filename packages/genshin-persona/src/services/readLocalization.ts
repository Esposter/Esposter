import type { Localization } from "#src/models/Localization";
import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import english from "#src/localizations/english";
import { DEFAULT_LANGUAGE, LOCALIZATIONS_DIRECTORY } from "#src/services/constants";
import { readPersonaModule } from "#src/services/readPersonaModule";

// The words that are ours in the interface language: the language's own module over English's, merged per string so
// A language that has translated its spinner and not its verbs' output shows each in the language it has. A language
// With no module at all is English here and still localized everywhere the data package answers
export const readLocalization = async (language: string): Promise<ResolvedLocalization> => {
  if (language === DEFAULT_LANGUAGE) return english;

  const localization = await readPersonaModule<Localization>(LOCALIZATIONS_DIRECTORY, language);
  return localization ? { ...localization, strings: { ...english.strings, ...localization.strings } } : english;
};
