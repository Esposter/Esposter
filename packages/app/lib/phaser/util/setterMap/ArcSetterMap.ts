import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/lib/phaser/models/emit/ArcEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/lib/phaser/util/setterMap/shared/ShapeSetterMap";

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
