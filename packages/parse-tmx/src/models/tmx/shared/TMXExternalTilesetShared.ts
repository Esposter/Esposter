import type { TMXBaseTilesetShared } from "@/src/models/tmx/shared/TMXBaseTilesetShared";

export interface TMXExternalTilesetShared extends TMXBaseTilesetShared {
  source: string;
}
