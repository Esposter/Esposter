import type { TransformConfiguration } from "#src/models/configuration/components/TransformConfiguration";
import type { TransformEventEmitsOptions } from "#src/models/emit/components/TransformEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { TransformSetter } from "#src/models/setterMap/components/TransformSetter";

export const TransformSetterMap = {
  [TransformSetter.Angle]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAngle(value);
  },
  [TransformSetter.Rotation]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setRotation(value);
  },
  [TransformSetter.Scale]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScale(value, value);
  },
  [TransformSetter.ScaleX]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScale(value, gameObject.scaleY);
  },
  [TransformSetter.ScaleY]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setScale(gameObject.scaleX, value);
  },
  [TransformSetter.W]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setW(value);
  },
  [TransformSetter.X]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setX(value);
  },
  [TransformSetter.Y]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setY(value);
  },
  [TransformSetter.Z]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setZ(value);
  },
} as const satisfies SetterMap<TransformConfiguration, GameObjects.Components.Transform, TransformEventEmitsOptions>;
