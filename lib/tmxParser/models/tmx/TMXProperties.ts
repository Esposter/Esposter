import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";

export type TMXProperties = Record<string, TMXNode<TMXObject>[]>[];
