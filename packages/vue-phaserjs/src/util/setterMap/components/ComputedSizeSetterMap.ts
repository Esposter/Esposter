import type { ComputedSizeConfiguration } from "#src/models/configuration/components/ComputedSizeConfiguration";
import type { ComputedSizeEventEmitsOptions } from "#src/models/emit/components/ComputedSizeEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { DisplaySizeSetterMap } from "#src/util/setterMap/components/DisplaySizeSetterMap";

export const ComputedSizeSetterMap = {
  ...DisplaySizeSetterMap,
  height: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(gameObject.width, value);
  },
  width: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(value, gameObject.height);
  },
} as const satisfies SetterMap<
  ComputedSizeConfiguration,
  GameObjects.Components.ComputedSize,
  ComputedSizeEventEmitsOptions
>;
