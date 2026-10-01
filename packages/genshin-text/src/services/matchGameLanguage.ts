import { GameLanguage, GameLanguages } from "#src/models/GameLanguage";
import { GameLanguageTagMap } from "#src/services/GameLanguageTagMap";
import { getResult } from "@esposter/shared";

const getMaximizedLocale = (tag: string): Intl.Locale | undefined =>
  getResult(() => new Intl.Locale(tag).maximize()).match(
    (locale) => locale,
    () => undefined,
  );
// The game language nearest a reader's own preference list — a browser's `navigator.languages` or the tags of an
// `Accept-Language` header, most preferred first. A tag matches on its language and, once both sides are maximized,
// Its script, so `zh-TW` reads Traditional and `zh-CN` Simplified while `pt-BR` and `en-GB` take the one Portuguese
// And English the game has. A tag that is not well formed is skipped rather than thrown on, since a header is
// Anyone's to write. English when nothing matches, the language the game falls back to as well
export const matchGameLanguage = (preferredTags: readonly string[]): GameLanguage => {
  for (const preferredTag of preferredTags) {
    const preferredLocale = getMaximizedLocale(preferredTag);
    if (!preferredLocale) continue;

    const language = GameLanguages.find((gameLanguage) => {
      const gameLocale = new Intl.Locale(GameLanguageTagMap[gameLanguage]).maximize();
      return gameLocale.language === preferredLocale.language && gameLocale.script === preferredLocale.script;
    });
    if (language) return language;
  }

  return GameLanguage.English;
};
