import type { TMXLayerGroupNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerGroupNode";
import type { TMXLayerGroupParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerGroupParsed";
import { parseNode } from "@/lib/tmxParser/util/parseNode";

export const parseGroup = async (
  node: TMXLayerGroupNode,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayerGroupParsed> => {
  const { $, $$ } = node;
  const group = structuredClone($) as TMXLayerGroupParsed;
  group.type = node["#name"] as string;
  if ($$) group.layers = await Promise.all($$.map((l) => parseNode(l, expectedCount, translateFlips)));
  return group;
};
