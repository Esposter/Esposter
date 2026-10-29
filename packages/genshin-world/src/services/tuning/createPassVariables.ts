import type { DevVariable } from "#src/models/dev/DevVariable";
import type { DirectionalLight } from "three";
import type { Ref } from "vue";

import { PASS_POST_GROUP, PASS_SHADOWS_GROUP } from "#src/services/tuning/constants";
import { createBooleanVariable } from "#src/services/tuning/createBooleanVariable";

// The passes the world draws that a developer can switch off to see what a slow frame pays for: the temporal anti-aliasing
// The post chain resolves with, and the sun's shadows. Bloom, the god rays and the occlusion are not drawn by the world's
// Chain at all, so they have no switch here
export const createPassVariables = ({
  isTemporalAntialiasingOn,
  sun,
}: {
  isTemporalAntialiasingOn: Ref<boolean>;
  sun: DirectionalLight;
}): DevVariable[] => [
  createBooleanVariable({
    get: () => isTemporalAntialiasingOn.value,
    group: PASS_POST_GROUP,
    name: "temporal anti-aliasing",
    set: (value) => {
      isTemporalAntialiasingOn.value = value;
    },
  }),
  createBooleanVariable({
    get: () => sun.castShadow,
    group: PASS_SHADOWS_GROUP,
    name: "shadows",
    set: (value) => {
      sun.castShadow = value;
    },
  }),
];
