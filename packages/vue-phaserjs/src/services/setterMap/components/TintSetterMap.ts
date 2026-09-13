import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { TintEventEmitsOptions } from "#src/models/emit/components/TintEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const TintSetterMap = {
  tint: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(value, value, value, value);
  },
  tintBottomLeft: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, value, gameObject.tintBottomRight);
  },
  tintBottomRight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, gameObject.tintBottomLeft, value);
  },
  tintTopLeft: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(value, gameObject.tintTopRight, gameObject.tintBottomLeft, gameObject.tintBottomRight);
  },
  tintTopRight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setTint(gameObject.tintTopLeft, value, gameObject.tintBottomLeft, gameObject.tintBottomRight);
  },
} as const satisfies SetterMap<TintConfiguration, GameObjects.Components.Tint, TintEventEmitsOptions>;
