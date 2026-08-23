import type { CurveConfiguration } from "#src/models/configuration/CurveConfiguration";
import type { CurveEventEmitsOptions } from "#src/models/emit/CurveEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const CurveSetterMap: SetterMap<CurveConfiguration, GameObjects.Curve, CurveEventEmitsOptions> = {
  smoothness: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSmoothness(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
