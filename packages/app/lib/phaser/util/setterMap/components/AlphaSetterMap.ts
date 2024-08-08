import type { AlphaConfiguration } from "@/lib/phaser/models/configuration/components/AlphaConfiguration";
import type { AlphaEventEmitsOptions } from "@/lib/phaser/models/emit/components/AlphaEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const AlphaSetterMap = {
  alpha: (gameObject) => (value) => gameObject.setAlpha(value, value, value, value),
  alphaBottomLeft: (gameObject) => (value) =>
    gameObject.setAlpha(gameObject.alphaTopLeft, gameObject.alphaTopRight, value, gameObject.alphaBottomRight),
  alphaBottomRight: (gameObject) => (value) =>
    gameObject.setAlpha(gameObject.alphaTopLeft, gameObject.alphaTopRight, gameObject.alphaBottomLeft, value),
  alphaTopLeft: (gameObject) => (value) =>
    gameObject.setAlpha(value, gameObject.alphaTopRight, gameObject.alphaBottomLeft, gameObject.alphaBottomRight),
  alphaTopRight: (gameObject) => (value) =>
    gameObject.setAlpha(gameObject.alphaTopLeft, value, gameObject.alphaBottomLeft, gameObject.alphaBottomRight),
} as const satisfies SetterMap<AlphaConfiguration, GameObjects.Components.Alpha, AlphaEventEmitsOptions>;
