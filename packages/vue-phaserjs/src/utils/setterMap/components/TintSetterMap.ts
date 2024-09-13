import type { TintConfiguration } from "@/models/configuration/components/TintConfiguration";
import type { TintEventEmitsOptions } from "@/models/emit/components/TintEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const TintSetterMap = {
  tint: (gameObject) => (value) => gameObject.setTint(value, value, value, value),
  tintBottomLeft: (gameObject) => (value) =>
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, value, gameObject.tintBottomRight),
  tintBottomRight: (gameObject) => (value) =>
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, gameObject.tintBottomLeft, value),
  tintTopLeft: (gameObject) => (value) =>
    gameObject.setTint(value, gameObject.tintTopRight, gameObject.tintBottomLeft, gameObject.tintBottomRight),
  tintTopRight: (gameObject) => (value) =>
    gameObject.setTint(gameObject.tintTopLeft, value, gameObject.tintBottomLeft, gameObject.tintBottomRight),
} as const satisfies SetterMap<TintConfiguration, GameObjects.Components.Tint, TintEventEmitsOptions>;
