import type { DevVariable } from "#src/models/dev/DevVariable";
import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";
import type { PostPipeline } from "genshin-engine";

import { LOOK_GOD_RAYS_GROUP, TUNING_UNIT_RANGE } from "#src/services/tuning/constants";
import { createColourVariable } from "#src/services/tuning/createColourVariable";
import { createNumberVariable } from "#src/services/tuning/createNumberVariable";

export const createGodRaysVariables = ({
  godraysNode,
  postUniforms,
}: Pick<GenshinTuningOptions, "postUniforms"> & Pick<PostPipeline, "godraysNode">): DevVariable[] =>
  godraysNode
    ? [
        createNumberVariable(godraysNode.density, "value", {
          group: LOOK_GOD_RAYS_GROUP,
          name: "god rays density",
          range: TUNING_UNIT_RANGE,
        }),
        createNumberVariable(godraysNode.maxDensity, "value", {
          group: LOOK_GOD_RAYS_GROUP,
          name: "god rays max density",
          range: TUNING_UNIT_RANGE,
        }),
        createNumberVariable(godraysNode.distanceAttenuation, "value", {
          group: LOOK_GOD_RAYS_GROUP,
          name: "god rays distance attenuation",
          range: { max: 5, min: 0, step: 0.01 },
        }),
        createColourVariable(postUniforms.godraysColor, { group: LOOK_GOD_RAYS_GROUP, name: "god rays colour" }),
      ]
    : [];
