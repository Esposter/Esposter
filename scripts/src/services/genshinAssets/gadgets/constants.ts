import { BIN_OUTPUT_DIRECTORY, GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { join } from "node:path";

// The widget config as the AnimeGameData Repository lays it out per patch, under the game's text folder like the tables
export const CONFIG_WIDGET_PATH: string = join(
  GAME_TEXT_DIRECTORY,
  BIN_OUTPUT_DIRECTORY,
  "Widget",
  "ConfigWidget.json",
);
