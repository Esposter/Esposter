import type { DevVariable } from "#src/models/dev/DevVariable";
import type { PostPipeline } from "genshin-engine";

import { LOOK_BLOOM_GROUP, TUNING_DOUBLE_UNIT_RANGE, TUNING_UNIT_RANGE } from "#src/services/tuning/constants";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";

export const createBloomVariables = ({ bloomNode }: Pick<PostPipeline, "bloomNode">): DevVariable[] =>
  bloomNode
    ? [
        createNumberVariable(bloomNode.strength, "value", {
          group: LOOK_BLOOM_GROUP,
          name: "bloom strength",
          range: TUNING_DOUBLE_UNIT_RANGE,
        }),
        createNumberVariable(bloomNode.radius, "value", {
          group: LOOK_BLOOM_GROUP,
          name: "bloom radius",
          range: TUNING_UNIT_RANGE,
        }),
        createNumberVariable(bloomNode.threshold, "value", {
          group: LOOK_BLOOM_GROUP,
          name: "bloom threshold",
          range: TUNING_UNIT_RANGE,
        }),
      ]
    : [];
