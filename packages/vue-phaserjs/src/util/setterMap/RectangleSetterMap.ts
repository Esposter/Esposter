import type { RectangleConfiguration } from "@/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "@/models/emit/RectangleEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

export const RectangleSetterMap: SetterMap<RectangleConfiguration, GameObjects.Rectangle, RectangleEventEmitsOptions> =
  {
    height: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(gameObject.width, value);
    },
    width: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(value, gameObject.height);
    },
    ...ShapeSetterMap,
    ...GlobalSetterMap,
  };
