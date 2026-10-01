// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
import type { GameLanguage } from "#src/generated/genshinText/models/GameLanguage";

import { GameLanguages } from "#src/generated/genshinText/models/GameLanguage";

// Widened to strings, so a name read off a state file or typed by a person can be looked up in it
const gameLanguageNames: readonly string[] = GameLanguages;

export const checkIsGameLanguage = (name: string): name is GameLanguage => gameLanguageNames.includes(name);
