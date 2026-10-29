import type { GameLanguage } from "genshin-text";

import { ALL_LANGUAGES_ARGUMENT } from "#src/services/genshinText/constants";
import { parseGameLanguages } from "#src/services/genshinText/parseGameLanguages";
import { GameLanguages } from "genshin-text";

// The languages a `--languages` argument asks for: every one the game is written in for `all`, else the comma-separated
// tags it names
export const getRequestedLanguages = (languagesArgument: string): GameLanguage[] =>
  languagesArgument === ALL_LANGUAGES_ARGUMENT ? [...GameLanguages] : parseGameLanguages(languagesArgument.split(","));
