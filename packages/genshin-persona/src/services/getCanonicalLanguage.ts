import { getLanguageDisplayName } from "#src/services/getLanguageDisplayName";

// A language as the data package spells it, matched however the person typed it — by that spelling, or by the
// Language's own name for itself, which is the one the verbs print and therefore the one they invite. Nothing when
// It names none of them
export const getCanonicalLanguage = <T extends string>(languageNames: T[], name: string): T | undefined =>
  languageNames.find(
    (languageName) =>
      languageName.toLowerCase() === name.toLowerCase() ||
      getLanguageDisplayName(languageName, languageName).toLowerCase() === name.toLowerCase(),
  );
