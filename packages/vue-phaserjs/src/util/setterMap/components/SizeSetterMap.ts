import type { SizeConfiguration } from "@/models/configuration/components/SizeConfiguration";
import type { SizeEventEmitsOptions } from "@/models/emit/components/SizeEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "@/util/setterMap/components/ComputedSizeSetterMap";

export const SizeSetterMap = {
  ...ComputedSizeSetterMap,
} as const satisfies SetterMap<SizeConfiguration, GameObjects.Components.Size, SizeEventEmitsOptions>;
