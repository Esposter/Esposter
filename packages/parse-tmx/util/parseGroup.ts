import type { TMXGroupLayerNode } from "parse-tmx/models/tmx/node/TMXGroupLayerNode";
import type { TMXGroupLayerParsed } from "parse-tmx/models/tmx/parsed/TMXGroupLayerParsed";
import { parseNode } from "parse-tmx/util/parseNode";

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
