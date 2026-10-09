import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The widget config as the AnimeGameData Repository lays it out per patch, under the game's text folder like the tables
export const CONFIG_WIDGET_PATH: string = join(GAME_TEXT_DIRECTORY, "BinOutput", "Widget", "ConfigWidget.json");
// Where the gadgets are written, the world's generated folder they are imported on demand from
export const GADGET_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "gadgets",
);
export const GADGETS_PATH: string = join(GADGET_GENERATED_DIRECTORY, "gadgets.json");
