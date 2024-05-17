import type { TMXBaseTilesetShared } from "parse-tmx/models/tmx/shared/TMXBaseTilesetShared";

export interface TMXExternalTilesetShared extends TMXBaseTilesetShared {
  source: string;
}
