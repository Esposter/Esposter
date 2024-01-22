import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const TintSetterMap = {
  tint: (gameObject) => (value) => gameObject.setTint(value, value, value, value),
  tintTopLeft: (gameObject) => (value) =>
    gameObject.setTint(value, gameObject.tintTopRight, gameObject.tintBottomLeft, gameObject.tintBottomRight),
  tintTopRight: (gameObject) => (value) =>
    gameObject.setTint(gameObject.tintTopLeft, value, gameObject.tintBottomLeft, gameObject.tintBottomRight),
  tintBottomLeft: (gameObject) => (value) =>
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, value, gameObject.tintBottomRight),
  tintBottomRight: (gameObject) => (value) =>
    gameObject.setTint(gameObject.tintTopLeft, gameObject.tintTopRight, gameObject.tintBottomLeft, value),
} satisfies SetterMap<GameObjects.Components.Tint, GameObjects.Components.Tint>;
