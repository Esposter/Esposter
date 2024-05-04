import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import type { TMXProperties } from "@/lib/tmxParser/models/tmx/TMXProperties";

export interface TMXTile {
  id: number;
  type: string;
  animation?: Record<string, TMXNode<TMXObject>[]>[];
  objectgroup?: Record<string, TMXNode<TMXObject>[]>[];
  probability?: number;
  properties: TMXProperties;
}
