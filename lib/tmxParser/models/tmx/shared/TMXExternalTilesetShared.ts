import type { TMXBaseTilesetShared } from "@/lib/tmxParser/models/tmx/shared/TMXBaseTilesetShared";

export interface TMXExternalTilesetShared extends TMXBaseTilesetShared {
  source: string;
}
