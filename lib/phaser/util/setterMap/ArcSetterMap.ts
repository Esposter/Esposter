import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/lib/phaser/models/emit/ArcEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/lib/phaser/util/setterMap/shared/ShapeSetterMap";
import type { GameObjects } from "phaser";

export const ArcSetterMap: SetterMap<ArcConfiguration, GameObjects.Arc, ArcEventEmitsOptions> = {
  ...ShapeSetterMap,
  ...GlobalSetterMap,
  radius: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setRadius(value);
  },
  closePath: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setClosePath(value);
  },
  startAngle: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setStartAngle(value);
  },
  endAngle: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setEndAngle(value);
  },
};
