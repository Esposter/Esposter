import type { TMXEmbeddedTilesetShared } from "parse-tmx/models/tmx/shared/TMXEmbeddedTilesetShared";
import type { TMXExternalTilesetShared } from "parse-tmx/models/tmx/shared/TMXExternalTilesetShared";

export const isExternalTileset = (
  tileset: TMXEmbeddedTilesetShared | TMXExternalTilesetShared,
): tileset is TMXExternalTilesetShared => "source" in tileset;
