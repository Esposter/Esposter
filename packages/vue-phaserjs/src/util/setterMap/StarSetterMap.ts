import type { StarConfiguration } from "#src/models/configuration/StarConfiguration";
import type { StarEventEmitsOptions } from "#src/models/emit/StarEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const StarSetterMap: SetterMap<StarConfiguration, GameObjects.Star, StarEventEmitsOptions> = {
  innerRadius: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setInnerRadius(value);
  },
  outerRadius: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOuterRadius(value);
  },
  points: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setPoints(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
