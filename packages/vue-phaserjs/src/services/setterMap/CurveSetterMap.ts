import type { CurveConfiguration } from "#src/models/configuration/CurveConfiguration";
import type { CurveEventEmitsOptions } from "#src/models/emit/CurveEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { CurveSetter } from "#src/models/setterMap/CurveSetter";
import { TweenSetterMap } from "#src/services/setterMap/global/TweenSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";

export const CurveSetterMap: SetterMap<CurveConfiguration, GameObjects.Curve, CurveEventEmitsOptions> = {
  [CurveSetter.Smoothness]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSmoothness(value);
  },
  ...ShapeSetterMap,
  ...TweenSetterMap,
};
