import type { GameLanguage } from "#src/models/GameLanguage";

import { GameLanguages } from "#src/models/GameLanguage";

// Widened to strings, so a name read off a state file or typed by a person can be looked up in it
const GAME_LANGUAGE_NAMES: readonly string[] = GameLanguages;

export const checkIsGameLanguage = (name: string): name is GameLanguage => GAME_LANGUAGE_NAMES.includes(name);
