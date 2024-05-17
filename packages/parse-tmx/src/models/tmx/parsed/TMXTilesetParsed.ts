import type { TMXEmbeddedTilesetParsed } from "@/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { TMXExternalTilesetParsed } from "@/models/tmx/parsed/TMXExternalTilesetParsed";

export type TMXTilesetParsed = TMXEmbeddedTilesetParsed | TMXExternalTilesetParsed;
