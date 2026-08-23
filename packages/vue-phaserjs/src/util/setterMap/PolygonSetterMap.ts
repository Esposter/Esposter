import type { PolygonConfiguration } from "#src/models/configuration/PolygonConfiguration";
import type { PolygonEventEmitsOptions } from "#src/models/emit/PolygonEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const PolygonSetterMap: SetterMap<PolygonConfiguration, GameObjects.Polygon, PolygonEventEmitsOptions> = {
  points: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
