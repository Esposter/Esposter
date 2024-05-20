import type { TeleportId } from "@/generated/tiled/propertyTypes/enum/TeleportId";
import type { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";

export interface TeleportTarget {
  id: TeleportId;
  tilemapKey: TilemapKey;
}
