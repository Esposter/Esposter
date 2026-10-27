import type { StarConfiguration } from "#src/models/configuration/StarConfiguration";
import type { StarEventEmitsOptions } from "#src/models/emit/StarEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";
import { StarSetter } from "#src/models/setterMap/StarSetter";

export const StarSetterMap: SetterMap<StarConfiguration, GameObjects.Star, StarEventEmitsOptions> = {
  [StarSetter.InnerRadius]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setInnerRadius(value);
  },
  [StarSetter.OuterRadius]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setOuterRadius(value);
  },
  [StarSetter.Points]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setPoints(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
