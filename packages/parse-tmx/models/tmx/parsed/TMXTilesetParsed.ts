import type { TMXEmbeddedTilesetParsed } from "parse-tmx/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { TMXExternalTilesetParsed } from "parse-tmx/models/tmx/parsed/TMXExternalTilesetParsed";

export type TMXTilesetParsed = TMXEmbeddedTilesetParsed | TMXExternalTilesetParsed;
