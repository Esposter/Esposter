import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { TintEventEmitsOptions } from "#src/models/emit/components/TintEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import { TintSetter } from "#src/models/setterMap/components/TintSetter";

export const TintSetterMap = {
  [TintSetter.Tint]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(value, value, value, value);
  },
  [TintSetter.TintBottomLeft]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, value, gameObject.tintBottomRight);
  },
  [TintSetter.TintBottomRight]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, gameObject.tintBottomLeft, value);
  },
  [TintSetter.TintTopLeft]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(value, gameObject.tintTopRight, gameObject.tintBottomLeft, gameObject.tintBottomRight);
  },
  [TintSetter.TintTopRight]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(gameObject.tintTopLeft, value, gameObject.tintBottomLeft, gameObject.tintBottomRight);
  },
} as const satisfies SetterMap<TintConfiguration, GameObjects.Components.Tint, TintEventEmitsOptions>;
