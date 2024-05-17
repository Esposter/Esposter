import type { TMXGroupLayerNode } from "@/src/models/tmx/node/TMXGroupLayerNode";
import type { TMXGroupLayerParsed } from "@/src/models/tmx/parsed/TMXGroupLayerParsed";
import { parseNode } from "@/src/util/parseNode";

export const parseGroup = async (
  node: TMXGroupLayerNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXGroupLayerParsed> => {
  const { $, $$ } = node;
  const group = structuredClone($) as TMXGroupLayerParsed;
  group.type = node["#name"] as string;
  if ($$) group.layers = await Promise.all($$.map((l) => parseNode(l, expectedCount, translateFlips)));
  return group;
};
