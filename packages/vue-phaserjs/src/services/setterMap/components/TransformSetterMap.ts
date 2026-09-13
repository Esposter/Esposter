import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { TransformEventEmitsOptions } from "#src/models/emit/components/TransformEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const TransformSetterMap = {
  angle: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAngle(value);
  },
  rotation: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setRotation(value);
  },
  scale: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScale(value, value);
  },
  scaleX: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScale(value, gameObject.scaleY);
  },
  scaleY: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScale(gameObject.scaleX, value);
  },
  w: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setW(value);
  },
  x: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setX(value);
  },
  y: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setY(value);
  },
  z: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setZ(value);
  },
} as const satisfies SetterMap<TransformConfiguration, GameObjects.Components.Transform, TransformEventEmitsOptions>;
