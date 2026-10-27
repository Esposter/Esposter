import type { PolygonConfiguration } from "#src/models/configuration/PolygonConfiguration";
import type { PolygonEventEmitsOptions } from "#src/models/emit/PolygonEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";
import { PolygonSetter } from "#src/models/setterMap/PolygonSetter";

export const PolygonSetterMap: SetterMap<PolygonConfiguration, GameObjects.Polygon, PolygonEventEmitsOptions> = {
  [PolygonSetter.Points]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
