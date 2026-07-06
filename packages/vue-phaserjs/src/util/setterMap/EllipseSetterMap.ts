import type { EllipseConfiguration } from "@/models/configuration/EllipseConfiguration";
import type { EllipseEventEmitsOptions } from "@/models/emit/EllipseEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "@/util/setterMap/components/ComputedSizeSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

export const EllipseSetterMap: SetterMap<EllipseConfiguration, GameObjects.Ellipse, EllipseEventEmitsOptions> = {
  height: ComputedSizeSetterMap.height,
  smoothness: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSmoothness(value);
  },
  width: ComputedSizeSetterMap.width,
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
