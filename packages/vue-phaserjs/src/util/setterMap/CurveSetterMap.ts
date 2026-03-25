import type { CurveConfiguration } from "@/models/configuration/CurveConfiguration";
import type { CurveEventEmitsOptions } from "@/models/emit/CurveEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

export const CurveSetterMap: SetterMap<CurveConfiguration, GameObjects.Curve, CurveEventEmitsOptions> = {
  smoothness: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setSmoothness(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
