import type { GameLanguage, GameText } from "genshin-text";
import type { DevRegistry } from "genshin-world";
import type { GenshinSave } from "genshin-world/save";

// What the developer's save commands take from the page that holds the save: the registry they register into, the save the
// World last wrote and the apply that hands a changed save back to the page, and the game's data they read their names from
export interface GenshinDevSaveCommandsOptions {
  applySave: (save: GenshinSave) => void;
  devRegistry: DevRegistry;
  gameDataBaseUrl: string;
  gameText: GameText;
  getSave: () => GenshinSave;
  language: GameLanguage;
  regionDataBaseUrl: string;
}
