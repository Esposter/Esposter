import type { TMXBaseTilesetShared } from "@/models/tmx/shared/TMXBaseTilesetShared";

export interface TMXExternalTilesetShared extends TMXBaseTilesetShared {
  source: string;
}
