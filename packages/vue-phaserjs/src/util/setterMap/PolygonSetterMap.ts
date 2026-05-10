import type { PolygonConfiguration } from "@/models/configuration/PolygonConfiguration";
import type { PolygonEventEmitsOptions } from "@/models/emit/PolygonEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

export const PolygonSetterMap: SetterMap<PolygonConfiguration, GameObjects.Polygon, PolygonEventEmitsOptions> = {
  points: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
