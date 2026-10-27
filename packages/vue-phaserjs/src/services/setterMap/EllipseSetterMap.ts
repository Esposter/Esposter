import type { EllipseConfiguration } from "#src/models/configuration/EllipseConfiguration";
import type { EllipseEventEmitsOptions } from "#src/models/emit/EllipseEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "#src/services/setterMap/components/ComputedSizeSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";
import { EllipseSetter } from "#src/models/setterMap/EllipseSetter";
import { ComputedSizeSetter } from "#src/models/setterMap/components/ComputedSizeSetter";

export const EllipseSetterMap: SetterMap<EllipseConfiguration, GameObjects.Ellipse, EllipseEventEmitsOptions> = {
  [ComputedSizeSetter.Height]: ComputedSizeSetterMap[ComputedSizeSetter.Height],
  [EllipseSetter.Smoothness]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSmoothness(value);
  },
  [ComputedSizeSetter.Width]: ComputedSizeSetterMap[ComputedSizeSetter.Width],
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
