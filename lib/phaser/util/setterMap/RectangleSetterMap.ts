import { type WeakSetterMap } from "@/lib/phaser/models/WeakSetterMap";
import { type RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import { ShapeSetterMap } from "@/lib/phaser/util/setterMap/components/ShapeSetterMap";
import { type GameObjects } from "phaser";

export const RectangleSetterMap: WeakSetterMap<RectangleConfiguration, GameObjects.Rectangle> = {
  ...ShapeSetterMap,
  width: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setSize(value, gameObject.height);
  },
  height: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setSize(gameObject.width, value);
  },
};
