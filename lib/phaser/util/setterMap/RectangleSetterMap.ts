import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { ShapeSetterMap } from "@/lib/phaser/util/setterMap/components/ShapeSetterMap";
import { type GameObjects } from "phaser";

export const RectangleSetterMap = {
  ...ShapeSetterMap,
  width: (gameObject) => (value) => gameObject.setSize(value, gameObject.height),
  height: (gameObject) => (value) => gameObject.setSize(gameObject.width, value),
} satisfies SetterMap<GameObjects.Rectangle, GameObjects.Rectangle>;
