import type { TMXLayerGroup } from "@/lib/tmxParser/models/tmx/TMXLayerGroup";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { parseNode } from "@/lib/tmxParser/util/parseNode";
import { parseProperties } from "@/lib/tmxParser/util/parseProperties";

export const parseGroup = async (
  node: TMXNode<TMXLayerGroup>,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayerGroup> => {
  const { $, $$, properties } = node;
  const group: Record<string, unknown> = { type: node["#name"] };
  if ($$) group.layers = await Promise.all($$.map((l) => parseNode(l, expectedCount, translateFlips)));
  return Object.assign({ ...group, properties: parseProperties(properties) }, ...getAttributes($));
};
