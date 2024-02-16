import { type RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import { type RectangleEventEmitsOptions } from "@/lib/phaser/models/emit/RectangleEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/lib/phaser/util/setterMap/shared/ShapeSetterMap";
import { type GameObjects } from "phaser";

export const RectangleSetterMap: SetterMap<RectangleConfiguration, GameObjects.Rectangle, RectangleEventEmitsOptions> =
  {
    ...ShapeSetterMap,
    ...GlobalSetterMap,
    width: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(value, gameObject.height);
    },
    height: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(gameObject.width, value);
    },
  };
