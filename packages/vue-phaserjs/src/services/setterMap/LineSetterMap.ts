import type { LineConfiguration } from "#src/models/configuration/LineConfiguration";
import type { LineEventEmitsOptions } from "#src/models/emit/LineEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { LineSetter } from "#src/models/setterMap/LineSetter";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";

export const LineSetterMap: SetterMap<LineConfiguration, GameObjects.Line, LineEventEmitsOptions> = {
  [LineSetter.LineWidth]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setLineWidth(value);
  },
  [LineSetter.To]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(...value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
