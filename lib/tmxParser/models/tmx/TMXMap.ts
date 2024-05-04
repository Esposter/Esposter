import type { TMXBaseTiledMap } from "@/lib/tmxParser/models/tmx/TMXBaseTiledMap";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";

export interface TMXMap extends TMXNode<TMXBaseTiledMap> {
  editorsettings: Record<string, unknown>[];
  tileset: Record<string, unknown>[];
  layer: Record<string, unknown>[];
  objectgroup: Record<string, unknown>[];
  group: Record<string, unknown>[];
}
