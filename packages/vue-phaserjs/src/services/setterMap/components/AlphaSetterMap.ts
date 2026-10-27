import type { AlphaConfiguration } from "#src/models/configuration/components/AlphaConfiguration";
import type { AlphaEventEmitsOptions } from "#src/models/emit/components/AlphaEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import { AlphaSetter } from "#src/models/setterMap/components/AlphaSetter";

export const AlphaSetterMap = {
  [AlphaSetter.Alpha]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAlpha(value, value, value, value);
  },
  [AlphaSetter.AlphaBottomLeft]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAlpha(gameObject.alphaTopLeft, gameObject.alphaTopRight, value, gameObject.alphaBottomRight);
  },
  [AlphaSetter.AlphaBottomRight]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAlpha(gameObject.alphaTopLeft, gameObject.alphaTopRight, gameObject.alphaBottomLeft, value);
  },
  [AlphaSetter.AlphaTopLeft]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAlpha(value, gameObject.alphaTopRight, gameObject.alphaBottomLeft, gameObject.alphaBottomRight);
  },
  [AlphaSetter.AlphaTopRight]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAlpha(gameObject.alphaTopLeft, value, gameObject.alphaBottomLeft, gameObject.alphaBottomRight);
  },
} as const satisfies SetterMap<AlphaConfiguration, GameObjects.Components.Alpha, AlphaEventEmitsOptions>;
