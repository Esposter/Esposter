import { BIN_OUTPUT_DIRECTORY, GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { join } from "node:path";

// The widget config as the AnimeGameData Repository lays it out per patch, under the game's text folder like the tables
export const CONFIG_WIDGET_PATH: string = join(
  GAME_TEXT_DIRECTORY,
  BIN_OUTPUT_DIRECTORY,
  "Widget",
  "ConfigWidget.json",
);
// The Serenitea Pot's item, which is also its gadget's id. The widget config names no widget under it, so its row is built
// From its material row instead
export const SERENITEA_POT_ITEM_ID = 220026;
