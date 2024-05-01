import type { BaseTMXTiledMap } from "@/lib/tmxParser/models/tmx/BaseTMXTiledMap";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";

export interface TMXMap extends TMXNode<BaseTMXTiledMap> {
  editorsettings: Record<string, unknown>[];
  tileset: Record<string, unknown>[];
  layer: Record<string, unknown>[];
  objectgroup: Record<string, unknown>[];
  group: Record<string, unknown>[];
}
