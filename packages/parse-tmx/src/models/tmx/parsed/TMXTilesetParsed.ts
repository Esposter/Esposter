import type { TMXEmbeddedTilesetParsed } from "@/src/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { TMXExternalTilesetParsed } from "@/src/models/tmx/parsed/TMXExternalTilesetParsed";

export type TMXTilesetParsed = TMXEmbeddedTilesetParsed | TMXExternalTilesetParsed;
