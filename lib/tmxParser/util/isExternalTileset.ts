import type { TMXExternalTileset } from "@/lib/tmxParser/models/tmx/TMXExternalTileset";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";

export const isExternalTileset = (tileset: TMXTileset): tileset is TMXExternalTileset => "source" in tileset;
