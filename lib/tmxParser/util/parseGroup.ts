import type { TMXLayerGroup } from "@/lib/tmxParser/models/tmx/TMXLayerGroup";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlattenedProperties } from "@/lib/tmxParser/util/getFlattenedProperties";
import { parseNode } from "@/lib/tmxParser/util/parseNode";

export const parseGroup = async (
  node: TMXNode<TMXLayerGroup>,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayerGroup> => {
  const { $, $$, properties } = node;
  const group: Record<string, unknown> = { type: node["#name"] };
  if (Array.isArray($$)) group.layers = await Promise.all($$.map((l) => parseNode(l, expectedCount, translateFlips)));
  return Object.assign({ ...group, ...getFlattenedProperties(properties) }, ...getAttributes($));
};
