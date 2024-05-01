import type { TMXLayerGroup } from "@/lib/tmxParser/models/tmx/TMXLayerGroup";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlattenedProperties } from "@/lib/tmxParser/util/getFlattenedProperties";
import { parseNode } from "@/lib/tmxParser/util/parseNode";

export const parseGroup = async (
  node: TMXNode<TMXLayerGroup>,
  expectedCount: number,
  translateFlips: boolean,
): Promise<TMXLayerGroup> =>
  Object.assign(
    {
      type: node["#name"],
      layers: Array.isArray(node.$$)
        ? await Promise.all(node.$$.map((l) => parseNode(l, expectedCount, translateFlips)))
        : [],
      ...getFlattenedProperties(node.properties),
    },
    ...getAttributes(node.$),
  );
