import type { TMXEmbeddedTilesetShared } from "@/src/models/tmx/shared/TMXEmbeddedTilesetShared";
import type { TMXExternalTilesetShared } from "@/src/models/tmx/shared/TMXExternalTilesetShared";

export const isExternalTileset = (
  tileset: TMXEmbeddedTilesetShared | TMXExternalTilesetShared,
): tileset is TMXExternalTilesetShared => "source" in tileset;
