import type { PolygonConfiguration } from "#src/models/configuration/PolygonConfiguration";
import type { PolygonEventEmitsOptions } from "#src/models/emit/PolygonEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { PolygonSetter } from "#src/models/setterMap/PolygonSetter";
import { TweenSetterMap } from "#src/services/setterMap/global/TweenSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";

export const PolygonSetterMap: SetterMap<PolygonConfiguration, GameObjects.Polygon, PolygonEventEmitsOptions> = {
  [PolygonSetter.Points]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(value);
  },
  ...ShapeSetterMap,
  ...TweenSetterMap,
};
