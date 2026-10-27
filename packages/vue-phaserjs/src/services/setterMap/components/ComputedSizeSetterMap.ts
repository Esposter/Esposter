import type { ComputedSizeConfiguration } from "#src/models/configuration/components/ComputedSizeConfiguration";
import type { ComputedSizeEventEmitsOptions } from "#src/models/emit/components/ComputedSizeEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { DisplaySizeSetterMap } from "#src/services/setterMap/components/DisplaySizeSetterMap";
import { ComputedSizeSetter } from "#src/models/setterMap/components/ComputedSizeSetter";

export const ComputedSizeSetterMap = {
  ...DisplaySizeSetterMap,
  [ComputedSizeSetter.Height]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(gameObject.width, value);
  },
  [ComputedSizeSetter.Width]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSize(value, gameObject.height);
  },
} as const satisfies SetterMap<
  ComputedSizeConfiguration,
  GameObjects.Components.ComputedSize,
  ComputedSizeEventEmitsOptions
>;
