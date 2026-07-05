import type { TMXGroupLayerNode } from "@/models/tmx/node/TMXGroupLayerNode";
import type { TMXGroupLayerParsed } from "@/models/tmx/parsed/TMXGroupLayerParsed";

import { cloneNodeWithType } from "@/util/cloneNodeWithType";
import { parseNode } from "@/util/parseNode";

export const parseGroup = async (
  node: TMXGroupLayerNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXGroupLayerParsed> => {
  const { $$ } = node;
  const group = cloneNodeWithType<TMXGroupLayerParsed>(node);
  group.layers = await Promise.all($$.map((l) => parseNode(l, expectedCount, translateFlips)));
  return group;
};
