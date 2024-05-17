import type { TMXEmbeddedTilesetShared } from "@/models/tmx/shared/TMXEmbeddedTilesetShared";
import type { TMXExternalTilesetShared } from "@/models/tmx/shared/TMXExternalTilesetShared";

export const isExternalTileset = (
  tileset: TMXEmbeddedTilesetShared | TMXExternalTilesetShared,
): tileset is TMXExternalTilesetShared => "source" in tileset;
