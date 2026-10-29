import type { GameLanguage } from "genshin-text";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguages, GameLanguageTagMap } from "genshin-text";

// The languages named by their BCP-47 tags, as the game-data package spells them. A tag that names none of the game's
// languages throws
export const parseGameLanguages = (languageTags: string[]): GameLanguage[] =>
  languageTags.map((languageTag) => {
    const tag = languageTag.trim();
    const language = GameLanguages.find(
      (candidate) => GameLanguageTagMap[candidate].toLowerCase() === tag.toLowerCase(),
    );
    if (language === undefined)
      throw new InvalidOperationError(Operation.Read, tag, "is not the tag of a language the game is written in");

    return language;
  });
