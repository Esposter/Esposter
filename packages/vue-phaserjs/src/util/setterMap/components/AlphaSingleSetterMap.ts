import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { AlphaSingleEventEmitsOptions } from "#src/models/emit/components/AlphaSingleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const AlphaSingleSetterMap = {
  alpha: (gameObject) => (value) => {
    gameObject.setAlpha(value);
  },
} as const satisfies SetterMap<
  AlphaSingleConfiguration,
  GameObjects.Components.AlphaSingle,
  AlphaSingleEventEmitsOptions
>;
