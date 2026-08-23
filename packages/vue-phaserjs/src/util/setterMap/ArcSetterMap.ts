import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "#src/models/emit/ArcEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const ArcSetterMap: SetterMap<ArcConfiguration, GameObjects.Arc, ArcEventEmitsOptions> = {
  closePath: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setClosePath(value);
  },
  endAngle: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setEndAngle(value);
  },
  radius: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setRadius(value);
  },
  startAngle: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setStartAngle(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
