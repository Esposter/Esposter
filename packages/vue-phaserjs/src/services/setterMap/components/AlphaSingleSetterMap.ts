import type { AlphaSingleConfiguration } from "#src/models/configuration/components/AlphaSingleConfiguration";
import type { AlphaSingleEventEmitsOptions } from "#src/models/emit/components/AlphaSingleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetter } from "#src/models/setterMap/components/AlphaSingleSetter";

export const AlphaSingleSetterMap = {
  [AlphaSingleSetter.Alpha]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setAlpha(value);
  },
} as const satisfies SetterMap<
  AlphaSingleConfiguration,
  GameObjects.Components.AlphaSingle,
  AlphaSingleEventEmitsOptions
>;
