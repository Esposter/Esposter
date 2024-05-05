import type { TMXEmbeddedTilesetParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { TMXExternalTilesetParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXExternalTilesetParsed";

export type TMXTilesetParsed = TMXEmbeddedTilesetParsed | TMXExternalTilesetParsed;
