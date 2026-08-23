import type { LineConfiguration } from "#src/models/configuration/LineConfiguration";
import type { LineEventEmitsOptions } from "#src/models/emit/LineEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const LineSetterMap: SetterMap<LineConfiguration, GameObjects.Line, LineEventEmitsOptions> = {
  lineWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setLineWidth(value);
  },
  to: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(...value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
