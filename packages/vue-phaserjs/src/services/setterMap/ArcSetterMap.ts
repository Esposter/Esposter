import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "#src/models/emit/ArcEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";
import { ArcSetter } from "#src/models/setterMap/ArcSetter";

export const ArcSetterMap: SetterMap<ArcConfiguration, GameObjects.Arc, ArcEventEmitsOptions> = {
  [ArcSetter.ClosePath]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setClosePath(value);
  },
  [ArcSetter.EndAngle]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setEndAngle(value);
  },
  [ArcSetter.Radius]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setRadius(value);
  },
  [ArcSetter.StartAngle]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setStartAngle(value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
