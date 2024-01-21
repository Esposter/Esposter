import { type RectangleConfiguration } from "@/lib/phaser/models/RectangleConfiguration";
import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const RectangleSetterMap = {
  x: (gameObject) => (value) => gameObject.setX(value),
  y: (gameObject) => (value) => gameObject.setY(value),
  width: (gameObject) => (value) => gameObject.setSize(value, gameObject.height),
  height: (gameObject) => (value) => gameObject.setSize(gameObject.width, value),
  color: (gameObject) => (value) => gameObject.setFillStyle(value, gameObject.alpha),
  alpha: (gameObject) => (value) => gameObject.setAlpha(value),
} satisfies SetterMap<RectangleConfiguration, GameObjects.Rectangle>;
