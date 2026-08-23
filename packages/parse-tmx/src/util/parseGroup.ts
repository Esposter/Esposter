import type { TMXGroupLayerNode } from "#src/models/tmx/node/TMXGroupLayerNode";
import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";

import { cloneNodeWithType } from "#src/util/cloneNodeWithType";
import { parseNode } from "#src/util/parseNode";

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
