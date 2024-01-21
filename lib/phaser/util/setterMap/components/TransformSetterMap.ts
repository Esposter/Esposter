import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const TransformSetterMap = {
  angle: (gameObject) => (value) => gameObject.setAngle(value),
  rotation: (gameObject) => (value) => gameObject.setRotation(value),
  scale: (gameObject) => (value) => gameObject.setScale(value, value),
  scaleX: (gameObject) => (value) => gameObject.setScale(value, gameObject.scaleY),
  scaleY: (gameObject) => (value) => gameObject.setScale(gameObject.scaleX, value),
  w: (gameObject) => (value) => gameObject.setW(value),
  x: (gameObject) => (value) => gameObject.setX(value),
  y: (gameObject) => (value) => gameObject.setY(value),
  z: (gameObject) => (value) => gameObject.setZ(value),
} satisfies SetterMap<GameObjects.Components.Transform, GameObjects.Components.Transform>;
