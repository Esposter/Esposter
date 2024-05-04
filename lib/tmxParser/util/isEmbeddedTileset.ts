import type { TMXEmbeddedTileset } from "@/lib/tmxParser/models/tmx/TMXEmbeddedTileset";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";

export const isEmbeddedTileset = (tileset: TMXTileset): tileset is TMXEmbeddedTileset => "image" in tileset;
