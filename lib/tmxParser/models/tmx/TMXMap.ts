import type { TMXBaseTiledMap } from "@/lib/tmxParser/models/tmx/TMXBaseTiledMap";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";

export interface TMXMap extends TMXNode<TMXBaseTiledMap> {
  editorsettings: Record<string, TMXNode<TMXObject>[]>[];
  tileset: Record<string, TMXNode<TMXObject>[]>[];
  layer: Record<string, TMXNode<TMXObject>[]>[];
  objectgroup: Record<string, TMXNode<TMXObject>[]>[];
  group: Record<string, TMXNode<TMXObject>[]>[];
}
