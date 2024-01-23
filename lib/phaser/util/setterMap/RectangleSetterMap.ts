import { type RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/lib/phaser/util/setterMap/global/ShapeSetterMap";
import { type GameObjects } from "phaser";

export const RectangleSetterMap: SetterMap<RectangleConfiguration, GameObjects.Rectangle> = {
  ...ShapeSetterMap,
  ...GlobalSetterMap,
  width: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setSize(value, gameObject.height);
  },
  height: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setSize(gameObject.width, value);
  },
};
