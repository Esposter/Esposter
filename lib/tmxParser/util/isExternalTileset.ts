import type { TMXEmbeddedTilesetShared } from "@/lib/tmxParser/models/tmx/shared/TMXEmbeddedTilesetShared";
import type { TMXExternalTilesetShared } from "@/lib/tmxParser/models/tmx/shared/TMXExternalTilesetShared";

export const isExternalTileset = (
  tileset: TMXEmbeddedTilesetShared | TMXExternalTilesetShared,
): tileset is TMXExternalTilesetShared => "source" in tileset;
