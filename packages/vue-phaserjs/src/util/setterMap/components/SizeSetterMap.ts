import type { SizeConfiguration } from "#src/models/configuration/components/SizeConfiguration";
import type { SizeEventEmitsOptions } from "#src/models/emit/components/SizeEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "#src/util/setterMap/components/ComputedSizeSetterMap";

export const SizeSetterMap = {
  ...ComputedSizeSetterMap,
} as const satisfies SetterMap<SizeConfiguration, GameObjects.Components.Size, SizeEventEmitsOptions>;
