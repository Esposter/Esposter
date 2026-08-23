import type { EllipseConfiguration } from "#src/models/configuration/EllipseConfiguration";
import type { EllipseEventEmitsOptions } from "#src/models/emit/EllipseEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "#src/util/setterMap/components/ComputedSizeSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

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
