import type { TransformConfiguration } from "@/lib/phaser/models/configuration/components/TransformConfiguration";
import type { TransformEventEmitsOptions } from "@/lib/phaser/models/emit/components/TransformEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

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
} as const satisfies SetterMap<TransformConfiguration, GameObjects.Components.Transform, TransformEventEmitsOptions>;
