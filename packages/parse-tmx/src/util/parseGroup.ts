import type { TMXGroupLayerNode } from "@/models/tmx/node/TMXGroupLayerNode";
import type { TMXGroupLayerParsed } from "@/models/tmx/parsed/TMXGroupLayerParsed";

import { parseNode } from "@/util/parseNode";

export const parseGroup = async (
  node: TMXGroupLayerNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXGroupLayerParsed> => {
  const { $, $$ } = node;
  const group = structuredClone($) as TMXGroupLayerParsed;
  group.type = node["#name"] as string;
  group.layers = await Promise.all($$.map((l) => parseNode(l, expectedCount, translateFlips)));
  return group;
};
