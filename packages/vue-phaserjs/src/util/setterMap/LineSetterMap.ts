import type { LineConfiguration } from "@/models/configuration/LineConfiguration";
import type { LineEventEmitsOptions } from "@/models/emit/LineEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

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
